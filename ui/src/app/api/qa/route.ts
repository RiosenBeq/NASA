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
              .substring(0, 3000); // Limit to 3000 chars
          }

          // Extract key sections (methods, results, conclusions)
          const methodsMatch = xmlText.match(/<sec[^>]*>[\s\S]*?<title>(?:Methods?|Materials? and Methods?|Methodology)<\/title>[\s\S]*?<\/sec>/i);
          const resultsMatch = xmlText.match(/<sec[^>]*>[\s\S]*?<title>(?:Results?|Findings)<\/title>[\s\S]*?<\/sec>/i);
          const conclusionsMatch = xmlText.match(/<sec[^>]*>[\s\S]*?<title>(?:Conclusions?|Discussion)<\/title>[\s\S]*?<\/sec>/i);

          const sections = [];
          if (methodsMatch) {
            const methods = methodsMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 800);
            sections.push(`**Methods:** ${methods}`);
          }
          if (resultsMatch) {
            const results = resultsMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 1000);
            sections.push(`**Results:** ${results}`);
          }
          if (conclusionsMatch) {
            const conclusions = conclusionsMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 800);
            sections.push(`**Conclusions:** ${conclusions}`);
          }

          if (sections.length > 0) {
            articleDetails = "\n\n" + sections.join("\n\n");
          }

          console.log(`[QA] Successfully fetched article content. Abstract length: ${abstract.length}, Sections: ${sections.length}`);
        }
      } catch (fetchError) {
        console.error(`[QA] Failed to fetch article content:`, fetchError);
        // Continue without abstract - will use title only
      }
    }

    // Configure OpenAI client with retry and timeout
    const client = new OpenAI({ apiKey, maxRetries: 2, timeout: 30000 });

    const prompt = `You are an expert NASA bioscience research analyst with deep knowledge of space biology research. Answer the user's question about this specific publication based on the provided article content.

PUBLICATION DETAILS:
Title: ${title}
URL: ${url}
PMC ID: ${pmcId || 'Not available'}

${abstract ? `ABSTRACT:
${abstract}` : ''}
${articleDetails || ''}

USER QUESTION:
${question}

CRITICAL INSTRUCTIONS:
- Answer based on the article content provided above (title, abstract, methods, results, conclusions)
- Use any relevant information from the title, abstract, or sections to answer the question
- If the article content contains ANY relevant information, provide an answer based on it
- Even if the information is limited, provide what you can find from the abstract or sections
- ONLY say "${language === 'en' ? 'This specific information is not found in the available article content' : 'Bu spesifik bilgi mevcut makale içeriğinde bulunamadı'}" if the question asks for something completely unrelated to the article topic
- Be helpful and informative - make reasonable inferences from the available abstract and sections
- If asked for "one sentence" (tek cümle/brief) or "brief" (kısa/özetle), give 1-2 sentences ONLY
- If asked for methodology, details, or explanations, provide a thorough answer with specific details from the Methods/Results sections
- IMPORTANT: Write your answer in ${language === 'en' ? 'ENGLISH' : 'TURKISH (professional scientific Turkish)'}
- Quote specific data, measurements, or findings when available
- If full details aren't in the abstract, explain based on what's available and note that more details would be in the full paper
- Language preference: ${language === 'en' ? 'Answer must be in English' : 'Cevap Türkçe olmalı'}

Answer the question now in ${language === 'en' ? 'ENGLISH' : 'TURKISH'} based on the provided article content. Be helpful and use all available information:`;

    // Detect if user wants short/brief answer
    const lowerQ = question.toLowerCase();
    const wantsShort = lowerQ.includes('kısa') || lowerQ.includes('özetle') || 
                       lowerQ.includes('tek cümle') || lowerQ.includes('brief') || 
                       lowerQ.includes('one sentence') || lowerQ.includes('summarize');
    const maxTokens = wantsShort ? 200 : 2000; // Increased for detailed answers

    let answer = "";
    try {
      console.log(`[QA] Sending to OpenAI. Prompt length: ${prompt.length} chars, Max tokens: ${maxTokens}`);
      
      const msg = await client.chat.completions.create({
        model: "gpt-4o-mini", // Using better model for accurate answers
        messages: [
          {
            role: "system",
            content: `You are a helpful NASA bioscience research analyst with expertise in space biology. You provide accurate, evidence-based answers from the article content provided (title, abstract, methods, results, conclusions). You are helpful and informative, making reasonable inferences from available information. Only refuse to answer if the question is completely unrelated to the article topic. Answer in ${language === 'en' ? 'English' : 'Turkish'}.`
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
              { role: "system", content: `You are a helpful NASA bioscience research analyst with expertise in space biology. You provide accurate, evidence-based answers from the article content provided. You are helpful and make reasonable inferences from available information. Answer in ${language === 'en' ? 'English' : 'Turkish'}.` },
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
