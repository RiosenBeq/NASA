from fastapi import FastAPI, Query
import json
import csv
from pydantic import BaseModel
import os
import psycopg2
from sentence_transformers import SentenceTransformer
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from dotenv import load_dotenv

# .env dosyasini yukle
load_dotenv()

app = FastAPI()
DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
_model = None

# CORS
allow_origins_env = os.getenv("ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://0.0.0.0:3000")
if allow_origins_env.strip() == "*":
    cors_kwargs = dict(allow_origins=["*"])
else:
    cors_kwargs = dict(allow_origins=[o.strip() for o in allow_origins_env.split(",") if o.strip()])
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    **cors_kwargs,
)

# Serve Knowledge Graph JSON directory as static (separate mount to avoid clashing with /kg API)
_proj_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_kg_dir = os.path.join(_proj_root, "data", "kg")
if os.path.isdir(_kg_dir):
    app.mount("/kg_static", StaticFiles(directory=_kg_dir), name="kg_static")

# Programmatic KG endpoints (simple file readers)
@app.get("/kg/nodes")
def kg_nodes():
    path = os.path.join(_kg_dir, "nodes.json")
    print(f"[KG] /kg/nodes -> {path}")
    if not os.path.isfile(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/kg/edges")
def kg_edges():
    path = os.path.join(_kg_dir, "edges.json")
    print(f"[KG] /kg/edges -> {path}")
    if not os.path.isfile(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/kg/stats")
def kg_stats():
    nodes_path = os.path.join(_kg_dir, "nodes.json")
    edges_path = os.path.join(_kg_dir, "edges.json")
    print(f"[KG] /kg/stats -> {nodes_path} , {edges_path}")
    stats = {"node_types": {}, "edge_relations": {}, "node_count": 0, "edge_count": 0}
    try:
        if os.path.isfile(nodes_path):
            nodes = json.load(open(nodes_path, "r", encoding="utf-8"))
            stats["node_count"] = len(nodes)
            for n in nodes:
                t = (n.get("type") or "Unknown")
                stats["node_types"][t] = stats["node_types"].get(t, 0) + 1
        if os.path.isfile(edges_path):
            edges = json.load(open(edges_path, "r", encoding="utf-8"))
            stats["edge_count"] = len(edges)
            for e in edges:
                r = (e.get("relation") or "related_to")
                stats["edge_relations"][r] = stats["edge_relations"].get(r, 0) + 1
    except Exception as e:
        return {"error": str(e), **stats}
    return stats


class SearchItem(BaseModel):
    id: int
    title: str
    url: str
    score: float
    snippet: Optional[str] = None


class SummaryRequest(BaseModel):
    ids: List[int]
    persona: Optional[str] = None  # scientist | manager | architect
    section_priority: Optional[str] = None  # results | discussion | conclusion


class SummaryResponse(BaseModel):
    summary: str
    citations: List[str]
    titles: List[str]


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


@app.get("/health")
def health():
    return {"status": "ok", "openai": bool(OPENAI_API_KEY)}


@app.get("/search", response_model=List[SearchItem])
def search(
    q: str = Query(..., min_length=2),
    k: int = 10,
    year_min: Optional[int] = Query(None),
    year_max: Optional[int] = Query(None),
    organism: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
):
    model = get_model()
    q_emb = model.encode([q], normalize_embeddings=True)[0].tolist()
    items: List[SearchItem] = []
    with psycopg2.connect(DB_URL) as conn:
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
    return items


@app.post("/summarize", response_model=SummaryResponse)
def summarize(req: SummaryRequest):
    client = None
    if OPENAI_API_KEY:
        client = OpenAI(api_key=OPENAI_API_KEY)
    docs = []
    citations = []
    titles: List[str] = []
    with psycopg2.connect(DB_URL) as conn:
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
    return SummaryResponse(summary=msg.choices[0].message.content or "", citations=citations, titles=titles)


class QARequest(BaseModel):
    id: int
    question: str
    persona: Optional[str] = None

class QAResponse(BaseModel):
    answer: str
    citations: List[str]


@app.post("/qa", response_model=QAResponse)
def qa(req: QARequest):
    client = None
    if OPENAI_API_KEY:
        client = OpenAI(api_key=OPENAI_API_KEY)
    with psycopg2.connect(DB_URL) as conn:
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
    return QAResponse(answer=answer, citations=[url] if url else [])

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
