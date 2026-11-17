
from pathlib import Path
import sqlite3
from datetime import datetime, timezone

from werkzeug.security import generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "marketplace.db"


def get_db_connection():
    """Create and return a connection to the SQLite database."""
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database():
    """Create tables and preset demo accounts."""
    connection = get_db_connection()

    try:
        # User accounts
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL
                    CHECK (role IN ('freelancer', 'client', 'admin')),
                created_at TEXT NOT NULL
            )
        """)

        # Existing project structure is preserved.
        connection.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                client TEXT NOT NULL,
                category TEXT NOT NULL,
                budget REAL NOT NULL,
                duration TEXT NOT NULL,
                skills TEXT NOT NULL,
                description TEXT NOT NULL
            )
        """)

        # Client profiles
        connection.execute("""
            CREATE TABLE IF NOT EXISTS client_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                company_name TEXT NOT NULL DEFAULT '',
                industry TEXT NOT NULL DEFAULT '',
                location TEXT NOT NULL DEFAULT '',
                website TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                is_public INTEGER NOT NULL DEFAULT 1
                    CHECK (is_public IN (0, 1)),
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        # Add client_id to an existing projects table when necessary.
        # This allows project listings to link to their owning client.
        project_columns = {
            row["name"]
            for row in connection.execute(
                "PRAGMA table_info(projects)"
            ).fetchall()
        }

        if "client_id" not in project_columns:
            connection.execute("""
                ALTER TABLE projects
                ADD COLUMN client_id INTEGER
                REFERENCES users(id)
            """)

        # Demo accounts
        demo_accounts = [
            (
                "Demo Freelancer",
                "g.kayigamba@alustudent.com",
                "12345",
                "freelancer",
            ),
            (
                "Demo Client",
                "client@demo.com",
                "23456",
                "client",
            ),
            (
                "Demo Admin",
                "admin@demo.com",
                "34567",
                "admin",
            ),
        ]

        for name, email, password, role in demo_accounts:
            existing = connection.execute(
                "SELECT id FROM users WHERE email = ?",
                (email,),
            ).fetchone()

            if existing is None:
                connection.execute(
                    """
                    INSERT INTO users
                        (name, email, password_hash, role, created_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        name,
                        email,
                        generate_password_hash(password),
                        role,
                        datetime.now(timezone.utc).isoformat(),
                    ),
                )

        connection.commit()

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
