from ingest_csv import read_csv_rows
from db_utils import upsert_publications, ensure_tables


def main():
    ensure_tables()
    batch = []
    for i, row in enumerate(read_csv_rows()):
        batch.append((row.title, row.year, row.doi, row.pmid, row.url, row.source))
        if len(batch) >= 100:
            upsert_publications(batch)
            print(f"Yazildi: {i+1}")
            batch.clear()
    if batch:
        upsert_publications(batch)
        print(f"Yazildi: toplam tamamladi")


if __name__ == "__main__":
    main()
