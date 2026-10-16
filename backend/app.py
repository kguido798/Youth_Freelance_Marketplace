
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path
import os
import sqlite3

from flask import Flask, jsonify, request, g
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from database import initialize_database
from auth import auth_bp


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "marketplace.db"

app = Flask(__name__)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
if not app.config["SECRET_KEY"]:
    raise RuntimeError(
        "Set the SECRET_KEY environment variable before starting Flask."
    )

TOKEN_SERIALIZER = URLSafeTimedSerializer(
    app.config["SECRET_KEY"],
    salt="youth-marketplace-auth",
)

CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173"]}},
)

TOKEN_MAX_AGE = 60 * 60 * 8


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_db_connection()

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

    # Create preset demo accounts if they do not already exist.
    demo_accounts = [
        {
            "name": "Demo Freelancer",
            "email": "g.kayigamba@alustudent.com",
            "password": "12345",
            "role": "freelancer",
        },
        {
            "name": "Demo Client",
            "email": "client@gmail.com",
            "password": "23456",
            "role": "client",
        },
        {
            "name": "Demo Admin",
            "email": "admin@gmail.com",
            "password": "34567",
            "role": "admin",
        },
    ]

    for account in demo_accounts:
        existing_user = connection.execute(
            "SELECT id FROM users WHERE email = ?",
            (account["email"],),
        ).fetchone()

        if existing_user is None:
            connection.execute(
                """
                INSERT INTO users
                    (name, email, password_hash, role, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    account["name"],
                    account["email"],
                    generate_password_hash(account["password"]),
                    account["role"],
                    datetime.now(timezone.utc).isoformat(),
                ),
            )

    # Preserve the existing projects table if it already exists.
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

    connection.commit()
    connection.close()


def public_user(user):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
    }


def create_auth_token(user):
    return TOKEN_SERIALIZER.dumps({
        "user_id": user["id"],
        "role": user["role"],
    })


def get_current_user():
    authorization = request.headers.get("Authorization", "")

    if not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = TOKEN_SERIALIZER.loads(
            token,
            max_age=TOKEN_MAX_AGE,
        )
    except (BadSignature, SignatureExpired):
        return None

    connection = get_db_connection()
    user = connection.execute(
        "SELECT * FROM users WHERE id = ?",
        (payload.get("user_id"),),
    ).fetchone()
    connection.close()

    return user


def require_auth(required_roles=None):
    def decorator(view_function):
        @wraps(view_function)
        def wrapped(*args, **kwargs):
            user = get_current_user()

            if user is None:
                return jsonify({"error": "Authentication required."}), 401

            if required_roles and user["role"] not in required_roles:
                return jsonify({"error": "You do not have permission."}), 403

            g.current_user = user
            return view_function(*args, **kwargs)

        return wrapped
    return decorator


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    role = str(data.get("role", "freelancer")).strip().lower()

    if not name or not email or not isinstance(password, str):
        return jsonify({"error": "Name, email, and password are required."}), 400

    if len(name) > 100 or len(email) > 254:
        return jsonify({"error": "Name or email is too long."}), 400

    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        return jsonify({"error": "Enter a valid email address."}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    if len(password) > 128:
        return jsonify({"error": "Password is too long."}), 400

    # Public registration must never create administrator accounts.
    if role not in ("freelancer", "client"):
        return jsonify({"error": "Choose Freelancer or Client."}), 400

    password_hash = generate_password_hash(password)
    created_at = datetime.now(timezone.utc).isoformat()

    connection = get_db_connection()

    try:
        cursor = connection.execute(
            """
            INSERT INTO users (name, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, email, password_hash, role, created_at),
        )
        connection.commit()

        user = connection.execute(
            "SELECT * FROM users WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()

    except sqlite3.IntegrityError:
        connection.close()
        return jsonify({"error": "An account with this email already exists."}), 409

    connection.close()

    return jsonify({
        "message": "Account created successfully.",
        "user": public_user(user),
        "token": create_auth_token(user),
    }), 201


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not email or not isinstance(password, str) or not password:
        return jsonify({"error": "Email and password are required."}), 400

    connection = get_db_connection()
    user = connection.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    connection.close()

    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({
        "message": "Login successful.",
        "user": public_user(user),
        "token": create_auth_token(user),
    })


@app.get("/api/me")
@require_auth()
def current_user():
    return jsonify({"user": public_user(g.current_user)})


@app.get("/api/projects")
def get_projects():
    connection = get_db_connection()
    rows = connection.execute(
        "SELECT * FROM projects ORDER BY id DESC"
    ).fetchall()
    connection.close()

    projects = []

    for row in rows:
        project = dict(row)
        project["skills"] = [
            skill.strip()
            for skill in project.get("skills", "").split(",")
            if skill.strip()
        ]
        projects.append(project)

    return jsonify(projects)


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True, port=5000)
