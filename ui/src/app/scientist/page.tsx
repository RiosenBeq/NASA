"use client";
import React, { useState, useEffect } from 'react';
import KnowledgeGraph from '../../components/KnowledgeGraph';

interface TrendData {
  year: number;
  count: number;
  topics: string[];
  organisms: string[];
  platforms: string[];
}

interface GapAnalysis {
  underrepresented_combinations: Array<{
    organism: string;
    platform: string;
    current_publications: number;
    gap_severity: number;
    recent_activity: number;
  }>;
  emerging_areas: string[];
  declining_areas: string[];
  recommendations: string[];
}

interface ConsensusArea {
  topic: string;
  consensus_level: number;
  supporting_publications: number;
  key_findings: string[];
}

export default function ScientistDashboard() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [gaps, setGaps] = useState<GapAnalysis | null>(null);
  const [consensus, setConsensus] = useState<ConsensusArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'gaps' | 'consensus' | 'kg'>('trends');

  useEffect(() => {
    fetchScientistData();
  }, []);

  const fetchScientistData = async () => {
    try {
      setLoading(true);
      
      const [trendsRes, gapsRes, consensusRes] = await Promise.all([
        fetch('/api/analysis/trends?start_year=2015'),
        fetch('/api/analysis/gaps'),
        fetch('/api/analysis/consensus')
      ]);

      const trendsData = await trendsRes.json();
      const gapsData = await gapsRes.json();
      const consensusData = await consensusRes.json();

      setTrends(trendsData);
      setGaps(gapsData);
      setConsensus(consensusData.consensus_areas || []);
    } catch (error) {
      console.error('Failed to fetch scientist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTrendsAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-400 mb-4">📈 Research Trends Analysis</h3>
        <p className="text-gray-300 mb-6">
          Analyze publication trends over time to identify hot topics and research directions.
        </p>
        
        {trends.length > 0 && (
          <>
            {/* Simple trend visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {trends.slice(-5).map((trend) => (
                <div key={trend.year} className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{trend.year}</div>
                  <div className="text-lg text-green-400">{trend.count} publications</div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-400 mb-1">Top Topics:</div>
                    <div className="flex flex-wrap gap-1">
                      {trend.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="bg-blue-600 text-xs px-2 py-1 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-400 mb-1">Organisms:</div>
                    <div className="text-xs text-gray-300">
                      {trend.organisms.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trend insights */}
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-2">🧬 Key Insights for Scientists</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                <li>Publication volume has {trends[trends.length-1]?.count > trends[0]?.count ? 'increased' : 'decreased'} over the analysis period</li>
                <li>Most active research areas: {trends[trends.length-1]?.topics.slice(0, 3).join(', ')}</li>
                <li>Emerging model organisms show promise for space biology research</li>
                <li>Consider collaboration opportunities in trending research areas</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderGapAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">🎯 Research Gap Analysis</h3>
        <p className="text-gray-300 mb-6">
          Identify underexplored areas and emerging opportunities for novel research hypotheses.
        </p>

        {gaps && (
          <>
            {/* Underrepresented combinations */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-yellow-300 mb-3">🔍 Underrepresented Research Areas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gaps.underrepresented_combinations.slice(0, 6).map((combo, i) => (
                  <div key={i} className="bg-yellow-900 bg-opacity-20 rounded-lg p-4 border border-yellow-700">
                    <div className="font-bold text-yellow-200">
                      {combo.organism} × {combo.platform}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      Only {combo.current_publications} publications
                    </div>
                    <div className="mt-2">
                      <div className="bg-yellow-600 h-2 rounded-full">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${combo.gap_severity * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Gap severity: {(combo.gap_severity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emerging vs declining */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-900 bg-opacity-20 rounded-lg p-4">
                <h4 className="text-lg font-bold text-green-300 mb-3">🌱 Emerging Areas</h4>
                <ul className="space-y-2">
                  {gaps.emerging_areas.slice(0, 5).map((area, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="text-green-400">↗️</span>
                      <span className="text-gray-300 capitalize">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-900 bg-opacity-20 rounded-lg p-4">
                <h4 className="text-lg font-bold text-red-300 mb-3">📉 Declining Areas</h4>
                <ul className="space-y-2">
                  {gaps.declining_areas.slice(0, 5).map((area, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="text-red-400">↘️</span>
                      <span className="text-gray-300 capitalize">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-2">💡 Research Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                {gaps.recommendations.slice(0, 5).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderConsensusAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-400 mb-4">🤝 Scientific Consensus Analysis</h3>
        <p className="text-gray-300 mb-6">
          Understand areas of scientific agreement and identify conflicting findings that need resolution.
        </p>

        <div className="space-y-4">
          {consensus.map((area, i) => (
            <div key={i} className="bg-green-900 bg-opacity-20 rounded-lg p-4 border border-green-700">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-green-200">{area.topic}</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {(area.consensus_level * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">consensus</div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="bg-gray-700 h-2 rounded-full">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${area.consensus_level * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-2">
                Based on {area.supporting_publications} publications
              </div>

              <div>
                <div className="text-sm font-medium text-green-300 mb-1">Key Findings:</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  {area.key_findings.map((finding, j) => (
                    <li key={j}>{finding}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
          <h4 className="font-bold text-blue-300 mb-2">🔬 Implications for Research</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>High consensus areas provide solid foundations for new research hypotheses</li>
            <li>Low consensus areas represent opportunities for paradigm-shifting research</li>
            <li>Consider replication studies for medium consensus findings</li>
            <li>Collaborate across disciplines to resolve conflicting results</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderKnowledgeGraph = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple-400 mb-4">🕸️ Knowledge Graph Explorer</h3>
        <p className="text-gray-300 mb-6">
          Visualize relationships between organisms, platforms, experiments, and findings.
        </p>
        
        <KnowledgeGraph 
          onNodeSelect={(node) => console.log('Selected node:', node)}
          onEdgeSelect={(edge) => console.log('Selected edge:', edge)}
        />
        
        <div className="mt-4 bg-purple-900 bg-opacity-30 rounded-lg p-4">
          <h4 className="font-bold text-purple-300 mb-2">🧠 Graph Insights for Scientists</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>Identify potential collaborations through shared research interests</li>
            <li>Discover unexpected connections between different research domains</li>
            <li>Find gaps in the research network that could lead to novel hypotheses</li>
            <li>Trace the evolution of research topics over time</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #0B0E2C 0%, #1B1270 60%, #4C3FE1 100%)", 
      color: "#EAF2FF" 
    }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🧬 Scientist Dashboard</h1>
          <p className="text-xl text-gray-300">
            Advanced analytics for hypothesis generation and research planning
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {[
              { id: 'trends', label: '📈 Trends', icon: '📊' },
              { id: 'gaps', label: '🎯 Gaps', icon: '🔍' },
              { id: 'consensus', label: '🤝 Consensus', icon: '✅' },
              { id: 'kg', label: '🕸️ Knowledge Graph', icon: '🌐' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'trends' && renderTrendsAnalysis()}
            {activeTab === 'gaps' && renderGapAnalysis()}
            {activeTab === 'consensus' && renderConsensusAnalysis()}
            {activeTab === 'kg' && renderKnowledgeGraph()}
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-left">
              <div className="font-bold">📝 Generate Hypothesis</div>
              <div className="text-sm text-gray-300">Based on gap analysis</div>
            </button>
            <button className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-left">
              <div className="font-bold">🔗 Find Collaborators</div>
              <div className="text-sm text-gray-300">Using knowledge graph</div>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg text-left">
              <div className="font-bold">📊 Export Analysis</div>
              <div className="text-sm text-gray-300">Download research insights</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}