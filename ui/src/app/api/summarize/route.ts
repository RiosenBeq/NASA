import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Backend API URL'ini al (environment variable veya default)
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8003";
    
    // Backend'e proxy yap
    const response = await fetch(`${backendUrl}/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { summary: `Backend hatası: ${errorText}`, citations: [], titles: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Summarize proxy error:", error);
    return NextResponse.json(
      { 
        summary: `Özet oluşturulamadı: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`, 
        citations: [], 
        titles: [] 
      },
      { status: 500 }
    );
  }
}
