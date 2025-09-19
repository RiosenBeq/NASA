import json
import os
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException


def _project_root() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _kg_dir() -> str:
    return os.path.join(_project_root(), "data", "kg")


def _load_json(path: str) -> Any:
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


router = APIRouter(prefix="/kg", tags=["kg"])


@router.get("/nodes", response_model=List[Dict])
def get_nodes() -> List[Dict]:
    path = os.path.join(_kg_dir(), "nodes.json")
    print(f"[KG] /kg/nodes -> {path}")
    try:
        data = _load_json(path)
        if not isinstance(data, list):
            raise ValueError("nodes.json must be a JSON array")
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="nodes.json not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load nodes: {e}")


@router.get("/edges", response_model=List[Dict])
def get_edges() -> List[Dict]:
    path = os.path.join(_kg_dir(), "edges.json")
    print(f"[KG] /kg/edges -> {path}")
    try:
        data = _load_json(path)
        if not isinstance(data, list):
            raise ValueError("edges.json must be a JSON array")
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="edges.json not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load edges: {e}")


# Note: CORS should be configured in the main FastAPI app where this router is included.
# The router is intentionally lightweight and modular so it can be composed
# with search/summarize endpoints and cross-linked to KG nodes in the future.


