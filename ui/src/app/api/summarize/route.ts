import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, persona, section_priority } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'ids' array" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY not configured",
          summary: "⚠️ OpenAI API anahtarı yapılandırılmamış. Lütfen OPENAI_API_KEY environment variable'ını Vercel dashboard'da ayarlayın.",
        },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    // Fetch publication data from GitHub CSV
    const csvUrl =
      "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv";
    const csvRes = await fetch(csvUrl);
    if (!csvRes.ok) {
      throw new Error(`Failed to fetch CSV: ${csvRes.statusText}`);
    }

    const csvText = await csvRes.text();
    const lines = csvText.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    const idCol = headers.indexOf("id");
    const titleCol = headers.indexOf("Title");
    const urlCol = headers.indexOf("PMC_URL");

    if (idCol === -1 || titleCol === -1 || urlCol === -1) {
      throw new Error("CSV missing required columns");
    }

    const citations: string[] = [];
    const titles: string[] = [];

    for (const id of ids) {
      const row = lines
        .slice(1)
        .find((line) => line.startsWith(`${id},`) || line.startsWith(`"${id}"`));
      if (row) {
        const cols = row.split(",").map((c) => c.trim().replace(/"/g, ""));
        const title = cols[titleCol] || "Unknown";
        const url = cols[urlCol] || "";
        titles.push(title);
        citations.push(`[${title}](${url})`);
      }
    }

    if (titles.length === 0) {
      return NextResponse.json(
        { error: "No publications found for given IDs" },
        { status: 404 }
      );
    }

    // Build enhanced prompt based on NASA requirements
    const personaContext = getPersonaContext(persona);
    const sectionFocus = getSectionFocus(section_priority);
    
    const prompt = `You are an expert NASA bioscience research analyst tasked with creating comprehensive, actionable summaries of space biology publications.

TARGET AUDIENCE: ${personaContext}

SECTION FOCUS: ${sectionFocus}

PUBLICATIONS TO ANALYZE:
${titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

REQUIREMENTS:
Create a detailed, structured summary following NASA's Space Bioscience Research Challenge guidelines:

1. **EXECUTIVE SUMMARY** (2-3 sentences)
   - High-level overview of research scope and significance

2. **KEY RESEARCH FINDINGS** (Bullet points)
   - Primary experimental results
   - Statistical significance and effect sizes where applicable
   - Novel discoveries or confirmations

3. **SCIENTIFIC PROGRESS & IMPACT**
   - What scientific questions were addressed?
   - How does this advance our understanding of life in space?
   - Implications for human space exploration (Moon/Mars missions)

4. **KNOWLEDGE GAPS IDENTIFIED**
   - What questions remain unanswered?
   - What additional research is needed?
   - Limitations of current studies

5. **CONSENSUS & CONTROVERSIES**
   - Areas of agreement across studies
   - Conflicting findings or interpretations
   - Methodological differences

6. **ACTIONABLE INSIGHTS**
   ${persona === 'scientist' ? '- New hypotheses to test\n   - Experimental approaches to consider\n   - Potential collaborations or data sources' : ''}
   ${persona === 'manager' ? '- Investment opportunities\n   - Research priorities\n   - Resource allocation recommendations' : ''}
   ${persona === 'architect' ? '- Mission planning considerations\n   - Technology requirements\n   - Risk mitigation strategies' : ''}
   ${!persona ? '- Practical implications for mission planning\n   - Technology development needs\n   - Risk factors to consider' : ''}

7. **CONNECTIONS TO NASA RESOURCES**
   - Relevant OSDR datasets that could provide additional context
   - Related NASA Task Book projects
   - Complementary studies in NASA Space Life Sciences Library

8. **FUTURE DIRECTIONS**
   - Recommended next steps in research
   - Emerging trends and opportunities
   - Long-term research trajectory

FORMAT:
- Use clear section headers (##)
- Use bullet points for lists
- Include specific details, not generalizations
- Cite key findings with publication references
- Maintain scientific rigor while being accessible
- Length: Comprehensive (500-800 words)

TONE: Professional, evidence-based, forward-looking, actionable

Begin your detailed analysis now:`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert NASA bioscience research analyst with deep knowledge of space biology, human spaceflight, and mission planning. You excel at synthesizing complex research findings into actionable insights for diverse stakeholders.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const summary = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      summary,
      citations,
      titles,
      metadata: {
        persona: persona || "general",
        section_priority: section_priority || "balanced",
        publication_count: titles.length,
        model: "gpt-4o-mini",
      },
    });
  } catch (error: unknown) {
    console.error("Summarize error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Summary generation failed",
        summary: `❌ Özet oluşturulamadı: ${message}\n\nLütfen daha sonra tekrar deneyin veya farklı yayınlar seçin.`,
      },
      { status: 500 }
    );
  }
}

function getPersonaContext(persona?: string): string {
  switch (persona) {
    case "scientist":
      return "Research scientists generating new hypotheses and designing experiments for space biology studies. Focus on experimental methodology, data interpretation, and hypothesis generation.";
    case "manager":
      return "Program managers and decision-makers identifying investment opportunities and research priorities. Focus on strategic importance, resource allocation, and portfolio optimization.";
    case "architect":
      return "Mission architects planning safe and efficient lunar and Mars exploration. Focus on operational constraints, technology requirements, and risk mitigation.";
    default:
      return "Diverse stakeholders including scientists, managers, and mission planners. Provide balanced insights relevant to multiple audiences.";
  }
}

function getSectionFocus(section?: string): string {
  switch (section) {
    case "results":
      return "Prioritize Results sections - focus on objectively demonstrated findings, experimental data, statistical analyses, and empirical evidence.";
    case "discussion":
      return "Prioritize Discussion sections - focus on interpretation of results, comparison with existing literature, and broader implications.";
    case "conclusion":
      return "Prioritize Conclusion sections - focus on forward-looking insights, future research directions, and practical applications.";
    default:
      return "Balanced analysis across all sections - integrate findings from Introduction, Methods, Results, Discussion, and Conclusions.";
  }
}
