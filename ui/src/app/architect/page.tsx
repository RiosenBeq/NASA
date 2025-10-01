"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import ErrorBoundary from "../../components/ErrorBoundary";
import { AnalyticsCardSkeleton } from "../../components/LoadingSkeleton";

type RiskAssessment = {
  risk_category: string;
  risk_level: "low" | "medium" | "high" | "critical";
  probability: number;
  impact: number;
  mitigation_strategies: string[];
  monitoring_requirements: string[];
};

type OperationalImplication = {
  system: string;
  mission_phase: string;
  constraint_type: string;
  severity: "minor" | "moderate" | "major" | "critical";
  solutions: string[];
  timeline_impact: string;
};

type PlatformSuitability = {
  platform: string;
  suitability_score: number;
  strengths: string[];
  limitations: string[];
  recommendations: string[];
};

export default function ArchitectDashboard() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [persona, setPersona] = useState<"scientist" | "manager" | "architect" | "">("architect");
  const [sectionPriority, setSectionPriority] = useState<"results" | "discussion" | "conclusion" | "">("results");
  const [activeTab, setActiveTab] = useState<'risks' | 'operations' | 'platforms' | 'timeline'>('risks');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    risks: RiskAssessment[];
    operations: OperationalImplication[];
    platforms: PlatformSuitability[];
  }>({
    risks: [],
    operations: [],
    platforms: []
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setData({
        risks: [
          {
            risk_category: "Crew Health Degradation",
            risk_level: "high",
            probability: 0.75,
            impact: 0.85,
            mitigation_strategies: [
              "Advanced exercise protocols",
              "Nutritional supplementation",
              "Medical monitoring systems"
            ],
            monitoring_requirements: [
              "Daily health assessments",
              "Biomarker tracking",
              "Psychological evaluations"
            ]
          },
          {
            risk_category: "Life Support System Failure",
            risk_level: "critical",
            probability: 0.25,
            impact: 0.95,
            mitigation_strategies: [
              "Redundant backup systems",
              "Automated failover mechanisms",
              "Emergency protocols"
            ],
            monitoring_requirements: [
              "Continuous system monitoring",
              "Real-time alerts",
              "Regular maintenance schedules"
            ]
          },
          {
            risk_category: "Radiation Exposure",
            risk_level: "medium",
            probability: 0.60,
            impact: 0.70,
            mitigation_strategies: [
              "Shielding materials",
              "Radiation monitoring",
              "Shelter protocols"
            ],
            monitoring_requirements: [
              "Radiation dosimetry",
              "Environmental monitoring",
              "Crew exposure tracking"
            ]
          }
        ],
        operations: [
          {
            system: "Plant Growth Systems",
            mission_phase: "Transit",
            constraint_type: "Mass Limitations",
            severity: "moderate",
            solutions: [
              "Compact hydroponic systems",
              "Seed-based cultivation",
              "Modular growth chambers"
            ],
            timeline_impact: "2-3 months delay"
          },
          {
            system: "Waste Management",
            mission_phase: "Surface Operations",
            constraint_type: "Volume Constraints",
            severity: "major",
            solutions: [
              "Compact recycling systems",
              "Waste-to-energy conversion",
              "Automated processing"
            ],
            timeline_impact: "4-6 months delay"
          },
          {
            system: "Medical Equipment",
            mission_phase: "All Phases",
            constraint_type: "Power Requirements",
            severity: "critical",
            solutions: [
              "Low-power diagnostic tools",
              "Solar-powered systems",
              "Backup power sources"
            ],
            timeline_impact: "6-12 months delay"
          }
        ],
        platforms: [
          {
            platform: "International Space Station (ISS)",
            suitability_score: 0.85,
            strengths: [
              "Proven microgravity environment",
              "Existing infrastructure",
              "International collaboration"
            ],
            limitations: [
              "Limited crew capacity",
              "Aging systems",
              "Orbital constraints"
            ],
            recommendations: [
              "Upgrade life support systems",
              "Expand research capabilities",
              "Enhance crew quarters"
            ]
          },
          {
            platform: "Lunar Gateway",
            suitability_score: 0.72,
            strengths: [
              "Deep space environment",
              "Gateway to Mars",
              "Modern design"
            ],
            limitations: [
              "Limited space",
              "High radiation",
              "Complex logistics"
            ],
            recommendations: [
              "Radiation shielding",
              "Compact systems",
              "Autonomous operations"
            ]
          },
          {
            platform: "Mars Surface Habitat",
            suitability_score: 0.68,
            strengths: [
              "Planetary environment",
              "Long-duration testing",
              "ISRU capabilities"
            ],
            limitations: [
              "Dust storms",
              "Communication delays",
              "Resource limitations"
            ],
            recommendations: [
              "Dust protection systems",
              "Redundant communications",
              "Resource recycling"
            ]
          }
        ]
      });
      setLoading(false);
    }, 1500);
  }, []);

  const tabs = [
    { id: 'risks', label: lang === 'tr' ? '⚠️ Risk Değerlendirmesi' : '⚠️ Risk Assessment', icon: '⚠️' },
    { id: 'operations', label: lang === 'tr' ? '🔧 Operasyonel Etkiler' : '🔧 Operational Implications', icon: '🔧' },
    { id: 'platforms', label: lang === 'tr' ? '🚀 Platform Uygunluğu' : '🚀 Platform Suitability', icon: '🚀' },
    { id: 'timeline', label: lang === 'tr' ? '📅 Görev Zaman Çizelgesi' : '📅 Mission Timeline', icon: '📅' }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' };
      case 'high': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
      case 'critical': return { bg: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' };
      default: return { bg: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' };
      case 'moderate': return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' };
      case 'major': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
      case 'critical': return { bg: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' };
      default: return { bg: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' };
    }
  };

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
            🏗️ {lang === "tr" ? "Görev Mimarı Dashboard" : "Mission Architect Dashboard"}
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", margin: 0 }}>
            {lang === "tr" ? "Risk değerlendirmesi, operasyonel etkiler ve platform uygunluğu analizi" : "Risk assessment, operational implications, and platform suitability analysis"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'risks' | 'operations' | 'platforms' | 'timeline')}
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
              {/* Risk Assessment Tab */}
              {activeTab === 'risks' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    ⚠️ {lang === 'tr' ? 'Risk Değerlendirmesi ve Azaltma Stratejileri' : 'Risk Assessment and Mitigation Strategies'}
                  </h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    {data.risks.map((risk, index) => {
                      const riskColors = getRiskColor(risk.risk_level);
                      const riskScore = (risk.probability + risk.impact) / 2;
                      
                      return (
                        <div key={index} style={{ 
                          padding: 24, 
                          background: "rgba(15, 8, 36, 0.5)", 
                          borderRadius: 12, 
                          border: "1px solid rgba(167, 139, 250, 0.2)" 
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
                              {risk.risk_category}
                            </h3>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <div className="badge" style={{ 
                                background: `linear-gradient(135deg, rgba(239, 68, 68, ${riskScore}), rgba(245, 158, 11, ${riskScore * 0.7}))`
                              }}>
                                {(riskScore * 100).toFixed(0)}% {lang === 'tr' ? 'Risk' : 'Risk'}
                              </div>
                              <div className="badge" style={{ background: riskColors.bg, color: riskColors.color }}>
                                {risk.risk_level.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                                📊 {lang === 'tr' ? 'Olasılık:' : 'Probability:'}
                              </h4>
                              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nebula-purple)" }}>
                                {(risk.probability * 100).toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                                💥 {lang === 'tr' ? 'Etki:' : 'Impact:'}
                              </h4>
                              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nebula-blue)" }}>
                                {(risk.impact * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: "grid", gap: 16 }}>
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--nebula-green)", marginBottom: 8 }}>
                                🛡️ {lang === 'tr' ? 'Azaltma Stratejileri:' : 'Mitigation Strategies:'}
                              </h4>
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {risk.mitigation_strategies.map((strategy, i) => (
                                  <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                                    {strategy}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--nebula-blue)", marginBottom: 8 }}>
                                📋 {lang === 'tr' ? 'İzleme Gereksinimleri:' : 'Monitoring Requirements:'}
                              </h4>
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {risk.monitoring_requirements.map((requirement, i) => (
                                  <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                                    {requirement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Operational Implications Tab */}
              {activeTab === 'operations' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    🔧 {lang === 'tr' ? 'Operasyonel Etkiler ve Çözümler' : 'Operational Implications and Solutions'}
                  </h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    {data.operations.map((op, index) => {
                      const severityColors = getSeverityColor(op.severity);
                      
                      return (
                        <div key={index} style={{ 
                          padding: 24, 
                          background: "rgba(15, 8, 36, 0.5)", 
                          borderRadius: 12, 
                          border: "1px solid rgba(167, 139, 250, 0.2)" 
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
                              {op.system}
                            </h3>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <div className="badge" style={{ background: "rgba(167, 139, 250, 0.2)", color: "var(--nebula-purple)" }}>
                                {op.mission_phase}
                              </div>
                              <div className="badge" style={{ background: severityColors.bg, color: severityColors.color }}>
                                {op.severity.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: 16 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                              🚫 {lang === 'tr' ? 'Kısıtlama Türü:' : 'Constraint Type:'}
                            </h4>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                              {op.constraint_type}
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: 16 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                              ⏱️ {lang === 'tr' ? 'Zaman Çizelgesi Etkisi:' : 'Timeline Impact:'}
                            </h4>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nebula-orange)" }}>
                              {op.timeline_impact}
                            </div>
                          </div>
                          
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--nebula-green)", marginBottom: 8 }}>
                              💡 {lang === 'tr' ? 'Önerilen Çözümler:' : 'Proposed Solutions:'}
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {op.solutions.map((solution, i) => (
                                <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                                  {solution}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Platform Suitability Tab */}
              {activeTab === 'platforms' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    🚀 {lang === 'tr' ? 'Platform Uygunluğu ve Öneriler' : 'Platform Suitability and Recommendations'}
                  </h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    {data.platforms.map((platform, index) => (
                      <div key={index} style={{ 
                        padding: 24, 
                        background: "rgba(15, 8, 36, 0.5)", 
                        borderRadius: 12, 
                        border: "1px solid rgba(167, 139, 250, 0.2)" 
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
                            {platform.platform}
                          </h3>
                          <div className="badge" style={{ 
                            background: `linear-gradient(135deg, rgba(34, 197, 94, ${platform.suitability_score}), rgba(96, 165, 250, ${platform.suitability_score * 0.7}))`
                          }}>
                            {(platform.suitability_score * 100).toFixed(0)}% {lang === 'tr' ? 'Uygunluk' : 'Suitability'}
                          </div>
                        </div>
                        
                        <div style={{ display: "grid", gap: 16 }}>
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--nebula-green)", marginBottom: 8 }}>
                              ✅ {lang === 'tr' ? 'Güçlü Yönler:' : 'Strengths:'}
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {platform.strengths.map((strength, i) => (
                                <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--nebula-orange)", marginBottom: 8 }}>
                              ⚠️ {lang === 'tr' ? 'Sınırlamalar:' : 'Limitations:'}
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {platform.limitations.map((limitation, i) => (
                                <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                                  {limitation}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--nebula-blue)", marginBottom: 8 }}>
                              💡 {lang === 'tr' ? 'Öneriler:' : 'Recommendations:'}
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {platform.recommendations.map((recommendation, i) => (
                                <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                                  {recommendation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mission Timeline Tab */}
              {activeTab === 'timeline' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    📅 {lang === 'tr' ? 'Görev Zaman Çizelgesi ve Kritik Milestonelar' : 'Mission Timeline and Critical Milestones'}
                  </h2>
                  <div style={{ 
                    height: "400px", 
                    background: "rgba(15, 8, 36, 0.3)", 
                    borderRadius: 12, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    border: "2px dashed rgba(167, 139, 250, 0.3)"
                  }}>
                    <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                        {lang === 'tr' ? 'Görev Zaman Çizelgesi Yükleniyor...' : 'Loading Mission Timeline...'}
                      </div>
                      <div style={{ fontSize: 14 }}>
                        {lang === 'tr' ? 'Kritik milestonelar ve bağımlılıklar' : 'Critical milestones and dependencies'}
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
            <span style={{ opacity: 0.8 }}>🏗️ Mission Architect Dashboard</span> <span style={{ color: "var(--nebula-purple)", fontWeight: 600 }}>Risk & Operations</span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Risk Assessment • Operational Analysis • Platform Suitability • Mission Planning</div>
        </div>
      </footer>
    </>
  );
}
