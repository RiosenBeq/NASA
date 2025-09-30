import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Publication {
  id: number;
  title: string;
  url: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids: number[] = body?.ids || [];
    const persona: string | null = body?.persona || null;
    const sectionPriority: string | null = body?.section_priority || null;

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { summary: "Lütfen en az bir yayın seçin.", citations: [], titles: [] },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        summary: "⚠️ OpenAI API anahtarı yapılandırılmamış.\n\nVercel Dashboard → Settings → Environment Variables bölümünden OPENAI_API_KEY ekleyin.\n\nOpenAI API key'inizi https://platform.openai.com/api-keys adresinden alabilirsiniz.",
        citations: [],
        titles: []
      }, { status: 503 });
    }

    // Fetch publication data from the CSV
    const CSV_URL = "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv";
    const response = await fetch(CSV_URL);
    const csv = await response.text();
    const lines = csv.split(/\r?\n/).filter(Boolean);
    lines.shift(); // Remove header

    const publications: Publication[] = [];
    lines.forEach((line, idx) => {
      let title = "";
      let link = "";
      if (line.startsWith('"')) {
        const endQuote = line.indexOf('"', 1);
        title = line.slice(1, endQuote);
        const rest = line.slice(endQuote + 2);
        link = rest;
      } else {
        const comma = line.indexOf(",");
        title = line.slice(0, comma);
        link = line.slice(comma + 1);
      }
      title = title.trim();
      link = link.trim();
      const pubId = idx + 1;
      if (ids.includes(pubId) && title && link) {
        publications.push({ id: pubId, title, url: link });
      }
    });

    if (publications.length === 0) {
      return NextResponse.json({
        summary: "Seçilen yayınlar bulunamadı.",
        citations: [],
        titles: []
      }, { status: 404 });
    }

    // Create citations and titles
    const citations = publications.map(p => p.url);
    const titles = publications.map(p => p.title);

    // Prepare context for OpenAI
    const docs = publications.map(p => 
      `[ID ${p.id}] Title: ${p.title}\nURL: ${p.url}`
    ).join("\n\n");

    const client = new OpenAI({ apiKey });

    const personaNote = {
      "scientist": "Emphasize hypotheses, methods, result robustness, conflicts/consensus.",
      "manager": "Emphasize impact, gaps, opportunities, funding relevance, readiness.",
      "architect": "Emphasize platform, exposure, risks, operational implications for missions.",
    }[persona?.toLowerCase() || ""] || "";

    const sectionNote = {
      "results": "Focus on concrete findings and results.",
      "discussion": "Focus on interpretation and implications.",
      "conclusion": "Focus on conclusions and future directions.",
    }[sectionPriority?.toLowerCase() || ""] || "Provide a balanced summary.";

    const prompt = `You are an AI assistant summarizing NASA space bioscience research publications.

${personaNote}
${sectionNote}

Based on the publication titles and sources below, provide a structured summary in Turkish:

${docs}

Lütfen aşağıdaki yapıda özetleyin:
- **Genel Bakış**: Bu yayınlar hangi konuları araştırıyor?
- **Ana Bulgular**: Başlıklardan ve NASA uzay biyolojisi bağlamından çıkarılabilecek ana noktalar nelerdir?
- **Bilimsel Önem**: Bu araştırmaların NASA misyonları için önemi nedir?
- **Öneriler**: Bu bulgular ışığında ne gibi sonraki adımlar önerilebilir?

Not: Detaylı abstract bilgisi olmadığı için özet, yayın başlıkları ve NASA uzay biyolojisi genel bilgisi temel alınarak oluşturulmuştur.`;

    const msg = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const summary = msg.choices?.[0]?.message?.content || "Özet oluşturulamadı.";

    return NextResponse.json({
      summary: summary + "\n\n📚 Kaynaklar:\n" + citations.join("\n"),
      citations,
      titles
    });

  } catch (error) {
    console.error("[Summarize] Error:", error);
    return NextResponse.json(
      {
        summary: `❌ Özet oluşturulamadı: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
        citations: [],
        titles: []
      },
      { status: 500 }
    );
  }
}
