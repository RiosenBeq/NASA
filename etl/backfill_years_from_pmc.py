import os
import re
import time
import psycopg2
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; NASA-KG/1.0)"}


def extract_year_from_html(html: str):
    soup = BeautifulSoup(html, "html.parser")
    # Try meta tags first
    for name in ("citation_year", "dc.Date", "prism.publicationDate"):
        tag = soup.find("meta", attrs={"name": name})
        if tag and tag.get("content"):
            try:
                return int(tag["content"][:4])
            except Exception:
                pass
    # Try visible publication date text
    text = soup.get_text(" ", strip=True)
    m = re.search(r"(19|20)\d{2}", text)
    if m:
        try:
            return int(m.group(0))
        except Exception:
            return None
    return None


def backfill(limit: int = 300):
    updated = 0
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, url
                FROM biosci.publications
                WHERE (year IS NULL OR year = 0) AND url ILIKE '%%ncbi.nlm.nih.gov/pmc%%'
                ORDER BY id
                LIMIT %s
                """,
                (limit,),
            )
            rows = cur.fetchall()
    for pid, url in rows:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=20)
            if resp.status_code == 200 and resp.text:
                y = extract_year_from_html(resp.text)
                if y and 1900 <= y <= 2100:
                    with psycopg2.connect(DB_URL) as conn:
                        with conn.cursor() as cur:
                            cur.execute("UPDATE biosci.publications SET year=%s WHERE id=%s", (int(y), int(pid)))
                            conn.commit()
                    updated += 1
                    print(f"[PMC YEAR] id={pid} <- {y}")
        except Exception as e:
            print(f"[PMC YEAR] id={pid} error: {e}")
        time.sleep(0.2)
    print(f"[PMC YEAR] Updated {updated} rows")


if __name__ == "__main__":
    backfill(limit=2000)


