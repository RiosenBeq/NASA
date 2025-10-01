"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import ErrorBoundary from "../../components/ErrorBoundary";
import { AnalyticsCardSkeleton } from "../../components/LoadingSkeleton";

type InvestmentOpportunity = {
  area: string;
  roi_potential: number;
  funding_required: string;
  timeline: string;
  risk_level: "low" | "medium" | "high";
  nasa_priority: "critical" | "high" | "medium" | "low";
};

type TechnologyReadiness = {
  technology: string;
  current_trl: number;
  target_trl: number;
  development_time: string;
  investment_needed: string;
};

type BudgetAllocation = {
  category: string;
  current_allocation: number;
  recommended_allocation: number;
  impact_score: number;
};

export default function ManagerDashboard() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [persona, setPersona] = useState<"scientist" | "manager" | "architect" | "">("manager");
  const [sectionPriority, setSectionPriority] = useState<"results" | "discussion" | "conclusion" | "">("results");
  const [activeTab, setActiveTab] = useState<'investments' | 'trl' | 'budget' | 'portfolio'>('investments');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    investments: InvestmentOpportunity[];
    trl: TechnologyReadiness[];
    budget: BudgetAllocation[];
  }>({
    investments: [],
    trl: [],
    budget: []
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setData({
        investments: [
          {
            area: "Advanced Life Support Systems",
            roi_potential: 0.85,
            funding_required: "$50M - $100M",
            timeline: "3-5 years",
            risk_level: "medium",
            nasa_priority: "critical"
          },
          {
            area: "Space Agriculture Technology",
            roi_potential: 0.72,
            funding_required: "$20M - $40M",
            timeline: "2-4 years",
            risk_level: "low",
            nasa_priority: "high"
          },
          {
            area: "Artificial Gravity Systems",
            roi_potential: 0.68,
            funding_required: "$100M - $200M",
            timeline: "5-7 years",
            risk_level: "high",
            nasa_priority: "medium"
          }
        ],
        trl: [
          {
            technology: "Closed-Loop Life Support",
            current_trl: 6,
            target_trl: 9,
            development_time: "4-6 years",
            investment_needed: "$80M"
          },
          {
            technology: "Space Plant Growth Systems",
            current_trl: 7,
            target_trl: 9,
            development_time: "2-3 years",
            investment_needed: "$30M"
          },
          {
            technology: "Radiation Protection Materials",
            current_trl: 5,
            target_trl: 8,
            development_time: "5-7 years",
            investment_needed: "$120M"
          }
        ],
        budget: [
          {
            category: "Life Support Systems",
            current_allocation: 25,
            recommended_allocation: 35,
            impact_score: 0.9
          },
          {
            category: "Space Medicine",
            current_allocation: 20,
            recommended_allocation: 25,
            impact_score: 0.8
          },
          {
            category: "Plant Biology",
            current_allocation: 15,
            recommended_allocation: 20,
            impact_score: 0.7
          },
          {
            category: "Radiation Biology",
            current_allocation: 18,
            recommended_allocation: 15,
            impact_score: 0.6
          }
        ]
      });
      setLoading(false);
    }, 1500);
  }, []);

  const tabs = [
    { id: 'investments', label: lang === 'tr' ? '💰 Yatırım Fırsatları' : '💰 Investment Opportunities', icon: '💰' },
    { id: 'trl', label: lang === 'tr' ? '🚀 Teknoloji Hazırlık Seviyesi' : '🚀 Technology Readiness', icon: '🚀' },
    { id: 'budget', label: lang === 'tr' ? '📊 Bütçe Optimizasyonu' : '📊 Budget Optimization', icon: '📊' },
    { id: 'portfolio', label: lang === 'tr' ? '📈 Portföy Analizi' : '📈 Portfolio Analysis', icon: '📈' }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' };
      case 'high': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
      default: return { bg: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return { bg: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' };
      case 'high': return { bg: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' };
      case 'medium': return { bg: 'rgba(96, 165, 250, 0.3)', color: '#60a5fa' };
      case 'low': return { bg: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' };
      default: return { bg: 'rgba(96, 165, 250, 0.3)', color: '#60a5fa' };
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
            💼 {lang === "tr" ? "Yönetici Dashboard" : "Manager Dashboard"}
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", margin: 0 }}>
            {lang === "tr" ? "Yatırım fırsatları, teknoloji hazırlık seviyesi ve bütçe optimizasyonu" : "Investment opportunities, technology readiness, and budget optimization"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'investments' | 'trl' | 'budget' | 'portfolio')}
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
              {/* Investment Opportunities Tab */}
              {activeTab === 'investments' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    💰 {lang === 'tr' ? 'Yatırım Fırsatları ve ROI Analizi' : 'Investment Opportunities and ROI Analysis'}
                  </h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    {data.investments.map((investment, index) => {
                      const riskColors = getRiskColor(investment.risk_level);
                      const priorityColors = getPriorityColor(investment.nasa_priority);
                      
                      return (
                        <div key={index} style={{ 
                          padding: 24, 
                          background: "rgba(15, 8, 36, 0.5)", 
                          borderRadius: 12, 
                          border: "1px solid rgba(167, 139, 250, 0.2)" 
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
                              {investment.area}
                            </h3>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <div className="badge" style={{ 
                                background: `linear-gradient(135deg, rgba(34, 197, 94, ${investment.roi_potential}), rgba(96, 165, 250, ${investment.roi_potential * 0.7}))`
                              }}>
                                {(investment.roi_potential * 100).toFixed(0)}% ROI
                              </div>
                              <div className="badge" style={{ background: riskColors.bg, color: riskColors.color }}>
                                {investment.risk_level.toUpperCase()}
                              </div>
                              <div className="badge" style={{ background: priorityColors.bg, color: priorityColors.color }}>
                                {investment.nasa_priority.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                                💵 {lang === 'tr' ? 'Gerekli Fon:' : 'Funding Required:'}
                              </h4>
                              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nebula-purple)" }}>
                                {investment.funding_required}
                              </div>
                            </div>
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                                ⏱️ {lang === 'tr' ? 'Zaman Çizelgesi:' : 'Timeline:'}
                              </h4>
                              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nebula-blue)" }}>
                                {investment.timeline}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technology Readiness Tab */}
              {activeTab === 'trl' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    🚀 {lang === 'tr' ? 'Teknoloji Hazırlık Seviyesi (TRL) Analizi' : 'Technology Readiness Level (TRL) Analysis'}
                  </h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    {data.trl.map((tech, index) => (
                      <div key={index} style={{ 
                        padding: 24, 
                        background: "rgba(15, 8, 36, 0.5)", 
                        borderRadius: 12, 
                        border: "1px solid rgba(167, 139, 250, 0.2)" 
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
                            {tech.technology}
                          </h3>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div className="badge" style={{ background: "rgba(167, 139, 250, 0.2)", color: "var(--nebula-purple)" }}>
                              TRL {tech.current_trl} → {tech.target_trl}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                              {lang === 'tr' ? 'Mevcut Seviye:' : 'Current Level:'}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                              TRL {tech.current_trl}
                            </span>
                          </div>
                          <div style={{ 
                            width: "100%", 
                            height: 8, 
                            background: "rgba(96, 165, 250, 0.2)", 
                            borderRadius: 4,
                            overflow: "hidden"
                          }}>
                            <div style={{ 
                              width: `${(tech.current_trl / 9) * 100}%`, 
                              height: "100%", 
                              background: "linear-gradient(90deg, var(--nebula-blue), var(--nebula-purple))",
                              borderRadius: 4
                            }} />
                          </div>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                              💰 {lang === 'tr' ? 'Gerekli Yatırım:' : 'Investment Needed:'}
                            </h4>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nebula-purple)" }}>
                              {tech.investment_needed}
                            </div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                              ⏱️ {lang === 'tr' ? 'Geliştirme Süresi:' : 'Development Time:'}
                            </h4>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nebula-blue)" }}>
                              {tech.development_time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Optimization Tab */}
              {activeTab === 'budget' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    📊 {lang === 'tr' ? 'Bütçe Optimizasyonu ve Etki Analizi' : 'Budget Optimization and Impact Analysis'}
                  </h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    {data.budget.map((item, index) => {
                      const allocationDiff = item.recommended_allocation - item.current_allocation;
                      const isIncrease = allocationDiff > 0;
                      
                      return (
                        <div key={index} style={{ 
                          padding: 24, 
                          background: "rgba(15, 8, 36, 0.5)", 
                          borderRadius: 12, 
                          border: "1px solid rgba(167, 139, 250, 0.2)" 
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
                              {item.category}
                            </h3>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <div className="badge" style={{ 
                                background: `linear-gradient(135deg, rgba(34, 197, 94, ${item.impact_score}), rgba(96, 165, 250, ${item.impact_score * 0.7}))`
                              }}>
                                {(item.impact_score * 100).toFixed(0)}% {lang === 'tr' ? 'Etki' : 'Impact'}
                              </div>
                              <div className="badge" style={{ 
                                background: isIncrease ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: isIncrease ? '#22c55e' : '#ef4444'
                              }}>
                                {isIncrease ? '+' : ''}{allocationDiff}%
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                                📈 {lang === 'tr' ? 'Mevcut Bütçe:' : 'Current Allocation:'}
                              </h4>
                              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                                {item.current_allocation}%
                              </div>
                            </div>
                            <div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                                🎯 {lang === 'tr' ? 'Önerilen Bütçe:' : 'Recommended Allocation:'}
                              </h4>
                              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--nebula-purple)" }}>
                                {item.recommended_allocation}%
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ marginTop: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                                {lang === 'tr' ? 'Bütçe Dağılımı:' : 'Budget Distribution:'}
                              </span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                {item.current_allocation}% → {item.recommended_allocation}%
                              </span>
                            </div>
                            <div style={{ 
                              width: "100%", 
                              height: 8, 
                              background: "rgba(96, 165, 250, 0.2)", 
                              borderRadius: 4,
                              overflow: "hidden"
                            }}>
                              <div style={{ 
                                width: `${item.current_allocation}%`, 
                                height: "100%", 
                                background: "linear-gradient(90deg, var(--nebula-blue), var(--nebula-purple))",
                                borderRadius: 4
                              }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Portfolio Analysis Tab */}
              {activeTab === 'portfolio' && (
                <div className="glass-card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>
                    📈 {lang === 'tr' ? 'Portföy Analizi ve Stratejik Öneriler' : 'Portfolio Analysis and Strategic Recommendations'}
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
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                        {lang === 'tr' ? 'Portföy Analizi Yükleniyor...' : 'Loading Portfolio Analysis...'}
                      </div>
                      <div style={{ fontSize: 14 }}>
                        {lang === 'tr' ? 'ROI analizi ve risk değerlendirmesi' : 'ROI analysis and risk assessment'}
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
            <span style={{ opacity: 0.8 }}>💼 Manager Dashboard</span> <span style={{ color: "var(--nebula-purple)", fontWeight: 600 }}>Investment Analysis</span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Investment Opportunities • TRL Analysis • Budget Optimization • Portfolio Management</div>
        </div>
      </footer>
    </>
  );
}
