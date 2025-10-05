import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, persona, section_priority, language } = body;

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
  const client = new OpenAI({ apiKey, maxRetries: 2, timeout: 60000 });

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

    // Build enhanced prompt based on NASA requirements and language
    const personaContext = getPersonaContext(persona, language);
    const sectionFocus = getSectionFocus(section_priority, language);
    const isTurkish = language === "tr";
    
    const prompt = buildPrompt(titles, personaContext, sectionFocus, persona, isTurkish);

    let summary = "";
    try {
      // First try via official SDK (with retries)
      const systemMessage = isTurkish
        ? "NASA uzay biyobilim araştırma analisti olarak uzay biyolojisi, insanlı uzay uçuşu ve görev planlaması konularında derin bilgiye sahipsiniz. Karmaşık araştırma bulgularını farklı paydaşlar için uygulanabilir içgörülere dönüştürmede mükemmelsiniz. TÜM CEVAPLARI TÜRKÇE YAZIN."
        : "You are an expert NASA bioscience research analyst with deep knowledge of space biology, human spaceflight, and mission planning. You excel at synthesizing complex research findings into actionable insights for diverse stakeholders. WRITE ALL RESPONSES IN ENGLISH.";
      
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      summary = completion.choices[0]?.message?.content || "";
    } catch {
      // Fallback to direct HTTP call for better diagnostics
      try {
        const systemMessage = isTurkish
          ? "NASA uzay biyobilim araştırma analisti olarak tüm cevapları Türkçe yazın."
          : "You are an expert NASA bioscience research analyst. Write all responses in English.";
        
        const ctrl = new AbortController();
        const tm = setTimeout(() => ctrl.abort(), 60000);
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
              { role: "system", content: systemMessage },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });
        clearTimeout(tm);
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`OpenAI HTTP ${resp.status} ${resp.statusText}: ${text.slice(0, 300)}`);
        }
        const j = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
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
        language: language || "en",
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

function buildPrompt(titles: string[], personaContext: string, sectionFocus: string, persona: string | undefined, isTurkish: boolean): string {
  const publicationsList = titles.map((t, i) => `${i + 1}. ${t}`).join("\n");
  
  if (isTurkish) {
    return `NASA uzay biyobilim araştırma analisti olarak 15+ yıllık uzay biyolojisi araştırma deneyiminizle, NASA'nın Uzay Biyobilim Araştırma Mücadelesi için uzay biyolojisi yayınlarının kapsamlı, detaylı özetlerini oluşturmanız beklenmektedir.

HEDEF KİTLE: ${personaContext}

BÖLÜM ODAĞI: ${sectionFocus}

ANALİZ EDİLECEK YAYINLAR:
${publicationsList}

KRİTİK GEREKSINIMLER:
NASA'nın Uzay Biyobilim Araştırma Mücadelesi kılavuzlarını takip ederek kapsamlı ve detaylı bir analiz oluşturun. Netliği ve uygulanabilirliği korurken derinlemesine içgörüler sağlayın.

ANALİZİNİZİ ŞU ŞEKİLDE YAPILANDIRIN:

## 🚀 YÖNETİCİ ÖZETİ
Şunları kapsayan kapsamlı 3-5 cümlelik genel bakış:
- Araştırma kapsamı, hedefler ve ana bulgular
- NASA'nın uzay keşif hedefleriyle doğrudan ilgisi
- Genel önem ve potansiyel etki

## 🔬 TEMEL BULGULAR
Her yayın için detaylı analiz:
- **Arka Plan ve Bağlam**: Araştırma motivasyonu ve önceki çalışmalar
- **Metodoloji**: Detaylı deneysel yaklaşım ve kullanılan teknikler
- **Sonuçlar**: Spesifik veri noktaları ve gözlemlerle kapsamlı bulgular
- **Önem**: Bu bulguların uzay biyolojisi için önemi
- **Sınırlamalar**: Çalışma kısıtlamaları ve daha fazla araştırma gerektiren alanlar

## 🌌 NASA ETKİSİ
- **Uzay Biyolojisi İlerlemesi**: Uzay biyolojisi anlayışını nasıl ilerlettiğinin detaylı açıklaması
- **Görev Uygulamaları**: Örneklerle Ay/Mars görevleri için spesifik uygulamalar
- **Teknoloji Geliştirme**: Yeni teknolojiler veya karşı önlemler için sonuçlar
- **Mürettebat Sağlığı ve Güvenliği**: Astronot refahıyla doğrudan ilgisi

## 🔍 ARAŞTIRMA BOŞLUKLARI
- **Kritik Sorular**: En önemli cevaplanmamış soruların detaylı tartışması
- **Bilgi Sınırlamaları**: Hala anlamadığımız şeyler ve bunun önemi
- **Sonraki Adımlar**: Gerekçeleriyle takip araştırması için spesifik öneriler
- **Kaynak İhtiyaçları**: Boşlukları gidermek için gereken kaynaklar veya yetenekler

## 💡 STRATEJİK UYGULANABİLİR İÇGÖRÜLER
${getPersonaInsightsTurkish(persona)}

FORMATLAMA GEREKSİNİMLERİ:
- Emoji'li net bölüm başlıkları kullanın (## 🚀)
- Uygun yerlerde madde işaretleri kullanın (bölüm başına 3-4 nokta)
- Spesifik veri noktaları, istatistikler ve nicel sonuçlar dahil edin
- Somut örnekler ve vaka çalışmaları sağlayın
- Farklı kitleler için erişilebilir olurken bilimsel titizliği koruyun
- Uzunluk: Öz ve anlaşılır (toplam 300-400 kelime)
- Destekleyici gerekçelerle öneriler dahil edin
- Vurgu için markdown formatı kullanın (anahtar terimler için **kalın**)

TON: Son derece profesyonel, kanıta dayalı, ileriye dönük, stratejik olarak uygulanabilir, bilimsel olarak titiz

ÖNEMLİ: Tüm analizi TÜRKÇE yazın. Başlıklar, açıklamalar ve tüm içerik Türkçe olmalıdır.

Kapsamlı analizinize şimdi başlayın. Unutmayın: Bu analiz doğrudan NASA'nın uzay biyolojisi araştırma stratejisini ve görev planlama kararlarını bilgilendirecektir.`;
  }
  
  return `You are an expert NASA bioscience research analyst with 15+ years of experience in space biology research. You are tasked with creating comprehensive, detailed summaries of space biology publications for NASA's Space Bioscience Research Challenge.

TARGET AUDIENCE: ${personaContext}

SECTION FOCUS: ${sectionFocus}

PUBLICATIONS TO ANALYZE:
${publicationsList}

CRITICAL REQUIREMENTS:
Create a comprehensive and detailed analysis following NASA's Space Bioscience Research Challenge guidelines. Provide thorough insights while maintaining clarity and actionability.

STRUCTURE YOUR ANALYSIS AS FOLLOWS:

## 🚀 EXECUTIVE SUMMARY
Provide a comprehensive 3-5 sentence overview covering:
- Research scope, objectives, and key findings
- Direct relevance to NASA's space exploration goals
- Overall significance and potential impact

## 🔬 KEY FINDINGS
For each publication, provide detailed analysis:
- **Background & Context**: Research motivation and previous work
- **Methodology**: Detailed experimental approach and techniques used
- **Results**: Comprehensive findings with specific data points and observations
- **Significance**: Why these findings matter for space biology
- **Limitations**: Study constraints and areas requiring further investigation

## 🌌 NASA IMPACT
- **Space Biology Advancement**: Detailed explanation of how this advances space biology understanding
- **Mission Applications**: Specific applications for Moon/Mars missions with examples
- **Technology Development**: Implications for new technologies or countermeasures
- **Crew Health & Safety**: Direct relevance to astronaut wellbeing

## 🔍 RESEARCH GAPS
- **Critical Questions**: Detailed discussion of the most important unanswered questions
- **Knowledge Limitations**: What we still don't understand and why it matters
- **Next Steps**: Specific recommendations for follow-up research with rationale
- **Resource Needs**: What resources or capabilities are needed to address gaps

## 💡 STRATEGIC ACTIONABLE INSIGHTS
${getPersonaInsightsEnglish(persona)}

FORMATTING REQUIREMENTS:
- Use clear section headers with emojis (## 🚀)
- Use bullet points where appropriate (3-4 points per section)
- Include specific data points, statistics, and quantitative results
- Provide concrete examples and case studies
- Maintain scientific rigor while being accessible to diverse audiences
- Length: Concise and clear (300-400 words total)
- Include recommendations with supporting rationale
- Use markdown formatting for emphasis (**bold** for key terms)

TONE: Highly professional, evidence-based, forward-looking, strategically actionable, scientifically rigorous

IMPORTANT: Write the entire analysis in ENGLISH. All headers, descriptions, and content should be in English.

Begin your comprehensive analysis now. Remember: This analysis will directly inform NASA's space biology research strategy and mission planning decisions.`;
}

function getPersonaInsightsTurkish(persona: string | undefined): string {
  switch (persona) {
    case 'scientist':
      return `**Araştırma Bilimcileri İçin:**
- **Test Edilebilir Hipotezler**: Net değişkenler ve beklenen sonuçlarla gelecek deneyler için spesifik, uygulanabilir hipotezler
- **Deneysel Protokoller**: Metodolojiler, kontroller ve doğrulama yaklaşımları için detaylı öneriler
- **İşbirliği Fırsatları**: Tamamlayıcı araştırma gruplarını ve potansiyel disiplinler arası ortaklıkları belirleme
- **Veri Gereksinimleri**: Bulguları güçlendirecek ek veriler veya ölçümler
- **Yayın Stratejisi**: Sonuçları bilimsel etkiyi maksimize edecek şekilde iletme önerileri`;
    case 'manager':
      return `**Program Yöneticileri İçin:**
- **Yatırım Öncelikleri**: Beklenen yatırım getirisi ve zaman çizelgesi ile detaylı finansman önerileri
- **Portföy Dengesi**: Keşifsel ve uygulamalı araştırmayı dengeleme konusunda stratejik rehberlik
- **Kaynak Tahsisi**: Araştırma alanlarında spesifik bütçe ve personel önerileri
- **Risk Değerlendirmesi**: Yüksek riskli/yüksek ödüllü fırsatların belirlenmesi ve azaltma stratejileri
- **Performans Metrikleri**: İlerleme ve başarıyı izlemek için ana göstergeler
- **Paydaş İletişimi**: Bulguları destek ve katılımı maksimize edecek şekilde sunma`;
    case 'architect':
      return `**Görev Mimarları İçin:**
- **Görev Tasarım Kısıtlamaları**: Uzay aracı/habitat tasarımı için spesifik operasyonel sınırlamalar ve gereksinimler
- **Teknoloji Hazırlığı**: Gerekli teknolojilerin ve mevcut TRL seviyelerinin değerlendirmesi
- **Mürettebat Sağlık Sistemleri**: Yaşam desteği, tıbbi ve izleme sistemleri için detaylı öneriler
- **Zaman Çizelgesi Sonuçları**: Bulguların görev süresi ve planlamasını nasıl etkilediği
- **Risk Azaltma**: Gerekli karşı önlemler ve yedek sistemler
- **Test Gereksinimleri**: Uçuş uygulamasından önce gereken yer tabanlı doğrulama`;
    default:
      return `**Tüm Paydaşlar İçin:**
- **Stratejik Öncelikler**: Acil dikkat ve uzun vadeli yatırım gerektiren ana alanlar
- **Çapraz Fonksiyonel Etki**: Bulguların farklı görev yönlerini nasıl etkilediği (mürettebat, donanım, operasyonlar)
- **Risk Yönetimi**: Spesifik azaltma yaklaşımlarıyla kapsamlı risk değerlendirmesi
- **Teknoloji Geliştirme**: Geliştirme veya iyileştirme gerektiren kritik yetenekler
- **Karar Noktaları**: Gerekli ana kararlar ve önerilen zaman çizelgeleri
- **Başarı Metrikleri**: Görev hedeflerine doğru ilerlemeyi nasıl ölçeceğiz ve değerlendireceğiz`;
  }
}

function getPersonaInsightsEnglish(persona: string | undefined): string {
  switch (persona) {
    case 'scientist':
      return `**For Research Scientists:**
- **Testable Hypotheses**: Specific, actionable hypotheses for future experiments with clear variables and expected outcomes
- **Experimental Protocols**: Detailed recommendations for methodologies, controls, and validation approaches
- **Collaboration Opportunities**: Identify complementary research groups and potential interdisciplinary partnerships
- **Data Requirements**: What additional data or measurements would strengthen findings
- **Publication Strategy**: Recommendations for communicating results to maximize scientific impact`;
    case 'manager':
      return `**For Program Managers:**
- **Investment Priorities**: Detailed funding recommendations with expected ROI and timeline
- **Portfolio Balance**: Strategic guidance on balancing exploratory vs. applied research
- **Resource Allocation**: Specific budget and personnel recommendations across research areas
- **Risk Assessment**: Identification of high-risk/high-reward opportunities and mitigation strategies
- **Performance Metrics**: Key indicators to track progress and success
- **Stakeholder Communication**: How to present findings to maximize support and engagement`;
    case 'architect':
      return `**For Mission Architects:**
- **Mission Design Constraints**: Specific operational limitations and requirements for spacecraft/habitat design
- **Technology Readiness**: Assessment of required technologies and their current TRL levels
- **Crew Health Systems**: Detailed recommendations for life support, medical, and monitoring systems
- **Timeline Implications**: How findings affect mission duration and scheduling
- **Risk Mitigation**: Specific countermeasures and backup systems needed
- **Testing Requirements**: Ground-based validation needed before flight implementation`;
    default:
      return `**For All Stakeholders:**
- **Strategic Priorities**: Key areas requiring immediate attention and long-term investment
- **Cross-Functional Impact**: How findings affect different mission aspects (crew, hardware, operations)
- **Risk Management**: Comprehensive assessment of risks with specific mitigation approaches
- **Technology Development**: Critical capabilities requiring development or improvement
- **Decision Points**: Key decisions needed and recommended timelines
- **Success Metrics**: How to measure and evaluate progress toward mission goals`;
  }
}

function getPersonaContext(persona?: string, language?: string): string {
  const isTurkish = language === "tr";
  
  switch (persona) {
    case "scientist":
      return isTurkish
        ? "Uzay biyolojisi çalışmaları için yeni hipotezler üreten ve deneyler tasarlayan araştırma bilimcileri. Deneysel metodoloji, veri yorumlama ve hipotez oluşturmaya odaklanın."
        : "Research scientists generating new hypotheses and designing experiments for space biology studies. Focus on experimental methodology, data interpretation, and hypothesis generation.";
    case "manager":
      return isTurkish
        ? "Yatırım fırsatlarını ve araştırma önceliklerini belirleyen program yöneticileri ve karar vericiler. Stratejik önem, kaynak tahsisi ve portföy optimizasyonuna odaklanın."
        : "Program managers and decision-makers identifying investment opportunities and research priorities. Focus on strategic importance, resource allocation, and portfolio optimization.";
    case "architect":
      return isTurkish
        ? "Güvenli ve verimli Ay ve Mars keşfi planlayan görev mimarları. Operasyonel kısıtlamalar, teknoloji gereksinimleri ve risk azaltmaya odaklanın."
        : "Mission architects planning safe and efficient lunar and Mars exploration. Focus on operational constraints, technology requirements, and risk mitigation.";
    default:
      return isTurkish
        ? "Bilim insanları, yöneticiler ve görev planlayıcıları dahil çeşitli paydaşlar. Birden fazla kitleyle ilgili dengeli içgörüler sağlayın."
        : "Diverse stakeholders including scientists, managers, and mission planners. Provide balanced insights relevant to multiple audiences.";
  }
}

function getSectionFocus(section?: string, language?: string): string {
  const isTurkish = language === "tr";
  
  switch (section) {
    case "results":
      return isTurkish
        ? "Sonuçlar bölümlerine öncelik verin - objektif olarak gösterilen bulgulara, deneysel verilere, istatistiksel analizlere ve ampirik kanıtlara odaklanın."
        : "Prioritize Results sections - focus on objectively demonstrated findings, experimental data, statistical analyses, and empirical evidence.";
    case "discussion":
      return isTurkish
        ? "Tartışma bölümlerine öncelik verin - sonuçların yorumlanmasına, mevcut literatürle karşılaştırmaya ve daha geniş çıkarımlara odaklanın."
        : "Prioritize Discussion sections - focus on interpretation of results, comparison with existing literature, and broader implications.";
    case "conclusion":
      return isTurkish
        ? "Sonuç bölümlerine öncelik verin - ileriye dönük içgörülere, gelecekteki araştırma yönlerine ve pratik uygulamalara odaklanın."
        : "Prioritize Conclusion sections - focus on forward-looking insights, future research directions, and practical applications.";
    default:
      return isTurkish
        ? "Tüm bölümlerde dengeli analiz - Giriş, Yöntemler, Sonuçlar, Tartışma ve Sonuçlardan bulguları entegre edin."
        : "Balanced analysis across all sections - integrate findings from Introduction, Methods, Results, Discussion, and Conclusions.";
  }
}
