import os
import sys
import psycopg2
from sentence_transformers import SentenceTransformer

DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")


def main():
    if len(sys.argv) < 2:
        print("Kullanim: python search_cli.py \"sorgu\" [k=5]")
        sys.exit(1)
    query = sys.argv[1]
    k = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    model = SentenceTransformer(MODEL_NAME)
    q_emb = model.encode([query], normalize_embeddings=True)[0].tolist()

    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT p.id, p.title, 1 - (e.embedding <=> %s::vector) AS score
                FROM biosci.pub_title_embeddings e
                JOIN biosci.publications p ON p.id = e.publication_id
                ORDER BY e.embedding <=> %s::vector
                LIMIT %s
                """,
                (q_emb, q_emb, k),
            )
            rows = cur.fetchall()
            for pid, title, score in rows:
                print(f"{score:.3f}\t[{pid}] {title}")


if __name__ == "__main__":
    main()
