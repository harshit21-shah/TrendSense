from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///trendsense.db")

# If the URL points to a Docker hostname (e.g. "db") and we're running locally,
# fall back to SQLite so the server starts without Docker.
if "postgresql" in DATABASE_URL and (
    DATABASE_URL.split("@")[-1].split(":")[0] in ("db", "localhost") 
    and os.getenv("ENVIRONMENT") != "production"
):
    import socket
    host = DATABASE_URL.split("@")[-1].split(":")[0]
    port = int(DATABASE_URL.split("@")[-1].split(":")[1].split("/")[0]) if ":" in DATABASE_URL.split("@")[-1] else 5432
    try:
        socket.create_connection((host, port), timeout=1).close()
    except OSError:
        DATABASE_URL = "sqlite+aiosqlite:///trendsense.db"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
