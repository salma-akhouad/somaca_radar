from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# build an absolute path to .env, so it's found no matter where uvicorn runs from
env_path = Path(__file__).resolve().parent.parent / ".env"

# load variables from .env into this program's environment
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is missing"
    )
# the engine is the actual connection pool to PostgreSQL 
engine = create_engine(DATABASE_URL)

# SessionLocal is a factory that creates individual conversations with the database
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine) 

# Base is what every table model (Machine, Utilisateur, etc.) will inherit from
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db # waits the request to finish before closing the session
    finally: # only when the function that called get_db() is finished, the finally block is executed, which closes the database session. This ensures that the session is closed and resources are released, preventing potential memory leaks or connection exhaustion.
        db.close()