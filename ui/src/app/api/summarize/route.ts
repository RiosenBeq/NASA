import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Backend API URL'ini al (environment variable)
    const backendUrl = process.env.BACKEND_API_URL;
    
    if (!backendUrl) {
      return NextResponse.json(
        { 
          summary: "⚠️ Backend API yapılandırması eksik.\n\nVercel Dashboard → Settings → Environment Variables bölümünden BACKEND_API_URL değişkenini ekleyin.\n\nÖrnek: https://nasa-api-xxx.onrender.com", 
          citations: [], 
          titles: [] 
        },
        { status: 503 }
      );
    }
    
    console.log(`[Summarize] Connecting to backend: ${backendUrl}`);
    
    // Backend'e proxy yap
    const response = await fetch(`${backendUrl}/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Summarize] Backend error (${response.status}):`, errorText);
      return NextResponse.json(
        { 
          summary: `❌ Backend API hatası (${response.status}):\n${errorText}\n\nBackend URL: ${backendUrl}`, 
          citations: [], 
          titles: [] 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Summarize] Success: ${data.summary?.length || 0} chars`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Summarize] Error:", error);
    
    let errorMessage = "Bilinmeyen hata";
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = "Backend API zaman aşımına uğradı (30s). Backend çalışıyor mu?";
      } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        errorMessage = "Backend API'ye bağlanılamadı. Backend çalışmıyor veya URL yanlış.";
      } else {
        errorMessage = error.message;
      }
    }
    
    const backendUrl = process.env.BACKEND_API_URL || "Ayarlanmamış";
    
    return NextResponse.json(
      { 
        summary: `❌ Özet oluşturulamadı: ${errorMessage}\n\nBackend URL: ${backendUrl}\n\nLütfen backend API'nizin çalıştığından ve Vercel'de BACKEND_API_URL environment variable'ının doğru ayarlandığından emin olun.`, 
        citations: [], 
        titles: [] 
      },
      { status: 500 }
    );
  }
}
