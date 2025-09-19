import { NextRequest, NextResponse } from "next/server";

// Use authoritative CSV from SB_publications (608 items)
const CSV_URL = "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv";

function normalize(str: string) {
  return (str || "").toLowerCase();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json([], { status: 200 });

  const res = await fetch(CSV_URL);
  const csv = await res.text();
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  const items: { id: number; title: string; url: string }[] = [];
  lines.forEach((line, idx) => {
    // Simple CSV split (Title,Link) – titles may contain commas; handle quotes
    let title = "";
    let link = "";
    if (line.startsWith("\"")) {
      const endQuote = line.indexOf("\"", 1);
      title = line.slice(1, endQuote);
      const rest = line.slice(endQuote + 2);
      link = rest;
    } else {
      const comma = line.indexOf(",");
      title = line.slice(0, comma);
      link = line.slice(comma + 1);
    }
    title = title.trim();
    link = link.trim();
    if (title && link) items.push({ id: idx + 1, title, url: link });
  });

  const nq = normalize(q);
  const ranked = items
    .map((it) => {
      const t = normalize(it.title);
      const score = t.includes(nq) ? 1 : Math.max(0, 1 - (Math.abs(t.length - nq.length) / Math.max(1, t.length)));
      return { ...it, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((it) => ({ ...it, snippet: null }));

  return NextResponse.json(ranked);
}
