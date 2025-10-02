import os
import time
from typing import List, Tuple
import psycopg2
import requests
from bs4 import BeautifulSoup

DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
HEADERS = {"User-Agent": "NASA-2025-Challenge/abstract-fetcher"}


def fetch_urls(limit: int = 100000) -> List[Tuple[int, str]]:
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, url FROM biosci.publications WHERE COALESCE(url,'')<>'' ORDER BY id LIMIT %s",
                (limit,),
            )
            return cur.fetchall()


def extract_abstract(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    # PubMed Central sayfalarında abstract genellikle class="t sec" id="abstract" vb.
    # Daha güvenli: h2/h3 'Abstract' başlığını takip eden paragraf(lar)
    heading = soup.find(lambda tag: tag.name in ["h2", "h3"] and "abstract" in tag.get_text(strip=True).lower())
    if heading:
        parts = []
        for sib in heading.find_all_next():
            if sib.name in ["h2", "h3"]:
                break
            if sib.name in ["p", "div"]:
                txt = sib.get_text(" ", strip=True)
                if txt:
                    parts.append(txt)
        return "\n".join(parts[:8])  # ilk birkaç paragraf
    # fallback: meta name="dc.Description"
    meta = soup.find("meta", attrs={"name": "dc.Description"})
    if meta and meta.get("content"):
        return meta["content"]
    return ""


def upsert_abstracts(rows: List[Tuple[int, str]]):
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            for pid, txt in rows:
                cur.execute(
                    """
                    INSERT INTO biosci.abstracts (publication_id, abstract_text)
                    VALUES (%s, %s)
                    ON CONFLICT (publication_id) DO UPDATE SET abstract_text=EXCLUDED.abstract_text
                    """,
                    (pid, txt),
                )
        conn.commit()


def main():
    urls = fetch_urls()
    batch: List[Tuple[int, str]] = []
    for i, (pid, url) in enumerate(urls, start=1):
        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            if r.status_code == 200:
                abs_txt = extract_abstract(r.text)
                if abs_txt:
                    batch.append((pid, abs_txt))
            else:
                print(f"WARN {pid} status={r.status_code} {url}")
        except Exception as e:
            print(f"ERR {pid} {e}")
        if len(batch) >= 50:
            upsert_abstracts(batch)
            print(f"Kaydedildi: {i}")
            batch.clear()
        time.sleep(0.2)
    if batch:
        upsert_abstracts(batch)
        print("Tamamlandi")


if __name__ == "__main__":
    main()
