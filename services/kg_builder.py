import json
import os
import re
from glob import glob
from typing import Dict, List, Tuple, Optional, Set


def log(message: str) -> None:
    print(f"[KG] {message}")


def try_load_nlp():
    """
    Try to load a SciSpacy model if available; otherwise fall back to spaCy en_core_web_sm.
    Returns an object with .pipe(texts) support and basic NER; None if spaCy not available.
    """
    try:
        import spacy
        # Prefer scispacy if available
        try:
            # Common SciSpacy models; try a few names
            for model_name in [
                "en_core_sci_sm",
                "en_core_sci_md",
                "en_core_sci_scibert",
                "en_ner_bionlp13cg_md",
            ]:
                try:
                    log(f"Trying to load SciSpacy model: {model_name}")
                    return spacy.load(model_name)
                except Exception:
                    continue
        except Exception:
            pass
        # Fallback to standard small English model
        try:
            log("Falling back to spaCy model: en_core_web_sm")
            return spacy.load("en_core_web_sm")
        except Exception:
            log("spaCy model en_core_web_sm not found. Proceeding without NLP.")
            return None
    except Exception:
        log("spaCy not installed. Proceeding without NLP.")
        return None


BIO_SYSTEM_TERMS = [
    "human", "astronaut", "crew", "mouse", "mice", "rodent", "rat", "rats",
    "plant", "arabidopsis", "seedling", "yeast", "drosophila", "zebrafish",
    "cell", "cells", "endothelial", "osteoblast", "osteoclast", "tissue"
]

EFFECT_TERMS = [
    "bone density", "bone loss", "muscle atrophy", "immune response",
    "gene expression", "oxidative stress", "radiation damage", "microgravity adaptation",
    "growth", "cell proliferation", "apoptosis", "inflammation", "tumor", "DNA damage"
]

EXPERIMENT_TERMS = [
    "experiment", "study", "mission", "flight", "spaceflight", "ISS", "Shuttle",
    "ground control", "exposure", "radiation", "microgravity"
]

PROJECT_TERMS = [
    "project", "grant", "award", "BPS", "HRP", "Task Book", "NASA Task Book"
]


def normalize_label(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())[:300]


def extract_candidates(text: str) -> Dict[str, Set[str]]:
    """Heuristic candidate extraction for required entity types.
    Returns a dict of sets for types: Article, Experiment, Project, Biological System, Effect
    """
    text_low = text.lower()
    cands: Dict[str, Set[str]] = {
        "Experiment": set(),
        "Project": set(),
        "Biological System": set(),
        "Effect": set(),
    }

    # Biological System terms
    for term in BIO_SYSTEM_TERMS:
        if term in text_low:
            cands["Biological System"].add(term)

    # Effect terms
    for term in EFFECT_TERMS:
        if term in text_low:
            cands["Effect"].add(term)

    # Experiment terms
    for term in EXPERIMENT_TERMS:
        if term.lower() in text_low:
            cands["Experiment"].add(term)

    # Project terms
    for term in PROJECT_TERMS:
        if term.lower() in text_low:
            cands["Project"].add(term)

    return cands


def extract_with_nlp(nlp, text: str) -> Dict[str, Set[str]]:
    """Use NLP NER to enrich candidates. Map certain labels to our buckets heuristically."""
    buckets: Dict[str, Set[str]] = {
        "Experiment": set(),
        "Project": set(),
        "Biological System": set(),
        "Effect": set(),
    }
    if not nlp:
        return buckets
    try:
        doc = nlp(text)
        for ent in getattr(doc, "ents", []):
            label = ent.label_.upper()
            val = normalize_label(ent.text)
            # Simple mapping rules
            if label in {"ORG", "FAC"} and any(t.lower() in val.lower() for t in PROJECT_TERMS):
                buckets["Project"].add(val)
            elif label in {"PERSON", "ORG", "PRODUCT"} and any(t in val.lower() for t in ["experiment", "study", "mission", "flight", "spaceflight", "iss"]):
                buckets["Experiment"].add(val)
            elif label in {"NORP", "ORG", "GPE", "LOC"} and any(t in val.lower() for t in BIO_SYSTEM_TERMS):
                buckets["Biological System"].add(val)
            elif label in {"EVENT", "PHENOMENON", "DISEASE", "SYMPTOM"} or any(t in val.lower() for t in EFFECT_TERMS):
                buckets["Effect"].add(val)
    except Exception as e:
        log(f"NLP error: {e}")
    return buckets


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def read_parsed_jsons(parsed_dir: str) -> List[Dict]:
    files = sorted(glob(os.path.join(parsed_dir, "*.json")))
    log(f"Found {len(files)} parsed JSON files in {parsed_dir}")
    data = []
    for fp in files:
        try:
            with open(fp, "r", encoding="utf-8") as f:
                data.append(json.load(f))
        except Exception as e:
            log(f"Failed to read {fp}: {e}")
    return data


def get_article_label(item: Dict, fallback: str) -> str:
    for key in ["title", "article_title", "paper_title"]:
        if key in item and isinstance(item[key], str) and item[key].strip():
            return normalize_label(item[key])
    return normalize_label(fallback)


def concatenate_text(item: Dict) -> str:
    parts: List[str] = []
    for key in ["abstract", "summary", "content", "fulltext"]:
        if key in item and isinstance(item[key], str):
            parts.append(item[key])
    # sections array
    sections = item.get("sections")
    if isinstance(sections, list):
        for s in sections:
            if isinstance(s, dict):
                txt = s.get("text") or s.get("content")
                if isinstance(txt, str):
                    parts.append(txt)
            elif isinstance(s, str):
                parts.append(s)
    return "\n\n".join(parts)[:200000]


def build_graph(parsed_dir: str, out_dir: str) -> Tuple[List[Dict], List[Dict]]:
    ensure_dir(out_dir)
    nlp = try_load_nlp()
    items = read_parsed_jsons(parsed_dir)

    # Stores
    node_index: Dict[Tuple[str, str], str] = {}
    nodes: List[Dict] = []
    edges: List[Dict] = []

    def add_node(n_type: str, label: str) -> str:
        key = (n_type, label)
        if key in node_index:
            return node_index[key]
        node_id = f"{n_type.lower().replace(' ', '_')}_{len(nodes)+1}"
        node = {"id": node_id, "type": n_type, "label": label}
        nodes.append(node)
        node_index[key] = node_id
        return node_id

    def add_edge(src: str, dst: str, rel: str) -> None:
        edges.append({"source": src, "target": dst, "relation": rel})

    for idx, item in enumerate(items, start=1):
        file_label = f"Article {idx}"
        article_label = get_article_label(item, file_label)
        article_id = add_node("Article", article_label)
        log(f"Processing: {article_label}")

        text = concatenate_text(item)
        cands = extract_candidates(text)
        nlp_cands = extract_with_nlp(nlp, text)
        # merge
        for k in cands:
            cands[k].update(nlp_cands.get(k, set()))

        # Create nodes and edges
        exp_ids: List[str] = []
        for exp in sorted(cands["Experiment"]):
            exp_id = add_node("Experiment", normalize_label(exp))
            add_edge(article_id, exp_id, "DESCRIBES")
            exp_ids.append(exp_id)

        bio_ids: List[str] = []
        for bio in sorted(cands["Biological System"]):
            bio_id = add_node("Biological System", normalize_label(bio))
            bio_ids.append(bio_id)

        eff_ids: List[str] = []
        for eff in sorted(cands["Effect"]):
            eff_id = add_node("Effect", normalize_label(eff))
            eff_ids.append(eff_id)

        proj_ids: List[str] = []
        for proj in sorted(cands["Project"]):
            proj_id = add_node("Project", normalize_label(proj))
            proj_ids.append(proj_id)
            add_edge(proj_id, article_id, "FUNDS" )

        # Link experiments to biological systems and effects (many-to-many)
        for eid in exp_ids:
            for bid in bio_ids:
                add_edge(eid, bid, "INVOLVES")
            for fid in eff_ids:
                add_edge(eid, fid, "OBSERVES")

    # Save
    nodes_path = os.path.join(out_dir, "nodes.json")
    edges_path = os.path.join(out_dir, "edges.json")
    with open(nodes_path, "w", encoding="utf-8") as f:
        json.dump(nodes, f, ensure_ascii=False, indent=2)
    with open(edges_path, "w", encoding="utf-8") as f:
        json.dump(edges, f, ensure_ascii=False, indent=2)
    log(f"Saved nodes: {nodes_path} ({len(nodes)})")
    log(f"Saved edges: {edges_path} ({len(edges)})")

    return nodes, edges


def main():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    parsed_dir = os.path.join(project_root, "data", "parsed_texts")
    out_dir = os.path.join(project_root, "data", "kg")
    build_graph(parsed_dir, out_dir)


if __name__ == "__main__":
    main()


