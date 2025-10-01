"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import ErrorBoundary from "../../components/ErrorBoundary";
import { AnalyticsCardSkeleton } from "../../components/LoadingSkeleton";

type ResearchTrend = {
  year: string;
  publications: number;
  focus_areas: string[];
};

type GapAnalysis = {
  area: string;
  gap_score: number;
  opportunities: string[];
  priority: "high" | "medium" | "low";
};

type ConsensusData = {
  topic: string;
  consensus_level: number;
  conflicting_findings: string[];
  established_facts: string[];
};

export default function ScientistDashboard() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [persona, setPersona] = useState<"scientist" | "manager" | "architect" | "">("scientist");
  const [sectionPriority, setSectionPriority] = useState<"results" | "discussion" | "conclusion" | "">("results");
  const [activeTab, setActiveTab] = useState<'trends' | 'gaps' | 'consensus' | 'kg'>('trends');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    trends: ResearchTrend[];
    gaps: GapAnalysis[];
    consensus: ConsensusData[];
  }>({
    trends: [],
    gaps: [],
    consensus: []
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setData({
        trends: [
          { year: "2020", publications: 45, focus_areas: ["microgravity", "radiation", "bone_loss"] },
          { year: "2021", publications: 52, focus_areas: ["plant_growth", "immune_system", "metabolism"] },
          { year: "2022", publications: 48, focus_areas: ["artificial_gravity", "closed_loop", "crew_health"] },
          { year: "2023", publications: 61, focus_areas: ["mars_preparation", "biotechnology", "life_support"] },
          { year: "2024", publications: 38, focus_areas: ["long_duration", "space_medicine", "habitat_design"] }
        ],
        gaps: [
          { 
            area: "Long-term microgravity effects on cellular aging", 
            gap_score: 0.85, 
            opportunities: ["Telomere length studies", "Senescence markers", "Epigenetic changes"],
            priority: "high"
          },
          { 
            area: "Space radiation impact on microbiome diversity", 
            gap_score: 0.72, 
            opportunities: ["Gut microbiome analysis", "Probiotic effectiveness", "Immune-microbiome interactions"],
            priority: "high"
          },
          { 
            area: "Artificial gravity optimization protocols", 
            gap_score: 0.68, 
            opportunities: ["Gravity dose-response", "Intermittent gravity", "Individual variations"],
            priority: "medium"
          }
        ],
        consensus: [
          {
            topic: "Microgravity causes bone density loss",
            consensus_level: 0.95,
            conflicting_findings: ["Rate of loss varies significantly between individuals"],
            established_facts: ["1-2% bone loss per month", "Weight-bearing exercise helps", "Calcium supplementation required"]
          },
          {
            topic: "Space radiation increases cancer risk",
            consensus_level: 0.88,
            conflicting_findings: ["Risk quantification models differ", "Individual susceptibility varies"],
            established_facts: ["Higher radiation exposure", "DNA damage occurs", "Protective measures needed"]
          }
        ]
      });
      setLoading(false);
    }, 1500);
  }, []);

  const tabs = [
    { id: 'trends', label: lang === 'tr' ? '📈 Araştırma Trendleri' : '📈 Research Trends', icon: '📈' },
    { id: 'gaps', label: lang === 'tr' ? '🔍 Araştırma Boşlukları' : '🔍 Research Gaps', icon: '🔍' },
    { id: 'consensus', label: lang === 'tr' ? '🤝 Bilimsel Konsensüs' : '🤝 Scientific Consensus', icon: '🤝' },
    { id: 'kg', label: lang === 'tr' ? '🕸️ Bilgi Grafiği' : '🕸️ Knowledge Graph', icon: '🕸️' }
  ];

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
        {/* Page Title */}
        <div className="glass-card" style={{ padding: "32px 24px", marginBottom: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 900, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
            🧬 {lang === "tr" ? "Bilim İnsanı Dashboard" : "Scientist Dashboard"}
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", margin: 0 }}>
            {lang === "tr" ? "Araştırma trendleri, boşluklar ve bilimsel konsensüs analizi" : "Research trends, gaps, and scientific consensus analysis"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'trends' | 'gaps' | 'consensus' | 'kg')}
                className={`btn-secondary ${activeTab === tab.id ? 'active' : ''}`}
                style={{ 
                  fontSize: 14, 
                  padding: "12px 20px", 
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <ErrorBoundary>
          {/* Content Area */}
          {loading ? (
            <div style={{ display: "grid", gap: 24 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <AnalyticsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Research Trends Tab */}
              {activeTab === 'trends' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    📈 {lang === 'tr' ? 'Yıllık Araştırma Trendleri' : 'Annual Research Trends'}
                  </h2>
                  <div style={{ display: "grid", gap: 16 }}>
                    {data.trends.map((trend, index) => (
                      <div key={index} style={{ 
                        padding: 20, 
                        background: "rgba(167, 139, 250, 0.1)", 
                        borderRadius: 12, 
                        border: "1px solid rgba(167, 139, 250, 0.2)" 
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{trend.year}</h3>
                          <div className="badge" style={{ background: "linear-gradient(135deg, var(--nebula-purple), var(--nebula-blue))" }}>
                            {trend.publications} {lang === 'tr' ? 'yayın' : 'publications'}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {trend.focus_areas.map((area, i) => (
                            <span key={i} style={{ 
                              padding: "4px 12px", 
                              background: "rgba(96, 165, 250, 0.2)", 
                              borderRadius: 16, 
                              fontSize: 12, 
                              color: "var(--nebula-blue)" 
                            }}>
                              {area.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Gaps Tab */}
              {activeTab === 'gaps' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    🔍 {lang === 'tr' ? 'Araştırma Boşlukları ve Fırsatlar' : 'Research Gaps and Opportunities'}
                  </h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    {data.gaps.map((gap, index) => (
                      <div key={index} style={{ 
                        padding: 24, 
                        background: "rgba(15, 8, 36, 0.5)", 
                        borderRadius: 12, 
                        border: "1px solid rgba(167, 139, 250, 0.2)" 
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
                            {gap.area}
                          </h3>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div className="badge" style={{ 
                              background: gap.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : 
                                         gap.priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                              color: gap.priority === 'high' ? '#ef4444' : 
                                     gap.priority === 'medium' ? '#f59e0b' : '#22c55e'
                            }}>
                              {(gap.gap_score * 100).toFixed(0)}% {lang === 'tr' ? 'boşluk' : 'gap'}
            </div>
                            <div className="badge" style={{ 
                              background: gap.priority === 'high' ? 'rgba(239, 68, 68, 0.3)' : 
                                         gap.priority === 'medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'
                            }}>
                              {gap.priority.toUpperCase()}
      </div>
    </div>
                    </div>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                            {lang === 'tr' ? 'Araştırma Fırsatları:' : 'Research Opportunities:'}
                          </h4>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {gap.opportunities.map((opp, i) => (
                              <span key={i} style={{ 
                                padding: "6px 12px", 
                                background: "rgba(167, 139, 250, 0.2)", 
                                borderRadius: 8, 
                                fontSize: 13, 
                                color: "var(--nebula-purple)" 
                              }}>
                                {opp}
                              </span>
                            ))}
                    </div>
                      </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scientific Consensus Tab */}
              {activeTab === 'consensus' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    🤝 {lang === 'tr' ? 'Bilimsel Konsensüs Analizi' : 'Scientific Consensus Analysis'}
                  </h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    {data.consensus.map((item, index) => (
                      <div key={index} style={{ 
                        padding: 24, 
                        background: "rgba(15, 8, 36, 0.5)", 
                        borderRadius: 12, 
                        border: "1px solid rgba(167, 139, 250, 0.2)" 
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
                            {item.topic}
                          </h3>
                          <div className="badge" style={{ 
                            background: item.consensus_level > 0.8 ? 'rgba(34, 197, 94, 0.2)' : 
                                       item.consensus_level > 0.6 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: item.consensus_level > 0.8 ? '#22c55e' : 
                                   item.consensus_level > 0.6 ? '#f59e0b' : '#ef4444'
                          }}>
                            {(item.consensus_level * 100).toFixed(0)}% {lang === 'tr' ? 'konsensüs' : 'consensus'}
              </div>
            </div>

                        <div style={{ display: "grid", gap: 16 }}>
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--nebula-green)", marginBottom: 8 }}>
                              ✅ {lang === 'tr' ? 'Kabul Edilen Gerçekler:' : 'Established Facts:'}
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {item.established_facts.map((fact, i) => (
                                <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                                  {fact}
                    </li>
                  ))}
                </ul>
              </div>

                          {item.conflicting_findings.length > 0 && (
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--nebula-orange)", marginBottom: 8 }}>
                                ⚠️ {lang === 'tr' ? 'Çelişkili Bulgular:' : 'Conflicting Findings:'}
                              </h4>
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {item.conflicting_findings.map((conflict, i) => (
                                  <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                                    {conflict}
                    </li>
                  ))}
                </ul>
              </div>
        )}
      </div>
    </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Knowledge Graph Tab */}
              {activeTab === 'kg' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    🕸️ {lang === 'tr' ? 'İnteraktif Bilgi Grafiği' : 'Interactive Knowledge Graph'}
                  </h2>
                  <div style={{ 
                    height: "500px", 
                    background: "rgba(15, 8, 36, 0.3)", 
                    borderRadius: 12, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    border: "2px dashed rgba(167, 139, 250, 0.3)"
                  }}>
                    <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🕸️</div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                        {lang === 'tr' ? 'Bilgi Grafiği Yükleniyor...' : 'Loading Knowledge Graph...'}
                </div>
                      <div style={{ fontSize: 14 }}>
                        {lang === 'tr' ? '3,107 düğüm ve 40,967 bağlantı' : '3,107 nodes and 40,967 connections'}
        </div>
      </div>
    </div>
        </div>
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 80, padding: "32px 0", borderTop: "1px solid rgba(167, 139, 250, 0.2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
            <Image src="/logo.png" alt="NextGenLAB Logo" width={28} height={28} className="glow" />
            <span className="text-gradient" style={{ fontWeight: 700, fontSize: 16 }}>NextGenLAB Space Bioscience Explorer</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ opacity: 0.8 }}>🧬 Scientist Dashboard</span> <span style={{ color: "var(--nebula-purple)", fontWeight: 600 }}>Research Analysis</span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Research Trends • Gap Analysis • Scientific Consensus • Knowledge Graph</div>
        </div>
      </footer>
    </>
  );
}
