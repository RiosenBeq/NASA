import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id: number = body?.id;
  const question: string = body?.question || "";
  const persona: string | null = body?.persona || null;
  const url = `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${String(id || 1).padStart(6, "0")}/`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ answer: "OpenAI anahtarı yok. Bu bir mock cevaptır.", citations: [url] });
  }

  const client = new OpenAI({ apiKey });
  const prompt = `NASA space bioscience Q&A. Persona=${persona || ""}. Use concise, cited bullets. ID=${id}. Q=${question}`;
  const msg = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });
  const answer = msg.choices?.[0]?.message?.content || "";
  return NextResponse.json({ answer, citations: [url] });
}
