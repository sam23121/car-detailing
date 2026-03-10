from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/quality_detailing_db")

# Lambda: fail fast if DB unreachable (e.g. Lambda in VPC with no NAT to reach Neon)
_CONNECT_TIMEOUT = 8
_engine_kw = {
    "pool_pre_ping": True,
    "echo": False,
    "connect_args": {"connect_timeout": _CONNECT_TIMEOUT},
}
if os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    _engine_kw["poolclass"] = NullPool

engine = create_engine(DATABASE_URL, **_engine_kw)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
