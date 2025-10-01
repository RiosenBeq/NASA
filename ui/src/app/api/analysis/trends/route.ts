import { NextRequest, NextResponse } from 'next/server';

interface TrendData {
  year: string;
  publication_count: number;
  research_areas: string[];
  key_findings: string[];
  impact_score: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startYear = searchParams.get('start_year') || '2015';

    // Mock data for now - will be replaced with real analysis
    const mockTrends: TrendData[] = [
      {
        year: '2015',
        publication_count: 45,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology'],
        key_findings: [
          'Initial microgravity plant growth experiments',
          'Radiation exposure studies begin',
          'Basic life support system research'
        ],
        impact_score: 7.2
      },
      {
        year: '2016',
        publication_count: 52,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health'],
        key_findings: [
          'Advanced plant growth chambers developed',
          'Radiation shielding materials tested',
          'Crew psychological studies initiated'
        ],
        impact_score: 7.8
      },
      {
        year: '2017',
        publication_count: 48,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health', 'Life Support'],
        key_findings: [
          'Closed-loop life support systems tested',
          'Plant-microbe interactions studied',
          'Long-duration mission planning begins'
        ],
        impact_score: 8.1
      },
      {
        year: '2018',
        publication_count: 61,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health', 'Life Support', 'Mars Preparation'],
        key_findings: [
          'Mars mission preparation research',
          'Advanced radiation protection',
          'Automated agriculture systems'
        ],
        impact_score: 8.5
      },
      {
        year: '2019',
        publication_count: 58,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health', 'Life Support', 'Mars Preparation', 'Artificial Gravity'],
        key_findings: [
          'Artificial gravity research begins',
          'Advanced life support integration',
          'Crew health monitoring systems'
        ],
        impact_score: 8.7
      },
      {
        year: '2020',
        publication_count: 67,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health', 'Life Support', 'Mars Preparation', 'Artificial Gravity', 'Space Medicine'],
        key_findings: [
          'COVID-19 impact on space research',
          'Telemedicine in space',
          'Advanced monitoring systems'
        ],
        impact_score: 8.9
      },
      {
        year: '2021',
        publication_count: 73,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health', 'Life Support', 'Mars Preparation', 'Artificial Gravity', 'Space Medicine', 'Biotechnology'],
        key_findings: [
          'Space biotechnology advances',
          'Mars mission technology readiness',
          'Advanced crew health systems'
        ],
        impact_score: 9.1
      },
      {
        year: '2022',
        publication_count: 79,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health', 'Life Support', 'Mars Preparation', 'Artificial Gravity', 'Space Medicine', 'Biotechnology', 'Sustainability'],
        key_findings: [
          'Sustainable space agriculture',
          'Advanced radiation protection',
          'Integrated life support systems'
        ],
        impact_score: 9.3
      },
      {
        year: '2023',
        publication_count: 85,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health', 'Life Support', 'Mars Preparation', 'Artificial Gravity', 'Space Medicine', 'Biotechnology', 'Sustainability', 'AI Integration'],
        key_findings: [
          'AI-powered life support systems',
          'Advanced Mars preparation',
          'Integrated health monitoring'
        ],
        impact_score: 9.5
      },
      {
        year: '2024',
        publication_count: 92,
        research_areas: ['Plant Biology', 'Microgravity Effects', 'Radiation Biology', 'Crew Health', 'Life Support', 'Mars Preparation', 'Artificial Gravity', 'Space Medicine', 'Biotechnology', 'Sustainability', 'AI Integration', 'Commercial Space'],
        key_findings: [
          'Commercial space partnerships',
          'Advanced Mars mission readiness',
          'Next-generation life support'
        ],
        impact_score: 9.7
      }
    ];

    // Filter by start year
    const filteredTrends = mockTrends.filter(trend => 
      parseInt(trend.year) >= parseInt(startYear)
    );

    return NextResponse.json(filteredTrends, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error fetching trends data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends data' },
      { status: 500 }
    );
  }
}
