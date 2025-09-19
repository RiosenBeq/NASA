import os
from typing import Iterable, Optional, Tuple
import psycopg2
import psycopg2.extras


def get_db_url() -> str:
    url = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
    return url


def get_conn():
    return psycopg2.connect(get_db_url())


def ensure_tables():
    # Tablolar init.sql ile yaratildi; burada sadece baglanti testi yapabiliriz.
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")


def upsert_publications(rows: Iterable[Tuple[Optional[str], Optional[int], Optional[str], Optional[str], Optional[str], str]]):
    sql = (
        "INSERT INTO biosci.publications (title, year, doi, pmid, url, source) "
        "VALUES %s "
        "ON CONFLICT DO NOTHING"
    )
    with get_conn() as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                sql,
                rows,
                template="(%s,%s,%s,%s,%s,%s)",
                page_size=1000,
            )
