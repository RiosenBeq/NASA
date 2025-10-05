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
    const language: string = body?.language || "tr"; // Get language from request

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

    // Extract PMCID from URL
    let pmcId = "";
    const pmcMatch = url.match(/PMC(\d+)/i);
    if (pmcMatch) {
      pmcId = `PMC${pmcMatch[1]}`;
    }

    console.log(`[QA] Fetching content for ${pmcId}: ${title}`);

    // Fetch abstract and article details from NCBI E-utilities
    let abstract = "";
    let articleDetails = "";
    
    if (pmcId) {
      try {
        // Fetch from NCBI E-utilities API
        const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=${pmcId}&retmode=xml`;
        const articleResponse = await fetch(efetchUrl, {
          headers: { 'User-Agent': 'NextGenLAB-NASA-Explorer/1.0 (qa-system)' }
        });
        
        if (articleResponse.ok) {
          const xmlText = await articleResponse.text();
          
          // Extract abstract using simple regex (basic XML parsing)
          const abstractMatch = xmlText.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/i);
          if (abstractMatch) {
            // Remove XML tags from abstract
            abstract = abstractMatch[1]
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 8000); // Increased to 8000 chars for full abstract
          }

          // Extract ALL key sections with much higher limits
          const introMatch = xmlText.match(/<sec[^>]*>[\s\S]*?<title>(?:Introduction|Background)<\/title>[\s\S]*?<\/sec>/i);
          const methodsMatch = xmlText.match(/<sec[^>]*>[\s\S]*?<title>(?:Methods?|Materials? and Methods?|Methodology|Experimental Procedures?)<\/title>[\s\S]*?<\/sec>/i);
          const resultsMatch = xmlText.match(/<sec[^>]*>[\s\S]*?<title>(?:Results?|Findings|Observations?)<\/title>[\s\S]*?<\/sec>/i);
          const discussionMatch = xmlText.match(/<sec[^>]*>[\s\S]*?<title>(?:Discussion|Interpretation)<\/title>[\s\S]*?<\/sec>/i);
          const conclusionsMatch = xmlText.match(/<sec[^>]*>[\s\S]*?<title>(?:Conclusions?|Summary|Concluding Remarks?)<\/title>[\s\S]*?<\/sec>/i);

          const sections = [];
          
          if (introMatch) {
            const intro = introMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);
            sections.push(`**INTRODUCTION:**\n${intro}`);
          }
          
          if (methodsMatch) {
            const methods = methodsMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 4000);
            sections.push(`**METHODS:**\n${methods}`);
          }
          
          if (resultsMatch) {
            const results = resultsMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000);
            sections.push(`**RESULTS:**\n${results}`);
          }
          
          if (discussionMatch) {
            const discussion = discussionMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 4000);
            sections.push(`**DISCUSSION:**\n${discussion}`);
          }
          
          if (conclusionsMatch) {
            const conclusions = conclusionsMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);
            sections.push(`**CONCLUSIONS:**\n${conclusions}`);
          }

          if (sections.length > 0) {
            articleDetails = "\n\n" + sections.join("\n\n");
          }

          console.log(`[QA] Successfully fetched FULL article content from PMC. Abstract: ${abstract.length} chars, Sections: ${sections.length}`);
        }
      } catch (fetchError) {
        console.error(`[QA] Failed to fetch article content:`, fetchError);
        // Continue without abstract - will use title only
      }
    }

    // Configure OpenAI client with retry and timeout
    const client = new OpenAI({ apiKey, maxRetries: 2, timeout: 30000 });

    const prompt = `You are an expert NASA bioscience research analyst with deep knowledge of space biology research. You have been provided with the FULL TEXT CONTENT from the research article (not just a summary). Answer the user's question based on this comprehensive article content.

📄 FULL ARTICLE CONTENT FROM PMC DATABASE:

Title: ${title}
URL: ${url}
PMC ID: ${pmcId || 'Not available'}

${abstract ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSTRACT (FULL TEXT):
${abstract}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` : ''}
${articleDetails || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 USER QUESTION:
${question}

📋 CRITICAL INSTRUCTIONS FOR ANSWERING:
✅ You have the FULL ARTICLE TEXT above (Abstract + Introduction + Methods + Results + Discussion + Conclusions)
✅ This is NOT just a summary - this is comprehensive content directly from the published paper
✅ Use ALL sections (Introduction, Methods, Results, Discussion, Conclusions) to answer thoroughly
✅ Provide detailed, specific answers with data, measurements, and findings from the article
✅ Quote specific numbers, percentages, statistical results, and experimental details
✅ Reference specific sections when answering (e.g., "According to the Methods section..." or "The Results show that...")
✅ If methodology is asked, provide detailed experimental procedures from Methods section
✅ If results are asked, provide specific findings with data from Results section
✅ If asked for "one sentence" (tek cümle) or "brief" (kısa), give 1-2 sentences ONLY
✅ Otherwise, provide comprehensive, detailed answers using all available information
✅ IMPORTANT: Write your answer in ${language === 'en' ? 'ENGLISH' : 'TURKISH (professional scientific Turkish)'}
✅ Be as detailed as the full article content allows
✅ ONLY say "${language === 'en' ? 'This specific information is not found in the article' : 'Bu spesifik bilgi makalede bulunamadı'}" if the question is completely unrelated to the article topic

🎯 Your task: Provide a comprehensive, detailed, accurate answer in ${language === 'en' ? 'ENGLISH' : 'TURKISH'} using the FULL ARTICLE CONTENT provided above:`;

    // Detect if user wants short/brief answer
    const lowerQ = question.toLowerCase();
    const wantsShort = lowerQ.includes('kısa') || lowerQ.includes('özetle') || 
                       lowerQ.includes('tek cümle') || lowerQ.includes('brief') || 
                       lowerQ.includes('one sentence') || lowerQ.includes('summarize');
    const maxTokens = wantsShort ? 200 : 3000; // Increased to 3000 for comprehensive answers from full article

    let answer = "";
    try {
      console.log(`[QA] Sending to OpenAI. Prompt length: ${prompt.length} chars, Max tokens: ${maxTokens}`);
      
      const msg = await client.chat.completions.create({
        model: "gpt-4o-mini", // Using better model for accurate answers
        messages: [
          {
            role: "system",
            content: `You are a NASA bioscience research analyst with expertise in space biology. You have been provided with FULL TEXT CONTENT from a research article (Abstract, Introduction, Methods, Results, Discussion, Conclusions). Provide detailed, comprehensive, accurate answers using ALL sections of the article. Quote specific data, measurements, and findings. Reference specific sections when answering. Be thorough and detailed. Answer in ${language === 'en' ? 'English' : 'Turkish'}.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2, // Lower temperature for more accurate responses
        max_tokens: maxTokens,
      });
      answer = msg.choices?.[0]?.message?.content || "Cevap oluşturulamadı.";
      console.log(`[QA] Received answer. Length: ${answer.length} chars`);
    } catch (aiError) {
      console.error('[QA] OpenAI SDK error:', aiError);
      // HTTP fallback if SDK fails
      try {
        const ctrl = new AbortController();
        const tm = setTimeout(() => ctrl.abort(), 30000);
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
              { role: "system", content: `You are a NASA bioscience research analyst with expertise in space biology. You have been provided with FULL TEXT CONTENT from a research article. Provide detailed, comprehensive answers using ALL sections. Quote specific data and findings. Answer in ${language === 'en' ? 'English' : 'Turkish'}.` },
              { role: "user", content: prompt },
            ],
            temperature: 0.2,
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
