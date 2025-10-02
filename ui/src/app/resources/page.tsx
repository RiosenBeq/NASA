"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ResourcesPage() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const resources = [
    {
      title: "📚 SB Publications",
      desc: "608 açık erişimli NASA Space Biology yayın listesi",
      url: "https://github.com/jgalazka/SB_publications/tree/main",
      category: "Primary Source",
      icon: "📄"
    },
    {
      title: "🛰️ OSDR (Open Science Data Repository)",
      desc: "NASA'nın uzay biyolojisi ve fiziksel bilimler verileri için birincil veri ve metadata deposu",
      url: "https://www.nasa.gov/osdr/",
      category: "Data Repository",
      icon: "🗄️"
    },
    {
      title: "🔬 NSLSL (NASA Space Life Sciences Lab)",
      desc: "Ek literatür ve uzay yaşam bilimleri araştırmaları",
      url: "https://extapps.ksc.nasa.gov/NSLSL/Search",
      category: "Literature",
      icon: "📖"
    },
    {
      title: "📊 NASA Task Book",
      desc: "NASA'nın Biological and Physical Sciences (BPS) Division ve Human Research Program (HRP) tarafından desteklenen araştırma projelerinin çevrimiçi veritabanı. Proje açıklamaları, yıllık ilerleme raporları, nihai raporlar ve NASA destekli çalışmalardan kaynaklanan yayınların bibliyografik listelerini içerir.",
      url: "https://taskbook.nasaprs.com/tbp/welcome.cfm",
      category: "Research Database",
      icon: "📋",
      featured: true
    },
    {
      title: "🌍 PMC (PubMed Central)",
      desc: "Biyomedikal ve yaşam bilimleri dergi literatürünün ücretsiz tam metin arşivi",
      url: "https://www.ncbi.nlm.nih.gov/pmc/",
      category: "Publication Archive",
      icon: "🏛️"
    },
    {
      title: "🚀 NASA Biological & Physical Sciences",
      desc: "NASA'nın uzay biyolojisi ve fiziksel bilimler araştırmaları ana portalı",
      url: "https://www.nasa.gov/directorates/somd/space-life-physical-sciences-research-applications/",
      category: "NASA Portal",
      icon: "🌌"
    }
  ];

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
                  Resources
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500, whiteSpace: "nowrap" }}>EXTERNAL LINKS & DATABASES</div>
              </div>
            </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>Home</Link>
              <Link href="/guidelines" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>Guidelines</Link>
              <Link href="/analytics" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>Analytics</Link>
              <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} style={{ fontSize: 13, fontWeight: 500, minWidth: 60 }}>
                <option value="tr">🇹🇷</option>
                <option value="en">🇬🇧</option>
              </select>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "32px auto", padding: "0 24px" }}>
          {/* Hero */}
          <div className="glass-card" style={{ padding: 48, marginBottom: 40, textAlign: "center" }}>
            <h1 className="text-gradient" style={{ fontSize: 42, fontWeight: 900, marginTop: 0, marginBottom: 16, lineHeight: 1.2 }}>
              🌐 Harici Kaynaklar
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 800, margin: "0 auto", lineHeight: 1.7 }}>
              NASA Space Bioscience araştırmaları için güvenilir veri kaynakları, 
              literatür veritabanları ve araştırma portalları.
            </p>
          </div>

          {/* Resources Grid */}
          <div style={{ display: "grid", gap: 24, marginBottom: 32 }}>
            {resources.map((resource, index) => (
              <div key={index} className={resource.featured ? "result-card" : "glass-card"} style={{ padding: 32, position: "relative", overflow: "hidden" }}>
                {resource.featured && (
                  <div style={{ position: "absolute", top: 16, right: 16 }}>
                    <div className="badge" style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", color: "white", border: "none" }}>
                      ⭐ Featured
                    </div>
                  </div>
                )}
                
                <div style={{ display: "flex", alignItems: "start", gap: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 48, flexShrink: 0 }}>{resource.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="badge" style={{ marginBottom: 12, display: "inline-flex" }}>
                      {resource.category}
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 12, color: "var(--text-primary)" }}>
                      {resource.title}
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 20 }}>
                      {resource.desc}
                    </p>
                    <a href={resource.url} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      🔗 Siteyi Ziyaret Et
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Card */}
          <div className="glass-card" style={{ padding: 32, background: "rgba(167, 139, 250, 0.08)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16, color: "var(--text-primary)" }}>
              💡 Kullanım Önerisi
            </h3>
            <div style={{ display: "grid", gap: 12, fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span>•</span>
                <span><strong>SB Publications:</strong> Platform&apos;da bulunan 608 yayının tam listesi için</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span>•</span>
                <span><strong>OSDR:</strong> Ham veri ve metadata&apos;ya erişim için</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span>•</span>
                <span><strong>NSLSL:</strong> Ek literatür taraması için</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span>•</span>
                <span><strong>Task Book:</strong> Devam eden ve tamamlanmış NASA projeleri için</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span>•</span>
                <span><strong>PMC:</strong> Tam metin yayınlara erişim için</span>
              </div>
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
            <div style={{ fontSize: 13, opacity: 0.7 }}>All external resources are provided by NASA and affiliated organizations</div>
          </div>
        </footer>
      </div>
    </>
  );
}
