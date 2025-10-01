"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface RiskAssessment {
  id: string;
  risk_category: string;
  description: string;
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation_strategy: string;
  monitoring_required: boolean;
  cost_impact: string;
}

interface MissionConstraint {
  constraint_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affected_systems: string[];
  mitigation_options: string[];
  timeline_impact: string;
}

interface TechnologyRequirement {
  technology: string;
  current_status: 'available' | 'development' | 'research' | 'conceptual';
  mission_criticality: 'critical' | 'important' | 'desirable';
  development_timeline: string;
  resource_requirements: string;
  risk_factors: string[];
  alternatives: string[];
}

interface OperationalImplication {
  area: string;
  description: string;
  impact_level: 'minimal' | 'moderate' | 'significant' | 'severe';
  crew_requirements: string;
  system_modifications: string[];
  training_needs: string[];
  contingency_plans: string[];
}

export default function ArchitectDashboard() {
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [constraints, setConstraints] = useState<MissionConstraint[]>([]);
  const [technologies, setTechnologies] = useState<TechnologyRequirement[]>([]);
  const [operations, setOperations] = useState<OperationalImplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'risks' | 'constraints' | 'technologies' | 'operations'>('risks');

  useEffect(() => {
    fetchArchitectData();
  }, []);

  const fetchArchitectData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - will be replaced with real API calls
      const mockRisks: RiskAssessment[] = [
        {
          id: '1',
          risk_category: 'Radiation Exposure',
          description: 'Increased cosmic radiation exposure during deep space missions',
          probability: 'high',
          impact: 'critical',
          mitigation_strategy: 'Advanced shielding materials and operational procedures',
          monitoring_required: true,
          cost_impact: '$50M - $100M'
        },
        {
          id: '2',
          risk_category: 'Life Support System Failure',
          description: 'Critical failure of closed-loop life support systems',
          probability: 'medium',
          impact: 'critical',
          mitigation_strategy: 'Redundant systems and emergency protocols',
          monitoring_required: true,
          cost_impact: '$30M - $60M'
        },
        {
          id: '3',
          risk_category: 'Psychological Stress',
          description: 'Crew psychological challenges during long-duration missions',
          probability: 'high',
          impact: 'high',
          mitigation_strategy: 'Comprehensive psychological support and monitoring',
          monitoring_required: true,
          cost_impact: '$10M - $20M'
        }
      ];

      const mockConstraints: MissionConstraint[] = [
        {
          constraint_type: 'Payload Mass',
          description: 'Limited payload capacity for Mars missions',
          severity: 'high',
          affected_systems: ['Life Support', 'Scientific Instruments', 'Crew Supplies'],
          mitigation_options: ['In-situ resource utilization', 'Modular design', 'Advanced materials'],
          timeline_impact: '6-12 months additional development'
        },
        {
          constraint_type: 'Power Requirements',
          description: 'High energy demands for life support and scientific operations',
          severity: 'medium',
          affected_systems: ['Power Generation', 'Thermal Management', 'Communication'],
          mitigation_options: ['Solar panel optimization', 'Nuclear power', 'Energy storage'],
          timeline_impact: '3-6 months additional development'
        },
        {
          constraint_type: 'Communication Delay',
          description: 'Signal delay between Earth and Mars (up to 22 minutes)',
          severity: 'medium',
          affected_systems: ['Mission Control', 'Emergency Response', 'Data Transmission'],
          mitigation_options: ['Autonomous systems', 'Local AI', 'Pre-planned protocols'],
          timeline_impact: '2-4 months additional development'
        }
      ];

      const mockTechnologies: TechnologyRequirement[] = [
        {
          technology: 'Advanced Life Support Systems',
          current_status: 'development',
          mission_criticality: 'critical',
          development_timeline: '5-7 years',
          resource_requirements: '$50M - $100M',
          risk_factors: ['Complexity', 'Reliability requirements', 'Testing limitations'],
          alternatives: ['Open-loop systems', 'Hybrid approaches', 'Commercial solutions']
        },
        {
          technology: 'Radiation Shielding',
          current_status: 'research',
          mission_criticality: 'critical',
          development_timeline: '7-10 years',
          resource_requirements: '$80M - $150M',
          risk_factors: ['Material limitations', 'Weight constraints', 'Effectiveness validation'],
          alternatives: ['Magnetic shielding', 'Water shielding', 'Operational procedures']
        },
        {
          technology: 'Artificial Gravity Systems',
          current_status: 'conceptual',
          mission_criticality: 'important',
          development_timeline: '10-15 years',
          resource_requirements: '$100M - $200M',
          risk_factors: ['Engineering complexity', 'Power requirements', 'Space constraints'],
          alternatives: ['Exercise protocols', 'Pharmacological solutions', 'Partial gravity']
        }
      ];

      const mockOperations: OperationalImplication[] = [
        {
          area: 'Crew Health Monitoring',
          description: 'Continuous health monitoring and medical support during missions',
          impact_level: 'significant',
          crew_requirements: 'Medical officer, telemedicine capabilities',
          system_modifications: ['Medical bay', 'Diagnostic equipment', 'Emergency protocols'],
          training_needs: ['Medical procedures', 'Emergency response', 'Equipment operation'],
          contingency_plans: ['Emergency return protocols', 'Medical evacuation', 'Remote consultation']
        },
        {
          area: 'Scientific Operations',
          description: 'Conducting research experiments in space environment',
          impact_level: 'moderate',
          crew_requirements: 'Research scientists, technical specialists',
          system_modifications: ['Laboratory facilities', 'Sample storage', 'Data transmission'],
          training_needs: ['Experiment protocols', 'Equipment operation', 'Data analysis'],
          contingency_plans: ['Backup experiments', 'Data recovery', 'Equipment redundancy']
        },
        {
          area: 'Mission Control Integration',
          description: 'Coordinating with ground-based mission control',
          impact_level: 'significant',
          crew_requirements: 'Communication specialists, mission planners',
          system_modifications: ['Communication systems', 'Data processing', 'Command interfaces'],
          training_needs: ['Communication protocols', 'Mission procedures', 'Emergency response'],
          contingency_plans: ['Autonomous operations', 'Backup communication', 'Emergency protocols']
        }
      ];

      setRisks(mockRisks);
      setConstraints(mockConstraints);
      setTechnologies(mockTechnologies);
      setOperations(mockOperations);
    } catch (error) {
      console.error('Failed to fetch architect data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (probability: string, impact: string) => {
    if (probability === 'critical' || impact === 'critical') return 'bg-red-500';
    if (probability === 'high' || impact === 'high') return 'bg-orange-500';
    if (probability === 'medium' || impact === 'medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderRiskAssessment = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {risks.map((risk) => (
          <div key={risk.id} className="glass-card" style={{ padding: 24 }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{risk.risk_category}</h3>
                <p className="text-gray-300 mb-4">{risk.description}</p>
              </div>
              <div className="text-right">
                <div className={`badge ${getRiskColor(risk.probability, risk.impact)} mb-2`}>
                  {risk.probability.toUpperCase()} Probability
                </div>
                <div className={`badge ${getRiskColor(risk.probability, risk.impact)}`}>
                  {risk.impact.toUpperCase()} Impact
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="badge">
                <span className="text-sm font-medium">🛡️ Mitigation:</span>
                <span className="ml-2">{risk.mitigation_strategy}</span>
              </div>
              <div className="badge">
                <span className="text-sm font-medium">💰 Cost Impact:</span>
                <span className="ml-2">{risk.cost_impact}</span>
              </div>
              <div className="badge">
                <span className="text-sm font-medium">📊 Monitoring:</span>
                <span className="ml-2">{risk.monitoring_required ? 'Required' : 'Not Required'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMissionConstraints = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {constraints.map((constraint, index) => (
          <div key={index} className="glass-card" style={{ padding: 24 }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{constraint.constraint_type}</h3>
                <p className="text-gray-300 mb-4">{constraint.description}</p>
              </div>
              <div className={`badge ${constraint.severity === 'high' ? 'bg-red-500' : constraint.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                {constraint.severity.toUpperCase()} Severity
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium">Affected Systems:</span>
                <div className="mt-1">
                  {constraint.affected_systems.map((system, i) => (
                    <span key={i} className="badge mr-2 mb-1">{system}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Mitigation Options:</span>
                <div className="mt-1">
                  {constraint.mitigation_options.map((option, i) => (
                    <span key={i} className="badge mr-2 mb-1 bg-blue-500">{option}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="badge">
              <span className="text-sm font-medium">⏱️ Timeline Impact:</span>
              <span className="ml-2">{constraint.timeline_impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTechnologyRequirements = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {technologies.map((tech, index) => (
          <div key={index} className="glass-card" style={{ padding: 24 }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{tech.technology}</h3>
                <div className="flex gap-2 mb-2">
                  <span className={`badge ${tech.current_status === 'available' ? 'bg-green-500' : tech.current_status === 'development' ? 'bg-blue-500' : tech.current_status === 'research' ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                    {tech.current_status.toUpperCase()}
                  </span>
                  <span className={`badge ${tech.mission_criticality === 'critical' ? 'bg-red-500' : tech.mission_criticality === 'important' ? 'bg-orange-500' : 'bg-green-500'}`}>
                    {tech.mission_criticality.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium">Development Timeline:</span>
                <div className="font-bold">{tech.development_timeline}</div>
              </div>
              <div>
                <span className="text-sm font-medium">Resource Requirements:</span>
                <div className="font-bold">{tech.resource_requirements}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Risk Factors:</span>
                <div className="mt-1">
                  {tech.risk_factors.map((risk, i) => (
                    <span key={i} className="badge mr-2 mb-1 bg-red-500">{risk}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Alternatives:</span>
                <div className="mt-1">
                  {tech.alternatives.map((alt, i) => (
                    <span key={i} className="badge mr-2 mb-1 bg-green-500">{alt}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOperationalImplications = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {operations.map((op, index) => (
          <div key={index} className="glass-card" style={{ padding: 24 }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{op.area}</h3>
                <p className="text-gray-300 mb-4">{op.description}</p>
              </div>
              <div className={`badge ${op.impact_level === 'severe' ? 'bg-red-500' : op.impact_level === 'significant' ? 'bg-orange-500' : op.impact_level === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                {op.impact_level.toUpperCase()} Impact
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium">Crew Requirements:</span>
                <div className="mt-1">{op.crew_requirements}</div>
              </div>
              <div>
                <span className="text-sm font-medium">System Modifications:</span>
                <div className="mt-1">
                  {op.system_modifications.map((mod, i) => (
                    <span key={i} className="badge mr-2 mb-1">{mod}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Training Needs:</span>
                <div className="mt-1">
                  {op.training_needs.map((training, i) => (
                    <span key={i} className="badge mr-2 mb-1 bg-blue-500">{training}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Contingency Plans:</span>
                <div className="mt-1">
                  {op.contingency_plans.map((plan, i) => (
                    <span key={i} className="badge mr-2 mb-1 bg-purple-500">{plan}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
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
                  Mission Architect Dashboard
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500 }}>
                  RISK ASSESSMENT & MISSION PLANNING
                </div>
              </div>
            </div>
            
            <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: 13 }}>Home</Link>
              <Link href="/scientist" className="btn-secondary" style={{ fontSize: 13 }}>Scientist</Link>
              <Link href="/manager" className="btn-secondary" style={{ fontSize: 13 }}>Manager</Link>
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
                { id: 'risks', label: '⚠️ Risk Assessment', icon: '🛡️' },
                { id: 'constraints', label: '🚧 Mission Constraints', icon: '⚖️' },
                { id: 'technologies', label: '🔬 Technology Requirements', icon: '⚙️' },
                { id: 'operations', label: '🚀 Operational Implications', icon: '👥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'risks' | 'constraints' | 'technologies' | 'operations')}
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
              {activeTab === 'risks' && renderRiskAssessment()}
              {activeTab === 'constraints' && renderMissionConstraints()}
              {activeTab === 'technologies' && renderTechnologyRequirements()}
              {activeTab === 'operations' && renderOperationalImplications()}
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
            <div style={{ fontSize: 13, opacity: 0.7 }}>Risk Assessment • Mission Planning • Safety Analysis</div>
          </div>
        </footer>
      </div>
    </>
  );
}
