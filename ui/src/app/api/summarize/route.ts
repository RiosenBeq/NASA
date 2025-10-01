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
    
    const prompt = `You are an expert NASA bioscience research analyst with 15+ years of experience in space biology research. You are tasked with creating comprehensive, detailed summaries of space biology publications for NASA's Space Bioscience Research Challenge.

TARGET AUDIENCE: ${personaContext}

SECTION FOCUS: ${sectionFocus}

PUBLICATIONS TO ANALYZE:
${titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

CRITICAL REQUIREMENTS:
Create an extremely detailed, comprehensive summary following NASA's Space Bioscience Research Challenge guidelines. This summary will be used by NASA scientists, mission planners, and program managers for critical decision-making.

STRUCTURE YOUR ANALYSIS AS FOLLOWS:

## 🚀 EXECUTIVE SUMMARY
Provide a comprehensive 4-5 sentence overview covering:
- Research scope and primary objectives
- Key methodologies employed
- Major findings and their significance
- Direct relevance to NASA's space exploration goals

## 🔬 DETAILED RESEARCH FINDINGS
For each publication, provide:
- **Experimental Design**: Detailed methodology, sample sizes, control groups
- **Primary Results**: Specific data points, statistical analyses, effect sizes
- **Secondary Findings**: Unexpected discoveries, correlations, trends
- **Data Quality**: Sample size adequacy, statistical power, reproducibility
- **Limitations**: Study constraints, potential biases, methodological concerns

## 🌌 SCIENTIFIC PROGRESS & IMPACT ANALYSIS
- **Knowledge Advancement**: How this research pushes the boundaries of space biology
- **Mechanism Understanding**: What biological processes are revealed
- **Space Environment Effects**: Specific impacts of microgravity, radiation, isolation
- **Human Spaceflight Implications**: Direct applications for Moon/Mars missions
- **Technology Development**: Required hardware, systems, or protocols

## 🔍 COMPREHENSIVE KNOWLEDGE GAPS
- **Unanswered Questions**: Specific research questions that remain
- **Methodological Gaps**: Experimental approaches not yet attempted
- **Data Gaps**: Missing information or insufficient sample sizes
- **Longitudinal Studies**: Need for extended duration research
- **Cross-Species Comparisons**: Comparative biology requirements

## ⚖️ CONSENSUS & CONTROVERSIES ANALYSIS
- **Scientific Consensus**: Areas of agreement across multiple studies
- **Conflicting Evidence**: Contradictory findings and possible explanations
- **Methodological Differences**: How different approaches yield different results
- **Interpretation Disagreements**: Alternative explanations for findings
- **Replication Status**: Which findings have been independently verified

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
- Use detailed bullet points with sub-bullets
- Include specific data points and measurements
- Provide concrete examples and case studies
- Maintain scientific rigor while being accessible
- Length: Comprehensive (800-1200 words minimum)
- Include specific recommendations and actionable items

TONE: Highly professional, evidence-based, forward-looking, strategically actionable, scientifically rigorous

Begin your comprehensive analysis now. Remember: This analysis will directly inform NASA's space biology research strategy and mission planning decisions.`;

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
      temperature: 0.6,
      max_tokens: 4000,
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
