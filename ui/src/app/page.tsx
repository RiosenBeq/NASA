"use client";
import { useEffect, useState, useCallback } from "react";
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
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [cardSummaries, setCardSummaries] = useState<Record<number, {text: string; loading: boolean}>>({});
  const [cardQA, setCardQA] = useState<Record<number, {q: string; a: string; loading: boolean}>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const apiEnv = process.env.NEXT_PUBLIC_API_URL;
  const api = apiEnv && apiEnv.trim().length > 0 ? apiEnv : "/api";

  // Detect language from text
  const detectLanguage = (text: string): "tr" | "en" => {
    const turkishChars = /[çğıöşü]/i;
    const turkishWords = /(ve|veya|ile|için|ancak|çünkü|nasıl|nedir|neden|etki|üzerinde|uzay)/i;
    return (turkishChars.test(text) || turkishWords.test(text)) ? "tr" : "en";
  };

  // Smart search suggestions based on context
  const generateSmartSuggestions = useCallback((query: string) => {
    const allSuggestions = {
      tr: [
        "mikrogravite bitki kök büyümesi",
        "uzay radyasyonu DNA hasarı",
        "kemik kaybı uzun süreli uzay uçuşu",
        "ISS protein kristalleşmesi",
        "astronot immün sistem değişiklikleri",
        "mars yolculuğu sağlık riskleri",
        "mikrobiyal davranış uzayda",
        "bitki yetiştirme uzay istasyonunda",
        "kasların atrofisi mikrogravitede",
        "uzay ortamında gen ekspresyonu"
      ],
      en: [
        "microgravity plant root growth",
        "space radiation DNA damage",
        "bone loss long duration spaceflight",
        "ISS protein crystallization",
        "astronaut immune system changes",
        "mars mission health risks",
        "microbial behavior in space",
        "plant cultivation space station",
        "muscle atrophy microgravity",
        "gene expression space environment"
      ]
    };

    if (!query.trim()) {
      return allSuggestions[lang].slice(0, 5);
    }

    const detectedLang = detectLanguage(query);
    const queryLower = query.toLowerCase();
    const suggestions = allSuggestions[detectedLang];
    
    // Filter suggestions that match query
    const filtered = suggestions.filter(s => 
      s.toLowerCase().includes(queryLower) || 
      queryLower.split(" ").some(word => word.length > 2 && s.toLowerCase().includes(word))
    );

    // If no matches, return top suggestions
    return filtered.length > 0 ? filtered.slice(0, 5) : suggestions.slice(0, 5);
  }, [lang]);

  // Update suggestions when query or lang changes
  useEffect(() => {
    setSmartSuggestions(generateSmartSuggestions(q));
  }, [q, generateSmartSuggestions]);

  // Auto-detect language when user types
  useEffect(() => {
    if (q.length > 3) {
      const detectedLang = detectLanguage(q);
      if (detectedLang !== lang) {
        setLang(detectedLang);
      }
    }
  }, [q, lang]);

  const T = (key: string) => {
    const tr: Record<string, string> = {
      // Header
      brandName: "NextGenLAB",
      brandSubtitle: "SPACE BIOSCIENCE EXPLORER",
      navAnalytics: "Analitik",
      navGuidelines: "Kılavuz",
      navResources: "Kaynaklar",
      navFAQ: "SSS",
      
      // Hero
      title: "NASA Uzay Biyobilim Keşif Platformu",
      subtitle: "Yapay zeka destekli semantik arama • 608 yayın • Gerçek zamanlı özetler",
      search: "🚀 Ara",
      queryPlaceholder: "Uzay biyolojisi araştırmanızı yazın...",
      
      // Search suggestions
      suggestionsTitle: "🧠 Akıllı Aramalar",
      smartSearchLabel: "Önerilen aramalar:",
      currentSearchLabel: "Yazdığınız arama:",
      searchButton: "Ara",
      
      // Errors & Messages
      noResult: "Sonuç bulunamadı. Farklı anahtar kelimeler deneyin.",
      noResultSub: "Farklı anahtar kelimeler deneyin veya filtreleri değiştirin",
      errorPrefix: "⚠️",
      searchEmptyError: "Lütfen bir arama sorgusu girin.",
      searchTimeoutError: "Arama zaman aşımına uğradı.",
      unknownError: "Bilinmeyen hata",
      apiError: "API hatası",
      invalidDataError: "API'den geçersiz veri formatı alındı",
      
      // Result actions
      summarizeOne: "✨ Özetle",
      hide: "✕",
      summarizing: "⏳",
      copy: "Kopyala",
      source: "Kaynak",
      askQuestion: "Soru Sor",
      asking: "Yanıtlanıyor...",
      askPlaceholder: "💬 Bu makale hakkında soru sorun... (Enter ile sor)",
      askButton: "🤔 Sor",
      answerLabel: "💡 Yanıt:",
      
      // Resource links
      pmcSource: "📄 PMC Source",
      copyLink: "📋 Copy Link",
      osdrLink: "🛰️ OSDR",
      nslslLink: "🔬 NSLSL",
      taskbookLink: "📚 Task Book",
      
      // Footer
      footerBrand: "NextGenLAB Space Bioscience Explorer",
      footerPowered: "🚀 Powered by",
      footerAI: "OpenAI GPT-4o-mini",
      footerStats: "608 NASA Publications • Real-time AI Analysis • Knowledge Graph Visualization",
    };
    const en: Record<string, string> = {
      // Header
      brandName: "NextGenLAB",
      brandSubtitle: "SPACE BIOSCIENCE EXPLORER",
      navAnalytics: "Analytics",
      navGuidelines: "Guidelines",
      navResources: "Resources",
      navFAQ: "FAQ",
      
      // Hero
      title: "NASA Space Bioscience Explorer",
      subtitle: "AI-powered semantic search • 608 publications • Real-time summaries",
      search: "🚀 Search",
      queryPlaceholder: "Search space biology research...",
      
      // Search suggestions
      suggestionsTitle: "🧠 Smart Searches",
      smartSearchLabel: "Suggested searches:",
      currentSearchLabel: "Your search:",
      searchButton: "Search",
      
      // Errors & Messages
      noResult: "No results found. Try different keywords.",
      noResultSub: "Try different keywords or adjust filters",
      errorPrefix: "⚠️",
      searchEmptyError: "Please enter a search query.",
      searchTimeoutError: "Search timed out.",
      unknownError: "Unknown error",
      apiError: "API error",
      invalidDataError: "Invalid data format from API",
      
      // Result actions
      summarizeOne: "✨ Summarize",
      hide: "✕",
      summarizing: "⏳",
      copy: "Copy",
      source: "Source",
      askQuestion: "Ask",
      asking: "Answering...",
      askPlaceholder: "💬 Ask about this article... (Press Enter)",
      askButton: "🤔 Ask",
      answerLabel: "💡 Answer:",
      
      // Resource links
      pmcSource: "📄 PMC Source",
      copyLink: "📋 Copy Link",
      osdrLink: "🛰️ OSDR",
      nslslLink: "🔬 NSLSL",
      taskbookLink: "📚 Task Book",
      
      // Footer
      footerBrand: "NextGenLAB Space Bioscience Explorer",
      footerPowered: "🚀 Powered by",
      footerAI: "OpenAI GPT-4o-mini",
      footerStats: "608 NASA Publications • Real-time AI Analysis • Knowledge Graph Visualization",
    };
    return (lang === "tr" ? tr : en)[key] || key;
  };


  const search = useCallback(async (query?: string) => {
    const qq = (query ?? q).trim();
    if (!qq) {
      setError(T("searchEmptyError"));
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
        throw new Error(`${T("apiError")} (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error(T("invalidDataError"));
      }
      
      setItems(data);
    } catch (e: unknown) {
      let msg = T("unknownError");
      
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          msg = T("searchTimeoutError");
        } else {
          msg = e.message;
        }
      }
      
      console.error("Search error:", e);
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        body: JSON.stringify({ ids: [id] }),
      });
      const data = await res.json();
      const text = res.ok && data.summary ? data.summary + (data.citations?.length ? "\n\n📚 Kaynaklar:\n" + data.citations.join("\n") : "") : (data?.summary || "");
      setCardSummaries((p) => ({ ...p, [id]: { text, loading: false } }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setCardSummaries((p) => ({ ...p, [id]: { text: `Özetleme başarısız: ${msg}`, loading: false } }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const askQA = useCallback(async (id: number) => {
    // Get current state to ensure we have the latest question
    const currentQA = cardQA[id];
    const question = currentQA?.q?.trim() || "";
    
    // Debug log
    console.log(`[askQA] ID: ${id}, Question: "${question}", Length: ${question.length}`);
    
    if (!question || question.length === 0) {
      console.log("[askQA] Empty question detected");
      setCardQA((p) => ({ 
        ...p, 
        [id]: { 
          q: currentQA?.q || "", 
          a: lang === "tr" ? "⚠️ Lütfen bir soru yazın." : "⚠️ Please enter a question.", 
          loading: false 
        } 
      }));
      return;
    }
    
    console.log("[askQA] Sending question to API:", question);
    
    // Clear previous answer and set loading
    setCardQA((p) => ({ 
      ...p, 
      [id]: { 
        q: question, 
        a: "", 
        loading: true 
      } 
    }));
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for article fetching
      
      console.log(`[Frontend] Sending QA request for article ID ${id}`);
      
      const res = await fetch(`${api}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          question, 
          persona: null,
          language: lang // Send current language to API
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`API Error (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      const ans = data.answer || (lang === "tr" ? "Yanıt alınamadı." : "No answer received.");
      
      console.log("[askQA] Received answer, length:", ans.length);
      
      setCardQA((p) => ({ ...p, [id]: { q: question, a: ans, loading: false } }));
    } catch (e: unknown) {
      let errorMsg = lang === "tr" ? "Soru cevaplanamadı" : "Failed to answer question";
      
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          errorMsg = lang === "tr" ? "⏱️ İstek zaman aşımına uğradı. Lütfen tekrar deneyin." : "⏱️ Request timed out. Please try again.";
        } else {
          errorMsg = `${lang === "tr" ? "Hata" : "Error"}: ${e.message}`;
        }
      }
      
      console.error("[askQA] Error:", e);
      setCardQA((p) => ({ ...p, [id]: { q: question, a: `❌ ${errorMsg}`, loading: false } }));
    }
  }, [api, lang, cardQA]);

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
        <header className="header-sticky" style={{ zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0, flex: "1 1 200px" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Image src="/logo.png" alt="NextGenLAB NASA Space Bioscience Explorer Logo" width={52} height={52} priority className="glow pulse-slow" />
                <div style={{ position: "absolute", inset: -8, background: "radial-gradient(circle, rgba(167, 139, 250, 0.4), transparent)", filter: "blur(12px)", zIndex: -1 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="text-gradient" style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                  {T("brandName")}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500, whiteSpace: "nowrap" }}>{T("brandSubtitle")}</div>
              </div>
          </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { href: "/analytics", labelKey: "navAnalytics" },
                { href: "/guidelines", labelKey: "navGuidelines" },
                { href: "/resources", labelKey: "navResources" },
                { href: "/faq", labelKey: "navFAQ" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                  {T(link.labelKey)}
                </Link>
              ))}
          </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", minWidth: 0 }}>
              <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} style={{ fontSize: 13, fontWeight: 500, minWidth: 60 }}>
                <option value="tr">🇹🇷</option>
                <option value="en">🇬🇧</option>
            </select>
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", position: "relative" }}>
          {/* Premium Hero Section */}
          <div className="glass-card" style={{ padding: "48px 24px 80px 24px", marginBottom: 40, position: "relative", overflow: "visible", zIndex: 1000 }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 400, height: 400, background: "radial-gradient(circle, rgba(167, 139, 250, 0.15), transparent)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
            
            <div style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
              <h1 className="text-gradient" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {T("title")}
              </h1>
              <p style={{ fontSize: "clamp(16px, 2.5vw, 18px)", color: "var(--text-secondary)", letterSpacing: 0.3, fontWeight: 500, maxWidth: 700, margin: "0 auto" }}>{T("subtitle")}</p>
            </div>

            {/* Premium Search Bar with Smart Suggestions */}
            <div style={{ position: "relative", zIndex: 9999999, isolation: "isolate" }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap", position: "relative", zIndex: 9999999 }}>
                <div style={{ position: "relative", flex: "1 1 300px", minWidth: 0, zIndex: 9999999 }}>
            <input
              value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setShowSuggestions(false);
                        search();
                      }
                      if (e.key === "Escape") setShowSuggestions(false);
                    }}
              placeholder={T("queryPlaceholder")}
                    style={{ width: "100%", padding: "18px 24px", fontSize: 16, fontWeight: 500, position: "relative", zIndex: 1 }}
                  />
                  
                  {/* Smart Suggestions Dropdown - ABSOLUTE MAXIMUM VISIBILITY */}
                  {showSuggestions && smartSuggestions.length > 0 && (
                    <div 
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking suggestions
                      style={{ 
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        right: 0,
                        background: "rgba(5, 2, 20, 1)",  // Fully opaque
                        backdropFilter: "blur(40px)",
                        WebkitBackdropFilter: "blur(40px)",
                        border: "3px solid rgba(167, 139, 250, 0.9)",
                        borderRadius: "20px",
                        padding: "12px 0",
                        maxHeight: 450,
                        overflowY: "auto",
                        boxShadow: `
                          0 0 3px 2px rgba(167, 139, 250, 0.7),
                          0 0 40px 8px rgba(167, 139, 250, 1), 
                          0 30px 80px rgba(167, 139, 250, 0.9), 
                          0 15px 40px rgba(0, 0, 0, 1), 
                          inset 0 3px 0 rgba(255, 255, 255, 0.25),
                          inset 0 0 30px rgba(167, 139, 250, 0.15),
                          0 0 150px rgba(167, 139, 250, 0.8)
                        `,
                        zIndex: 2147483647,  // Maximum z-index value
                        animation: "slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        outline: "2px solid rgba(255, 255, 255, 0.15)",
                        outlineOffset: "-2px",
                        isolation: "isolate",
                        willChange: "transform"
                      }}
                    >
                      <div style={{ 
                        padding: "16px 24px 12px", 
                        fontSize: 12, 
                        color: "rgba(167, 139, 250, 1)", 
                        fontWeight: 800, 
                        letterSpacing: 2, 
                        textTransform: "uppercase",
                        borderBottom: "2px solid rgba(167, 139, 250, 0.3)",
                        marginBottom: 8,
                        textShadow: "0 0 20px rgba(167, 139, 250, 0.8), 0 0 10px rgba(167, 139, 250, 0.5)",
                        background: "linear-gradient(90deg, rgba(167, 139, 250, 0.1), transparent)"
                      }}>
                        ✨ {T("smartSearchLabel")}
                      </div>
                      {smartSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setQ(suggestion);
                            setShowSuggestions(false);
                            setTimeout(() => search(suggestion), 100);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "16px 24px",
                            background: "transparent",
                            border: "none",
                            color: "var(--text-primary)",
                            fontSize: 15,
                            cursor: "pointer",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            fontWeight: 500,
                            borderBottom: idx < smartSuggestions.length - 1 ? "1px solid rgba(167, 139, 250, 0.15)" : "none",
                            position: "relative"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(90deg, rgba(167, 139, 250, 0.25), rgba(167, 139, 250, 0.1))";
                            e.currentTarget.style.paddingLeft = "36px";
                            e.currentTarget.style.borderLeft = "4px solid rgba(167, 139, 250, 0.8)";
                            e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(167, 139, 250, 0.2)";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.paddingLeft = "24px";
                            e.currentTarget.style.borderLeft = "none";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <span style={{ opacity: 0.8, fontSize: 17 }}>🔍</span>
                          <span style={{ flex: 1, lineHeight: 1.5 }}>{suggestion}</span>
                          <span style={{ opacity: 0.5, fontSize: 14 }}>↵</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => search()} disabled={loading} className="btn-primary" style={{ minWidth: 140, fontSize: 16, flexShrink: 0 }} aria-label="Search publications">
                  {loading ? "⏳" : T("search")}
            </button>
          </div>
              
              {/* Language Indicator */}
              {q.length > 0 && (
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🌐 {lang === "tr" ? "Türkçe" : "English"} {T("currentSearchLabel")}</span>
                  <span style={{ fontWeight: 600, color: "var(--nebula-purple)" }}>{q}</span>
                </div>
              )}
            </div>


            {error && (
              <div className="glass-card" style={{ marginTop: 16, padding: 16, border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, color: "#FCA5A5", fontSize: 14 }}>
                {T("errorPrefix")} {error}
              </div>
            )}
          </div>

          {/* Premium Results */}
          <div style={{ display: "grid", gap: 24, position: "relative", zIndex: 1 }}>
            {loading && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="result-card loading-shimmer" style={{ height: 180 }} />
              ))
            )}

            {!loading && items.map((it) => (
              <div key={it.id} className="result-card" style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 24, marginBottom: 18, flexWrap: "wrap" }}>
                  <a href={it.url} target="_blank" rel="noreferrer" style={{ flex: "1 1 300px", fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none", lineHeight: 1.4, transition: "color 0.3s", minWidth: 0 }}>
                    {it.title}
                  </a>
                  
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                    <div className="badge" data-tooltip="Relevance Score" style={{ background: `linear-gradient(135deg, rgba(167, 139, 250, ${it.score * 0.3}), rgba(96, 165, 250, ${it.score * 0.2}))`, whiteSpace: "nowrap" }}>
                      ⭐ {(it.score * 100).toFixed(1)}%
                        </div>
                    <button onClick={() => summarizeOne(it.id)} disabled={cardSummaries[it.id]?.loading} className="btn-primary" style={{ fontSize: 13, padding: "10px 20px", whiteSpace: "nowrap" }} aria-label={`Summarize article: ${it.title}`}>
                      {cardSummaries[it.id]?.loading ? T("summarizing") : (cardSummaries[it.id]?.text ? T("hide") : T("summarizeOne"))}
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

                {/* Enhanced Q&A Section */}
                <div style={{ marginTop: 20, padding: 20, background: "rgba(167, 139, 250, 0.05)", borderRadius: 12, border: "1px solid rgba(167, 139, 250, 0.1)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--nebula-purple)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>💬</span>
                    <span>{lang === "tr" ? "Bu makale hakkında soru sorun" : "Ask about this article"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <input 
                    value={cardQA[it.id]?.q || ""} 
                    onChange={(e) => setCardQA((p) => ({ ...p, [it.id]: { q: e.target.value, a: p[it.id]?.a || "", loading: false } }))} 
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !cardQA[it.id]?.loading && cardQA[it.id]?.q?.trim()) {
                          e.preventDefault();
                        askQA(it.id);
                      }
                    }}
                    placeholder={T("askPlaceholder")}
                      disabled={cardQA[it.id]?.loading}
                      style={{ 
                        flex: "1 1 200px", 
                        fontWeight: 500, 
                        minWidth: 0,
                        opacity: cardQA[it.id]?.loading ? 0.6 : 1,
                        cursor: cardQA[it.id]?.loading ? "not-allowed" : "text"
                      }}
                    />
                    <button 
                      onClick={() => askQA(it.id)} 
                      disabled={cardQA[it.id]?.loading || !cardQA[it.id]?.q?.trim()} 
                      className="btn-primary" 
                      style={{ 
                        fontSize: 13, 
                        padding: "12px 24px", 
                        flexShrink: 0,
                        minWidth: 120,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8
                      }} 
                      aria-label={`Ask question about: ${it.title}`}
                    >
                      {cardQA[it.id]?.loading ? (
                        <>
                          <span className="loading-spinner" style={{ 
                            width: 14, 
                            height: 14, 
                            border: "2px solid rgba(255,255,255,0.3)", 
                            borderTopColor: "white", 
                            borderRadius: "50%", 
                            animation: "spin 1s linear infinite" 
                          }}/>
                          <span>{T("asking")}</span>
                        </>
                      ) : (
                        <>
                          <span>🤔</span>
                          <span>{T("askButton")}</span>
                        </>
                      )}
                        </button>
                  </div>
                      </div>

                      {cardQA[it.id]?.a && (
                  <div className="glass-card" style={{ padding: 20, marginTop: 16, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, color: "var(--text-primary)", background: "rgba(15, 8, 36, 0.5)", borderLeft: "3px solid var(--nebula-purple)" }}>
                    <div style={{ fontWeight: 600, marginBottom: 10, color: "var(--nebula-purple)" }}>{T("answerLabel")}</div>
                    {cardQA[it.id].a}
                        </div>
                      )}

                {/* Premium Resource Links */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(167, 139, 250, 0.1)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href={it.url} target="_blank" rel="noreferrer" className="badge">
                    {T("pmcSource")}
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(it.url)} className="badge" style={{ cursor: "pointer", background: "transparent" }}>
                    {T("copyLink")}
                  </button>
                  <a href={`https://osdr.nasa.gov/bio/repo/search?q=${encodeURIComponent(it.title)}`} target="_blank" rel="noreferrer" className="badge">
                    {T("osdrLink")}
                  </a>
                  <a href={`https://extapps.ksc.nasa.gov/NSLSL/Search?q=${encodeURIComponent(it.title)}`} target="_blank" rel="noreferrer" className="badge">
                    {T("nslslLink")}
                  </a>
                  <a href="https://taskbook.nasaprs.com/tbp/welcome.cfm" target="_blank" rel="noreferrer" className="badge">
                    {T("taskbookLink")}
                  </a>
                  </div>
              </div>
            ))}

            {!loading && items.length === 0 && !error && (
              <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🌌</div>
                <div style={{ fontSize: 20, color: "var(--text-secondary)", fontWeight: 500 }}>{T("noResult")}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 12, opacity: 0.7 }}>{T("noResultSub")}</div>
              </div>
            )}
          </div>
      </main>

        {/* Premium Footer */}
        <footer className="glass-card" style={{ marginTop: 80, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
              <Image src="/logo.png" alt="NextGenLAB Logo" width={28} height={28} className="glow" />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: 16 }}>{T("footerBrand")}</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{T("footerStats")}</div>
        </div>
      </footer>
    </div>
    </>
  );
}
