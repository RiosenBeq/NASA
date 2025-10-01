"use client";
import { useState } from "react";
import Image from "next/image";
import Header from "../../components/Header";

export default function GuidelinesPage() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [persona, setPersona] = useState<"scientist" | "manager" | "architect" | "">("");
  const [sectionPriority, setSectionPriority] = useState<"results" | "discussion" | "conclusion" | "">("");
  return (
    <>
      <Header 
        lang={lang} 
        setLang={setLang} 
        persona={persona} 
        setPersona={setPersona} 
        sectionPriority={sectionPriority} 
        setSectionPriority={setSectionPriority} 
      />

        <main style={{ maxWidth: 1200, margin: "32px auto", padding: "0 24px" }}>
          {/* Hero */}
          <div className="glass-card" style={{ padding: 48, marginBottom: 32, textAlign: "center" }}>
            <h1 className="text-gradient" style={{ fontSize: 42, fontWeight: 900, marginTop: 0, marginBottom: 16, lineHeight: 1.2 }}>
              🚀 {lang === "tr" ? "Platform Kullanım Kılavuzu" : "Platform Usage Guidelines"}
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 800, margin: "0 auto", lineHeight: 1.7 }}>
              {lang === "tr" 
                ? "NASA Space Bioscience Explorer platformunu nasıl etkili kullanacağınızı öğrenin. 608 yayın üzerinde semantik arama, yapay zeka destekli özetler ve bilgi grafiği görselleştirmesi."
                : "Learn how to effectively use the NASA Space Bioscience Explorer platform. Semantic search over 608 publications, AI-powered summaries, and knowledge graph visualization."
              }
            </p>
          </div>

          {/* Purpose */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 16, color: "var(--text-primary)" }}>
              🎯 Platform Amacı
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)", margin: 0 }}>
              Bu platform, <strong style={{ color: "var(--nebula-purple)" }}>608 NASA biyobilim yayınının</strong> etkilerini ve 
              sonuçlarını özetleyen, araştırma ilerlemesini gösteren ve bilgi boşluklarını belirleyen interaktif bir gösterge panelidir. 
              Araştırmacıların hipotez oluşturmasına, yöneticilerin yatırım fırsatlarını değerlendirmesine ve misyon mimarlarının 
              güvenli ve etkili keşif stratejileri geliştirmesine yardımcı olur.
            </p>
          </div>

          {/* Personas */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 24, color: "var(--text-primary)" }}>
              👥 Kullanıcı Profilleri
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              <div className="badge" style={{ flexDirection: "column", padding: 20, alignItems: "start", minHeight: 140 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔬</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Scientist</div>
                <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                  Hipotez üretimi, araştırma soruları geliştirme, literatür taraması
                </div>
              </div>
              
              <div className="badge" style={{ flexDirection: "column", padding: 20, alignItems: "start", minHeight: 140 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💼</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Manager</div>
                <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                  Yatırım fırsatları değerlendirme, araştırma trendleri analizi
                </div>
              </div>
              
              <div className="badge" style={{ flexDirection: "column", padding: 20, alignItems: "start", minHeight: 140 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏗️</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Mission Architect</div>
                <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                  Güvenli ve etkili keşif stratejileri, misyon planlama
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 24, color: "var(--text-primary)" }}>
              ✨ Özellikler
            </h2>
            
            <div style={{ display: "grid", gap: 20 }}>
              <div className="result-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, color: "var(--nebula-purple)" }}>
                  🔍 Semantik Arama
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  Doğal dil kullanarak başlık ve abstract üzerinde arama yapın:
                </p>
                <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8, fontSize: 14, color: "var(--text-secondary)" }}>
                  <li><strong>Örnek:</strong> &ldquo;microgravity plant root growth&rdquo;</li>
                  <li><strong>Filtreler:</strong> Yıl, organizma (Plant/Rodent/Human), platform (ISS/Shuttle)</li>
                  <li><strong>Sonuçlar:</strong> Relevans skoru ile sıralanır (%0-100)</li>
                </ul>
              </div>

              <div className="result-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, color: "var(--nebula-blue)" }}>
                  ✨ AI Destekli Özetler
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  Her makale için tek tıkla GPT-4o-mini ile özet oluşturun:
                </p>
                <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8, fontSize: 14, color: "var(--text-secondary)" }}>
                  <li><strong>Kaynaklı:</strong> Tüm özetler kaynak referanslarıyla</li>
                  <li><strong>İzlenebilir:</strong> Doğrudan PMC linklerine erişim</li>
                  <li><strong>Kişiselleştirilmiş:</strong> Persona ve bölüm önceliğine göre</li>
                  <li><strong>Soru-Cevap:</strong> Makale hakkında soru sorun</li>
                </ul>
              </div>

              <div className="result-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, color: "var(--nebula-cyan)" }}>
                  📊 Bilgi Grafiği
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 12 }}>
                  Scientist Dashboard&apos;da interaktif bilgi grafiği:
                </p>
                <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8, fontSize: 14, color: "var(--text-secondary)" }}>
                  <li><strong>3,107 düğüm:</strong> Araştırma varlıkları</li>
                  <li><strong>40,967 bağlantı:</strong> İlişkiler ve etkileşimler</li>
                  <li><strong>Görselleştirme:</strong> Cytoscape.js ile dinamik</li>
                  <li><strong>Analiz:</strong> Düğüm tipleri, edge ilişkileri, zaman çizelgesi</li>
          </ul>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 0, marginBottom: 24, color: "var(--text-primary)" }}>
              📖 Nasıl Kullanılır?
            </h2>
            
            <div style={{ display: "grid", gap: 16 }}>
              {[
                {
                  step: "1",
                  title: "Arama Yapın",
                  desc: "Ana sayfada doğal dil kullanarak arama yapın. Örn: &lsquo;microgravity bone loss&rsquo;",
                  icon: "🔍"
                },
                {
                  step: "2",
                  title: "Filtreleri Kullanın",
                  desc: "Yıl, organizma veya platform filtrelerini uygulayarak sonuçları daraltın",
                  icon: "🎯"
                },
                {
                  step: "3",
                  title: "Özet Oluşturun",
                  desc: "&lsquo;Özetle&rsquo; butonuna tıklayarak AI destekli özet alın. Persona seçin (opsiyonel)",
                  icon: "✨"
                },
                {
                  step: "4",
                  title: "Soru Sorun",
                  desc: "Makale hakkında spesifik sorular sorun, AI yanıt versin",
                  icon: "💬"
                },
                {
                  step: "5",
                  title: "Kaynakları İnceleyin",
                  desc: "PMC Source, OSDR, NSLSL linklerini kullanarak detaylı bilgiye ulaşın",
                  icon: "📚"
                },
                {
                  step: "6",
                  title: "Analytics&apos;i Keşfedin",
                  desc: "Analytics sayfasında istatistikleri, grafikleri ve trendleri görün",
                  icon: "📊"
                }
              ].map((item) => (
                <div key={item.step} className="badge" style={{ padding: 20, alignItems: "start", gap: 16 }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                      Adım {item.step}: {item.title}
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
              💡 İpuçları
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                "Arama yaparken spesifik bilimsel terimler kullanın",
                "Relevans skoruna göre en alakalı sonuçlara odaklanın",
                "Persona seçerek ihtiyacınıza özel özetler alın",
                "Section Priority ile önemli bölümleri vurgulayın",
                "Analytics&apos;te trend analizi yaparak araştırma boşluklarını keşfedin",
                "Knowledge Graph&apos;te düğümlere tıklayarak ilişkileri görün"
              ].map((tip, i) => (
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
            <div style={{ fontSize: 13, opacity: 0.7 }}>Need help? Check Resources or contact support</div>
          </div>
        </footer>
    </>
  );
}
