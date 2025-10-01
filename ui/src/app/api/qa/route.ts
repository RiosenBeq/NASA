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
    const lang: string = body?.lang || "tr";

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

    // Extract PMC ID from URL to fetch full article content
    let pmcId = "";
    let pmid = "";
    
    if (url.includes("pmc")) {
      const pmcMatch = url.match(/PMC(\d+)/);
      if (pmcMatch) {
        pmcId = pmcMatch[1];
      }
    }
    
    if (url.includes("pubmed")) {
      const pmidMatch = url.match(/pubmed\/(\d+)/);
      if (pmidMatch) {
        pmid = pmidMatch[1];
      }
    }

    // Fetch article content from PubMed/PMC
    let articleContent = "";
    let articleAbstract = "";
    
    try {
      if (pmid) {
        // Fetch from PubMed
        const pubmedResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml&rettype=abstract`);
        const pubmedXml = await pubmedResponse.text();
        
        // Extract abstract from XML
        const abstractMatch = pubmedXml.match(/<AbstractText[^>]*>([^<]+)<\/AbstractText>/);
        if (abstractMatch) {
          articleAbstract = abstractMatch[1];
        }
        
        // Extract title from XML
        const titleMatch = pubmedXml.match(/<ArticleTitle[^>]*>([^<]+)<\/ArticleTitle>/);
        if (titleMatch) {
          articleContent = `Title: ${titleMatch[1]}\n\nAbstract: ${articleAbstract}`;
        }
      } else if (pmcId) {
        // Fetch from PMC
        const pmcResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=PMC${pmcId}&retmode=xml&rettype=abstract`);
        const pmcXml = await pmcResponse.text();
        
        // Extract abstract from PMC XML
        const abstractMatch = pmcXml.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/);
        if (abstractMatch) {
          articleAbstract = abstractMatch[1].replace(/<[^>]*>/g, '').trim();
        }
        
        articleContent = `Title: ${title}\n\nAbstract: ${articleAbstract}`;
      }
    } catch (fetchError) {
      console.log("Could not fetch article content:", fetchError);
      // Fallback to title only
      articleContent = `Title: ${title}`;
    }

    const client = new OpenAI({ apiKey });

    const personaContext = getPersonaContext(persona || undefined);

    const prompt = `You are an expert NASA bioscience research analyst with comprehensive knowledge of space biology, human spaceflight, and mission planning.

ARTICLE CONTENT TO ANALYZE:
${articleContent}

PUBLICATION DETAILS:
- Title: ${title}
- URL: ${url}
- PMC ID: ${pmcId || 'N/A'}
- PMID: ${pmid || 'N/A'}

USER QUESTION:
${question}

TARGET AUDIENCE: ${personaContext}

CRITICAL INSTRUCTIONS:
You MUST analyze the specific article content provided above and answer the user's question based on the actual research findings, methodology, and conclusions from this specific publication. Do not provide generic answers.

1. **ANALYZE THE SPECIFIC ARTICLE CONTENT**
   - Extract key findings directly from the abstract/content provided
   - Identify the specific methodology used in this study
   - Note sample sizes, experimental conditions, and results mentioned
   - Highlight unique aspects of this particular research

2. **ANSWER THE USER'S QUESTION BASED ON THIS ARTICLE**
   - Use ONLY information from the article content provided above
   - Quote specific findings, numbers, or conclusions from the article
   - If the article doesn't contain information relevant to the question, clearly state this
   - Be precise and cite specific details from the research

3. **PROVIDE CONTEXT BASED ON THIS SPECIFIC STUDY**
   - How this specific study's findings relate to NASA's space biology research
   - What makes this particular study's approach or results unique
   - Connection to current NASA missions based on this study's focus

4. **DISCUSS IMPLICATIONS OF THIS SPECIFIC RESEARCH**
   ${persona === 'scientist' ? '- What this specific study teaches about research methods\n   - How to build upon these exact findings\n   - Experimental approaches used in this particular study' : ''}
   ${persona === 'manager' ? '- Strategic value of this specific research\n   - Investment implications of these exact findings\n   - How this specific study supports program goals' : ''}
   ${persona === 'architect' ? '- Mission design insights from this specific study\n   - Operational implications of these exact findings\n   - Risk factors identified in this particular research' : ''}
   ${!persona ? '- Practical applications of these specific findings\n   - How this particular study advances space biology\n   - Mission planning insights from this specific research' : ''}

5. **ACKNOWLEDGE THIS STUDY'S LIMITATIONS**
   - What this specific study couldn't determine (based on the content)
   - Limitations mentioned in the abstract or methodology
   - What additional research would complement these specific findings

FORMAT:
- Use clear paragraphs with headers (###) where appropriate
- Quote specific findings from the article content
- Include exact numbers, percentages, or results mentioned in the article
- Reference the publication as [${title}](${url})
- If the article doesn't contain relevant information, clearly state this
- Length: Thorough but concise (200-400 words)

LANGUAGE: ${lang === 'en' ? 'English (professional scientific English)' : 'Turkish (professional scientific Turkish)'}

TONE: Expert, evidence-based, helpful, forward-looking

IMPORTANT: Base your answer ONLY on the article content provided above. If the article doesn't contain information relevant to the question, clearly state this limitation.

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
