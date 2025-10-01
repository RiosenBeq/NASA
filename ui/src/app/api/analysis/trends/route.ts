import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Simulate research trends analysis
    const trends = [
      {
        year: "2020",
        publications: 45,
        focus_areas: ["microgravity", "radiation", "bone_loss"],
        growth_rate: 0.12,
        emerging_topics: ["space_medicine", "crew_health"]
      },
      {
        year: "2021", 
        publications: 52,
        focus_areas: ["plant_growth", "immune_system", "metabolism"],
        growth_rate: 0.15,
        emerging_topics: ["artificial_gravity", "closed_loop"]
      },
      {
        year: "2022",
        publications: 48,
        focus_areas: ["artificial_gravity", "closed_loop", "crew_health"],
        growth_rate: -0.08,
        emerging_topics: ["mars_preparation", "biotechnology"]
      },
      {
        year: "2023",
        publications: 61,
        focus_areas: ["mars_preparation", "biotechnology", "life_support"],
        growth_rate: 0.27,
        emerging_topics: ["long_duration", "space_medicine"]
      },
      {
        year: "2024",
        publications: 38,
        focus_areas: ["long_duration", "space_medicine", "habitat_design"],
        growth_rate: -0.38,
        emerging_topics: ["autonomous_systems", "ai_integration"]
      }
    ];

    const analysis = {
      total_publications: trends.reduce((sum, t) => sum + t.publications, 0),
      average_growth: trends.reduce((sum, t) => sum + t.growth_rate, 0) / trends.length,
      peak_year: trends.reduce((max, t) => t.publications > max.publications ? t : max),
      declining_areas: ["radiation_biology", "basic_research"],
      emerging_areas: ["ai_integration", "autonomous_systems", "personalized_medicine"],
      recommendations: [
        "Focus on AI-integrated life support systems",
        "Increase investment in autonomous research platforms",
        "Develop personalized medicine approaches for space crews"
      ]
    };

    return NextResponse.json({
      success: true,
      data: {
        trends,
        analysis,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in trends analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze research trends' },
      { status: 500 }
    );
  }
}
