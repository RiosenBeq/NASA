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

    const client = new OpenAI({ apiKey });

    const personaContext = getPersonaContext(persona || undefined);

    const prompt = `You are an expert NASA bioscience research analyst with comprehensive knowledge of space biology, human spaceflight, and mission planning.

PUBLICATION CONTEXT:
- Title: ${title}
- URL: ${url}

USER QUESTION:
${question}

TARGET AUDIENCE: ${personaContext}

INSTRUCTIONS:
Focus specifically on the publication "${title}" and provide a detailed answer that:

1. **ANALYZE THE SPECIFIC PUBLICATION**
   - What this specific study investigated
   - Key findings from this publication
   - Methodology used in this research
   - Sample size and experimental conditions

2. **ANSWER THE USER'S QUESTION**
   - Directly address what they're asking about this publication
   - Use the publication title and context to inform your answer
   - Be specific about findings from this particular study

3. **PROVIDE RELEVANT CONTEXT**
   - How this specific publication fits into NASA's space biology research
   - What makes this study unique or important
   - Connection to current NASA missions (Artemis, Mars, ISS)

4. **DISCUSS IMPLICATIONS OF THIS SPECIFIC STUDY**
   ${persona === 'scientist' ? '- What this study teaches us about research methods\n   - How to build upon these specific findings\n   - Experimental approaches used in this study' : ''}
   ${persona === 'manager' ? '- Strategic value of this specific research\n   - Investment implications of these findings\n   - How this study supports program goals' : ''}
   ${persona === 'architect' ? '- Mission design insights from this study\n   - Operational implications of these findings\n   - Risk factors identified in this research' : ''}
   ${!persona ? '- Practical applications of these specific findings\n   - How this study advances space biology\n   - Mission planning insights from this research' : ''}

5. **ACKNOWLEDGE STUDY LIMITATIONS**
   - What this specific study couldn't determine
   - Limitations of the methodology used
   - What additional research would complement these findings

FORMAT:
- Use clear paragraphs with headers (###) where appropriate
- Include specific examples and details
- Reference the publication as [${title}](${url})
- Maintain scientific rigor while being accessible
- Length: Thorough but concise (200-400 words)

LANGUAGE: Turkish (professional scientific Turkish)

TONE: Expert, evidence-based, helpful, forward-looking

Answer the question now:`;

    const msg = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert NASA bioscience research analyst with deep knowledge of space biology, microgravity effects, radiation biology, human spaceflight physiology, and mission planning. You provide detailed, evidence-based answers to research questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const answer = msg.choices?.[0]?.message?.content || "Cevap oluşturulamadı.";

    return NextResponse.json({
      answer: answer + `\n\n---\n\n### 📚 Kaynak\n[${title}](${url})\n\n### 🔗 İlgili NASA Kaynakları\n- [OSDR Dataset Ara](https://osdr.nasa.gov/bio/repo/search?q=${encodeURIComponent(title)})\n- [Task Book Projeleri](https://taskbook.nasaprs.com/tbp/welcome.cfm)\n- [NSLSL Literatür](https://extapps.ksc.nasa.gov/NSLSL/Search?q=${encodeURIComponent(title)})`,
      citations: [url],
      metadata: {
        publication_id: id,
        publication_title: title,
        persona: persona || "general",
        model: "gpt-4o-mini"
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
