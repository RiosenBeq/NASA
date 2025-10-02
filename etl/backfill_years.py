import os
import re
import time
import json
import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
NCBI_API_KEY = os.getenv("NCBI_API_KEY")  # optional

ESUMMARY_PMID = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
ELINK_PMC2PMID = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi"


def extract_ids_from_url(url: str):
    if not url:
        return None, None
    pmcid = None
    pmid = None
    m = re.search(r"PMC(\d+)", url)
    if m:
        pmcid = m.group(1)
    m2 = re.search(r"PMID[:\s]?([0-9]+)", url, re.I)
    if m2:
        pmid = m2.group(1)
    # also try typical query params
    m3 = re.search(r"pmid=(\d+)", url, re.I)
    if m3:
        pmid = m3.group(1)
    return pmcid, pmid


def fetch_year_by_pmid(pmid: str):
    params = {
        "db": "pubmed",
        "retmode": "json",
        "id": pmid,
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY
    r = requests.get(ESUMMARY_PMID, params=params, timeout=15)
    r.raise_for_status()
    js = r.json()
    try:
        rec = js["result"][pmid]
        # Prefer pubdate or epublish date
        date = rec.get("pubdate") or rec.get("epubdate") or rec.get("sortpubdate")
        if date:
            y = int(str(date)[:4])
            return y
    except Exception:
        pass
    return None


def fetch_pmid_from_pmcid(pmcid_numeric: str):
    pmcid_full = f"PMC{pmcid_numeric}"
    params = {
        "dbfrom": "pmc",
        "db": "pubmed",
        "id": pmcid_full,
        "retmode": "json",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY
    r = requests.get(ELINK_PMC2PMID, params=params, timeout=15)
    r.raise_for_status()
    js = r.json()
    try:
        linksets = js.get("linksets", [])
        if linksets:
            ids = linksets[0].get("linksetdbs", [])[0].get("links", [])
            if ids:
                return str(ids[0])
    except Exception:
        pass
    return None


def backfill_years(limit: int = 500):
    updated = 0
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, url
                FROM biosci.publications
                WHERE (year IS NULL OR year = 0)
                ORDER BY id
                LIMIT %s
                """,
                (limit,),
            )
            rows = cur.fetchall()
    for pid, url in rows:
        pmcid, pmid = extract_ids_from_url(url or "")
        year = None
        if not pmid and pmcid:
            try:
                pmid = fetch_pmid_from_pmcid(pmcid)
            except Exception:
                pmid = None
        if pmid:
            try:
                year = fetch_year_by_pmid(pmid)
            except Exception:
                year = None
        if year:
            with psycopg2.connect(DB_URL) as conn:
                with conn.cursor() as cur:
                    cur.execute("UPDATE biosci.publications SET year=%s WHERE id=%s", (int(year), int(pid)))
                    conn.commit()
            updated += 1
            print(f"[YEAR] id={pid} <- {year}")
        time.sleep(0.2)
    print(f"[YEAR] Updated {updated} rows")


if __name__ == "__main__":
    backfill_years(limit=2000)


