#!/usr/bin/env python3
"""
NASA Data Service - Load integration results for API endpoints
Loads the comprehensive NASA resource integration data for FastAPI backend.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class NASADataService:
    """Service to load and provide NASA integration data to API endpoints."""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.data_dir = self.project_root / "data" / "nasa_resources"
        
        # Load all integration data
        self._load_integration_data()
        
        logger.info(f"🚀 NASA Data Service initialized with {self.get_total_publications()} publications")
    
    def _load_integration_data(self) -> None:
        """Load all integration data from JSON files."""
        try:
            # Main integration results
            with open(self.data_dir / 'enhanced_nasa_integration.json', 'r') as f:
                self.integration_data = json.load(f)
            
            # Challenge summary
            with open(self.data_dir / 'challenge_integration_summary.json', 'r') as f:
                self.challenge_summary = json.load(f)
            
            # OSDR detailed matches
            with open(self.data_dir / 'osdr_studies_detailed.json', 'r') as f:
                self.osdr_matches = json.load(f)
            
            # TaskBook detailed funding
            with open(self.data_dir / 'taskbook_funding_detailed.json', 'r') as f:
                self.taskbook_matches = json.load(f)
                
            logger.info("✅ Successfully loaded all NASA integration data")
            
        except Exception as e:
            logger.error(f"❌ Failed to load integration data: {e}")
            # Initialize empty data structures if loading fails
            self.integration_data = {"publication_integrations": [], "coverage_stats": {}}
            self.challenge_summary = {}
            self.osdr_matches = []
            self.taskbook_matches = []
    
    def get_total_publications(self) -> int:
        """Get total number of integrated publications."""
        return self.integration_data.get('total_publications_processed', 0)
    
    def get_challenge_summary(self) -> Dict[str, Any]:
        """Get comprehensive challenge integration summary."""
        return self.challenge_summary
    
    def get_publications_with_resources(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Get publications with their related NASA resources."""
        all_integrations = self.integration_data.get('publication_integrations', [])
        
        # Apply pagination
        start_idx = offset
        end_idx = min(offset + limit, len(all_integrations))
        paginated_integrations = all_integrations[start_idx:end_idx]
        
        return {
            'total_count': len(all_integrations),
            'returned_count': len(paginated_integrations),
            'offset': offset,
            'limit': limit,
            'publications': paginated_integrations
        }
    
    def search_publications_by_keyword(self, keywords: List[str], limit: int = 10) -> List[Dict[str, Any]]:
        """Search publications by keywords and return with matched resources."""
        if not keywords:
            return []
        
        keyword_lower = [k.lower() for k in keywords]
        matches = []
        
        for integration in self.integration_data.get('publication_integrations', []):
            pub_keywords = [k.lower() for k in integration.get('publication_keywords', [])]
            title_lower = integration.get('publication_title', '').lower()
            
            # Check for keyword matches in title or keywords
            match_score = 0
            for keyword in keyword_lower:
                if keyword in title_lower:
                    match_score += 2  # Title match worth more
                if any(keyword in pk for pk in pub_keywords):
                    match_score += 1
            
            if match_score > 0:
                integration['match_score'] = match_score
                matches.append(integration)
        
        # Sort by match score and return top results
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        return matches[:limit]
    
    def get_osdr_studies_summary(self) -> Dict[str, Any]:
        """Get OSDR studies summary with statistics."""
        total_matches = len(self.osdr_matches)
        total_studies = sum(len(match['osdr_studies']) for match in self.osdr_matches)
        
        # Get unique organisms and platforms
        organisms = set()
        platforms = set()
        data_types = set()
        
        for match in self.osdr_matches:
            for study in match['osdr_studies']:
                organisms.add(study.get('organism', 'Unknown'))
                platforms.add(study.get('platform', 'Unknown'))
                data_types.update(study.get('data_types', []))
        
        return {
            'total_publications_with_matches': total_matches,
            'total_osdr_studies': total_studies,
            'unique_organisms': list(organisms),
            'unique_platforms': list(platforms),
            'available_data_types': list(data_types),
            'recent_matches': self.osdr_matches[:5]  # Top 5 recent matches
        }
    
    def get_taskbook_funding_summary(self) -> Dict[str, Any]:
        """Get Task Book funding summary with statistics."""
        total_matches = len(self.taskbook_matches)
        total_projects = sum(len(match['funded_research']) for match in self.taskbook_matches)
        
        # Calculate funding statistics
        total_funding = 0
        active_projects = 0
        completed_projects = 0
        institutions = set()
        
        for match in self.taskbook_matches:
            for project in match['funded_research']:
                total_funding += project.get('funding_amount', 0)
                institutions.add(project.get('institution', 'Unknown'))
                status = project.get('status', '').lower()
                if 'active' in status:
                    active_projects += 1
                elif 'complete' in status:
                    completed_projects += 1
        
        return {
            'total_publications_with_funding': total_matches,
            'total_funded_projects': total_projects,
            'total_funding_amount': total_funding,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'participating_institutions': list(institutions),
            'average_funding_per_project': total_funding / total_projects if total_projects > 0 else 0,
            'recent_funding': self.taskbook_matches[:5]  # Top 5 recent funding matches
        }
    
    def get_publication_by_id(self, pub_id: int) -> Optional[Dict[str, Any]]:
        """Get specific publication and its resources by ID."""
        for integration in self.integration_data.get('publication_integrations', []):
            if integration.get('publication_id') == pub_id:
                return integration
        return None
    
    def get_research_trends_analysis(self) -> Dict[str, Any]:
        """Analyze research trends from integrated publications."""
        all_keywords = []
        organism_counts = {}
        platform_counts = {}
        yearly_projects = {}
        
        for integration in self.integration_data.get('publication_integrations', []):
            # Collect keywords
            all_keywords.extend(integration.get('publication_keywords', []))
            
            # Count organisms from OSDR studies
            for study in integration.get('osdr_studies', []):
                organism = study.get('organism', 'Unknown')
                organism_counts[organism] = organism_counts.get(organism, 0) + 1
                
                platform = study.get('platform', 'Unknown')
                platform_counts[platform] = platform_counts.get(platform, 0) + 1
            
            # Extract project years from Task Book
            for project in integration.get('funded_research', []):
                start_date = project.get('start_date', '')
                if start_date:
                    year = start_date.split('-')[0]
                    yearly_projects[year] = yearly_projects.get(year, 0) + 1
        
        # Count keyword frequency
        keyword_counts = {}
        for keyword in all_keywords:
            keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
        
        # Get top trends
        top_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:15]
        top_organisms = sorted(organism_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        top_platforms = sorted(platform_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'top_research_keywords': dict(top_keywords),
            'most_studied_organisms': dict(top_organisms),
            'popular_platforms': dict(top_platforms),
            'project_timeline': yearly_projects,
            'total_unique_keywords': len(keyword_counts),
            'analysis_date': datetime.now().isoformat()
        }
    
    def get_cross_reference_stats(self) -> Dict[str, Any]:
        """Get cross-referencing statistics between NASA resources."""
        coverage_stats = self.integration_data.get('coverage_stats', {})
        
        return {
            'publications_processed': self.get_total_publications(),
            'osdr_coverage': {
                'publications_with_matches': coverage_stats.get('publications_with_osdr_matches', 0),
                'total_studies_found': coverage_stats.get('total_osdr_studies_found', 0),
                'coverage_percentage': (coverage_stats.get('publications_with_osdr_matches', 0) / self.get_total_publications() * 100) if self.get_total_publications() > 0 else 0
            },
            'taskbook_coverage': {
                'publications_with_matches': coverage_stats.get('publications_with_taskbook_matches', 0),
                'total_projects_found': coverage_stats.get('total_taskbook_projects_found', 0),
                'coverage_percentage': (coverage_stats.get('publications_with_taskbook_matches', 0) / self.get_total_publications() * 100) if self.get_total_publications() > 0 else 0
            },
            'overall_metrics': {
                'average_resources_per_publication': coverage_stats.get('average_resources_per_publication', 0),
                'total_cross_references': coverage_stats.get('total_osdr_studies_found', 0) + coverage_stats.get('total_taskbook_projects_found', 0)
            },
            'integration_date': self.integration_data.get('integration_date'),
            'data_quality_score': min(95.0, coverage_stats.get('coverage_percentage', 0))  # Cap at 95%
        }

# Global instance
nasa_data_service = NASADataService()