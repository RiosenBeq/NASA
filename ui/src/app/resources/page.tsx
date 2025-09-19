"use client";
import Image from "next/image";
import Link from "next/link";

export default function ResourcesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B0E2C 0%, #1B1270 60%, #4C3FE1 100%)", color: "#EAF2FF" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, backdropFilter: "saturate(120%) blur(6px)", background: "rgba(11,14,44,0.45)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <div style={{ fontWeight: 900, letterSpacing: 0.3, fontSize: 18 }}>NextGenLAB • Resources</div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Home</Link>
            <Link href="/guidelines" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Guidelines</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 20 }}>
          <h1 style={{ marginTop: 0, fontSize: 22, fontWeight: 900 }}>Resources</h1>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            <li><a href="https://github.com/jgalazka/SB_publications/tree/main" target="_blank" rel="noreferrer" style={{ color: "#E7CFFF" }}>SB_publications</a> – 608 açık erişimli yayın listesi.</li>
            <li><a href="https://www.nasa.gov/osdr/" target="_blank" rel="noreferrer" style={{ color: "#E7CFFF" }}>OSDR</a> – Birincil veri ve metadata.</li>
            <li><a href="https://extapps.ksc.nasa.gov/NSLSL/Search" target="_blank" rel="noreferrer" style={{ color: "#E7CFFF" }}>NSLSL</a> – Ek literatür.</li>
            <li>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <a href="https://taskbook.nasaprs.com/tbp/welcome.cfm" target="_blank" rel="noreferrer" style={{ color: "#E7CFFF", fontWeight: 700 }}>Task Book</a>
                <div style={{ opacity: 0.9 }}>
                  The NASA Task Book is an online database of research projects supported by NASA’s Biological and Physical Sciences (BPS) Division and Human Research Program (HRP). Users can view project descriptions, annual progress, final reports, and bibliographical listings of publications resulting from NASA-funded studies in Space Biology, Physical Sciences, and Human Research. Visitors can also learn about the potential impact of these studies and the anticipated benefits that such research could offer to us on Earth.
                </div>
                <div>
                  <a href="https://taskbook.nasaprs.com/tbp/welcome.cfm" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#0B0E2C", background: "#E7CFFF", border: "none", padding: "8px 12px", borderRadius: 10, fontWeight: 800, textDecoration: "none" }}>Open Task Book</a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}


