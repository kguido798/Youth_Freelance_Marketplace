
from pathlib import Path
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request, g
from flask_cors import CORS

# Load environment variables BEFORE importing auth.py.
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
load_dotenv(PROJECT_DIR / ".env")

from database import initialize_database, get_db_connection
from auth import auth_bp, require_auth

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        }
    },
)

app.register_blueprint(auth_bp)



# --------------------------------------------------
# GENERAL HELPERS
# --------------------------------------------------

def profile_to_dict(profile):
    if profile is None:
        return None

    result = dict(profile)
    result["is_public"] = bool(result["is_public"])

    return result


def get_or_create_client_profile(user_id):
    connection = get_db_connection()

    try:
        profile = connection.execute(
            """
            SELECT *
            FROM client_profiles
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()

        if profile is None:
            user = connection.execute(
                "SELECT name FROM users WHERE id = ?",
                (user_id,),
            ).fetchone()

            if user is None:
                return None

            now = datetime.now(timezone.utc).isoformat()

            connection.execute(
                """
                INSERT INTO client_profiles
                    (user_id, company_name, updated_at)
                VALUES (?, ?, ?)
                """,
                (user_id, user["name"], now),
            )

            connection.commit()

            profile = connection.execute(
                """
                SELECT *
                FROM client_profiles
                WHERE user_id = ?
                """,
                (user_id,),
            ).fetchone()

        return profile_to_dict(profile)

    finally:
        connection.close()


def public_client_profile(user_id):
    """Return only information intended for public discovery."""
    connection = get_db_connection()

    try:
        row = connection.execute(
            """
            SELECT
                users.id AS user_id,
                users.name AS name,
                client_profiles.company_name,
                client_profiles.industry,
                client_profiles.location,
                client_profiles.website,
                client_profiles.description
            FROM users
            JOIN client_profiles
                ON client_profiles.user_id = users.id
            WHERE users.id = ?
                AND users.role = 'client'
                AND client_profiles.is_public = 1
            """,
            (user_id,),
        ).fetchone()

        return dict(row) if row else None

    finally:
        connection.close()


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "message": "Youth Freelance Marketplace API is running.",
    }), 200


# --------------------------------------------------
# PROJECT LISTING
# --------------------------------------------------

@app.get("/api/projects")
def get_projects():
    connection = get_db_connection()

    try:
        rows = connection.execute(
            "SELECT * FROM projects ORDER BY id DESC"
        ).fetchall()

        projects = []

        for row in rows:
            project = dict(row)

            project["skills"] = [
                skill.strip()
                for skill in project.get("skills", "").split(",")
                if skill.strip()
            ]

            projects.append(project)

        return jsonify(projects), 200

    finally:
        connection.close()


# --------------------------------------------------
# GET OWN CLIENT PROFILE
# --------------------------------------------------

@app.get("/api/client-profile/me")
@require_auth(required_roles=["client"])
def get_my_client_profile():
    profile = get_or_create_client_profile(
        g.current_user["id"]
    )

    if profile is None:
        return jsonify({
            "error": "Could not find your account."
        }), 404

    return jsonify({
        "profile": profile
    }), 200


# --------------------------------------------------
# UPDATE OWN CLIENT PROFILE
# --------------------------------------------------

@app.put("/api/client-profile/me")
@require_auth(required_roles=["client"])
def update_my_client_profile():
    data = request.get_json(silent=True) or {}

    fields = [
        "company_name",
        "industry",
        "location",
        "website",
        "description",
    ]

    values = {}

    for field in fields:
        value = data.get(field, "")

        if not isinstance(value, str):
            return jsonify({
                "error": f"{field} must be text."
            }), 400

        values[field] = value.strip()

    limits = {
        "company_name": 120,
        "industry": 100,
        "location": 120,
        "website": 255,
        "description": 2000,
    }

    for field, maximum in limits.items():
        if len(values[field]) > maximum:
            return jsonify({
                "error": f"{field} must not exceed {maximum} characters."
            }), 400

    website = values["website"]

    if website and not (
        website.startswith("https://")
        or website.startswith("http://")
    ):
        return jsonify({
            "error": "Website must begin with http:// or https://."
        }), 400

    is_public = data.get("is_public", True)

    if not isinstance(is_public, bool):
        return jsonify({
            "error": "is_public must be true or false."
        }), 400

    connection = get_db_connection()

    try:
        now = datetime.now(timezone.utc).isoformat()

        connection.execute(
            """
            INSERT INTO client_profiles (
                user_id,
                company_name,
                industry,
                location,
                website,
                description,
                is_public,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)

            ON CONFLICT(user_id) DO UPDATE SET
                company_name = excluded.company_name,
                industry = excluded.industry,
                location = excluded.location,
                website = excluded.website,
                description = excluded.description,
                is_public = excluded.is_public,
                updated_at = excluded.updated_at
            """,
            (
                g.current_user["id"],
                values["company_name"],
                values["industry"],
                values["location"],
                values["website"],
                values["description"],
                int(is_public),
                now,
            ),
        )

        connection.commit()

        profile = connection.execute(
            """
            SELECT *
            FROM client_profiles
            WHERE user_id = ?
            """,
            (g.current_user["id"],),
        ).fetchone()

        return jsonify({
            "message": "Client profile updated successfully.",
            "profile": profile_to_dict(profile),
        }), 200

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# --------------------------------------------------
# SEARCH PUBLIC CLIENT PROFILES
# --------------------------------------------------

@app.get("/api/clients")
@require_auth()
def search_clients():
    search = request.args.get("q", "").strip()

    if len(search) > 100:
        return jsonify({
            "error": "Search query is too long."
        }), 400

    connection = get_db_connection()

    try:
        pattern = f"%{search}%"

        rows = connection.execute(
            """
            SELECT
                users.id AS user_id,
                users.name AS name,
                client_profiles.company_name,
                client_profiles.industry,
                client_profiles.location,
                client_profiles.website,
                client_profiles.description
            FROM users
            JOIN client_profiles
                ON client_profiles.user_id = users.id
            WHERE users.role = 'client'
                AND client_profiles.is_public = 1
                AND (
                    users.name LIKE ?
                    OR client_profiles.company_name LIKE ?
                    OR client_profiles.industry LIKE ?
                    OR client_profiles.location LIKE ?
                )
            ORDER BY client_profiles.updated_at DESC
            LIMIT 50
            """,
            (pattern, pattern, pattern, pattern),
        ).fetchall()

        return jsonify({
            "clients": [dict(row) for row in rows]
        }), 200

    finally:
        connection.close()


# --------------------------------------------------
# VIEW A PUBLIC CLIENT PROFILE
# --------------------------------------------------

@app.get("/api/clients/<int:client_id>")
@require_auth()
def get_public_client(client_id):
    profile = public_client_profile(client_id)

    if profile is None:
        return jsonify({
            "error": "Client profile not found or is private."
        }), 404

    return jsonify({
        "profile": profile
    }), 200


# --------------------------------------------------
# APPLICATION STARTUP
# --------------------------------------------------

if __name__ == "__main__":
    initialize_database()

    print("Youth Freelance Marketplace backend starting...")
    print("API URL: http://127.0.0.1:5000")
    print("Health check: http://127.0.0.1:5000/api/health")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )
