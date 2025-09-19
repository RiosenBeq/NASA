"use client";
import Image from "next/image";
import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B0E2C 0%, #1B1270 60%, #4C3FE1 100%)", color: "#EAF2FF" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, backdropFilter: "saturate(120%) blur(6px)", background: "rgba(11,14,44,0.45)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <div style={{ fontWeight: 900, letterSpacing: 0.3, fontSize: 18 }}>NextGenLAB • Guidelines</div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Home</Link>
            <Link href="/resources" style={{ color: "#EAF2FF", textDecoration: "none", fontSize: 14 }}>Resources</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 20 }}>
          <h1 style={{ marginTop: 0, fontSize: 22, fontWeight: 900 }}>Guidelines</h1>
          <p style={{ opacity: 0.9 }}>
            – Amaç: 608 NASA biyobilim yayınının etkilerini ve sonuçlarını özetleyen, araştırma ilerlemesini gösteren, boşlukları belirleyen etkileşimli bir gösterge paneli sağlamak.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Persona: Scientists (hipotez üretimi), Managers (yatırım fırsatları), Mission Architects (güvenli/etkili keşif).</li>
            <li>Bölüm önceliği: Results &gt; Discussion &gt; Conclusion (ayarlanabilir).</li>
            <li>Arama: Başlık+Abstract semantik; filtreler (yıl/organizma/platform).</li>
            <li>Özet: Kaynaklı, izlenebilir, kart içi tek tıkla.</li>
            <li>Keşif: Trend ve organizma×platform ısı haritası (yakında).</li>
          </ul>
        </div>
      </main>
    </div>
  );
}


