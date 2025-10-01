"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Item = {
  id: number;
  title: string;
  url: string;
  score: number;
  snippet?: string | null;
};

export default function Home() {
  const [q, setQ] = useState("microgravity plant root growth");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [cardSummaries, setCardSummaries] = useState<Record<number, {text: string; loading: boolean}>>({});
  const [cardQA, setCardQA] = useState<Record<number, {q: string; a: string; loading: boolean}>>({});
  const [persona, setPersona] = useState<"scientist" | "manager" | "architect" | "">("");
  const [sectionPriority, setSectionPriority] = useState<"results" | "discussion" | "conclusion" | "">("");

  const apiEnv = process.env.NEXT_PUBLIC_API_URL;
  const api = apiEnv && apiEnv.trim().length > 0 ? apiEnv : "/api";

  const T = (key: string) => {
    const tr: Record<string, string> = {
      title: "NASA Uzay Biyobilim Keşif Platformu",
      subtitle: "Yapay zeka destekli semantik arama • 608 yayın • Gerçek zamanlı özetler",
      search: "🚀 Ara",
      queryPlaceholder: "Uzay biyolojisi araştırmanızı yazın...",
      noResult: "Sonuç bulunamadı. Farklı anahtar kelimeler deneyin.",
      copy: "Kopyala",
      source: "Kaynak",
      summarizeOne: "✨ Özetle",
      hide: "Gizle",
      summarizing: "🔮 Analiz ediliyor...",
      askQuestion: "Soru Sor",
      asking: "Yanıtlanıyor...",
    };
    const en: Record<string, string> = {
      title: "NASA Space Bioscience Explorer",
      subtitle: "AI-powered semantic search • 608 publications • Real-time summaries",
      search: "🚀 Search",
      queryPlaceholder: "Search space biology research...",
      noResult: "No results found. Try different keywords.",
      copy: "Copy",
      source: "Source",
      summarizeOne: "✨ Summarize",
      hide: "Hide",
      summarizing: "🔮 Analyzing...",
      askQuestion: "Ask",
      asking: "Answering...",
    };
    return (lang === "tr" ? tr : en)[key] || key;
  };


  async function search(query?: string) {
    const qq = (query ?? q).trim();
    if (!qq) {
      setError("Lütfen bir arama sorgusu girin.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ q: qq });
      
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const res = await fetch(`${api}/search?${params.toString()}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`API hatası (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("API'den geçersiz veri formatı alındı");
      }
      
      setItems(data);
    } catch (e: unknown) {
      let msg = "Bilinmeyen hata";
      
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          msg = "Arama zaman aşımına uğradı.";
        } else {
          msg = e.message;
        }
      }
      
      console.error("Arama hatası:", e);
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function summarizeOne(id: number) {
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
      const text = res.ok && data.summary ? data.summary + (data.citations?.length ? "\n\n📚 Kaynaklar:\n" + data.citations.join("\n") : "") : (data?.summary || "");
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
    const performInitialSearch = async () => {
      try {
        await search("microgravity plant root growth");
      } catch (error) {
        console.error("Initial search failed:", error);
      }
    };
    performInitialSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Uzay Arka Plan Efektleri */}
      <div className="space-background" />
      <div className="stars stars-layer-1" />
      <div className="stars stars-layer-2" />
      <div className="stars stars-layer-3" />
      <div className="nebula">
        <div className="nebula-glow-1" />
        <div className="nebula-glow-2" />
        <div className="nebula-glow-3" />
      </div>

      <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
        {/* Premium Header */}
        <header className="header-sticky">
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ position: "relative" }}>
                <Image src="/logo.png" alt="logo" width={52} height={52} priority className="glow pulse-slow" />
                <div style={{ position: "absolute", inset: -8, background: "radial-gradient(circle, rgba(167, 139, 250, 0.4), transparent)", filter: "blur(12px)", zIndex: -1 }} />
              </div>
              <div>
                <div className="text-gradient" style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.3 }}>
                  NextGenLAB
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500 }}>SPACE BIOSCIENCE EXPLORER</div>
              </div>
            </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {[
                { href: "/scientist", label: "Scientist" },
                { href: "/manager", label: "Manager" },
                { href: "/architect", label: "Architect" },
                { href: "/analytics", label: "Analytics" },
                { href: "/guidelines", label: "Guidelines" },
                { href: "/resources", label: "Resources" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="btn-secondary" style={{ fontSize: 13 }}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} style={{ fontSize: 13, fontWeight: 500 }}>
                <option value="tr">🇹🇷</option>
                <option value="en">🇬🇧</option>
              </select>
              
              <select value={persona} onChange={(e) => setPersona(e.target.value as "scientist" | "manager" | "architect" | "")} style={{ fontSize: 13, fontWeight: 500 }}>
                <option value="">Persona</option>
                <option value="scientist">Scientist</option>
                <option value="manager">Manager</option>
                <option value="architect">Architect</option>
              </select>
              
              <select value={sectionPriority} onChange={(e) => setSectionPriority(e.target.value as "results" | "discussion" | "conclusion" | "")} style={{ fontSize: 13, fontWeight: 500 }}>
                <option value="">Section</option>
                <option value="results">Results</option>
                <option value="discussion">Discussion</option>
                <option value="conclusion">Conclusion</option>
              </select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          {/* Premium Hero Section */}
          <div className="glass-card" style={{ padding: 48, marginBottom: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 400, height: 400, background: "radial-gradient(circle, rgba(167, 139, 250, 0.15), transparent)", filter: "blur(60px)", pointerEvents: "none" }} />
            
            <div style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
              <h1 className="text-gradient" style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {T("title")}
              </h1>
              <p style={{ fontSize: 18, color: "var(--text-secondary)", letterSpacing: 0.3, fontWeight: 500, maxWidth: 700, margin: "0 auto" }}>{T("subtitle")}</p>
            </div>

            {/* Premium Search Bar */}
            <div style={{ display: "flex", gap: 14, marginBottom: 24, position: "relative", zIndex: 1 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={T("queryPlaceholder")}
                style={{ flex: 1, padding: "18px 24px", fontSize: 16, fontWeight: 500 }}
              />
              <button onClick={() => search()} disabled={loading} className="btn-primary" style={{ minWidth: 140, fontSize: 16 }}>
                {loading ? "⏳" : T("search")}
              </button>
            </div>


            {error && (
              <div className="glass-card" style={{ marginTop: 16, padding: 16, border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, color: "#FCA5A5", fontSize: 14 }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Premium Results */}
          <div style={{ display: "grid", gap: 24 }}>
            {loading && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="result-card loading-shimmer" style={{ height: 180 }} />
              ))
            )}

            {!loading && items.map((it) => (
              <div key={it.id} className="result-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 24, marginBottom: 18 }}>
                  <a href={it.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 20, fontWeight: 700, color: "var(--text-primary)", textDecoration: "none", lineHeight: 1.4, transition: "color 0.3s" }}>
                    {it.title}
                  </a>
                  
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                    <div className="badge" data-tooltip="Relevance Score" style={{ background: `linear-gradient(135deg, rgba(167, 139, 250, ${it.score * 0.3}), rgba(96, 165, 250, ${it.score * 0.2}))` }}>
                      ⭐ {(it.score * 100).toFixed(1)}%
                    </div>
                    <button onClick={() => summarizeOne(it.id)} disabled={cardSummaries[it.id]?.loading} className="btn-primary" style={{ fontSize: 13, padding: "10px 20px" }}>
                      {cardSummaries[it.id]?.loading ? "⏳" : (cardSummaries[it.id]?.text ? "✕" : "✨ Özetle")}
                    </button>
                  </div>
                </div>

                {it.snippet && (
                  <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{it.snippet}</p>
                )}

                {cardSummaries[it.id]?.text && (
                  <div className="glass-card" style={{ padding: 20, marginTop: 20, marginBottom: 20, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, color: "var(--text-primary)", background: "rgba(15, 8, 36, 0.5)" }}>
                    {cardSummaries[it.id].text}
                  </div>
                )}

                {/* Premium Q&A Section */}
                <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
                  <input 
                    value={cardQA[it.id]?.q || ""} 
                    onChange={(e) => setCardQA((p) => ({ ...p, [it.id]: { q: e.target.value, a: p[it.id]?.a || "", loading: false } }))} 
                    placeholder={lang === 'tr' ? '💬 Bu makale hakkında soru sorun...' : '💬 Ask about this article...'}
                    style={{ flex: 1, fontWeight: 500 }}
                  />
                  <button onClick={() => askQA(it.id)} disabled={cardQA[it.id]?.loading} className="btn-primary" style={{ fontSize: 13, padding: "12px 24px" }}>
                    {cardQA[it.id]?.loading ? "⏳" : "🤔 Sor"}
                  </button>
                </div>

                {cardQA[it.id]?.a && (
                  <div className="glass-card" style={{ padding: 20, marginTop: 16, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, color: "var(--text-primary)", background: "rgba(15, 8, 36, 0.5)", borderLeft: "3px solid var(--nebula-purple)" }}>
                    <div style={{ fontWeight: 600, marginBottom: 10, color: "var(--nebula-purple)" }}>💡 Yanıt:</div>
                    {cardQA[it.id].a}
                  </div>
                )}

                {/* Premium Resource Links */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(167, 139, 250, 0.1)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href={it.url} target="_blank" rel="noreferrer" className="badge">
                    📄 PMC Source
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(it.url)} className="badge" style={{ cursor: "pointer", background: "transparent" }}>
                    📋 Copy Link
                  </button>
                  <a href={`https://osdr.nasa.gov/bio/repo/search?q=${encodeURIComponent(it.title)}`} target="_blank" rel="noreferrer" className="badge">
                    🛰️ OSDR
                  </a>
                  <a href={`https://extapps.ksc.nasa.gov/NSLSL/Search?q=${encodeURIComponent(it.title)}`} target="_blank" rel="noreferrer" className="badge">
                    🔬 NSLSL
                  </a>
                  <a href="https://taskbook.nasaprs.com/tbp/welcome.cfm" target="_blank" rel="noreferrer" className="badge">
                    📚 Task Book
                  </a>
                </div>
              </div>
            ))}

            {!loading && items.length === 0 && !error && (
              <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🌌</div>
                <div style={{ fontSize: 20, color: "var(--text-secondary)", fontWeight: 500 }}>{T("noResult")}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 12, opacity: 0.7 }}>Farklı anahtar kelimeler deneyin veya filtreleri değiştirin</div>
              </div>
            )}
          </div>
        </main>

        {/* Premium Footer */}
        <footer className="glass-card" style={{ marginTop: 80, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
              <Image src="/logo.png" alt="logo" width={28} height={28} className="glow" />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: 16 }}>NextGenLAB Space Bioscience Explorer</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ opacity: 0.8 }}>🚀 Powered by</span> <span style={{ color: "var(--nebula-purple)", fontWeight: 600 }}>OpenAI GPT-4o-mini</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>608 NASA Publications • Real-time AI Analysis • Knowledge Graph Visualization</div>
          </div>
        </footer>
      </div>
    </>
  );
}
