import os
import psycopg2
import psycopg2.extras
from sentence_transformers import SentenceTransformer

DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")


def fetch_abstracts(limit: int = 100000):
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT publication_id, abstract_text FROM biosci.abstracts WHERE abstract_text IS NOT NULL ORDER BY publication_id LIMIT %s",
                (limit,),
            )
            return cur.fetchall()


def upsert_embeddings(rows):
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO biosci.abstract_embeddings (publication_id, model, embedding)
                VALUES %s
                ON CONFLICT (publication_id) DO UPDATE SET model=EXCLUDED.model, embedding=EXCLUDED.embedding
                """,
                rows,
                template="(%s,%s,%s)",
                page_size=300,
            )
            conn.commit()


def main():
    model = SentenceTransformer(MODEL_NAME)
    dim = model.get_sentence_embedding_dimension()
    # Tablo boyutu 384 olarak yaratildi; farkli model kullanilacaksa tabloyu ayarlayin
    if dim != 384:
        print(f"Uyari: Model embedding boyutu {dim}, tablo 384 bekliyor")
    data = fetch_abstracts()
    texts = [t for _, t in data]
    embs = model.encode(texts, batch_size=64, show_progress_bar=True, normalize_embeddings=True)
    rows = [(pid, MODEL_NAME, emb.tolist()) for (pid, _), emb in zip(data, embs)]
    upsert_embeddings(rows)
    print(f"Abstract embeddings yazildi: {len(rows)}")


if __name__ == "__main__":
    main()
