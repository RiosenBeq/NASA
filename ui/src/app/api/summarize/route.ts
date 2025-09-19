import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ids: number[] = body?.ids || [];
  const persona: string | null = body?.persona || null;
  const section: string | null = body?.section_priority || null;

  const citations = ids.map((id) => `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${String(id).padStart(6, "0")}/`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ summary: "OpenAI anahtarı yok. Özet mock döndü.", citations, titles: [] });
  }

  const client = new OpenAI({ apiKey });
  const prompt = `Summarize NASA bioscience studies results-first. Persona=${persona || ""} Section=${section || "results"}. IDs: ${ids.join(", ")}`;
  const msg = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });
  const summary = msg.choices?.[0]?.message?.content || "";
  return NextResponse.json({ summary, citations, titles: [] });
}
