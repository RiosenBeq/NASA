import csv
import os
from dataclasses import dataclass
from typing import Iterator, Optional

CSV_PATH = os.path.expanduser("/Users/okanberkmanavoglu/NASA/data/SB_publications/SB_publication_PMC.csv")


@dataclass
class PublicationRow:
    title: str
    year: Optional[int]
    doi: Optional[str]
    pmid: Optional[str]
    url: Optional[str]
    source: str = "SB_publications"


def _clean_key(k: str) -> str:
    return k.replace("\ufeff", "").strip().lower()


def read_csv_rows(csv_path: str = CSV_PATH) -> Iterator[PublicationRow]:
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            norm = {_clean_key(k): v for k, v in row.items()}
            title = norm.get("title") or ""
            year_raw = norm.get("year")
            year = int(year_raw) if year_raw and str(year_raw).isdigit() else None
            doi = norm.get("doi")
            pmid = norm.get("pmid")
            url = norm.get("url") or norm.get("link")
            yield PublicationRow(title=title, year=year, doi=doi, pmid=pmid, url=url)


def main():
    count = 0
    first = None
    for r in read_csv_rows():
        if first is None:
            first = r
        count += 1
    print(f"Read {count} rows from CSV: {CSV_PATH}")
    if first:
        print(f"Example: title='{first.title[:60]}', url='{first.url}'")


if __name__ == "__main__":
    main()

