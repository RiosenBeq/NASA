"""Database utilities for NASA Space Bio Explorer ETL processes."""

import os
import logging
from typing import Iterable, Optional, Tuple, List, Dict, Any
from contextlib import contextmanager

import psycopg2
import psycopg2.extras
from psycopg2 import sql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_url() -> str:
    """Get database connection URL from environment variables."""
    url = os.getenv("DATABASE_URL", "postgres://localhost:5432/nasa")
    logger.debug(f"Using database URL: {url[:url.find('@')+1]}...")
    return url

@contextmanager
def get_connection():
    """Get database connection with proper error handling."""
    conn = None
    try:
        conn = psycopg2.connect(get_db_url())
        logger.debug("Database connection established")
        yield conn
        conn.commit()
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        raise
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

# Deprecated - use get_connection() context manager instead
def get_conn():
    """Legacy function - deprecated. Use get_connection() context manager instead."""
    logger.warning("get_conn() is deprecated. Use get_connection() context manager instead.")
    return psycopg2.connect(get_db_url())

def ensure_tables():
    """Verify database connection and basic table structure."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Test basic connection
                cur.execute("SELECT 1;")
                
                # Check if main tables exist
                cur.execute("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_schema = 'biosci' 
                        AND table_name = 'publications'
                    );
                """)
                publications_exists = cur.fetchone()[0]
                
                if not publications_exists:
                    logger.warning("Publications table does not exist. Run init.sql first.")
                else:
                    logger.info("✅ Database tables verified")
                    
    except Exception as e:
        logger.error(f"❌ Database verification failed: {e}")
        raise

def upsert_publications(
    rows: Iterable[Tuple[Optional[str], Optional[int], Optional[str], Optional[str], Optional[str], str]],
    batch_size: int = 1000
):
    """Insert or update publications data with improved error handling."""
    if not rows:
        logger.warning("No data provided for upsert_publications")
        return
    
    # Convert to list if needed for counting
    if not isinstance(rows, list):
        rows = list(rows)
    
    logger.info(f"Upserting {len(rows)} publications...")
    
    sql_query = """
        INSERT INTO biosci.publications (title, year, doi, pmid, url, source) 
        VALUES %s 
        ON CONFLICT (url) DO UPDATE SET
            title = EXCLUDED.title,
            year = EXCLUDED.year,
            doi = EXCLUDED.doi,
            pmid = EXCLUDED.pmid,
            source = EXCLUDED.source,
            updated_at = CURRENT_TIMESTAMP
    """
    
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Process in batches
                for i in range(0, len(rows), batch_size):
                    batch = rows[i:i + batch_size]
                    
                    try:
                        psycopg2.extras.execute_values(
                            cur,
                            sql_query,
                            batch,
                            template="(%s,%s,%s,%s,%s,%s)",
                            page_size=batch_size,
                        )
                        logger.info(f"Processed batch {i//batch_size + 1}/{(len(rows)-1)//batch_size + 1}")
                        
                    except psycopg2.Error as e:
                        logger.error(f"Failed to process batch {i//batch_size + 1}: {e}")
                        # Log problematic data for debugging
                        logger.debug(f"Problematic batch data: {batch[:3]}...")  # First 3 items
                        raise
                        
        logger.info(f"✅ Successfully upserted {len(rows)} publications")
        
    except Exception as e:
        logger.error(f"❌ Failed to upsert publications: {e}")
        raise

def get_publication_count() -> int:
    """Get total number of publications in the database."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM biosci.publications;")
                count = cur.fetchone()[0]
                logger.info(f"Total publications in database: {count}")
                return count
    except Exception as e:
        logger.error(f"Failed to get publication count: {e}")
        raise

def get_embedding_counts() -> Dict[str, int]:
    """Get count of different embedding types."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                counts = {}
                
                # Title embeddings
                cur.execute("SELECT COUNT(*) FROM biosci.pub_title_embeddings;")
                counts['title_embeddings'] = cur.fetchone()[0]
                
                # Abstract embeddings
                cur.execute("SELECT COUNT(*) FROM biosci.abstract_embeddings;")
                counts['abstract_embeddings'] = cur.fetchone()[0]
                
                logger.info(f"Embedding counts: {counts}")
                return counts
    except Exception as e:
        logger.error(f"Failed to get embedding counts: {e}")
        return {}

def validate_data_integrity() -> Dict[str, Any]:
    """Validate data integrity and return diagnostic information."""
    diagnostics = {
        'publications': 0,
        'title_embeddings': 0,
        'abstract_embeddings': 0,
        'missing_titles': 0,
        'missing_abstracts': 0,
        'orphaned_embeddings': 0
    }
    
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Basic counts
                cur.execute("SELECT COUNT(*) FROM biosci.publications;")
                diagnostics['publications'] = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM biosci.pub_title_embeddings;")
                diagnostics['title_embeddings'] = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM biosci.abstract_embeddings;")
                diagnostics['abstract_embeddings'] = cur.fetchone()[0]
                
                # Missing data
                cur.execute("""
                    SELECT COUNT(*) FROM biosci.publications p
                    LEFT JOIN biosci.pub_title_embeddings te ON p.id = te.publication_id
                    WHERE te.publication_id IS NULL;
                """)
                diagnostics['missing_title_embeddings'] = cur.fetchone()[0]
                
                cur.execute("""
                    SELECT COUNT(*) FROM biosci.publications p
                    LEFT JOIN biosci.abstract_embeddings ae ON p.id = ae.publication_id
                    WHERE ae.publication_id IS NULL;
                """)
                diagnostics['missing_abstract_embeddings'] = cur.fetchone()[0]
                
        logger.info(f"Data integrity diagnostics: {diagnostics}")
        return diagnostics
        
    except Exception as e:
        logger.error(f"Failed to validate data integrity: {e}")
        return diagnostics
