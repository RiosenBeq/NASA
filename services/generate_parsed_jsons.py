import os
import json
import time
from typing import Dict, Any, Optional

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


BASE_PROMPT = (
    "You are an AI assistant for extracting structured data from NASA space biology publications.\n"
    "Convert the given publication text into a SINGLE JSON object with fields: \n"
    "- title (string)\n- abstract (string)\n- experiment (string)\n- project (string or null)\n- results (string)\n- keywords (array of up to 5 strings).\n\n"
    "Rules:\n1) Output ONLY valid JSON. No commentary.\n"
    "2) Keep concise but informative.\n3) Missing fields -> null.\n"
)


def log(msg: str) -> None:
    print(f"[PARSE] {msg}")


def get_items(limit: int = 100000):
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT p.id, COALESCE(p.title, ''), COALESCE(a.abstract_text, '')
                FROM biosci.publications p
                LEFT JOIN biosci.abstracts a ON a.publication_id = p.id
                ORDER BY p.id
                LIMIT %s
                """,
                (limit,),
            )
            return cur.fetchall()


def call_llm(prompt: str) -> Optional[Dict[str, Any]]:
    if not OPENAI_API_KEY:
        return None
    try:
        from openai import OpenAI

        client = OpenAI(api_key=OPENAI_API_KEY)
        msg = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        text = msg.choices[0].message.content or ""
        return json.loads(text)
    except Exception as e:
        log(f"LLM error: {e}")
        return None


def build_fallback_json(title: str, abstract: str) -> Dict[str, Any]:
    # Simple heuristic fallback if no API key
    words = [w.strip(",.()[]{}:;!?") for w in (title + " " + abstract).lower().split()]
    uniq = []
    for w in words:
        if w and w not in uniq:
            uniq.append(w)
    return {
        "title": title or "Untitled",
        "abstract": abstract or "",
        "experiment": None,
        "project": None,
        "results": None,
        "keywords": uniq[:5],
    }


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def main():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out_dir = os.path.join(project_root, "data", "parsed_texts")
    ensure_dir(out_dir)

    items = get_items()
    log(f"Found {len(items)} publications")
    done = 0
    for pid, title, abstract in items:
        out_path = os.path.join(out_dir, f"{pid}.json")
        if os.path.isfile(out_path):
            continue
        publication_text = "\n\n".join([s for s in [title, abstract] if s])
        prompt = f"{BASE_PROMPT}\n{publication_text}"
        data = call_llm(prompt)
        if data is None:
            data = build_fallback_json(title, abstract)
        try:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            done += 1
            if done % 25 == 0:
                log(f"Saved {done} JSONs…")
        except Exception as e:
            log(f"Write error for {pid}: {e}")
        time.sleep(0.2)

    log(f"Completed. New JSON files: {done}")


if __name__ == "__main__":
    main()


