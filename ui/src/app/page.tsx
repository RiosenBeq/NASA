"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Item = {
  id: number;
  title: string;
  url: string;
  score: number;
  snippet?: string | null;
};

const BRAND = {
  name: "NextGenLAB • Space Bio Explorer",
  primary: "#0A0E2C", // deep space blue
  secondary: "#5B4AE6", // nebula violet
  accent: "#A6E1FF", // starlight cyan
  green: "#22C55E",
  gradBtn: "linear-gradient(135deg, #5B4AE6 0%, #7C5CFF 50%, #23B5D3 100%)",
  gradChip: "linear-gradient(135deg, rgba(166,225,255,0.35) 0%, rgba(124,92,255,0.25) 100%)",
  gradBorder: "linear-gradient(135deg, rgba(124,92,255,0.85), rgba(35,181,211,0.85))",
};

export default function Home() {
  const [q, setQ] = useState("microgravity plant root growth");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>("");
  const [organism, setOrganism] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [cardSummaries, setCardSummaries] = useState<Record<number, {text: string; loading: boolean}>>({});
  const [cardQA, setCardQA] = useState<Record<number, {q: string; a: string; loading: boolean}>>({});
  const [persona, setPersona] = useState<"scientist" | "manager" | "architect" | "">("");
  const [sectionPriority, setSectionPriority] = useState<"results" | "discussion" | "conclusion" | "">("");

  const apiEnv = process.env.NEXT_PUBLIC_API_URL;
  const api = apiEnv && apiEnv.trim().length > 0 ? apiEnv : "/api";

  const T = (key: string) => {
    const tr: Record<string, string> = {
      title: "NASA Biyobilim Arama",
      subtitle: "Başlıklara ve Abstract'lere göre semantik arama. Results'a öncelik, kaynaklı ve izlenebilir özetler.",
      search: "Ara",
      queryPlaceholder: "Sorgu yazın",
      year: "Yıl (örn. 2018)",
      organism: "Organizma (Plant/Rodent/Human)",
      platform: "Platform (ISS/Shuttle)",
      clear: "Temizle",
      noResult: "Sonuç bulunamadı. Farklı bir sorgu deneyin.",
      copy: "Linki Kopyala",
      source: "PMC Kaynağı",
      howTitle: "Nasıl arama yapılır?",
      howText1: "1) Doğal dil kullanın: 'microgravity plant root growth'.",
      howText2: "2) Filtreleyin: yıl/organizma/platform alanlarını kullanın.",
      howText3: "3) Karttaki 'Özetle' ile kaynaklı kısa özet alın.",
      featTitle: "Özellikler",
      feat1: "Semantik arama (başlık + abstract)",
      feat2: "Kaynaklı ve izlenebilir özet",
      feat3: "Filtreler ve skor bazlı sıralama",
      feat4: "Uzay temalı modern arayüz",
      summarizeOne: "Özetle",
      hide: "Gizle",
      summarizing: "Özetleniyor...",
    };
    const en: Record<string, string> = {
      title: "NASA Bioscience Search",
      subtitle: "Semantic search over Titles & Abstracts. Results-first, cited and traceable summaries.",
      search: "Search",
      queryPlaceholder: "Type your query",
      year: "Year (e.g., 2018)",
      organism: "Organism (Plant/Rodent/Human)",
      platform: "Platform (ISS/Shuttle)",
      clear: "Clear",
      noResult: "No results. Try a different query.",
      copy: "Copy Link",
      source: "PMC Source",
      howTitle: "How to search?",
      howText1: "1) Use natural language: 'microgravity plant root growth'.",
      howText2: "2) Narrow down with year/organism/platform filters.",
      howText3: "3) Use card 'Summarize' for a cited short summary.",
      featTitle: "Features",
      feat1: "Semantic search (title + abstract)",
      feat2: "Cited, traceable summary",
      feat3: "Filters and score-based ranking",
      feat4: "Modern space-themed UI",
      summarizeOne: "Summarize",
      hide: "Hide",
      summarizing: "Summarizing...",
    };
    return (lang === "tr" ? tr : en)[key] || key;
  };

  const filtersActive = useMemo(() => {
    const tags = [year && `Year:${year}`, organism && `Org:${organism}`, platform && `Plat:${platform}`].filter(Boolean) as string[];
    return tags;
  }, [year, organism, platform]);

  async function search(query?: string) {
    const qq = (query ?? q).trim();
    if (!qq) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: qq });
      if (year) { params.set("year_min", year); params.set("year_max", year); }
      if (organism) params.set("organism", organism);
      if (platform) params.set("platform", platform);
      const res = await fetch(`${api}/search?${params.toString()}`);
      if (!res.ok) throw new Error(`API hata: ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function summarizeOne(id: number) {
    // Toggle: açık ise gizle
    const current = cardSummaries[id];
    if (current && !current.loading && current.text) {
      setCardSummaries((p) => ({ ...p, [id]: { text: "", loading: false } }));
      return;
    }
    setCardSummaries((p) => ({ ...p, [id]: { text: "", loading: true } }));
    try {
      const res = await fetch(`${api}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id], persona: persona || null, section_priority: sectionPriority || null }),
      });
      const data = await res.json();
      const text = res.ok && data.summary ? data.summary + (data.citations?.length ? "\n\nCitations:\n" + data.citations.join("\n") : "") : (data?.summary || "");
      setCardSummaries((p) => ({ ...p, [id]: { text, loading: false } }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setCardSummaries((p) => ({ ...p, [id]: { text: `Özetleme başarısız: ${msg}`, loading: false } }));
    }
  }

  async function askQA(id: number) {
    const qa = cardQA[id] || { q: "", a: "", loading: false };
    const question = (qa.q || "").trim();
    if (!question) return;
    setCardQA((p) => ({ ...p, [id]: { ...qa, loading: true } }));
    try {
      const res = await fetch(`${api}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, question, persona: persona || null }),
      });
      const data = await res.json();
      const ans = res.ok ? (data.answer || "") : (data?.answer || "");
      setCardQA((p) => ({ ...p, [id]: { q: question, a: ans, loading: false } }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setCardQA((p) => ({ ...p, [id]: { q: question, a: `Soru cevaplanamadı: ${msg}`, loading: false } }));
    }
  }

  useEffect(() => {
    search("microgravity plant root growth");
  }, [/* search intentionally not added to deps to avoid re-run */]);

  const skeletons = Array.from({ length: 5 }).map((_, i) => (
    <div key={`sk-${i}`} style={{ border: "1px solid #2A2E57", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)" }}>
      <div style={{ height: 16, width: "60%", background: "#2E3166", borderRadius: 6 }} />
      <div style={{ height: 12, width: "80%", background: "#242856", borderRadius: 6, marginTop: 8 }} />
      <div style={{ height: 12, width: "40%", background: "#242856", borderRadius: 6, marginTop: 8 }} />
    </div>
  ));

  

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "linear-gradient(135deg, #0B0E2C 0%, #1B1270 60%, #4C3FE1 100%)", color: "#EAF2FF" }}>
      {/* Watermark Logo */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", right: -80, top: -40, opacity: 0.08, transform: "rotate(-8deg)" }}>
          <Image src="/logo.png" alt="logo-bg" width={420} height={420} />
        </div>
      </div>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, backdropFilter: "saturate(120%) blur(6px)", background: "rgba(11,14,44,0.45)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Image src="/logo.png" alt="logo" width={56} height={56} priority />
            <div style={{ fontWeight: 900, letterSpacing: 0.3, fontSize: 18 }}>{BRAND.name}</div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/guidelines" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Guidelines</Link>
            <Link href="/resources" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Resources</Link>
            <Link href="/analytics" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Analytics</Link>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
            <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 12px" }}>
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
            <select value={persona} onChange={(e)=> setPersona(e.target.value as "scientist" | "manager" | "architect" | "")} title="Persona"
                    style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 12px" }}>
              <option value="">Persona</option>
              <option value="scientist">Scientist</option>
              <option value="manager">Manager</option>
              <option value="architect">Mission Architect</option>
            </select>
            <select value={sectionPriority} onChange={(e)=> setSectionPriority(e.target.value as "results" | "discussion" | "conclusion" | "")} title="Section Priority"
                    style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 12px" }}>
              <option value="">Section</option>
              <option value="results">Results</option>
              <option value="discussion">Discussion</option>
              <option value="conclusion">Conclusion</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 20, boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 12, background: "rgba(76,63,225,0.15)", border: "1px solid rgba(124,92,255,0.35)" }}>
              <Image src="/logo.png" alt="logo-mini" width={28} height={28} />
              <div style={{ fontWeight: 900, letterSpacing: 0.4, color: "#E7CFFF" }}>NextGenLAB</div>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>{T("title")}</h1>
          </div>
          <p style={{ opacity: 0.9, marginTop: 8 }}>{T("subtitle")}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder={T("queryPlaceholder")}
              style={{ flex: 1, minWidth: 280, padding: 14, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, background: "rgba(10,14,44,0.5)", color: "#fff" }}
            />
            <button onClick={() => search()} disabled={loading} style={{ padding: "12px 18px", borderRadius: 12, background: BRAND.gradBtn, color: "#fff", border: "none", fontWeight: 800, letterSpacing: 0.2, boxShadow: "0 6px 16px rgba(76,63,225,0.45)" }}>
              {loading ? "…" : T("search")}
            </button>
          </div>

          {/* Basit filtreler */}
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={T("year")}
                   style={{ padding: 10, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, background: "rgba(10,14,44,0.5)", color: "#fff" }} />
            <input value={organism} onChange={(e) => setOrganism(e.target.value)} placeholder={T("organism")}
                   style={{ padding: 10, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, background: "rgba(10,14,44,0.5)", color: "#fff" }} />
            <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder={T("platform")}
                   style={{ padding: 10, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, background: "rgba(10,14,44,0.5)", color: "#fff" }} />
            {filtersActive.length > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {filtersActive.map((t) => (
                  <span key={t} style={{ background: BRAND.gradChip, color: "#fff", padding: "6px 10px", borderRadius: 999, fontSize: 12, border: "1px solid rgba(231,207,255,0.45)" }}>{t}</span>
                ))}
                <button onClick={() => { setYear(""); setOrganism(""); setPlatform(""); }} style={{ fontSize: 12, color: "#fff", background: "transparent", border: "none", textDecoration: "underline" }}>{T("clear")}</button>
              </div>
            )}
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: 12, background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.3)", borderRadius: 10, color: "#fff" }}>
              Hata: {error}. API çalışıyor mu? .env.local’daki NEXT_PUBLIC_API_URL doğru mu?
            </div>
          )}
        </div>

        {/* Nasıl arama yapılır + Özellikler + KG Özet */}
        <section style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16 }}>
            <h3 style={{ marginTop: 0, fontSize: 16, fontWeight: 800 }}>{T("howTitle")}</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>{T("howText1")}</li>
              <li>{T("howText2")}</li>
              <li>{T("howText3")}</li>
            </ul>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16 }}>
            <h3 style={{ marginTop: 0, fontSize: 16, fontWeight: 800 }}>{T("featTitle")}</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>{T("feat1")}</li>
              <li>{T("feat2")}</li>
              <li>{T("feat3")}</li>
              <li>{T("feat4")}</li>
            </ul>
          </div>
        </section>


        {/* Guidelines & Resources ayrı sayfalara taşındı */}

        {/* Sonuçlar */}
        <section style={{ marginTop: 18 }}>
          <div style={{ display: "grid", gap: 14 }}>
            {loading && skeletons}
            {!loading && items.map((it) => (
              <div key={it.id} style={{ position: "relative", borderRadius: 18, padding: 1, background: BRAND.gradBorder }}>
                  <div style={{ position: "relative", borderRadius: 16, padding: 18, background: "linear-gradient(180deg, rgba(11,14,44,0.78) 0%, rgba(20,18,75,0.78) 60%, rgba(76,63,225,0.25) 100%)", boxShadow: "0 16px 40px rgba(0,0,0,0.55)", transition: "transform .18s ease, box-shadow .18s ease", border: "1px solid rgba(231,207,255,0.12)" }}
                     onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                     onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    {/* Corner brand badge */}
                    <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 999, background: "rgba(124,92,255,0.2)", border: "1px solid rgba(124,92,255,0.4)", backdropFilter: "blur(4px)", zIndex: 2 }}>
                      <Image src="/logo.png" alt="brand" width={14} height={14} />
                      <span style={{ fontSize: 11, letterSpacing: 0.3, color: "#E7CFFF", fontWeight: 800 }}>NextGenLAB</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <a href={it.url} target="_blank" rel="noreferrer" style={{ fontSize: 20, fontWeight: 900, color: "#EAF2FF", textDecoration: "none", lineHeight: 1.3 }}>
                        {it.title || it.url}
                      </a>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative", zIndex: 1 }}>
                        <div title="Arama skoru: Sorgu ile yayın arasındaki semantik benzerlik (0-1). 1’e yakın = daha alakalı."
                             style={{ fontSize: 12, whiteSpace: "nowrap", cursor: "help", border: "1px solid rgba(255,255,255,0.25)", padding: "4px 8px", borderRadius: 10, background: "rgba(255,255,255,0.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}>
                          Skor: <span style={{ fontWeight: 800 }}>{it.score.toFixed(3)}</span>
                        </div>
                        <button onClick={() => summarizeOne(it.id)} disabled={cardSummaries[it.id]?.loading} style={{ padding: "8px 12px", borderRadius: 12, background: "linear-gradient(135deg, #7C5CFF 0%, #4C3FE1 60%, #22C55E 100%)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: 0.2 }}>
                          {cardSummaries[it.id]?.loading ? T("summarizing") : (cardSummaries[it.id]?.text ? T("hide") : T("summarizeOne"))}
                        </button>
                      </div>
                    </div>
                    {it.snippet && (
                      <p style={{ marginTop: 8, color: "#D7DBFF", fontSize: 14, lineHeight: 1.6 }}>{it.snippet}</p>
                    )}
                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 12, background: "rgba(231,207,255,0.18)", border: "1px solid rgba(231,207,255,0.35)", color: "#E7CFFF" }}>
                        <Image src="/logo.png" alt="mini" width={14} height={14} /> PMC
                      </span>
                      <a href={it.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: BRAND.accent }}>{T("source")}</a>
                      <button onClick={() => navigator.clipboard.writeText(it.url)} style={{ fontSize: 13, color: BRAND.primary, background: BRAND.accent, border: "none", padding: "8px 12px", borderRadius: 10, fontWeight: 800, boxShadow: "0 6px 16px rgba(231,207,255,0.25)" }}>{T("copy")}</button>
                      {/* Resource Buttons */}
                      <a href={`https://osdr.nasa.gov/bio/repo/search?q=${encodeURIComponent(it.url || it.title || "")}&data_source=cgene,alsda,esa&data_type=study`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#fff", background: "rgba(124,92,255,0.35)", border: "1px solid rgba(124,92,255,0.55)", padding: "6px 10px", borderRadius: 10, backdropFilter: "blur(4px)" }}>OSDR</a>
                      <a href={`https://extapps.ksc.nasa.gov/NSLSL/Search?q=${encodeURIComponent(it.url || it.title || "")}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#fff", background: "rgba(124,92,255,0.35)", border: "1px solid rgba(124,92,255,0.55)", padding: "6px 10px", borderRadius: 10, backdropFilter: "blur(4px)" }}>NSLSL</a>
                      <a href="https://taskbook.nasaprs.com/tbp/welcome.cfm" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#fff", background: "rgba(124,92,255,0.35)", border: "1px solid rgba(124,92,255,0.55)", padding: "6px 10px", borderRadius: 10, backdropFilter: "blur(4px)" }}>Task Book</a>
                    </div>
                    {cardSummaries[it.id]?.text && (
                      <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", whiteSpace: "pre-wrap" }}>
                        {cardSummaries[it.id].text}
                      </div>
                    )}
                    {/* Q&A */}
                    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input value={cardQA[it.id]?.q || ""} onChange={(e)=> setCardQA((p)=> ({ ...p, [it.id]: { q: e.target.value, a: p[it.id]?.a || "", loading: false } }))} placeholder={lang==='tr'? 'Bu yayın hakkında soru sorun' : 'Ask a question about this article'} style={{ flex: 1, padding: 10, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, background: "rgba(10,14,44,0.5)", color: "#fff" }} />
                        <button onClick={()=> askQA(it.id)} disabled={cardQA[it.id]?.loading} style={{ padding: "8px 12px", borderRadius: 10, background: "linear-gradient(135deg, #22C55E 0%, #4C3FE1 100%)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: 12 }}>
                          {cardQA[it.id]?.loading ? (lang==='tr'? 'Cevaplanıyor…' : 'Answering…') : (lang==='tr'? 'Sor' : 'Ask')}
                        </button>
                      </div>
                      {cardQA[it.id]?.a && (
                        <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", whiteSpace: "pre-wrap", fontSize: 14 }}>
                          {cardQA[it.id]?.a}
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            ))}
            {!loading && items.length === 0 && !error && (
              <div style={{ color: "#EAF2FF", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <Image src="/logo.png" alt="logo-empty" width={32} height={32} />
                {T("noResult")}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18, fontSize: 12, opacity: 0.9, display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="logo-footer" width={18} height={18} />
          NextGenLAB • Bu araç bilimsel bilgi sağlar; klinik tavsiye değildir. Kaynaklar: SB_publications, OSDR, NSLSL, Task Book.
        </div>
      </footer>
    </div>
  );
}
