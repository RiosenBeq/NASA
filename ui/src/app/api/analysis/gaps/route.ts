import { NextRequest, NextResponse } from 'next/server';

interface GapAnalysis {
  gap_category: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  research_opportunity: string;
  potential_impact: string;
  recommended_approach: string;
  timeline: string;
  resource_requirements: string;
  related_publications: number;
  priority_score: number;
}

export async function GET(req: NextRequest) {
  try {
    // Mock data for gap analysis - will be replaced with real analysis
    const mockGaps: GapAnalysis[] = [
      {
        gap_category: 'Long-duration Space Missions',
        description: 'Limited research on biological effects of missions longer than 1 year',
        severity: 'critical',
        research_opportunity: 'Comprehensive studies on multi-year space exposure effects',
        potential_impact: 'Critical for Mars mission success and crew safety',
        recommended_approach: 'Simulated Mars mission studies, extended ISS research',
        timeline: '5-7 years',
        resource_requirements: '$100M - $200M',
        related_publications: 23,
        priority_score: 9.5
      },
      {
        gap_category: 'Artificial Gravity Systems',
        description: 'Insufficient research on optimal artificial gravity parameters',
        severity: 'high',
        research_opportunity: 'Development of effective artificial gravity solutions',
        potential_impact: 'Could revolutionize long-duration space missions',
        recommended_approach: 'Centrifuge studies, variable gravity research',
        timeline: '7-10 years',
        resource_requirements: '$150M - $300M',
        related_publications: 18,
        priority_score: 8.8
      },
      {
        gap_category: 'Space Agriculture Optimization',
        description: 'Limited understanding of optimal growing conditions in space',
        severity: 'high',
        research_opportunity: 'Advanced space agriculture systems for Mars colonization',
        potential_impact: 'Essential for sustainable Mars missions',
        recommended_approach: 'Advanced growth chambers, automated systems',
        timeline: '3-5 years',
        resource_requirements: '$50M - $100M',
        related_publications: 34,
        priority_score: 8.6
      },
      {
        gap_category: 'Radiation Protection',
        description: 'Inadequate protection against cosmic radiation',
        severity: 'critical',
        research_opportunity: 'Advanced radiation shielding materials and methods',
        potential_impact: 'Critical for deep space exploration safety',
        recommended_approach: 'Material science research, magnetic shielding',
        timeline: '5-8 years',
        resource_requirements: '$80M - $150M',
        related_publications: 28,
        priority_score: 9.2
      },
      {
        gap_category: 'Crew Psychological Health',
        description: 'Limited research on psychological effects of isolation and confinement',
        severity: 'medium',
        research_opportunity: 'Comprehensive psychological support systems',
        potential_impact: 'Essential for mission success and crew well-being',
        recommended_approach: 'Psychological studies, support system development',
        timeline: '2-4 years',
        resource_requirements: '$20M - $40M',
        related_publications: 15,
        priority_score: 7.8
      },
      {
        gap_category: 'Microgravity Medicine',
        description: 'Insufficient medical procedures adapted for microgravity',
        severity: 'high',
        research_opportunity: 'Development of space-adapted medical procedures',
        potential_impact: 'Critical for crew health during missions',
        recommended_approach: 'Medical procedure adaptation, telemedicine',
        timeline: '3-6 years',
        resource_requirements: '$30M - $60M',
        related_publications: 21,
        priority_score: 8.4
      },
      {
        gap_category: 'Life Support System Integration',
        description: 'Limited research on integrated life support systems',
        severity: 'medium',
        research_opportunity: 'Holistic life support system development',
        potential_impact: 'Improved efficiency and reliability',
        recommended_approach: 'System integration studies, optimization research',
        timeline: '4-6 years',
        resource_requirements: '$60M - $120M',
        related_publications: 26,
        priority_score: 7.9
      },
      {
        gap_category: 'Space Biotechnology',
        description: 'Limited biotechnology applications in space environment',
        severity: 'medium',
        research_opportunity: 'Space biotechnology development and applications',
        potential_impact: 'Revolutionary advances in space medicine and agriculture',
        recommended_approach: 'Biotechnology research, space applications',
        timeline: '5-8 years',
        resource_requirements: '$70M - $140M',
        related_publications: 19,
        priority_score: 8.1
      }
    ];

    // Sort by priority score (highest first)
    const sortedGaps = mockGaps.sort((a, b) => b.priority_score - a.priority_score);

    return NextResponse.json(sortedGaps, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error fetching gap analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gap analysis' },
      { status: 500 }
    );
  }
}
