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
      title: "NASA Uzay Biyobilim Keşif Platformu",
      subtitle: "Yapay zeka destekli semantik arama • 608 yayın • Gerçek zamanlı özetler",
      search: "🚀 Ara",
      queryPlaceholder: "Uzay biyolojisi araştırmanızı yazın...",
      year: "Yıl",
      organism: "Organizma",
      platform: "Platform",
      clear: "Temizle",
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
      year: "Year",
      organism: "Organism",
      platform: "Platform",
      clear: "Clear",
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

  const filtersActive = useMemo(() => {
    const tags = [year && `${year}`, organism && organism, platform && platform].filter(Boolean) as string[];
    return tags;
  }, [year, organism, platform]);

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
      
      if (year) {
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2030) {
          throw new Error("Geçersiz yıl formatı (1950-2030 arası olmalı)");
        }
        params.set("year_min", year);
        params.set("year_max", year);
      }
      
      if (organism && organism.trim()) {
        params.set("organism", organism.trim());
      }
      
      if (platform && platform.trim()) {
        params.set("platform", platform.trim());
      }
      
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
        {/* Header */}
        <header className="glass-card" style={{ position: "sticky", top: 0, zIndex: 50, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <Image src="/logo.png" alt="logo" width={48} height={48} priority style={{ filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))" }} />
                <div style={{ position: "absolute", inset: -5, background: "radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)", filter: "blur(10px)", zIndex: -1, animation: "pulse 2s ease-in-out infinite" }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 20, background: "linear-gradient(135deg, #A78BFA, #60A5FA, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 0.5 }}>
                  NextGenLAB
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: 1.5 }}>SPACE BIOSCIENCE</div>
              </div>
            </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {[
                { href: "/guidelines", label: "📖 Guidelines", icon: "📖" },
                { href: "/resources", label: "🔗 Resources", icon: "🔗" },
                { href: "/analytics", label: "📊 Analytics", icon: "📊" },
                { href: "/scientist", label: "🔬 Scientist", icon: "🔬" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="holographic" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, transition: "all 0.3s" }}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} className="glass-card" style={{ padding: "8px 12px", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 10, color: "#E0E7FF", fontSize: 13 }}>
                <option value="tr">🇹🇷 TR</option>
                <option value="en">🇬🇧 EN</option>
              </select>
              
              <select value={persona} onChange={(e) => setPersona(e.target.value as "scientist" | "manager" | "architect" | "")} className="glass-card" style={{ padding: "8px 12px", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 10, color: "#E0E7FF", fontSize: 13 }}>
                <option value="">👤 Persona</option>
                <option value="scientist">🔬 Scientist</option>
                <option value="manager">💼 Manager</option>
                <option value="architect">🏗️ Architect</option>
              </select>
              
              <select value={sectionPriority} onChange={(e) => setSectionPriority(e.target.value as "results" | "discussion" | "conclusion" | "")} className="glass-card" style={{ padding: "8px 12px", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 10, color: "#E0E7FF", fontSize: 13 }}>
                <option value="">📑 Section</option>
                <option value="results">📊 Results</option>
                <option value="discussion">💭 Discussion</option>
                <option value="conclusion">✅ Conclusion</option>
              </select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          {/* Hero Section */}
          <div className="glass-card holographic" style={{ padding: 32, marginBottom: 32 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 12, background: "linear-gradient(135deg, #FFF, #A78BFA, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {T("title")}
              </h1>
              <p style={{ fontSize: 16, color: "#94A3B8", letterSpacing: 0.5 }}>{T("subtitle")}</p>
            </div>

            {/* Search Bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={T("queryPlaceholder")}
                className="glass-card"
                style={{ flex: 1, padding: "16px 20px", fontSize: 15, color: "#FFF", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: 12 }}
              />
              <button onClick={() => search()} disabled={loading} className="neon-button" style={{ minWidth: 120, fontSize: 15 }}>
                {loading ? "⏳" : T("search")}
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={T("year")} className="glass-card" style={{ padding: "10px 16px", width: 120, border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 10, color: "#FFF", fontSize: 13 }} />
              <input value={organism} onChange={(e) => setOrganism(e.target.value)} placeholder={T("organism")} className="glass-card" style={{ padding: "10px 16px", width: 140, border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 10, color: "#FFF", fontSize: 13 }} />
              <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder={T("platform")} className="glass-card" style={{ padding: "10px 16px", width: 140, border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 10, color: "#FFF", fontSize: 13 }} />
              
              {filtersActive.length > 0 && (
                <>
                  {filtersActive.map((tag) => (
                    <span key={tag} className="holographic" style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                      {tag}
                    </span>
                  ))}
                  <button onClick={() => { setYear(""); setOrganism(""); setPlatform(""); }} style={{ fontSize: 12, color: "#60A5FA", background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer" }}>
                    {T("clear")}
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="glass-card" style={{ marginTop: 16, padding: 16, border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, color: "#FCA5A5", fontSize: 14 }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Results */}
          <div style={{ display: "grid", gap: 20 }}>
            {loading && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card holographic" style={{ padding: 24, height: 150, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))
            )}

            {!loading && items.map((it) => (
              <div key={it.id} className="glass-card" style={{ padding: 24, transition: "all 0.3s", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 20, marginBottom: 16 }}>
                  <a href={it.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 19, fontWeight: 700, color: "#E0E7FF", textDecoration: "none", lineHeight: 1.4, transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#A78BFA"} onMouseLeave={(e) => e.currentTarget.style.color = "#E0E7FF"}>
                    {it.title}
                  </a>
                  
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div className="holographic" style={{ padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                      ⭐ {it.score.toFixed(3)}
                    </div>
                    <button onClick={() => summarizeOne(it.id)} disabled={cardSummaries[it.id]?.loading} className="neon-button" style={{ fontSize: 13, padding: "8px 16px" }}>
                      {cardSummaries[it.id]?.loading ? T("summarizing") : (cardSummaries[it.id]?.text ? T("hide") : T("summarizeOne"))}
                    </button>
                  </div>
                </div>

                {it.snippet && (
                  <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{it.snippet}</p>
                )}

                {cardSummaries[it.id]?.text && (
                  <div className="glass-card holographic" style={{ padding: 16, marginTop: 16, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, color: "#CBD5E1" }}>
                    {cardSummaries[it.id].text}
                  </div>
                )}

                {/* Q&A Section */}
                <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
                  <input 
                    value={cardQA[it.id]?.q || ""} 
                    onChange={(e) => setCardQA((p) => ({ ...p, [it.id]: { q: e.target.value, a: p[it.id]?.a || "", loading: false } }))} 
                    placeholder={lang === 'tr' ? 'Bu makale hakkında soru sorun...' : 'Ask about this article...'}
                    className="glass-card"
                    style={{ flex: 1, padding: "12px 16px", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 10, color: "#FFF", fontSize: 13 }}
                  />
                  <button onClick={() => askQA(it.id)} disabled={cardQA[it.id]?.loading} className="neon-button" style={{ fontSize: 13, padding: "10px 20px" }}>
                    {cardQA[it.id]?.loading ? T("asking") : T("askQuestion")}
                  </button>
                </div>

                {cardQA[it.id]?.a && (
                  <div className="glass-card holographic" style={{ padding: 16, marginTop: 12, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, color: "#CBD5E1" }}>
                    💬 {cardQA[it.id].a}
                  </div>
                )}

                {/* Resource Links */}
                <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href={it.url} target="_blank" rel="noreferrer" className="holographic" style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                    📄 {T("source")}
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(it.url)} className="holographic" style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "1px solid rgba(6, 182, 212, 0.3)", cursor: "pointer", background: "transparent", color: "#E0E7FF" }}>
                    📋 {T("copy")}
                  </button>
                  <a href={`https://osdr.nasa.gov/bio/repo/search?q=${encodeURIComponent(it.title)}`} target="_blank" rel="noreferrer" className="holographic" style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                    🛰️ OSDR
                  </a>
                  <a href={`https://extapps.ksc.nasa.gov/NSLSL/Search?q=${encodeURIComponent(it.title)}`} target="_blank" rel="noreferrer" className="holographic" style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                    🔬 NSLSL
                  </a>
                </div>
              </div>
            ))}

            {!loading && items.length === 0 && !error && (
              <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌌</div>
                <div style={{ fontSize: 18, color: "#94A3B8" }}>{T("noResult")}</div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="glass-card" style={{ marginTop: 64, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", textAlign: "center", fontSize: 13, color: "#64748B" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
              <Image src="/logo.png" alt="logo" width={24} height={24} style={{ filter: "brightness(0.7)" }} />
              <span style={{ fontWeight: 600 }}>NextGenLAB Space Bioscience Explorer</span>
            </div>
            <div>🚀 Powered by OpenAI GPT-4o-mini • 608 NASA Publications • Real-time Analysis</div>
          </div>
        </footer>
      </div>
    </>
  );
}
