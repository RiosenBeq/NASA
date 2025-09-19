#!/usr/bin/env python3
"""
NASA Space Bio Explorer - API Server
Simple FastAPI server wrapper for production deployment.
"""

import os
import uvicorn
from dotenv import load_dotenv
from api.main import app

# Load environment variables
load_dotenv()

def main():
    """Run the FastAPI application with production settings."""
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting NASA Space Bio Explorer API on {host}:{port}")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    main()