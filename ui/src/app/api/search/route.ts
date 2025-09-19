import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json([], { status: 200 });
  const mock = [
    { id: 1, title: "Space Plant Growth in Microgravity", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC000001/", score: 0.91, snippet: "Plants grew slower in microgravity compared to Earth controls..." },
    { id: 2, title: "Cardiovascular Responses to Long-Duration Spaceflight", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC000002/", score: 0.87, snippet: "Increased arterial stiffness and reduced blood volume..." },
  ];
  return NextResponse.json(mock);
}
