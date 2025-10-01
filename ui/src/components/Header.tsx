"use client";

import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  lang: "tr" | "en";
  setLang: (lang: "tr" | "en") => void;
  persona: "scientist" | "manager" | "architect" | "";
  setPersona: (persona: "scientist" | "manager" | "architect" | "") => void;
  sectionPriority: "results" | "discussion" | "conclusion" | "";
  setSectionPriority: (section: "results" | "discussion" | "conclusion" | "") => void;
}

export default function Header({ 
  lang, 
  setLang, 
  persona, 
  setPersona, 
  sectionPriority, 
  setSectionPriority 
}: HeaderProps) {
  const navigationLinks = [
    { href: "/", label: lang === "tr" ? "Ana Sayfa" : "Home" },
    { href: "/analytics", label: lang === "tr" ? "Analitik" : "Analytics" },
    { href: "/scientist", label: lang === "tr" ? "Bilim İnsanı" : "Scientist" },
    { href: "/manager", label: lang === "tr" ? "Yönetici" : "Manager" },
    { href: "/architect", label: lang === "tr" ? "Mimar" : "Architect" },
    { href: "/guidelines", label: lang === "tr" ? "Kılavuzlar" : "Guidelines" },
    { href: "/resources", label: lang === "tr" ? "Kaynaklar" : "Resources" },
  ];

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

      <div style={{ minHeight: "100vh", position: "relative", zIndex: 10 }}>
        {/* Premium Header */}
        <header className="header-sticky">
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0, flex: "1 1 200px" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Link href="/" aria-label={lang === "tr" ? "Ana sayfaya dön" : "Go to home page"}>
                  <Image src="/logo.png" alt="NextGenLAB NASA Space Bioscience Explorer Logo" width={52} height={52} priority className="glow pulse-slow" />
                </Link>
                <div style={{ position: "absolute", inset: -8, background: "radial-gradient(circle, rgba(167, 139, 250, 0.4), transparent)", filter: "blur(12px)", zIndex: -1 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <Link href="/" style={{ textDecoration: "none" }}>
                  <div className="text-gradient" style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                    NextGenLAB
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500, whiteSpace: "nowrap" }}>SPACE BIOSCIENCE EXPLORER</div>
                </Link>
              </div>
            </div>
              
            <nav style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }} role="navigation" aria-label={lang === "tr" ? "Ana navigasyon" : "Main navigation"}>
              {navigationLinks.map((link) => (
                <Link key={link.href} href={link.href} className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }} aria-label={link.label}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", minWidth: 0 }}>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as "tr" | "en")} 
                style={{ fontSize: 13, fontWeight: 500, minWidth: 60 }}
                aria-label={lang === "tr" ? "Dil seçimi" : "Language selection"}
              >
                <option value="tr">🇹🇷</option>
                <option value="en">🇬🇧</option>
              </select>
                
              <select 
                value={persona} 
                onChange={(e) => setPersona(e.target.value as "scientist" | "manager" | "architect" | "")} 
                style={{ fontSize: 13, fontWeight: 500, minWidth: 80 }}
                aria-label={lang === "tr" ? "Kişilik seçimi" : "Persona selection"}
              >
                <option value="">{lang === "tr" ? "Kişilik" : "Persona"}</option>
                <option value="scientist">{lang === "tr" ? "Bilim İnsanı" : "Scientist"}</option>
                <option value="manager">{lang === "tr" ? "Yönetici" : "Manager"}</option>
                <option value="architect">{lang === "tr" ? "Mimar" : "Architect"}</option>
              </select>
                
              <select 
                value={sectionPriority} 
                onChange={(e) => setSectionPriority(e.target.value as "results" | "discussion" | "conclusion" | "")} 
                style={{ fontSize: 13, fontWeight: 500, minWidth: 80 }}
                aria-label={lang === "tr" ? "Bölüm önceliği" : "Section priority"}
              >
                <option value="">{lang === "tr" ? "Bölüm" : "Section"}</option>
                <option value="results">{lang === "tr" ? "Sonuçlar" : "Results"}</option>
                <option value="discussion">{lang === "tr" ? "Tartışma" : "Discussion"}</option>
                <option value="conclusion">{lang === "tr" ? "Sonuç" : "Conclusion"}</option>
              </select>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
