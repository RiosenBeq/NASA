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
    if (!apiKey || apiKey.trim() === '') {
      console.error('[QA] OPENAI_API_KEY not found or empty');
      return NextResponse.json({
        answer: "⚠️ OpenAI API anahtarı yapılandırılmamış. Lütfen OPENAI_API_KEY environment variable'ını ayarlayın.",
        citations: []
      }, { status: 200 });
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

    // Configure OpenAI client with retry and timeout
    const client = new OpenAI({ apiKey, maxRetries: 2, timeout: 20000 });

    const personaContext = getPersonaContext(persona || undefined);

    const prompt = `You are an expert NASA bioscience research analyst. Answer the user's question about this specific publication.

PUBLICATION:
Title: ${title}
URL: ${url}

USER QUESTION:
${question}

INSTRUCTIONS:
- Answer EXACTLY what the user asked - no more, no less
- If they ask for "one sentence", give ONE sentence
- If they ask for "brief", give a brief answer (2-3 sentences)
- If they ask for details, then provide detailed information
- Focus ONLY on the publication: "${title}"
- Use information from this specific study
- Write in Turkish (professional scientific Turkish)
- Be direct and precise

Answer now:`;

    // Detect if user wants short/brief answer
    const lowerQ = question.toLowerCase();
    const wantsShort = lowerQ.includes('kısa') || lowerQ.includes('özetle') || 
                       lowerQ.includes('tek cümle') || lowerQ.includes('brief') || 
                       lowerQ.includes('one sentence') || lowerQ.includes('summarize');
    const maxTokens = wantsShort ? 150 : 800;

    let answer = "";
    try {
      const msg = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a precise NASA bioscience research analyst. Answer questions directly and concisely, following the user's requested format exactly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
      });
      answer = msg.choices?.[0]?.message?.content || "Cevap oluşturulamadı.";
    } catch {
      // HTTP fallback if SDK fails
      try {
        const ctrl = new AbortController();
        const tm = setTimeout(() => ctrl.abort(), 20000);
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a precise NASA bioscience research analyst. Answer questions directly and concisely, following the user's requested format exactly." },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: maxTokens,
          }),
        });
        clearTimeout(tm);
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`OpenAI HTTP ${resp.status} ${resp.statusText}: ${text.slice(0, 300)}`);
        }
        const j = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
        answer = j?.choices?.[0]?.message?.content || "Cevap oluşturulamadı.";
      } catch (httpError) {
        const msg = httpError instanceof Error ? httpError.message : String(httpError);
        throw new Error(`OpenAI request failed: ${msg}`);
      }
    }

    return NextResponse.json({
      answer: answer + `\n\n---\n\n### 📚 Kaynak\n[${title}](${url})\n\n### 🔗 İlgili NASA Kaynakları\n- [OSDR Dataset Ara](https://osdr.nasa.gov/bio/repo/search?q=${encodeURIComponent(title)})\n- [Task Book Projeleri](https://taskbook.nasaprs.com/tbp/welcome.cfm)\n- [NSLSL Literatür](https://extapps.ksc.nasa.gov/NSLSL/Search?q=${encodeURIComponent(title)})`,
      citations: [url],
      metadata: {
        publication_id: id,
        publication_title: title,
        persona: persona || "general",
        model: "gpt-3.5-turbo"
      }
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

function getPersonaContext(persona?: string): string {
  switch (persona) {
    case "scientist":
      return "Research scientist seeking detailed technical insights, methodology analysis, and hypothesis generation opportunities.";
    case "manager":
      return "Program manager evaluating research impact, investment priorities, and strategic alignment with NASA goals.";
    case "architect":
      return "Mission architect planning safe lunar/Mars missions, focusing on operational constraints and risk mitigation.";
    default:
      return "General stakeholder seeking comprehensive understanding of space bioscience research and its implications.";
  }
}
