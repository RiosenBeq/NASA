import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache for 24h to avoid hammering PubMed APIs
let _cache: { data: Record<number, number>; ts: number } | null = null;
const ONE_HOUR_MS = 60 * 60 * 1000;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "NextGenLAB-NASA-Explorer/1.0 (+timeline)"
    },
    // Let Next cache at the fetch layer for 1h as an additional guard
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function parseCsvLines(csv: string): { title: string; link: string }[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  // Expect header "Title,Link"
  lines.shift();
  const items: { title: string; link: string }[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    let title = "";
    let link = "";
    if (line.startsWith("\"")) {
      const endQuote = line.indexOf("\"", 1);
      title = line.slice(1, endQuote);
      const rest = line.slice(endQuote + 2);
      link = rest;
    } else {
      const comma = line.indexOf(",");
      if (comma === -1) continue;
      title = line.slice(0, comma);
      link = line.slice(comma + 1);
    }
    title = title.trim();
    link = link.trim();
    if (title && link) items.push({ title, link });
  }
  return items;
}

function extractPmcidFromLink(link: string): string | null {
  // Examples: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/
  const m = link.match(/\/PMC(\d+)\/?/i);
  return m ? `PMC${m[1]}` : null;
}

function extractYearFromPubDate(pubdate?: string, epubdate?: string): number | null {
  const candidates = [pubdate, epubdate].filter(Boolean) as string[];
  for (const s of candidates) {
    const m = s.match(/\b(19|20)\d{2}\b/);
    if (m) return parseInt(m[0], 10);
  }
  return null;
}

export async function GET() {
  try {
    // Serve from memory cache if fresh (<1h) to keep route snappy during dev
    if (_cache && Date.now() - _cache.ts < ONE_HOUR_MS) {
      return NextResponse.json({ data: _cache.data }, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" }
      });
    }

    // 1) Load authoritative CSV (Title,Link)
    const CSV_URL = "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv";
    const csvRes = await fetch(CSV_URL, { next: { revalidate: 3600 } });
    if (!csvRes.ok) throw new Error(`CSV fetch failed: ${csvRes.status}`);
    const csv = await csvRes.text();
    const items = parseCsvLines(csv);
    if (items.length === 0) throw new Error("CSV empty or unparsable");

    // 2) Extract PMCID list
    const pmcids = items.map((it) => extractPmcidFromLink(it.link)).filter(Boolean) as string[];
    if (pmcids.length === 0) throw new Error("No PMCID values extracted from CSV links");

    // 3) Convert PMCID -> PMID via ID Converter (batch up to 100 IDs per call)
    const idconvBase = "https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/";
    const apiKey = process.env.EUTILS_API_KEY || process.env.NCBI_API_KEY || "";
    const pmids: string[] = [];

    for (const group of chunk(pmcids, 100)) {
      const url = `${idconvBase}?format=json&ids=${encodeURIComponent(group.join(","))}${apiKey ? `&api_key=${apiKey}` : ""}`;
      const j = await fetchJson(url);
      const records = (j?.records ?? []) as Record<string, unknown>[];
      for (const r of records) {
        if (r?.pmid) pmids.push(String(r.pmid));
      }
    }

    // 4) Fetch PubMed summaries for PMIDs to obtain publication year (batch up to 200 IDs per call)
    const esummaryBase = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";
    const yearCounts: Record<number, number> = {};

    for (const group of chunk(pmids, 200)) {
      const url = `${esummaryBase}?db=pubmed&retmode=json&id=${encodeURIComponent(group.join(","))}${apiKey ? `&api_key=${apiKey}` : ""}`;
      const j = await fetchJson(url);
      const result = (j?.result ?? {}) as Record<string, Record<string, unknown>>;
      for (const key of Object.keys(result)) {
        if (key === "uids") continue;
        const rec = result[key];
        const year = extractYearFromPubDate(rec?.pubdate as string | undefined, rec?.epubdate as string | undefined);
        if (year && year >= 1950 && year <= 2035) {
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
      }
    }

    // 5) Fallback: if nothing resolved via PubMed, try regex on titles/links as last resort
    if (Object.keys(yearCounts).length === 0) {
      for (const it of items) {
        const mTitle = it.title.match(/\b(19|20)\d{2}\b/);
        const mLink = it.link.match(/\b(19|20)\d{2}\b/);
        const y = mTitle ? parseInt(mTitle[0], 10) : (mLink ? parseInt(mLink[0], 10) : NaN);
        if (!Number.isNaN(y) && y >= 1950 && y <= 2035) {
          yearCounts[y] = (yearCounts[y] || 0) + 1;
        }
      }
    }

    // 6) Still nothing? Provide safe, explicit empty dataset
    const data = Object.keys(yearCounts).length ? yearCounts : {};

    // Update cache
    _cache = { data, ts: Date.now() };

    return NextResponse.json({ data }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" }
    });
  } catch (error) {
    console.error("[Year Counts] Error:", error);
    // Conservative fallback: empty so UI shows graceful message
    return NextResponse.json({ data: {} }, {
      headers: { "Cache-Control": "public, s-maxage=600" },
      status: 200
    });
  }
}
