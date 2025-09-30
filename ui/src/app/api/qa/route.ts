import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Backend API URL'ini al (environment variable veya default)
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8003";
    
    // Backend'e proxy yap
    const response = await fetch(`${backendUrl}/qa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { answer: `Backend hatası: ${errorText}`, citations: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("QA proxy error:", error);
    return NextResponse.json(
      { 
        answer: `Soru cevaplanamadı: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`, 
        citations: [] 
      },
      { status: 500 }
    );
  }
}
