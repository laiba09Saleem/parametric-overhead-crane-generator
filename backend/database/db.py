import sqlite3
from pathlib import Path

# Resolve path relative to this file (backend/database/db.py) -> backend/database/crane.db
DB_PATH = Path(__file__).resolve().parent / "crane.db"


def get_connection() -> sqlite3.Connection:
    """
    Open and return a connection to the local SQLite database.
    Ensures the parent directory exists before connecting.
    """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """
    Create the 'designs' table if it does not already exist.
    Called once when the FastAPI application starts.
    """
    conn = get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS designs (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT    NOT NULL,
                parameters  TEXT    NOT NULL,
                created_at  TEXT    NOT NULL,
                updated_at  TEXT    NOT NULL
            );
            """
        )
        conn.commit()
    finally:
        conn.close()