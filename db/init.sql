CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS biosci;

CREATE TABLE IF NOT EXISTS biosci.publications (
  id SERIAL PRIMARY KEY,
  external_id TEXT,
  title TEXT,
  year INT,
  doi TEXT,
  pmid TEXT,
  url TEXT,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS biosci.sections (
  id SERIAL PRIMARY KEY,
  publication_id INT REFERENCES biosci.publications(id) ON DELETE CASCADE,
  section TEXT,
  text TEXT,
  citation_span TEXT
);

CREATE TABLE IF NOT EXISTS biosci.chunks (
  id SERIAL PRIMARY KEY,
  publication_id INT REFERENCES biosci.publications(id) ON DELETE CASCADE,
  section TEXT,
  text TEXT,
  year INT,
  organism TEXT,
  platform TEXT,
  exposure TEXT,
  duration TEXT
);

CREATE TABLE IF NOT EXISTS biosci.embeddings (
  id SERIAL PRIMARY KEY,
  chunk_id INT REFERENCES biosci.chunks(id) ON DELETE CASCADE,
  model TEXT,
  embedding VECTOR(1536)
);

-- ivfflat index için uygun opclass seçin: vector_l2_ops | vector_ip_ops | vector_cosine_ops
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON biosci.embeddings USING ivfflat (embedding vector_l2_ops);

-- Abstract metinleri ve embedding'leri (MVP için 384 boyutlu SBERT)
CREATE TABLE IF NOT EXISTS biosci.abstracts (
  publication_id INT PRIMARY KEY REFERENCES biosci.publications(id) ON DELETE CASCADE,
  abstract_text TEXT
);

CREATE TABLE IF NOT EXISTS biosci.abstract_embeddings (
  publication_id INT PRIMARY KEY REFERENCES biosci.publications(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  embedding VECTOR(384)
);

CREATE INDEX IF NOT EXISTS idx_abs_embeddings_vector ON biosci.abstract_embeddings USING ivfflat (embedding vector_l2_ops);


