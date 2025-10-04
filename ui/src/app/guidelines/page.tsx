"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GuidelinesPage() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  
  const T = (key: string) => {
    const tr: Record<string, string> = {
      pageTitle: "Kılavuz",
      pageSubtitle: "PLATFORMU NASIL KULLANIRSINIZ",
      navHome: "Ana Sayfa",
      navResources: "Kaynaklar",
      navAnalytics: "Analitik",
      heroTitle: "🚀 Platform Kullanım Kılavuzu",
      heroDesc: "NASA Space Bioscience Explorer platformunu nasıl etkili kullanacağınızı öğrenin. 608 yayın üzerinde semantik arama, yapay zeka destekli özetler ve bilgi grafiği görselleştirmesi.",
      purposeTitle: "🎯 Platform Amacı",
      purposeDesc: "Bu platform, 608 NASA biyobilim yayınının etkilerini ve sonuçlarını özetleyen, araştırma ilerlemesini gösteren ve bilgi boşluklarını belirleyen interaktif bir gösterge panelidir. Araştırmacıların hipotez oluşturmasına, yöneticilerin yatırım fırsatlarını değerlendirmesine ve misyon mimarlarının güvenli ve etkili keşif stratejileri geliştirmesine yardımcı olur.",
      personasTitle: "👥 Kullanıcı Profilleri",
      scientist: "Scientist",
      scientistDesc: "Hipotez üretimi, araştırma soruları geliştirme, literatür taraması",
      manager: "Manager",
      managerDesc: "Yatırım fırsatları değerlendirme, araştırma trendleri analizi",
      architect: "Mission Architect",
      architectDesc: "Güvenli ve etkili keşif stratejileri, misyon planlama",
      featuresTitle: "✨ Özellikler",
      feature1Title: "🔍 Semantik Arama",
      feature1Desc: "Doğal dil kullanarak başlık ve abstract üzerinde arama yapın:",
      feature1Ex: "Örnek: \"microgravity plant root growth\"",
      feature1Filters: "Filtreler: Yıl, organizma (Plant/Rodent/Human), platform (ISS/Shuttle)",
      feature1Results: "Sonuçlar: Relevans skoru ile sıralanır (%0-100)",
      feature2Title: "✨ AI Destekli Özetler",
      feature2Desc: "Her makale için tek tıkla GPT-4o-mini ile özet oluşturun:",
      feature2Cited: "Kaynaklı: Tüm özetler kaynak referanslarıyla",
      feature2Traceable: "İzlenebilir: Doğrudan PMC linklerine erişim",
      feature2Personalized: "Kişiselleştirilmiş: Persona ve bölüm önceliğine göre",
      feature2QA: "Soru-Cevap: Makale hakkında soru sorun",
      feature3Title: "📊 Bilgi Grafiği",
      feature3Desc: "Scientist Dashboard'da interaktif bilgi grafiği:",
      feature3Nodes: "3,107 düğüm: Araştırma varlıkları",
      feature3Edges: "40,967 bağlantı: İlişkiler ve etkileşimler",
      feature3Viz: "Görselleştirme: Cytoscape.js ile dinamik",
      feature3Analysis: "Analiz: Düğüm tipleri, edge ilişkileri, zaman çizelgesi",
      howToTitle: "📖 Nasıl Kullanılır?",
      tipsTitle: "💡 İpuçları",
      footerHelp: "Yardıma mı ihtiyacınız var? Kaynakları kontrol edin veya destekle iletişime geçin"
    };
    
    const en: Record<string, string> = {
      pageTitle: "Guidelines",
      pageSubtitle: "HOW TO USE THE PLATFORM",
      navHome: "Home",
      navResources: "Resources",
      navAnalytics: "Analytics",
      heroTitle: "🚀 Platform Usage Guide",
      heroDesc: "Learn how to effectively use the NASA Space Bioscience Explorer platform. Semantic search, AI-powered summaries, and knowledge graph visualization across 608 publications.",
      purposeTitle: "🎯 Platform Purpose",
      purposeDesc: "This platform is an interactive dashboard that summarizes the impacts and results of 608 NASA bioscience publications, shows research progress, and identifies knowledge gaps. It helps researchers generate hypotheses, managers evaluate investment opportunities, and mission architects develop safe and effective exploration strategies.",
      personasTitle: "👥 User Profiles",
      scientist: "Scientist",
      scientistDesc: "Hypothesis generation, research question development, literature review",
      manager: "Manager",
      managerDesc: "Investment opportunity assessment, research trend analysis",
      architect: "Mission Architect",
      architectDesc: "Safe and effective exploration strategies, mission planning",
      featuresTitle: "✨ Features",
      feature1Title: "🔍 Semantic Search",
      feature1Desc: "Search titles and abstracts using natural language:",
      feature1Ex: "Example: \"microgravity plant root growth\"",
      feature1Filters: "Filters: Year, organism (Plant/Rodent/Human), platform (ISS/Shuttle)",
      feature1Results: "Results: Ranked by relevance score (0-100%)",
      feature2Title: "✨ AI-Powered Summaries",
      feature2Desc: "Generate summaries with GPT-4o-mini for each article in one click:",
      feature2Cited: "Cited: All summaries with source references",
      feature2Traceable: "Traceable: Direct access to PMC links",
      feature2Personalized: "Personalized: Based on persona and section priority",
      feature2QA: "Q&A: Ask questions about the article",
      feature3Title: "📊 Knowledge Graph",
      feature3Desc: "Interactive knowledge graph on Scientist Dashboard:",
      feature3Nodes: "3,107 nodes: Research entities",
      feature3Edges: "40,967 edges: Relationships and interactions",
      feature3Viz: "Visualization: Dynamic with Cytoscape.js",
      feature3Analysis: "Analysis: Node types, edge relations, timeline",
      howToTitle: "📖 How to Use?",
      tipsTitle: "💡 Tips",
      footerHelp: "Need help? Check Resources or contact support"
    };
    
    return (lang === "tr" ? tr : en)[key] || key;
  };

  const steps = {
    tr: [
      { step: "1", title: "Arama Yapın", desc: "Ana sayfada doğal dil kullanarak arama yapın. Örn: 'microgravity bone loss'", icon: "🔍" },
      { step: "2", title: "Filtreleri Kullanın", desc: "Yıl, organizma veya platform filtrelerini uygulayarak sonuçları daraltın", icon: "🎯" },
      { step: "3", title: "Özet Oluşturun", desc: "'Özetle' butonuna tıklayarak AI destekli özet alın. Persona seçin (opsiyonel)", icon: "✨" },
      { step: "4", title: "Soru Sorun", desc: "Makale hakkında spesifik sorular sorun, AI yanıt versin", icon: "💬" },
      { step: "5", title: "Kaynakları İnceleyin", desc: "PMC Source, OSDR, NSLSL linklerini kullanarak detaylı bilgiye ulaşın", icon: "📚" },
      { step: "6", title: "Analytics'i Keşfedin", desc: "Analytics sayfasında istatistikleri, grafikleri ve trendleri görün", icon: "📊" }
    ],
    en: [
      { step: "1", title: "Search", desc: "Use natural language to search on the homepage. E.g.: 'microgravity bone loss'", icon: "🔍" },
      { step: "2", title: "Use Filters", desc: "Narrow results by applying year, organism, or platform filters", icon: "🎯" },
      { step: "3", title: "Generate Summary", desc: "Click 'Summarize' to get AI-powered summaries. Select persona (optional)", icon: "✨" },
      { step: "4", title: "Ask Questions", desc: "Ask specific questions about the article, AI will respond", icon: "💬" },
      { step: "5", title: "Explore Sources", desc: "Use PMC Source, OSDR, NSLSL links to access detailed information", icon: "📚" },
      { step: "6", title: "Explore Analytics", desc: "View statistics, charts, and trends on the Analytics page", icon: "📊" }
    ]
  };

  const tips = {
    tr: [
      "Arama yaparken spesifik bilimsel terimler kullanın",
      "Relevans skoruna göre en alakalı sonuçlara odaklanın",
      "Persona seçerek ihtiyacınıza özel özetler alın",
      "Section Priority ile önemli bölümleri vurgulayın",
      "Analytics'te trend analizi yaparak araştırma boşluklarını keşfedin",
      "Knowledge Graph'te düğümlere tıklayarak ilişkileri görün"
    ],
    en: [
      "Use specific scientific terms when searching",
      "Focus on the most relevant results based on relevance score",
      "Select a persona to get customized summaries",
      "Highlight important sections with Section Priority",
      "Discover research gaps by analyzing trends in Analytics",
      "Click on nodes in the Knowledge Graph to see relationships"
    ]
  };

  const currentSteps = steps[lang];
  const currentTips = tips[lang];

  return (
    <>
      {/* Space Background */}
      <div className="space-background" />
      <div className="stars stars-layer-1" />
      <div className="stars stars-layer-2" />
      <div className="stars stars-layer-3" />
      <div className="nebula">
        <div className="nebula-glow-1" />
        <div className="nebula-glow-2" />
        <div className="nebula-glow-3" />
      </div>

      <div style={{ minHeight: "100vh", position: "relative", zIndex: 10 }}>
        {/* Premium Header */}
        <header className="header-sticky">
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0, flex: "1 1 200px" }}>
              <Image src="/logo.png" alt="NextGenLAB NASA Space Bioscience Explorer Logo" width={52} height={52} priority className="glow pulse-slow" />
              <div style={{ minWidth: 0 }}>
                <div className="text-gradient" style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                  {T("pageTitle")}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500, whiteSpace: "nowrap" }}>{T("pageSubtitle")}</div>
              </div>
          </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{T("navHome")}</Link>
              <Link href="/resources" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{T("navResources")}</Link>
              <Link href="/analytics" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{T("navAnalytics")}</Link>
              <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} style={{ fontSize: 13, fontWeight: 500, minWidth: 60 }}>
                <option value="tr">🇹🇷</option>
                <option value="en">🇬🇧</option>
              </select>
          </nav>
        </div>
      </header>

        <main style={{ maxWidth: 1200, margin: "32px auto", padding: "0 24px" }}>
          {/* Hero */}
          <div className="glass-card" style={{ padding: 48, marginBottom: 32, textAlign: "center" }}>
            <h1 className="text-gradient" style={{ fontSize: 42, fontWeight: 900, marginTop: 0, marginBottom: 16, lineHeight: 1.2 }}>
              {T("heroTitle")}
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 800, margin: "0 auto", lineHeight: 1.7 }}>
              {T("heroDesc")}
            </p>
          </div>

          {/* Purpose */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 16, color: "var(--text-primary)" }}>
              {T("purposeTitle")}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)", margin: 0 }}>
              {T("purposeDesc")}
            </p>
          </div>

          {/* Personas */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 24, color: "var(--text-primary)" }}>
              {T("personasTitle")}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              <div className="badge" style={{ flexDirection: "column", padding: 20, alignItems: "start", minHeight: 140 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔬</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{T("scientist")}</div>
                <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                  {T("scientistDesc")}
                </div>
              </div>
              
              <div className="badge" style={{ flexDirection: "column", padding: 20, alignItems: "start", minHeight: 140 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💼</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{T("manager")}</div>
                <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                  {T("managerDesc")}
                </div>
              </div>
              
              <div className="badge" style={{ flexDirection: "column", padding: 20, alignItems: "start", minHeight: 140 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏗️</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{T("architect")}</div>
                <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                  {T("architectDesc")}
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 24, color: "var(--text-primary)" }}>
              {T("featuresTitle")}
            </h2>
            
            <div style={{ display: "grid", gap: 20 }}>
              <div className="result-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, color: "var(--nebula-purple)" }}>
                  {T("feature1Title")}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {T("feature1Desc")}
                </p>
                <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8, fontSize: 14, color: "var(--text-secondary)" }}>
                  <li><strong>{lang === "tr" ? "Örnek:" : "Example:"}</strong> {T("feature1Ex")}</li>
                  <li><strong>{lang === "tr" ? "Filtreler:" : "Filters:"}</strong> {T("feature1Filters")}</li>
                  <li><strong>{lang === "tr" ? "Sonuçlar:" : "Results:"}</strong> {T("feature1Results")}</li>
                </ul>
              </div>

              <div className="result-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, color: "var(--nebula-blue)" }}>
                  {T("feature2Title")}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {T("feature2Desc")}
                </p>
                <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8, fontSize: 14, color: "var(--text-secondary)" }}>
                  <li><strong>{lang === "tr" ? "Kaynaklı:" : "Cited:"}</strong> {T("feature2Cited")}</li>
                  <li><strong>{lang === "tr" ? "İzlenebilir:" : "Traceable:"}</strong> {T("feature2Traceable")}</li>
                  <li><strong>{lang === "tr" ? "Kişiselleştirilmiş:" : "Personalized:"}</strong> {T("feature2Personalized")}</li>
                  <li><strong>{lang === "tr" ? "Soru-Cevap:" : "Q&A:"}</strong> {T("feature2QA")}</li>
                </ul>
              </div>

              <div className="result-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, color: "var(--nebula-cyan)" }}>
                  {T("feature3Title")}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {T("feature3Desc")}
                </p>
                <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8, fontSize: 14, color: "var(--text-secondary)" }}>
                  <li><strong>3,107 {lang === "tr" ? "düğüm:" : "nodes:"}</strong> {T("feature3Nodes")}</li>
                  <li><strong>40,967 {lang === "tr" ? "bağlantı:" : "edges:"}</strong> {T("feature3Edges")}</li>
                  <li><strong>{lang === "tr" ? "Görselleştirme:" : "Visualization:"}</strong> {T("feature3Viz")}</li>
                  <li><strong>{lang === "tr" ? "Analiz:" : "Analysis:"}</strong> {T("feature3Analysis")}</li>
          </ul>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 24, color: "var(--text-primary)" }}>
              {T("howToTitle")}
            </h2>
            
            <div style={{ display: "grid", gap: 16 }}>
              {currentSteps.map((item) => (
                <div key={item.step} className="badge" style={{ padding: 20, alignItems: "start", gap: 16 }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                      {lang === "tr" ? "Adım" : "Step"} {item.step}: {item.title}
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 24, color: "var(--text-primary)" }}>
              {T("tipsTitle")}
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              {currentTips.map((tip, i) => (
                <div key={i} className="badge" style={{ justifyContent: "start", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>💡</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
        </div>
      </main>

        {/* Footer */}
        <footer className="glass-card" style={{ marginTop: 80, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
              <Image src="/logo.png" alt="NextGenLAB Logo" width={28} height={28} className="glow" />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: 16 }}>NextGenLAB Space Bioscience Explorer</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{T("footerHelp")}</div>
          </div>
        </footer>
    </div>
    </>
  );
}
