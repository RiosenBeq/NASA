import os
import csv
import sys
import requests

CSV_URL = "https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publication_PMC.csv"
OUT_PATH = os.path.expanduser("/Users/okanberkmanavoglu/NASA/data/sb_publications_pmc.csv")


def download_csv(url: str = CSV_URL, out_path: str = OUT_PATH) -> None:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    with open(out_path, "wb") as f:
        f.write(resp.content)
    print(f"CSV saved: {out_path} ({len(resp.content)} bytes)")


def head_count(path: str = OUT_PATH) -> int:
    if not os.path.exists(path):
        return 0
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return sum(1 for _ in reader)


if __name__ == "__main__":
    try:
        download_csv()
        rows = head_count()
        print(f"Rows: {rows}")
        sys.exit(0)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
