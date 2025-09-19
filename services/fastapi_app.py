"""Knowledge Graph API Router for NASA Space Bio Explorer."""

import json
import os
from typing import Any, Dict, List, Optional
from functools import lru_cache
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Configure logging
logger = logging.getLogger(__name__)

class KGNode(BaseModel):
    """Knowledge Graph Node model."""
    id: str
    type: str
    label: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class KGEdge(BaseModel):
    """Knowledge Graph Edge model."""
    source: str
    target: str
    relation: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class KGStats(BaseModel):
    """Knowledge Graph statistics."""
    node_count: int
    edge_count: int
    node_types: Dict[str, int]
    edge_relations: Dict[str, int]

def _project_root() -> str:
    """Get project root directory."""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def _kg_dir() -> str:
    """Get knowledge graph data directory."""
    return os.path.join(_project_root(), "data", "kg")

@lru_cache(maxsize=1)
def _load_json(path: str) -> Any:
    """Load JSON file with caching."""
    if not os.path.isfile(path):
        raise FileNotFoundError(f"File not found: {path}")
    
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        logger.info(f"Loaded JSON file: {path}")
        return data
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {path}: {e}")
        raise ValueError(f"Invalid JSON format in {path}")
    except Exception as e:
        logger.error(f"Error loading {path}: {e}")
        raise


# Create router
router = APIRouter(
    prefix="/kg",
    tags=["Knowledge Graph"],
    responses={
        404: {"description": "Knowledge graph data not found"},
        500: {"description": "Internal server error"}
    }
)

@router.get(
    "/nodes",
    response_model=List[Dict],
    summary="Get knowledge graph nodes",
    description="Retrieve all nodes from the knowledge graph"
)
def get_nodes() -> List[Dict]:
    """Get all knowledge graph nodes."""
    path = os.path.join(_kg_dir(), "nodes.json")
    logger.info(f"Loading KG nodes from: {path}")
    
    try:
        data = _load_json(path)
        
        if not isinstance(data, list):
            raise ValueError("nodes.json must contain a JSON array")
        
        # Validate node structure (basic)
        for i, node in enumerate(data[:5]):  # Check first 5 for performance
            if not isinstance(node, dict):
                raise ValueError(f"Node {i} is not a valid object")
        
        logger.info(f"Successfully loaded {len(data)} nodes")
        return data
        
    except FileNotFoundError:
        logger.error(f"Nodes file not found: {path}")
        raise HTTPException(status_code=404, detail="Knowledge graph nodes not found")
    except ValueError as e:
        logger.error(f"Invalid nodes data format: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to load nodes: {e}")
        raise HTTPException(status_code=500, detail="Failed to load knowledge graph nodes")

@router.get(
    "/edges",
    response_model=List[Dict],
    summary="Get knowledge graph edges",
    description="Retrieve all edges from the knowledge graph"
)
def get_edges() -> List[Dict]:
    """Get all knowledge graph edges."""
    path = os.path.join(_kg_dir(), "edges.json")
    logger.info(f"Loading KG edges from: {path}")
    
    try:
        data = _load_json(path)
        
        if not isinstance(data, list):
            raise ValueError("edges.json must contain a JSON array")
        
        # Validate edge structure (basic)
        for i, edge in enumerate(data[:5]):  # Check first 5 for performance
            if not isinstance(edge, dict):
                raise ValueError(f"Edge {i} is not a valid object")
        
        logger.info(f"Successfully loaded {len(data)} edges")
        return data
        
    except FileNotFoundError:
        logger.error(f"Edges file not found: {path}")
        raise HTTPException(status_code=404, detail="Knowledge graph edges not found")
    except ValueError as e:
        logger.error(f"Invalid edges data format: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to load edges: {e}")
        raise HTTPException(status_code=500, detail="Failed to load knowledge graph edges")

@router.get(
    "/stats",
    response_model=KGStats,
    summary="Get knowledge graph statistics",
    description="Get summary statistics about the knowledge graph"
)
def get_kg_stats() -> KGStats:
    """Get knowledge graph statistics."""
    nodes_path = os.path.join(_kg_dir(), "nodes.json")
    edges_path = os.path.join(_kg_dir(), "edges.json")
    
    logger.info(f"Calculating KG stats from: {nodes_path}, {edges_path}")
    
    try:
        stats = KGStats(
            node_count=0,
            edge_count=0,
            node_types={},
            edge_relations={}
        )
        
        # Process nodes
        if os.path.isfile(nodes_path):
            try:
                nodes = _load_json(nodes_path)
                stats.node_count = len(nodes)
                
                for node in nodes:
                    node_type = node.get("type", "Unknown")
                    stats.node_types[node_type] = stats.node_types.get(node_type, 0) + 1
            except Exception as e:
                logger.warning(f"Could not process nodes for stats: {e}")
        
        # Process edges
        if os.path.isfile(edges_path):
            try:
                edges = _load_json(edges_path)
                stats.edge_count = len(edges)
                
                for edge in edges:
                    relation = edge.get("relation", "related_to")
                    stats.edge_relations[relation] = stats.edge_relations.get(relation, 0) + 1
            except Exception as e:
                logger.warning(f"Could not process edges for stats: {e}")
        
        logger.info(f"KG stats calculated: {stats.node_count} nodes, {stats.edge_count} edges")
        return stats
        
    except Exception as e:
        logger.error(f"Failed to calculate KG stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate knowledge graph statistics")


# Note: CORS should be configured in the main FastAPI app where this router is included.
# The router is intentionally lightweight and modular so it can be composed
# with search/summarize endpoints and cross-linked to KG nodes in the future.


