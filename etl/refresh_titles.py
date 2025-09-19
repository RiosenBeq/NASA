from ingest_csv import read_csv_rows
from db_utils import get_conn


def main():
    rows = list(read_csv_rows())
    with get_conn() as conn:
        with conn.cursor() as cur:
            for r in rows:
                if not r.url:
                    continue
                cur.execute(
                    """
                    INSERT INTO biosci.publications (title, year, doi, pmid, url, source)
                    VALUES (%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (url) DO UPDATE SET title=EXCLUDED.title
                    """,
                    (r.title, r.year, r.doi, r.pmid, r.url, r.source),
                )
        conn.commit()
    print(f"Guncelleme tamamlandi: {len(rows)} satir isleme alindi")


if __name__ == "__main__":
    main()
