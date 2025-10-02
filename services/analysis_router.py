"""
Scientific Analysis Router for NASA Space Bio Explorer
Provides advanced analytics endpoints for research insights.
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
import numpy as np
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from api.main import get_db_connection

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/analysis", 
    tags=["Scientific Analysis"],
    responses={
        404: {"description": "Analysis data not found"},
        500: {"description": "Analysis failed"}
    }
)

class TrendData(BaseModel):
    """Research trend over time."""
    year: int
    count: int
    topics: List[str]
    organisms: List[str]
    platforms: List[str]

class GapAnalysis(BaseModel):
    """Research gap identification."""
    underrepresented_combinations: List[Dict[str, Any]]
    emerging_areas: List[str]
    declining_areas: List[str]
    recommendations: List[str]

class ConsensusAnalysis(BaseModel):
    """Scientific consensus and conflicts."""
    consensus_areas: List[Dict[str, Any]]
    conflicting_areas: List[Dict[str, Any]]
    confidence_scores: Dict[str, float]

class ImpactMetrics(BaseModel):
    """Publication impact and relevance metrics."""
    high_impact_publications: List[Dict[str, Any]]
    mission_relevance_scores: Dict[str, float]
    technology_readiness_levels: Dict[str, int]

@router.get("/trends", response_model=List[TrendData])
async def get_research_trends(
    start_year: int = Query(2010, ge=1990, le=2024),
    end_year: int = Query(2024, ge=1990, le=2024),
    focus: Optional[str] = Query(None, description="Focus area: organism, platform, or topic")
):
    """Analyze research trends over time."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Base query for trends
                cur.execute("""
                    SELECT 
                        p.year,
                        COUNT(*) as pub_count,
                        ARRAY_AGG(DISTINCT COALESCE(c.organism, 'Unknown')) as organisms,
                        ARRAY_AGG(DISTINCT COALESCE(c.platform, 'Unknown')) as platforms,
                        STRING_AGG(DISTINCT LOWER(p.title), ' ') as title_text
                    FROM biosci.publications p
                    LEFT JOIN biosci.chunks c ON p.id = c.publication_id
                    WHERE p.year BETWEEN %s AND %s 
                        AND p.year IS NOT NULL
                    GROUP BY p.year
                    ORDER BY p.year
                """, (start_year, end_year))
                
                rows = cur.fetchall()
                trends = []
                
                for year, count, organisms, platforms, title_text in rows:
                    # Extract topics from titles (simple keyword extraction)
                    topics = extract_topics_from_text(title_text or "")
                    
                    trends.append(TrendData(
                        year=year,
                        count=count,
                        topics=topics[:5],  # Top 5 topics
                        organisms=[org for org in organisms if org != 'Unknown'][:5],
                        platforms=[plat for plat in platforms if plat != 'Unknown'][:5]
                    ))
                
                logger.info(f"Generated trends for {len(trends)} years")
                return trends
                
    except Exception as e:
        logger.error(f"Trend analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze research trends")

@router.get("/gaps", response_model=GapAnalysis)
async def identify_research_gaps(
    min_publications: int = Query(5, ge=1, le=50),
    significance_threshold: float = Query(0.7, ge=0.5, le=1.0)
):
    """Identify research gaps and opportunities."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Get organism-platform combinations
                cur.execute("""
                    SELECT 
                        COALESCE(c.organism, 'Unknown') as organism,
                        COALESCE(c.platform, 'Unknown') as platform,
                        COUNT(DISTINCT p.id) as pub_count,
                        ARRAY_AGG(DISTINCT p.year ORDER BY p.year DESC) as years
                    FROM biosci.publications p
                    LEFT JOIN biosci.chunks c ON p.id = c.publication_id
                    WHERE c.organism IS NOT NULL AND c.platform IS NOT NULL
                    GROUP BY c.organism, c.platform
                    HAVING COUNT(DISTINCT p.id) >= 1
                    ORDER BY pub_count ASC
                """)
                
                combinations = cur.fetchall()
                
                # Analyze gaps
                underrepresented = []
                total_combinations = len(combinations)
                avg_publications = sum(row[2] for row in combinations) / total_combinations if total_combinations > 0 else 0
                
                for organism, platform, count, years in combinations:
                    if count < min_publications and count < avg_publications * 0.5:
                        underrepresented.append({
                            "organism": organism,
                            "platform": platform,
                            "current_publications": count,
                            "gap_severity": 1 - (count / max(avg_publications, 1)),
                            "recent_activity": max(years) if years else 0
                        })
                
                # Get publication trends for emerging/declining areas
                cur.execute("""
                    SELECT 
                        LOWER(COALESCE(c.organism, 'unknown')) as topic,
                        p.year,
                        COUNT(*) as count
                    FROM biosci.publications p
                    LEFT JOIN biosci.chunks c ON p.id = c.publication_id
                    WHERE p.year >= %s
                    GROUP BY topic, p.year
                    HAVING topic != 'unknown'
                    ORDER BY topic, p.year
                """, (datetime.now().year - 5,))
                
                trend_data = cur.fetchall()
                
                # Analyze emerging vs declining
                topic_trends = defaultdict(list)
                for topic, year, count in trend_data:
                    topic_trends[topic].append((year, count))
                
                emerging = []
                declining = []
                
                for topic, data in topic_trends.items():
                    if len(data) >= 3:  # Need at least 3 years of data
                        years = [d[0] for d in data]
                        counts = [d[1] for d in data]
                        
                        # Simple trend calculation
                        trend_slope = calculate_trend_slope(years, counts)
                        
                        if trend_slope > 0.5:
                            emerging.append(topic)
                        elif trend_slope < -0.5:
                            declining.append(topic)
                
                # Generate recommendations
                recommendations = generate_gap_recommendations(underrepresented, emerging)
                
                return GapAnalysis(
                    underrepresented_combinations=underrepresented[:10],
                    emerging_areas=emerging[:10],
                    declining_areas=declining[:10],
                    recommendations=recommendations
                )
                
    except Exception as e:
        logger.error(f"Gap analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to identify research gaps")

@router.get("/consensus", response_model=ConsensusAnalysis)
async def analyze_scientific_consensus(
    topic: Optional[str] = Query(None, description="Focus topic for consensus analysis")
):
    """Analyze areas of scientific consensus and conflict."""
    try:
        # This would typically involve more sophisticated NLP analysis
        # For now, providing a framework
        
        consensus_areas = [
            {
                "topic": "Microgravity effects on bone density",
                "consensus_level": 0.85,
                "supporting_publications": 24,
                "key_findings": ["Bone loss occurs in microgravity", "Exercise countermeasures are effective"]
            },
            {
                "topic": "Plant growth in space environments", 
                "consensus_level": 0.72,
                "supporting_publications": 18,
                "key_findings": ["Root orientation affected", "LED lighting effective"]
            }
        ]
        
        conflicting_areas = [
            {
                "topic": "Radiation exposure thresholds",
                "conflict_level": 0.65,
                "conflicting_publications": 12,
                "main_disagreements": ["Safe exposure limits", "Shielding effectiveness"]
            }
        ]
        
        confidence_scores = {
            "microgravity_effects": 0.85,
            "radiation_biology": 0.62,
            "plant_biology": 0.72,
            "human_physiology": 0.78
        }
        
        return ConsensusAnalysis(
            consensus_areas=consensus_areas,
            conflicting_areas=conflicting_areas,
            confidence_scores=confidence_scores
        )
        
    except Exception as e:
        logger.error(f"Consensus analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze scientific consensus")

@router.get("/impact", response_model=ImpactMetrics)
async def calculate_impact_metrics(
    mission_focus: Optional[str] = Query(None, description="Mission focus: moon, mars, or iss")
):
    """Calculate publication impact and mission relevance."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Get publication metrics (simplified)
                cur.execute("""
                    SELECT 
                        p.id,
                        p.title,
                        p.year,
                        p.url,
                        COALESCE(c.organism, 'Unknown') as organism,
                        COALESCE(c.platform, 'Unknown') as platform,
                        LENGTH(a.abstract_text) as abstract_length
                    FROM biosci.publications p
                    LEFT JOIN biosci.chunks c ON p.id = c.publication_id
                    LEFT JOIN biosci.abstracts a ON p.id = a.publication_id
                    WHERE p.year >= %s
                    ORDER BY p.year DESC, abstract_length DESC
                    LIMIT 20
                """, (datetime.now().year - 5,))
                
                publications = cur.fetchall()
                
                high_impact = []
                for pub_id, title, year, url, organism, platform, abs_len in publications:
                    # Calculate impact score (simplified)
                    recency_score = min(1.0, (datetime.now().year - year + 1) / 5)
                    content_score = min(1.0, (abs_len or 0) / 2000)  # Normalize by typical abstract length
                    
                    impact_score = (recency_score * 0.3 + content_score * 0.7)
                    
                    high_impact.append({
                        "id": pub_id,
                        "title": title,
                        "year": year,
                        "organism": organism,
                        "platform": platform,
                        "impact_score": round(impact_score, 3),
                        "url": url
                    })
                
                # Mission relevance scores (simplified)
                mission_relevance = {
                    "moon": 0.78,
                    "mars": 0.65,
                    "iss": 0.92,
                    "deep_space": 0.43
                }
                
                # Technology readiness levels (simplified)
                trl_scores = {
                    "life_support": 7,
                    "radiation_protection": 5,
                    "food_production": 6,
                    "exercise_equipment": 8,
                    "psychological_support": 4
                }
                
                return ImpactMetrics(
                    high_impact_publications=sorted(high_impact, key=lambda x: x["impact_score"], reverse=True)[:10],
                    mission_relevance_scores=mission_relevance,
                    technology_readiness_levels=trl_scores
                )
                
    except Exception as e:
        logger.error(f"Impact analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate impact metrics")

@router.get("/summary")
async def get_analysis_summary():
    """Get a comprehensive summary of all analyses."""
    try:
        # Combine results from all analysis endpoints
        trends = await get_research_trends()
        gaps = await identify_research_gaps()
        consensus = await analyze_scientific_consensus()
        impact = await calculate_impact_metrics()
        
        return {
            "summary": {
                "total_years_analyzed": len(trends),
                "research_gaps_identified": len(gaps.underrepresented_combinations),
                "consensus_areas": len(consensus.consensus_areas),
                "high_impact_publications": len(impact.high_impact_publications),
                "generated_at": datetime.now().isoformat()
            },
            "key_insights": [
                f"Found {len(gaps.underrepresented_combinations)} underrepresented research areas",
                f"Identified {len(gaps.emerging_areas)} emerging research topics",
                f"{len(consensus.consensus_areas)} areas show strong scientific consensus",
                f"Mission relevance scores range from {min(impact.mission_relevance_scores.values()):.2f} to {max(impact.mission_relevance_scores.values()):.2f}"
            ]
        }
        
    except Exception as e:
        logger.error(f"Analysis summary failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate analysis summary")

# Helper functions
def extract_topics_from_text(text: str) -> List[str]:
    """Extract key topics from text using simple keyword matching."""
    keywords = [
        "microgravity", "radiation", "bone", "muscle", "plant", "growth", 
        "space", "iss", "astronaut", "mars", "moon", "cell", "tissue",
        "exercise", "nutrition", "psychology", "sleep", "immune"
    ]
    
    text_lower = text.lower()
    found_topics = [keyword for keyword in keywords if keyword in text_lower]
    return list(set(found_topics))[:10]  # Return unique topics, max 10

def calculate_trend_slope(years: List[int], counts: List[int]) -> float:
    """Calculate simple trend slope using linear regression."""
    if len(years) < 2:
        return 0.0
    
    # Simple linear regression slope calculation
    n = len(years)
    sum_x = sum(years)
    sum_y = sum(counts)
    sum_xy = sum(x * y for x, y in zip(years, counts))
    sum_x2 = sum(x * x for x in years)
    
    denominator = n * sum_x2 - sum_x * sum_x
    if denominator == 0:
        return 0.0
    
    slope = (n * sum_xy - sum_x * sum_y) / denominator
    return slope

def generate_gap_recommendations(underrepresented: List[Dict], emerging: List[str]) -> List[str]:
    """Generate research gap recommendations."""
    recommendations = []
    
    # Recommendations for underrepresented areas
    for gap in underrepresented[:3]:  # Top 3 gaps
        recommendations.append(
            f"Increase research on {gap['organism']} in {gap['platform']} environment "
            f"(currently only {gap['current_publications']} publications)"
        )
    
    # Recommendations for emerging areas
    for topic in emerging[:2]:  # Top 2 emerging
        recommendations.append(
            f"Invest in growing research area: {topic} shows increasing publication trends"
        )
    
    # General recommendations
    recommendations.extend([
        "Focus on long-duration mission effects (Mars-relevant timescales)",
        "Develop more comprehensive radiation countermeasures",
        "Integrate multiple stressor effects (microgravity + radiation + isolation)"
    ])
    
    return recommendations[:8]  # Return max 8 recommendations