"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Header from "../components/Header";

type Item = {
  id: number;
  title: string;
  url: string;
  score: number;
  snippet?: string | null;
};

export default function Home() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [cardSummaries, setCardSummaries] = useState<Record<number, {text: string; loading: boolean}>>({});
  const [cardQA, setCardQA] = useState<Record<number, {q: string; a: string; loading: boolean}>>({});
  const [persona, setPersona] = useState<"scientist" | "manager" | "architect" | "">("");
  const [sectionPriority, setSectionPriority] = useState<"results" | "discussion" | "conclusion" | "">("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showImages, setShowImages] = useState<Record<number, boolean>>({});

  // Rastgele görsel seçme fonksiyonu (gelecekte kullanılacak)
  // const getRandomImage = (id: number) => {
  //   const images = [
  //     '/images/articles/space-lab-1.jpg',
  //     '/images/articles/space-lab-2.jpg', 
  //     '/images/articles/space-lab-3.jpg',
  //     '/images/articles/space-lab-4.jpg',
  //     '/images/articles/space-lab-5.jpg',
  //     '/images/articles/space-lab-6.jpg',
  //     '/images/articles/space-lab-7.jpg',
  //     '/images/articles/space-lab-8.jpg',
  //     '/images/articles/space-lab-9.jpg',
  //     '/images/articles/space-lab-10.jpg'
  //   ];
  //   const index = id % images.length;
  //   return images[index];
  // };

  const apiEnv = process.env.NEXT_PUBLIC_API_URL;
  const api = apiEnv && apiEnv.trim().length > 0 ? apiEnv : "/api";

  // Popular search suggestions - memoized for performance
  const searchSuggestions = useMemo(() => [
    "microgravity plant root growth",
    "space radiation effects on DNA",
    "artificial gravity systems",
    "closed-loop life support",
    "space agriculture technology",
    "crew psychological health",
    "Mars mission preparation",
    "space medicine research",
    "bone loss in space",
    "space biotechnology"
  ], []);

  const T = useCallback((key: string) => {
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
  }, [lang]);


  const search = useCallback(async (query?: string) => {
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
  }, [api, q]);

  const summarizeOne = useCallback(async (id: number) => {
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
  }, [api, persona, sectionPriority, cardSummaries]);

  const askQA = useCallback(async (id: number) => {
    const qa = cardQA[id] || { q: "", a: "", loading: false };
    const question = (qa.q || "").trim();
    if (!question) return;
    setCardQA((p) => ({ ...p, [id]: { ...qa, loading: true } }));
    try {
      const res = await fetch(`${api}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, question, persona: persona || null, lang }),
      });
      const data = await res.json();
      const ans = res.ok ? (data.answer || "") : (data?.answer || "");
      setCardQA((p) => ({ ...p, [id]: { q: question, a: ans, loading: false } }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setCardQA((p) => ({ ...p, [id]: { q: question, a: `Soru cevaplanamadı: ${msg}`, loading: false } }));
    }
  }, [api, persona, cardQA, lang]);

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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-suggestions-container]')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        {lang === 'tr' ? 'Ana içeriğe geç' : 'Skip to main content'}
      </a>
      
      <Header 
        lang={lang} 
        setLang={setLang} 
        persona={persona} 
        setPersona={setPersona} 
        sectionPriority={sectionPriority} 
        setSectionPriority={setSectionPriority} 
      />

        {/* Main Content */}
        <main id="main-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          {/* Premium Hero Section */}
          <div className="glass-card" style={{ padding: "48px 24px", marginBottom: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 400, height: 400, background: "radial-gradient(circle, rgba(167, 139, 250, 0.15), transparent)", filter: "blur(60px)", pointerEvents: "none" }} />
            
            <div style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
              <h1 className="text-gradient" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {T("title")}
              </h1>
              <p style={{ fontSize: "clamp(16px, 2.5vw, 18px)", color: "var(--text-secondary)", letterSpacing: 0.3, fontWeight: 500, maxWidth: 700, margin: "0 auto" }}>{T("subtitle")}</p>
            </div>

            {/* Premium Search Bar */}
            <div style={{ position: "relative", zIndex: 10000 }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 300px", minWidth: 0 }}>
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder={T("queryPlaceholder")}
              aria-label={lang === 'tr' ? "Arama kutusu" : "Search box"}
              aria-describedby="search-help"
              style={{ width: "100%", padding: "18px 24px", fontSize: 16, fontWeight: 500 }}
            />
            <div id="search-help" style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, opacity: 0.8 }}>
              {lang === 'tr' ? "Enter tuşuna basarak arama yapabilirsiniz" : "Press Enter to search"}
            </div>
                  
                  {/* Search Suggestions */}
                  {showSuggestions && (
                    <>
                      {/* Background Overlay */}
                      <div 
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          zIndex: 99999998,
                          backdropFilter: "blur(5px)"
                        }}
                        onClick={() => setShowSuggestions(false)}
                      />
                      
                      {/* Suggestions Modal */}
                      <div 
                        className="glass-card" 
                        data-suggestions-container 
                        style={{ 
                          position: "fixed",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "90%",
                          maxWidth: "600px",
                          padding: 24,
                          zIndex: 99999999,
                          boxShadow: "0 30px 60px rgba(0, 0, 0, 0.9)",
                          backgroundColor: "rgba(15, 8, 36, 0.99)",
                          backdropFilter: "blur(30px)",
                          border: "3px solid rgba(167, 139, 250, 0.8)",
                          borderRadius: 16,
                          maxHeight: "500px",
                          overflowY: "auto"
                        }}
                      >
                      <div style={{ 
                        fontSize: 15, 
                        fontWeight: 700, 
                        marginBottom: 16, 
                        color: "var(--nebula-purple)",
                        textAlign: "center",
                        borderBottom: "1px solid rgba(167, 139, 250, 0.3)",
                        paddingBottom: 12
                      }}>
                        🔍 {lang === 'tr' ? 'Popüler Aramalar' : 'Popular Searches'}
                      </div>
                      
                      {/* Current Search Input */}
                      {q && (
                        <div style={{ marginBottom: 16, textAlign: "center" }}>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
                            {lang === 'tr' ? 'Yazdığınız arama:' : 'Your search:'}
                          </div>
                          <button
                            onClick={() => {
                              setShowSuggestions(false);
                              search();
                            }}
                            className="btn-primary"
                            style={{
                              fontSize: 14,
                              padding: "10px 20px",
                              borderRadius: 8,
                              fontWeight: 600
                            }}
                          >
                            🔍 &ldquo;{q}&rdquo; {lang === 'tr' ? 'Ara' : 'Search'}
                          </button>
                        </div>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setQ(suggestion);
                              setShowSuggestions(false);
                              search(suggestion);
                            }}
                            className="btn-secondary"
                            style={{ 
                              fontSize: 12, 
                              padding: "8px 14px", 
                              whiteSpace: "nowrap",
                              borderRadius: 6,
                              border: "1px solid rgba(167, 139, 250, 0.4)",
                              backgroundColor: "rgba(167, 139, 250, 0.1)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                      </div>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => search()} 
                  disabled={loading} 
                  className="btn-primary" 
                  style={{ minWidth: 140, fontSize: 16, flexShrink: 0 }} 
                  aria-label={lang === 'tr' ? 'Yayınları ara' : 'Search publications'}
                >
                  {loading ? "⏳" : T("search")}
            </button>
          </div>
            </div>


            {error && (
              <div 
                className="glass-card" 
                style={{ marginTop: 16, padding: 16, border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, color: "#FCA5A5", fontSize: 14 }}
                role="alert"
                aria-live="polite"
              >
                ⚠️ {error}
                <button 
                  onClick={() => setError(null)}
                  style={{ 
                    marginLeft: 12, 
                    padding: "4px 8px", 
                    background: "rgba(239, 68, 68, 0.2)", 
                    border: "1px solid rgba(239, 68, 68, 0.4)", 
                    borderRadius: 4, 
                    color: "#ef4444", 
                    fontSize: 11, 
                    cursor: "pointer" 
                  }}
                  aria-label={lang === 'tr' ? 'Hatayı kapat' : 'Close error'}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Premium Results */}
          <div style={{ display: "grid", gap: 24 }}>
            {loading && (
              <div 
                role="status"
                aria-live="polite"
                aria-label={lang === 'tr' ? 'Arama yapılıyor' : 'Searching'}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="result-card loading-shimmer" style={{ height: 180 }} />
                ))}
            </div>
          )}

            {!loading && items.map((it) => (
              <div key={it.id} className="result-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 24, marginBottom: 18, flexWrap: "wrap" }}>
                  <a 
                    href={it.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ flex: "1 1 300px", fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none", lineHeight: 1.4, transition: "color 0.3s", minWidth: 0 }}
                    aria-label={`${it.title} - ${lang === 'tr' ? 'Makaleyi yeni sekmede aç' : 'Open article in new tab'}`}
                  >
                    {it.title}
                  </a>
                  
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                    <div className="badge" data-tooltip="Relevance Score" style={{ background: `linear-gradient(135deg, rgba(167, 139, 250, ${it.score * 0.3}), rgba(96, 165, 250, ${it.score * 0.2}))`, whiteSpace: "nowrap" }}>
                      ⭐ {(it.score * 100).toFixed(1)}%
                        </div>
                    <button onClick={() => summarizeOne(it.id)} disabled={cardSummaries[it.id]?.loading} className="btn-primary" style={{ fontSize: 13, padding: "10px 20px", whiteSpace: "nowrap" }} aria-label={`Summarize article: ${it.title}`}>
                      {cardSummaries[it.id]?.loading ? "⏳" : (cardSummaries[it.id]?.text ? "✕" : lang === 'tr' ? "✨ Özetle" : "✨ Summarize")}
                        </button>
                    <button 
                      onClick={() => setShowImages(prev => ({ ...prev, [it.id]: !prev[it.id] }))} 
                      className="btn-secondary" 
                      style={{ fontSize: 13, padding: "10px 20px", whiteSpace: "nowrap" }}
                    >
                      {showImages[it.id] ? (lang === 'tr' ? "🖼️ Gizle" : "🖼️ Hide") : (lang === 'tr' ? "🖼️ Görsel" : "🖼️ Image")}
                        </button>
                      </div>
                    </div>

                    {it.snippet && (
                  <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{it.snippet}</p>
                )}

                    {showImages[it.id] && (
                      <div style={{ marginBottom: 20, textAlign: "center" }}>
                        <div className="glass-card" style={{ padding: 16, background: "rgba(15, 8, 36, 0.3)" }}>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
                            {lang === 'tr' ? 'İlgili Görsel:' : 'Related Image:'}
                          </div>
                          <div style={{ 
                            width: "100%", 
                            height: "200px", 
                            background: "linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(96, 165, 250, 0.2))",
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px dashed rgba(167, 139, 250, 0.4)",
                            fontSize: 14,
                            color: "var(--text-secondary)"
                          }}>
                            🖼️ {lang === 'tr' ? 'Görsel yükleniyor...' : 'Loading image...'}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 8, opacity: 0.7 }}>
                            {lang === 'tr' ? 'Görselleri /images/articles/ klasörüne ekleyebilirsiniz' : 'You can add images to /images/articles/ folder'}
                          </div>
                        </div>
                      </div>
                    )}

                    {cardSummaries[it.id]?.text && (
                  <div className="glass-card" style={{ padding: 20, marginTop: 20, marginBottom: 20, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, color: "var(--text-primary)", background: "rgba(15, 8, 36, 0.5)" }}>
                        {cardSummaries[it.id].text}
                      </div>
                    )}

                {/* Premium Q&A Section */}
                <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <input 
                    type="text"
                    value={cardQA[it.id]?.q || ""} 
                    onChange={(e) => setCardQA((p) => ({ ...p, [it.id]: { q: e.target.value, a: p[it.id]?.a || "", loading: false } }))} 
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !cardQA[it.id]?.loading && cardQA[it.id]?.q?.trim()) {
                        askQA(it.id);
                      }
                    }}
                    placeholder={lang === 'tr' ? '💬 Bu makale hakkında soru sorun...' : '💬 Ask about this article...'}
                    aria-label={lang === 'tr' ? 'Makale hakkında soru sor' : 'Ask question about article'}
                    style={{ flex: "1 1 200px", fontWeight: 500, minWidth: 0 }}
                  />
                  <button onClick={() => askQA(it.id)} disabled={cardQA[it.id]?.loading || !cardQA[it.id]?.q?.trim()} className="btn-primary" style={{ fontSize: 13, padding: "12px 24px", flexShrink: 0 }} aria-label={`Ask question about: ${it.title}`}>
                    {cardQA[it.id]?.loading ? "⏳" : lang === 'tr' ? "🤔 Sor" : "🤔 Ask"}
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
              <Image src="/logo.png" alt="NextGenLAB Logo" width={28} height={28} className="glow" />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: 16 }}>NextGenLAB Space Bioscience Explorer</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ opacity: 0.8 }}>🚀 Powered by</span> <span style={{ color: "var(--nebula-purple)", fontWeight: 600 }}>OpenAI GPT-4o-mini</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>608 NASA Publications • Real-time AI Analysis • Knowledge Graph Visualization</div>
        </div>
      </footer>
    </>
  );
}
