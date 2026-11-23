from pathlib import Path
import sqlite3
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "marketplace.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def _columns(connection, table):
    return {row["name"] for row in connection.execute(f"PRAGMA table_info({table})")}


def initialize_database():
    connection = get_db_connection()
    now = datetime.now(timezone.utc).isoformat()
    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('freelancer','client','admin')),
                created_at TEXT NOT NULL
            )
        """)
        user_cols = _columns(connection, "users")
        if "is_active" not in user_cols:
            connection.execute("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1")

        # Create a modern project table for new databases. Existing databases are migrated below.
        connection.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                budget REAL NOT NULL DEFAULT 0,
                currency TEXT NOT NULL DEFAULT 'USD',
                level TEXT NOT NULL DEFAULT 'Entry level',
                skills TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'open',
                client_id INTEGER,
                duration TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT '',
                FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """)
        project_cols = _columns(connection, "projects")
        additions = {
            "client_id": "INTEGER REFERENCES users(id) ON DELETE SET NULL",
            "currency": "TEXT NOT NULL DEFAULT 'USD'",
            "level": "TEXT NOT NULL DEFAULT 'Entry level'",
            "status": "TEXT NOT NULL DEFAULT 'open'",
            "duration": "TEXT NOT NULL DEFAULT ''",
            "created_at": "TEXT NOT NULL DEFAULT ''",
        }
        for name, definition in additions.items():
            if name not in project_cols:
                connection.execute(f"ALTER TABLE projects ADD COLUMN {name} {definition}")
        project_cols = _columns(connection, "projects")
        if "client" not in project_cols:
            # Legacy-compatible display field; new projects use client_id.
            connection.execute("ALTER TABLE projects ADD COLUMN client TEXT NOT NULL DEFAULT ''")
        project_cols = _columns(connection, "projects")
        if "client" in project_cols and "client_id" in project_cols:
            connection.execute("""
                UPDATE projects SET client = COALESCE(
                    (SELECT name FROM users WHERE users.id = projects.client_id), client
                ) WHERE client = ''
            """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS client_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                company_name TEXT NOT NULL DEFAULT '',
                industry TEXT NOT NULL DEFAULT '',
                location TEXT NOT NULL DEFAULT '',
                website TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                is_public INTEGER NOT NULL DEFAULT 1 CHECK(is_public IN (0,1)),
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS freelancer_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                title TEXT NOT NULL DEFAULT '',
                location TEXT NOT NULL DEFAULT '',
                bio TEXT NOT NULL DEFAULT '',
                education TEXT NOT NULL DEFAULT '',
                skills TEXT NOT NULL DEFAULT '[]',
                portfolio TEXT NOT NULL DEFAULT '[]',
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                freelancer_id INTEGER NOT NULL,
                cover_letter TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending','accepted','rejected')),
                created_at TEXT NOT NULL,
                UNIQUE(project_id, freelancer_id),
                FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY(freelancer_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        demo_accounts = [
            ("Demo Freelancer", "g.kayigamba@alustudent.com", "12345", "freelancer"),
            ("Demo Client", "client@demo.com", "23456", "client"),
            ("Demo Admin", "admin@demo.com", "34567", "admin"),
        ]
        for name, email, password, role in demo_accounts:
            existing = connection.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
            if existing is None:
                connection.execute("""
                    INSERT INTO users(name,email,password_hash,role,created_at,is_active)
                    VALUES(?,?,?,?,?,1)
                """, (name, email, generate_password_hash(password), role, now))

        # Give the demo client a profile so the directory is useful on first run.
        demo_client = connection.execute(
            "SELECT id,name FROM users WHERE email='client@demo.com'"
        ).fetchone()
        if demo_client:
            connection.execute("""
                INSERT OR IGNORE INTO client_profiles
                    (user_id,company_name,industry,location,description,is_public,updated_at)
                VALUES(?,?,?,?,?,1,?)
            """, (
                demo_client["id"], "Demo Creative Studio", "Digital Services",
                "Kigali, Rwanda",
                "A sample organization using SkillBridge to connect with talented freelancers.",
                now
            ))
            # Older sample projects had no owner. Attach those unowned records to the demo client
            # so they appear in the client dashboard and remain editable.
            if "client_id" in project_cols:
                connection.execute("""
                    UPDATE projects SET client_id=?, client='Demo Creative Studio'
                    WHERE client_id IS NULL
                """, (demo_client["id"],))

        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
