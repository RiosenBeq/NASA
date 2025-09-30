import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id: number = body?.id;
    const question: string = body?.question || "";
    const persona: string | null = body?.persona || null;

    if (!question.trim()) {
      return NextResponse.json(
        { answer: "Lütfen bir soru yazın.", citations: [] },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        answer: "⚠️ OpenAI API anahtarı yapılandırılmamış.\n\nVercel Dashboard → Settings → Environment Variables bölümünden OPENAI_API_KEY ekleyin.\n\nOpenAI API key'inizi https://platform.openai.com/api-keys adresinden alabilirsiniz.",
        citations: []
      }, { status: 503 });
    }

    // Fetch publication data from the CSV
    const CSV_URL = "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv";
    const response = await fetch(CSV_URL);
    const csv = await response.text();
    const lines = csv.split(/\r?\n/).filter(Boolean);
    lines.shift(); // Remove header

    let title = "";
    let url = "";
    
    lines.forEach((line, idx) => {
      const pubId = idx + 1;
      if (pubId === id) {
        if (line.startsWith('"')) {
          const endQuote = line.indexOf('"', 1);
          title = line.slice(1, endQuote);
          const rest = line.slice(endQuote + 2);
          url = rest;
        } else {
          const comma = line.indexOf(",");
          title = line.slice(0, comma);
          url = line.slice(comma + 1);
        }
        title = title.trim();
        url = url.trim();
      }
    });

    if (!title || !url) {
      return NextResponse.json({
        answer: "Seçilen yayın bulunamadı.",
        citations: []
      }, { status: 404 });
    }

    const client = new OpenAI({ apiKey });

    const personaNote = {
      "scientist": "Answer like a domain expert with scientific rigor.",
      "manager": "Answer with focus on impact and practical implications.",
      "architect": "Answer with focus on mission design and operational considerations.",
    }[persona?.toLowerCase() || ""] || "Provide clear, factual answers.";

    const prompt = `You are an AI assistant helping with NASA space bioscience research questions.

${personaNote}

Publication Information:
- Title: ${title}
- URL: ${url}

User Question: ${question}

Please provide a helpful answer in Turkish based on:
1. The publication title and what it suggests about the research
2. General knowledge about NASA space bioscience research
3. The specific question asked

Note: Detailed abstract information is not available, so the answer is based on the publication title and general NASA space biology knowledge.

Be concise, cite the publication as [ID ${id}], and if you're uncertain, clearly state the limitations.`;

    const msg = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const answer = msg.choices?.[0]?.message?.content || "Cevap oluşturulamadı.";

    return NextResponse.json({
      answer: answer + `\n\n📚 Kaynak: ${url}`,
      citations: [url]
    });

  } catch (error) {
    console.error("[QA] Error:", error);
    return NextResponse.json(
      {
        answer: `❌ Soru cevaplanamadı: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
        citations: []
      },
      { status: 500 }
    );
  }
}
