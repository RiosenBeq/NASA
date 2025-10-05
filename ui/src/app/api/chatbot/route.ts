import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `Sen NextGenLAB Space Bioscience Explorer platformunun yardımcı asistanısın. Kullanıcılara platform hakkında bilgi ver ve yardımcı ol.

PLATFORM HAKKINDA:
- NextGenLAB, 608 NASA uzay biyolojisi yayınını AI ile erişilebilir kılan bir araştırma platformudur
- Semantik arama, AI özetleme, soru-cevap ve bilgi grafiği özellikleri var
- GPT-4o-mini ile 600-1000 kelimelik detaylı özetler üretir
- 3,107 düğüm ve 40,967 bağlantılı interaktif bilgi grafiği
- Türkçe ve İngilizce dil desteği
- NASA Space Apps Challenge 2025 için geliştirildi

ÖZELLİKLER:
1. ARAMA: 608 NASA yayınında semantik arama
   - Ana sayfada arama kutusuna sorgunuzu yazın
   - Akıllı öneriler ve filtreleme var
   - Sonuçlar ilgi puanıyla gösterilir

2. AI ÖZETLEME: 
   - Her yayın için "Özetle" butonuna basın
   - 600-1000 kelime kapsamlı analiz
   - Bilim insanı, yönetici veya mimar için özelleştirilebilir
   - Ana bulgular, NASA etkisi, araştırma boşlukları

3. SORU-CEVAP:
   - Herhangi bir yayın kartında soru sorabilirsiniz
   - AI makale içeriğini analiz edip cevaplar
   - NCBI PMC'den tam makale içeriği çekilir

4. BİLGİ GRAFİĞİ:
   - 3,107 araştırma varlığı
   - 40,967 bağlantı
   - İnteraktif görselleştirme
   - İlişkileri keşfedin

5. ANALİTİK:
   - Araştırma trendleri
   - Yıllara göre dağılım
   - Organizmalara göre analiz

SAYFALLAR:
- Ana Sayfa: Arama ve özetleme
- Analytics: Grafikler ve istatistikler
- Guidelines: Kullanım kılavuzu
- Resources: NASA kaynakları
- FAQ: Sık sorulan sorular

VERİ KAYNAKLARI:
- 608 NASA yayını (1970-2024)
- NASA OSDR (Open Science Data Repository)
- NCBI PubMed Central
- NASA Task Book
- NSLSL (Space Life Sciences)

KULLANIM:
1. Ana sayfada arama kutusuna sorgunuzu girin
2. Sonuçlarda "Özetle" ile AI özeti alın
3. Soru sorun: Makale kartında soru kutusuna yazın
4. Bilgi grafiğini keşfedin
5. Analytics'te trendleri görün

ÖRNEKLER:
- "mikrogravite bitki kök büyümesi" araması yapın
- "uzay radyasyonu DNA hasarı" için özetler alın
- "Kemik kaybı nasıl önlenir?" diye sorun

ÖNEMLİ:
- Kısa, net ve yardımcı ol
- Türkçe cevap ver
- Emoji kullan (🔍🤖🕸️📊)
- Adım adım açıkla
- Kullanıcıyı yönlendir

Her zaman dostça, profesyonel ve bilgilendirici ol!`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json({
        response: "⚠️ OpenAI API anahtarı yapılandırılmamış. Site yöneticisiyle iletişime geçin.",
      });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: apiKey,
      maxRetries: 2,
      timeout: 20000,
    });

    // Build messages array with conversation history
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ];

    // Add conversation history (last 10 messages max)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          });
        }
      });
    } else {
      // If no history, just add current message
      messages.push({
        role: "user",
        content: message,
      });
    }

    // Call OpenAI API with conversation context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const response = completion.choices[0]?.message?.content || "Üzgünüm, yanıt oluşturamadım.";

    return NextResponse.json({
      response,
      success: true,
    });

  } catch (error: unknown) {
    console.error("Chatbot error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Handle specific error types
    if (errorMessage.includes("rate_limit")) {
      return NextResponse.json({
        response: "⏳ API limit aşıldı. Lütfen birkaç saniye sonra tekrar deneyin.",
      });
    }
    
    if (errorMessage.includes("timeout")) {
      return NextResponse.json({
        response: "⏱️ Yanıt zaman aşımına uğradı. Lütfen tekrar deneyin.",
      });
    }

    if (errorMessage.includes("API key")) {
      return NextResponse.json({
        response: "🔑 API anahtarı geçersiz. Lütfen yöneticiyle iletişime geçin.",
      });
    }
    
    return NextResponse.json({
      response: "❌ Bir hata oluştu. Lütfen daha sonra tekrar deneyin veya farklı bir soru sorun.",
    });
  }
}

