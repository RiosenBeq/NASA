from fastapi import FastAPI, Query, HTTPException
import json
import csv
from pydantic import BaseModel, Field
import os
import psycopg2
from psycopg2 import pool
from sentence_transformers import SentenceTransformer
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from dotenv import load_dotenv
import logging
from contextlib import contextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="NASA Space Bio Explorer API",
    description="Semantic search and AI-powered summarization for NASA space bioscience publications",
    version="1.0.0"
)

# Configuration
DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Global variables
_model = None
_db_pool = None

# Initialize database connection pool
def init_db_pool():
    """Initialize database connection pool."""
    global _db_pool
    try:
        _db_pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DB_URL
        )
        logger.info("✅ Database connection pool initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database pool: {e}")
        raise

@contextmanager
def get_db_connection():
    """Get database connection from pool."""
    if _db_pool is None:
        init_db_pool()
    
    conn = _db_pool.getconn()
    try:
        yield conn
    finally:
        _db_pool.putconn(conn)

# CORS - Secure configuration
allow_origins_env = os.getenv("ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://nasa-space-bio.vercel.app")

# Parse origins and validate
if allow_origins_env.strip() == "*":
    # Only allow wildcard in development
    if os.getenv("ENVIRONMENT") == "development":
        cors_kwargs = dict(allow_origins=["*"])
    else:
        # Default to secure origins in production
        cors_kwargs = dict(allow_origins=["https://nasa-space-bio.vercel.app", "http://localhost:3000"])
else:
    origins = [o.strip() for o in allow_origins_env.split(",") if o.strip()]
    cors_kwargs = dict(allow_origins=origins)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    **cors_kwargs,
)

# Include additional routers
try:
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    
    # Knowledge Graph router
    from fastapi_app import router as kg_router
    app.include_router(kg_router)
    logger.info("✅ Knowledge Graph router included")
    
    # Scientific Analysis router
    from analysis_router import router as analysis_router
    app.include_router(analysis_router)
    logger.info("✅ Scientific Analysis router included")
    
    # NASA Resources router
    from nasa_resources import router as resources_router
    app.include_router(resources_router)
    logger.info("✅ NASA Resources router included")
    
except ImportError as e:
    logger.warning(f"⚠️ Could not import additional routers: {e}")

# Serve Knowledge Graph JSON directory as static (separate mount to avoid clashing with /kg API)
_proj_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_kg_dir = os.path.join(_proj_root, "data", "kg")
if os.path.isdir(_kg_dir):
    app.mount("/kg_static", StaticFiles(directory=_kg_dir), name="kg_static")


class SearchItem(BaseModel):
    id: int
    title: str
    url: str
    score: float = Field(..., ge=0, le=1, description="Similarity score between 0 and 1")
    snippet: Optional[str] = Field(None, max_length=500, description="Text snippet from abstract")


class SummaryRequest(BaseModel):
    ids: List[int]
    persona: Optional[str] = None  # scientist | manager | architect
    section_priority: Optional[str] = None  # results | discussion | conclusion


class SummaryResponse(BaseModel):
    summary: str
    citations: List[str]
    titles: List[str]


def get_model():
    """Get or initialize the sentence transformer model with caching."""
    global _model
    if _model is None:
        try:
            logger.info(f"🔄 Loading model: {MODEL_NAME}")
            _model = SentenceTransformer(MODEL_NAME)
            logger.info(f"✅ Model loaded successfully: {MODEL_NAME}")
        except Exception as e:
            logger.error(f"❌ Failed to load model {MODEL_NAME}: {e}")
            raise HTTPException(status_code=500, detail=f"Model loading failed: {e}")
    return _model

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup."""
    try:
        # Initialize database pool
        init_db_pool()
        
        # Pre-load model
        get_model()
        
        logger.info("🚀 API startup completed successfully")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown."""
    global _db_pool
    if _db_pool:
        _db_pool.closeall()
        logger.info("✅ Database pool closed")


@app.get("/health")
def health():
    return {"status": "ok", "openai": bool(OPENAI_API_KEY)}


@app.get("/search", response_model=List[SearchItem])
def search(
    q: str = Query(..., min_length=2, max_length=200, description="Search query"),
    k: int = Query(10, ge=1, le=50, description="Number of results to return"),
    year_min: Optional[int] = Query(None, ge=1950, le=2030),
    year_max: Optional[int] = Query(None, ge=1950, le=2030),
    organism: Optional[str] = Query(None, max_length=50),
    platform: Optional[str] = Query(None, max_length=50),
):
    try:
        # Input validation
        if year_min and year_max and year_min > year_max:
            raise HTTPException(status_code=400, detail="year_min cannot be greater than year_max")
        
        model = get_model()
        q_emb = model.encode([q], normalize_embeddings=True)[0].tolist()
        items: List[SearchItem] = []
        
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                """
                WITH title_hits AS (
                  SELECT p.id, p.title, p.url, 1 - (t.embedding <=> %s::vector) AS score
                  FROM biosci.pub_title_embeddings t
                  JOIN biosci.publications p ON p.id = t.publication_id
                  WHERE (%s IS NULL OR p.year >= %s)
                    AND (%s IS NULL OR p.year <= %s)
                    AND (
                          %s IS NULL OR EXISTS (
                            SELECT 1 FROM biosci.chunks c
                            WHERE c.publication_id = p.id AND c.organism ILIKE %s
                          )
                        )
                    AND (
                          %s IS NULL OR EXISTS (
                            SELECT 1 FROM biosci.chunks c2
                            WHERE c2.publication_id = p.id AND c2.platform ILIKE %s
                          )
                        )
                  ORDER BY t.embedding <=> %s::vector
                  LIMIT %s
                ),
                abs_hits AS (
                  SELECT p.id, p.title, p.url, 1 - (a.embedding <=> %s::vector) AS score
                  FROM biosci.abstract_embeddings a
                  JOIN biosci.publications p ON p.id = a.publication_id
                  WHERE (%s IS NULL OR p.year >= %s)
                    AND (%s IS NULL OR p.year <= %s)
                    AND (
                          %s IS NULL OR EXISTS (
                            SELECT 1 FROM biosci.chunks c
                            WHERE c.publication_id = p.id AND c.organism ILIKE %s
                          )
                        )
                    AND (
                          %s IS NULL OR EXISTS (
                            SELECT 1 FROM biosci.chunks c2
                            WHERE c2.publication_id = p.id AND c2.platform ILIKE %s
                          )
                        )
                  ORDER BY a.embedding <=> %s::vector
                  LIMIT %s
                ),
                merged AS (
                  SELECT * FROM title_hits
                  UNION ALL
                  SELECT * FROM abs_hits
                )
                SELECT m.id, m.title, m.url, m.score,
                       COALESCE(SUBSTRING(a.abstract_text FOR 220), '') AS snippet
                FROM merged m
                LEFT JOIN biosci.abstracts a ON a.publication_id = m.id
                ORDER BY m.score DESC
                LIMIT %s
                """,
                (
                    q_emb,
                    year_min, year_min, year_max, year_max,
                    organism, f"%{organism}%",
                    platform, f"%{platform}%",
                    q_emb, k,
                    q_emb,
                    year_min, year_min, year_max, year_max,
                    organism, f"%{organism}%",
                    platform, f"%{platform}%",
                    q_emb, k,
                    k,
                ),
                )
                for pid, title, url, score, snippet in cur.fetchall():
                    items.append(SearchItem(id=pid, title=title or "", url=url or "", score=float(score), snippet=snippet or None))
        
        logger.info(f"Search completed: '{q}' -> {len(items)} results")
        return items
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search failed for query '{q}': {e}")
        raise HTTPException(status_code=500, detail="Search operation failed")


@app.post("/summarize", response_model=SummaryResponse)
def summarize(req: SummaryRequest):
    try:
        # Input validation
        if not req.ids or len(req.ids) == 0:
            raise HTTPException(status_code=400, detail="At least one publication ID is required")
        if len(req.ids) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 publications can be summarized at once")
        
        client = None
        if OPENAI_API_KEY:
            client = OpenAI(api_key=OPENAI_API_KEY)
        
        docs = []
        citations = []
        titles: List[str] = []
        
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT p.id, COALESCE(p.title,''), COALESCE(a.abstract_text,''), p.url FROM biosci.publications p LEFT JOIN biosci.abstracts a ON a.publication_id=p.id WHERE p.id = ANY(%s)",
                    (req.ids,),
                )
                for pid, title, abs_txt, url in cur.fetchall():
                    titles.append(title)
                    citations.append(url)
                    docs.append(f"[ID {pid}] Title: {title}\nAbstract: {abs_txt}\nURL: {url}")
        
        if not client:
            return SummaryResponse(summary="OpenAI anahtarı yok.", citations=citations, titles=titles)
            
        persona_note = {
            "scientist": "Emphasize hypotheses, methods, result robustness, conflicts/consensus.",
            "manager": "Emphasize impact, gaps, opportunities, funding relevance, readiness.",
            "architect": "Emphasize platform, exposure, risks, operational implications for missions.",
        }.get((req.persona or "").lower(), "")
        
        section_note = {
            "results": "Prefer Results over other sections.",
            "discussion": "Balance Discussion with Results; note uncertainties.",
            "conclusion": "Include forward-looking insights from Conclusions.",
        }.get((req.section_priority or "").lower(), "Prefer Results over Discussion/Conclusion.")
        
        prompt = (
            "You are an assistant summarizing NASA space bioscience studies (PubMed Central full texts). "
            f"{persona_note} "
            f"{section_note} "
            "Follow NASA guidance: prefer objectively demonstrated information from Results; identify gaps, consensus/discord; provide actionable insights. "
            "Output in the following structured bullets (concise, factual, no fluff):\n"
            "- Objective: What was studied and why.\n"
            "- Platform/Exposure: Vehicle/platform (e.g., ISS/Shuttle), exposure (microgravity, radiation, duration).\n"
            "- Organism/Tissue: Species/cell/tissue.\n"
            "- Main Results: Results-first, quantitative where possible. Cite IDs like [ID 123].\n"
            "- Consensus vs Conflict: Note agreement/disagreement across included IDs.\n"
            "- Gaps & Limitations: What is unknown or underpowered.\n"
            "- Actionable Insights: (tailor to persona) concrete next steps, investment or ops decisions.\n"
            "- Risks/Impact: Mission risk or biological impact notes (esp. for architects).\n"
            "- References: list the provided URLs.\n\n"
            + "\n\n".join(docs)
        )
        
        msg = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        
        response = SummaryResponse(
            summary=msg.choices[0].message.content or "", 
            citations=citations, 
            titles=titles
        )
        
        logger.info(f"Summarization completed for {len(req.ids)} publications")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        raise HTTPException(status_code=500, detail="Summarization operation failed")


class QARequest(BaseModel):
    id: int
    question: str
    persona: Optional[str] = None

class QAResponse(BaseModel):
    answer: str
    citations: List[str]


@app.post("/qa", response_model=QAResponse)
def qa(req: QARequest):
    try:
        # Input validation
        if not req.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        if len(req.question) > 500:
            raise HTTPException(status_code=400, detail="Question too long (max 500 characters)")
        
        client = None
        if OPENAI_API_KEY:
            client = OpenAI(api_key=OPENAI_API_KEY)
            
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT p.id, COALESCE(p.title,''), COALESCE(a.abstract_text,''), p.url
                    FROM biosci.publications p
                    LEFT JOIN biosci.abstracts a ON a.publication_id = p.id
                    WHERE p.id = %s
                    """,
                    (req.id,),
                )
                row = cur.fetchone()
                if not row:
                    return QAResponse(answer="Publication not found.", citations=[])
                pid, title, abs_txt, url = row
        
        if not client:
            return QAResponse(answer="OpenAI anahtarı yok.", citations=[url] if url else [])
            
        persona_note = {
            "scientist": "Answer like a domain expert. Provide evidence from Results.",
            "manager": "Answer with impact, opportunity, and risk in plain terms, cited.",
            "architect": "Answer with platform, exposure and operational implications, cited.",
        }.get((req.persona or "").lower(), "Provide concise, factual, cited answers.")
        
        prompt = (
            "You are assisting with NASA space bioscience Q&A. "
            f"{persona_note} "
            "Use only the provided study content. Prefer Results over other sections. "
            "If uncertain, say so explicitly. Always include short inline citations like [ID {pid}] and list the source URL.\n\n"
            f"Study [ID {pid}]\nTitle: {title}\nAbstract: {abs_txt}\nURL: {url}\n\n"
            f"Question: {req.question}\n"
            "Answer (concise bullets where possible):"
        )
        
        msg = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        
        answer = msg.choices[0].message.content or ""
        response = QAResponse(answer=answer, citations=[url] if url else [])
        
        logger.info(f"QA completed for publication {req.id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"QA failed for publication {req.id}: {e}")
        raise HTTPException(status_code=500, detail="Question answering operation failed")

@app.get("/kg/year_counts")
def kg_year_counts():
    out = {}
    # 1) Try database
    try:
        with psycopg2.connect(DB_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT year, COUNT(*) FROM biosci.publications WHERE year IS NOT NULL GROUP BY year ORDER BY year")
                rows = cur.fetchall()
                for y, c in rows:
                    out[int(y)] = int(c)
    except Exception as e:
        # proceed to fallback
        print(f"[KG] /kg/year_counts DB error: {e}")
    if out:
        return {"data": out}

    # 2) Fallback to CSV if DB empty or unavailable
    csv_path_options = [
        os.path.join(_proj_root, "data", "SB_publications_PMC.csv"),
        os.path.join(_proj_root, "data", "sb_publications_pmc.csv"),
    ]
    for csv_path in csv_path_options:
        if os.path.isfile(csv_path):
            print(f"[KG] /kg/year_counts fallback CSV -> {csv_path}")
            try:
                with open(csv_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    # try common header names
                    year_headers = ["year", "Year", "Published Year", "published_year", "PublicationYear"]
                    for row in reader:
                        year_val = None
                        for h in year_headers:
                            if h in row and row[h]:
                                year_val = row[h]
                                break
                        if not year_val:
                            continue
                        try:
                            y = int(str(year_val).strip())
                        except Exception:
                            continue
                        out[y] = out.get(y, 0) + 1
                if out:
                    return {"data": dict(sorted(out.items()))}
            except Exception as e:
                print(f"[KG] /kg/year_counts CSV error: {e}")

    # 3) Nothing found
    return {"data": out}
