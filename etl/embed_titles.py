import os
from typing import List, Tuple
import psycopg2
import psycopg2.extras
from sentence_transformers import SentenceTransformer

DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")


def fetch_titles(limit: int = 100000) -> List[Tuple[int, str]]:
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, COALESCE(title,'') FROM biosci.publications ORDER BY id LIMIT %s", (limit,))
            return cur.fetchall()


def ensure_embedding_table(dim: int):
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS biosci.pub_title_embeddings (
                  publication_id INT PRIMARY KEY REFERENCES biosci.publications(id) ON DELETE CASCADE,
                  model TEXT NOT NULL,
                  embedding VECTOR(%s)
                )
                """,
                (dim,),
            )
            conn.commit()


def upsert_embeddings(rows: List[Tuple[int, List[float]]], model: str):
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO biosci.pub_title_embeddings (publication_id, model, embedding)
                VALUES %s
                ON CONFLICT (publication_id) DO UPDATE SET model=EXCLUDED.model, embedding=EXCLUDED.embedding
                """,
                [(pid, model, emb) for pid, emb in rows],
                template="(%s,%s,%s)",
                page_size=500,
            )
            conn.commit()


def main():
    model = SentenceTransformer(MODEL_NAME)
    dim = model.get_sentence_embedding_dimension()
    ensure_embedding_table(dim)

    data = fetch_titles()
    texts = [t for _, t in data]
    embs = model.encode(texts, batch_size=64, show_progress_bar=True, normalize_embeddings=True)
    rows = [(pid, emb.tolist()) for (pid, _), emb in zip(data, embs)]
    upsert_embeddings(rows, MODEL_NAME)
    print(f"Yazilan embedding sayisi: {len(rows)} (dim={dim})")


if __name__ == "__main__":
    main()
