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
  if (!apiKey || apiKey.trim() === '') {
      console.error('[Summarize] OPENAI_API_KEY not found or empty');
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY not configured",
          summary: "⚠️ OpenAI API anahtarı yapılandırılmamış. Lütfen OPENAI_API_KEY environment variable'ını ayarlayın.",
          citations: [],
          titles: []
        },
        { status: 200 }
      );
  }

  // Configure OpenAI client with retry and timeout to reduce transient failures
  const client = new OpenAI({ apiKey, maxRetries: 2, timeout: 20000 });

    // Fetch publication data from GitHub CSV
    const csvUrl =
      "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv";
    // Fetch CSV with a timeout protection
    const controller = new AbortController();
    const csvTimeout = setTimeout(() => controller.abort(), 15000);
    const csvRes = await fetch(csvUrl, { signal: controller.signal, headers: { 'User-Agent': 'NextGenLAB-NASA-Explorer/1.0 (+summarize)' } });
    clearTimeout(csvTimeout);
    if (!csvRes.ok) {
      throw new Error(`Failed to fetch CSV: ${csvRes.statusText}`);
    }

    const csvText = await csvRes.text();
    const lines = csvText.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    const titleCol = headers.indexOf("Title");
    const urlCol = headers.indexOf("Link");

    if (titleCol === -1 || urlCol === -1) {
      throw new Error("CSV missing required columns: Title or Link");
    }

    const citations: string[] = [];
    const titles: string[] = [];

    for (const id of ids) {
      // ID is 1-based index from search API
      const rowIndex = parseInt(id) - 1;
      if (rowIndex >= 0 && rowIndex < lines.length - 1) {
        const row = lines[rowIndex + 1]; // +1 because we skip header
        if (row) {
          // Parse CSV row (Title,Link format)
          let title = "";
          let url = "";
          if (row.startsWith("\"")) {
            const endQuote = row.indexOf("\"", 1);
            title = row.slice(1, endQuote);
            const rest = row.slice(endQuote + 2);
            url = rest;
          } else {
            const comma = row.indexOf(",");
            title = row.slice(0, comma);
            url = row.slice(comma + 1);
          }
          title = title.trim();
          url = url.trim();
          if (title && url) {
            titles.push(title);
            citations.push(`[${title}](${url})`);
          }
        }
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
    
    const prompt = `You are an expert NASA bioscience research analyst with 15+ years of experience in space biology research. You are tasked with creating comprehensive, detailed summaries of space biology publications for NASA's Space Bioscience Research Challenge.

TARGET AUDIENCE: ${personaContext}

SECTION FOCUS: ${sectionFocus}

PUBLICATIONS TO ANALYZE:
${titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

CRITICAL REQUIREMENTS:
Create a very concise summary following NASA's Space Bioscience Research Challenge guidelines. Keep it brief and actionable.

STRUCTURE YOUR ANALYSIS AS FOLLOWS:

## 🚀 EXECUTIVE SUMMARY
Provide a 1-2 sentence overview covering:
- Research scope and key findings
- Direct relevance to NASA's space exploration goals

## 🔬 KEY FINDINGS
For each publication, provide:
- **Methodology**: Brief experimental approach
- **Results**: Key findings only
- **Limitations**: Main study constraints

## 🌌 NASA IMPACT
- **Space Biology Advancement**: How this advances space biology
- **Mission Applications**: Direct applications for Moon/Mars missions

## 🔍 RESEARCH GAPS
- **Critical Questions**: Most important unanswered questions
- **Next Steps**: Essential follow-up research needed

## 💡 STRATEGIC ACTIONABLE INSIGHTS
${persona === 'scientist' ? `
**For Research Scientists:**
- Specific hypotheses to test in future experiments
- Recommended experimental protocols and methodologies
- Potential collaborations with other research groups
- Data sources and datasets to leverage
- Equipment and technology requirements for future studies` : ''}
${persona === 'manager' ? `
**For Program Managers:**
- Investment priorities and funding recommendations
- Research portfolio optimization strategies
- Resource allocation across different research areas
- Risk assessment and mitigation strategies
- Timeline considerations for research programs` : ''}
${persona === 'architect' ? `
**For Mission Architects:**
- Mission design implications and constraints
- Technology development requirements
- Crew safety and health considerations
- Life support system requirements
- Risk mitigation strategies for long-duration missions` : ''}
${!persona ? `
**For All Stakeholders:**
- Mission planning considerations and constraints
- Technology development priorities
- Risk factors and mitigation strategies
- Resource requirements and optimization
- Timeline and milestone considerations` : ''}

## 🛰️ NASA RESOURCE INTEGRATION
- **OSDR Datasets**: Specific datasets that complement this research
- **Task Book Projects**: Related ongoing NASA research initiatives
- **NSLSL Resources**: Additional studies in NASA's Space Life Sciences Library
- **International Collaborations**: Relevant international space agency research
- **Commercial Partnerships**: Potential industry collaborations

## 🔮 FUTURE RESEARCH DIRECTIONS
- **Immediate Next Steps**: 1-2 year research priorities
- **Medium-term Goals**: 3-5 year research objectives
- **Long-term Vision**: 10+ year research trajectory
- **Emerging Technologies**: New tools and methodologies to leverage
- **International Opportunities**: Global collaboration possibilities

## 📊 DETAILED TECHNICAL SPECIFICATIONS
- **Sample Requirements**: Optimal sample sizes for future studies
- **Duration Considerations**: Recommended study lengths
- **Environmental Parameters**: Specific space environment conditions to study
- **Measurement Protocols**: Standardized approaches for data collection
- **Quality Assurance**: Data validation and verification methods

FORMATTING REQUIREMENTS:
- Use clear section headers with emojis (## 🚀)
- Use concise bullet points (max 2-3 per section)
- Include only essential data points
- Provide brief examples
- Maintain scientific rigor while being accessible
- Length: Very concise and focused (150-250 words maximum)
- Include only critical recommendations

TONE: Highly professional, evidence-based, forward-looking, strategically actionable, scientifically rigorous

Begin your comprehensive analysis now. Remember: This analysis will directly inform NASA's space biology research strategy and mission planning decisions.`;

    let summary = "";
    try {
      // First try via official SDK (with retries)
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert NASA bioscience research analyst with deep knowledge of space biology, human spaceflight, and mission planning. You excel at synthesizing complex research findings into actionable insights for diverse stakeholders.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 4000,
      });
      summary = completion.choices[0]?.message?.content || "";
    } catch (sdkError) {
      // Fallback to direct HTTP call for better diagnostics
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
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: prompt },
            ],
            temperature: 0.6,
            max_tokens: 4000,
          }),
        });
        clearTimeout(tm);
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`OpenAI HTTP ${resp.status} ${resp.statusText}: ${text.slice(0, 300)}`);
        }
        const j = (await resp.json()) as any;
        summary = j?.choices?.[0]?.message?.content || "";
      } catch (httpError) {
        // Re-throw with merged context
        const msg = httpError instanceof Error ? httpError.message : String(httpError);
        throw new Error(`OpenAI request failed: ${msg}`);
      }
    }

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
