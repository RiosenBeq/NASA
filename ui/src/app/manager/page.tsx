"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface InvestmentOpportunity {
  id: string;
  title: string;
  description: string;
  roi_score: number;
  risk_level: 'low' | 'medium' | 'high';
  funding_required: string;
  timeline: string;
  market_potential: number;
  nasa_priority: 'critical' | 'high' | 'medium' | 'low';
  related_publications: number;
}

interface FundingTrend {
  year: string;
  total_funding: number;
  publications_count: number;
  roi_trend: number;
}

interface TechnologyReadiness {
  technology: string;
  current_trl: number;
  target_trl: number;
  development_time: string;
  investment_needed: string;
  market_impact: 'high' | 'medium' | 'low';
}

export default function ManagerDashboard() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [fundingTrends, setFundingTrends] = useState<FundingTrend[]>([]);
  const [trlData, setTrlData] = useState<TechnologyReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'funding' | 'trl' | 'roi'>('opportunities');

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - will be replaced with real API calls
      const mockOpportunities: InvestmentOpportunity[] = [
        {
          id: '1',
          title: 'Advanced Life Support Systems',
          description: 'Next-generation closed-loop life support for long-duration missions',
          roi_score: 8.5,
          risk_level: 'medium',
          funding_required: '$50M - $100M',
          timeline: '5-7 years',
          market_potential: 9.2,
          nasa_priority: 'critical',
          related_publications: 45
        },
        {
          id: '2',
          title: 'Space Agriculture Technologies',
          description: 'Automated plant growth systems for Mars colonization',
          roi_score: 7.8,
          risk_level: 'low',
          funding_required: '$20M - $40M',
          timeline: '3-5 years',
          market_potential: 8.7,
          nasa_priority: 'high',
          related_publications: 32
        },
        {
          id: '3',
          title: 'Radiation Protection Solutions',
          description: 'Advanced shielding materials for deep space exploration',
          roi_score: 9.1,
          risk_level: 'high',
          funding_required: '$80M - $150M',
          timeline: '7-10 years',
          market_potential: 9.5,
          nasa_priority: 'critical',
          related_publications: 28
        }
      ];

      const mockFundingTrends: FundingTrend[] = [
        { year: '2020', total_funding: 45.2, publications_count: 89, roi_trend: 2.3 },
        { year: '2021', total_funding: 52.8, publications_count: 95, roi_trend: 2.8 },
        { year: '2022', total_funding: 61.4, publications_count: 102, roi_trend: 3.2 },
        { year: '2023', total_funding: 68.9, publications_count: 108, roi_trend: 3.7 },
        { year: '2024', total_funding: 75.3, publications_count: 115, roi_trend: 4.1 }
      ];

      const mockTrlData: TechnologyReadiness[] = [
        { technology: 'Closed-Loop Life Support', current_trl: 6, target_trl: 9, development_time: '5-7 years', investment_needed: '$50M', market_impact: 'high' },
        { technology: 'Space Agriculture Systems', current_trl: 4, target_trl: 8, development_time: '3-5 years', investment_needed: '$25M', market_impact: 'high' },
        { technology: 'Radiation Shielding', current_trl: 5, target_trl: 9, development_time: '7-10 years', investment_needed: '$80M', market_impact: 'high' },
        { technology: 'Artificial Gravity Systems', current_trl: 3, target_trl: 7, development_time: '10-15 years', investment_needed: '$100M', market_impact: 'medium' }
      ];

      setOpportunities(mockOpportunities);
      setFundingTrends(mockFundingTrends);
      setTrlData(mockTrlData);
    } catch (error) {
      console.error('Failed to fetch manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInvestmentOpportunities = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {opportunities.map((opp) => (
          <div key={opp.id} className="glass-card" style={{ padding: 24 }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{opp.title}</h3>
                <p className="text-gray-300 mb-4">{opp.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {opp.roi_score}/10
                </div>
                <div className="text-sm text-gray-400">ROI Score</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="badge">
                <span className="text-sm font-medium">💰 Funding:</span>
                <span className="ml-2">{opp.funding_required}</span>
              </div>
              <div className="badge">
                <span className="text-sm font-medium">⏱️ Timeline:</span>
                <span className="ml-2">{opp.timeline}</span>
              </div>
              <div className="badge">
                <span className="text-sm font-medium">📊 Market:</span>
                <span className="ml-2">{opp.market_potential}/10</span>
              </div>
              <div className="badge">
                <span className="text-sm font-medium">📚 Papers:</span>
                <span className="ml-2">{opp.related_publications}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className={`badge ${opp.risk_level === 'low' ? 'bg-green-500' : opp.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                  Risk: {opp.risk_level.toUpperCase()}
                </span>
                <span className={`badge ${opp.nasa_priority === 'critical' ? 'bg-red-500' : opp.nasa_priority === 'high' ? 'bg-orange-500' : opp.nasa_priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                  NASA: {opp.nasa_priority.toUpperCase()}
                </span>
              </div>
              <button className="btn-primary">
                📈 Analyze ROI
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFundingTrends = () => (
    <div className="space-y-6">
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 className="text-xl font-bold mb-6">📈 Funding Trends Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fundingTrends.map((trend) => (
            <div key={trend.year} className="badge" style={{ flexDirection: 'column', alignItems: 'start', padding: 20 }}>
              <div className="text-lg font-bold mb-2">{trend.year}</div>
              <div className="space-y-2 w-full">
                <div className="flex justify-between">
                  <span>Total Funding:</span>
                  <span className="font-bold">${trend.total_funding}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Publications:</span>
                  <span className="font-bold">{trend.publications_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>ROI Trend:</span>
                  <span className="font-bold text-green-400">{trend.roi_trend}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTechnologyReadiness = () => (
    <div className="space-y-6">
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 className="text-xl font-bold mb-6">🔬 Technology Readiness Levels</h3>
        <div className="space-y-4">
          {trlData.map((tech, index) => (
            <div key={index} className="badge" style={{ flexDirection: 'column', alignItems: 'start', padding: 20 }}>
              <div className="flex justify-between items-center w-full mb-3">
                <h4 className="text-lg font-bold">{tech.technology}</h4>
                <div className="flex gap-2">
                  <span className="badge bg-blue-500">TRL {tech.current_trl}</span>
                  <span className="badge bg-green-500">Target: {tech.target_trl}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div>
                  <span className="text-sm font-medium">Development Time:</span>
                  <div className="font-bold">{tech.development_time}</div>
                </div>
                <div>
                  <span className="text-sm font-medium">Investment Needed:</span>
                  <div className="font-bold">{tech.investment_needed}</div>
                </div>
                <div>
                  <span className="text-sm font-medium">Market Impact:</span>
                  <div className={`font-bold ${tech.market_impact === 'high' ? 'text-green-400' : tech.market_impact === 'medium' ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {tech.market_impact.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="w-full mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress to Target TRL</span>
                  <span>{Math.round((tech.current_trl / tech.target_trl) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(tech.current_trl / tech.target_trl) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderROIAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-green-400 mb-2">$2.4B</div>
          <div className="text-sm text-gray-400">Total Investment Potential</div>
        </div>
        
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold text-blue-400 mb-2">4.2x</div>
          <div className="text-sm text-gray-400">Average ROI</div>
        </div>
        
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-purple-400 mb-2">87%</div>
          <div className="text-sm text-gray-400">Success Rate</div>
        </div>
      </div>
      
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 className="text-xl font-bold mb-6">📊 Portfolio Optimization</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <span>High-ROI, Low-Risk Investments</span>
            <span className="badge bg-green-500">Priority 1</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <span>Medium-ROI, Medium-Risk Investments</span>
            <span className="badge bg-yellow-500">Priority 2</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <span>High-ROI, High-Risk Investments</span>
            <span className="badge bg-orange-500">Priority 3</span>
          </div>
        </div>
      </div>
    </div>
  );

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

      <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
        {/* Premium Header */}
        <header className="header-sticky">
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Image src="/logo.png" alt="logo" width={52} height={52} priority className="glow pulse-slow" />
              <div>
                <div className="text-gradient" style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.3 }}>
                  Manager Dashboard
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500 }}>
                  INVESTMENT OPPORTUNITIES & ROI ANALYSIS
                </div>
              </div>
            </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: 13 }}>Home</Link>
              <Link href="/scientist" className="btn-secondary" style={{ fontSize: 13 }}>Scientist</Link>
              <Link href="/architect" className="btn-secondary" style={{ fontSize: 13 }}>Architect</Link>
              <Link href="/analytics" className="btn-secondary" style={{ fontSize: 13 }}>Analytics</Link>
              <Link href="/guidelines" className="btn-secondary" style={{ fontSize: 13 }}>Guidelines</Link>
              <Link href="/resources" className="btn-secondary" style={{ fontSize: 13 }}>Resources</Link>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "32px auto", padding: "0 24px" }}>
          {/* Navigation tabs */}
          <div className="glass-card" style={{ marginBottom: 24, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {[
                { id: 'opportunities', label: '💼 Investment Opportunities', icon: '💰' },
                { id: 'funding', label: '📈 Funding Trends', icon: '📊' },
                { id: 'trl', label: '🔬 Technology Readiness', icon: '⚙️' },
                { id: 'roi', label: '📊 ROI Analysis', icon: '🎯' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'opportunities' | 'funding' | 'trl' | 'roi')}
                  className={`btn-secondary ${activeTab === tab.id ? 'active' : ''}`}
                  style={{ fontSize: 12, padding: '8px 12px' }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
              <div className="loading-shimmer" style={{ height: 200, borderRadius: 12 }} />
            </div>
          ) : (
            <>
              {activeTab === 'opportunities' && renderInvestmentOpportunities()}
              {activeTab === 'funding' && renderFundingTrends()}
              {activeTab === 'trl' && renderTechnologyReadiness()}
              {activeTab === 'roi' && renderROIAnalysis()}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="glass-card" style={{ marginTop: 80, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
              <Image src="/logo.png" alt="logo" width={28} height={28} className="glow" />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: 16 }}>NextGenLAB Space Bioscience Explorer</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Investment Analysis • ROI Optimization • Strategic Planning</div>
          </div>
        </footer>
      </div>
    </>
  );
}
