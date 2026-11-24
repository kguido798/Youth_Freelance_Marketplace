from pathlib import Path
from datetime import datetime, timezone
import json
from urllib.parse import urlparse

from dotenv import load_dotenv
from flask import Flask, jsonify, request, g
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
load_dotenv(PROJECT_DIR / ".env")

from database import initialize_database, get_db_connection
from auth import auth_bp, require_auth

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://youth-freelance-marketplace.vercel.app"
        ]
    }
})
app.register_blueprint(auth_bp)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def json_error(message, status=400):
    return jsonify({"error": message}), status


def get_client_profile(user_id):
    connection = get_db_connection()
    try:
        row = connection.execute(
            "SELECT * FROM client_profiles WHERE user_id=?", (user_id,)
        ).fetchone()
        if row is None:
            user = connection.execute("SELECT name FROM users WHERE id=?", (user_id,)).fetchone()
            if user is None:
                return None
            connection.execute("""
                INSERT INTO client_profiles(user_id,company_name,updated_at)
                VALUES(?,?,?)
            """, (user_id, user["name"], now_iso()))
            connection.commit()
            row = connection.execute(
                "SELECT * FROM client_profiles WHERE user_id=?", (user_id,)
            ).fetchone()
        result = dict(row)
        result["is_public"] = bool(result["is_public"])
        return result
    finally:
        connection.close()


def project_dict(row):
    item = dict(row)

    raw_skills = item.get("skills") or ""
    if isinstance(raw_skills, str):
        try:
            parsed = json.loads(raw_skills)
            item["skills"] = parsed if isinstance(parsed, list) else [
                x.strip() for x in raw_skills.split(",") if x.strip()
            ]
        except (ValueError, TypeError):
            item["skills"] = [
                x.strip() for x in raw_skills.split(",") if x.strip()
            ]

    # Only expose a clickable client ID when the profile is public.
    if "public_client_id" in item:
        item["client_id"] = item["public_client_id"]

    item["client"] = item.get("client_name") or item.get("client") or "Client"
    item["status"] = (item.get("status") or "open").lower()
    item["applications"] = item.get("applications_count", 0)

    return item


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "message": "Youth Freelance Marketplace API is running."})


# PROJECTS
@app.get("/api/projects")
def list_projects():
    connection = get_db_connection()
    try:
        query = """
            SELECT p.*,
            CASE
                WHEN cp.is_public = 1
                THEN COALESCE(NULLIF(cp.company_name,''), u.name, p.client)
            ELSE 'Private client'
                END AS client_name,
            CASE
                WHEN cp.is_public = 1 THEN p.client_id
            ELSE NULL
                END AS public_client_id,
            u.name AS client_owner,
            (
                SELECT COUNT(*)
                FROM applications a
                WHERE a.project_id = p.id
            ) AS applications_count
            FROM projects p
            LEFT JOIN users u ON u.id = p.client_id
            LEFT JOIN client_profiles cp ON cp.user_id = u.id
        """
        params = []
        if request.args.get("mine") == "1":
            user = require_current_user()
            if user is None:
                return json_error("Authentication required.", 401)
            if user["role"] != "client":
                return json_error("Only clients can view their own projects.", 403)
            query += " WHERE p.client_id=?"
            params.append(user["id"])
        elif request.args.get("all") != "1":
            query += " WHERE lower(p.status)='open'"
        query += " ORDER BY p.id DESC"
        rows = connection.execute(query, params).fetchall()
        return jsonify([project_dict(row) for row in rows])
    finally:
        connection.close()


def require_current_user():
    # Reuse the authentication decorator's underlying lookup for a query-parameter endpoint.
    from auth import get_current_user
    return get_current_user()


@app.route("/api/projects", methods=["POST"])
@require_auth
def create_project():
    user = require_current_user()

    if user["role"] != "client":
        return jsonify({"message": "Only clients can create projects."}), 403

    data = request.get_json() or {}

    title = data.get("title", "").strip()
    category = data.get("category", "").strip()
    description = data.get("description", "").strip()
    duration = data.get("duration", "").strip()
    skills = data.get("skills", [])
    budget = data.get("budget", 0)
    currency = data.get("currency", "USD")
    level = data.get("level", "Entry level")

    if not title or not category or not description:
        return jsonify({"message": "Title, category and description are required."}), 400

    try:
        budget = float(budget)
        if budget < 0:
            return jsonify({"message": "Budget cannot be negative."}), 400
    except (ValueError, TypeError):
        return jsonify({"message": "Please enter a valid budget."}), 400

    if isinstance(skills, str):
        skills = [skill.strip() for skill in skills.split(",") if skill.strip()]

    connection = get_db_connection()

    try:
        cursor = connection.execute(
            """
            INSERT INTO projects (
                title, category, description, budget, currency,
                level, skills, status, client_id, duration,
                created_at, client
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, CURRENT_TIMESTAMP, ?)
            """,
            (
                title,
                category,
                description,
                budget,
                currency,
                level,
                json.dumps(skills),
                user["id"],
                duration,
                user.get("name", "Client"),
            ),
        )

        row = connection.execute(
            """
            SELECT p.*,
                CASE
                    WHEN cp.is_public = 1
                    THEN COALESCE(NULLIF(cp.company_name,''), u.name, p.client)
                    ELSE 'Private client'
                END AS client_name,
                CASE
                    WHEN cp.is_public = 1 THEN p.client_id
                    ELSE NULL
                END AS public_client_id,
                0 AS applications_count
            FROM projects p
            LEFT JOIN users u ON u.id = p.client_id
            LEFT JOIN client_profiles cp ON cp.user_id = u.id
            WHERE p.id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

        connection.commit()

        return jsonify({
            "message": "Project created.",
            "project": project_dict(row),
        }), 201

    except Exception as error:
        connection.rollback()
        return jsonify({"message": str(error)}), 500

    finally:
        connection.close()


@app.put("/api/projects/<int:project_id>")
@require_auth(required_roles=["client", "admin"])
def update_project(project_id):
    data = request.get_json(silent=True) or {}
    connection = get_db_connection()
    try:
        project = connection.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if project is None:
            return json_error("Project not found.", 404)
        if g.current_user["role"] != "admin" and project["client_id"] != g.current_user["id"]:
            return json_error("You cannot edit this project.", 403)
        title = str(data.get("title", project["title"])).strip()
        category = str(data.get("category", project["category"])).strip()
        description = str(data.get("description", project["description"])).strip()
        duration = str(data.get("duration", project["duration"] or "")).strip()
        try:
            budget = float(data.get("budget", project["budget"]))
            if budget < 0:
                raise ValueError()
        except (TypeError, ValueError):
            return json_error("Budget must be a valid non-negative number.")
        skills = data.get("skills", project["skills"] or "")
        skills_text = ", ".join(skills) if isinstance(skills, list) else str(skills)
        status = str(data.get("status", project["status"] or "open")).lower()
        if status not in ("open", "in_progress", "closed"):
            return json_error("Invalid project status.")
        connection.execute("""
            UPDATE projects SET title=?,category=?,description=?,budget=?,duration=?,skills=?,status=?
            WHERE id=?
        """, (title, category, description, budget, duration, skills_text, status, project_id))
        connection.commit()
        return jsonify({"message": "Project updated."})
    finally:
        connection.close()


@app.delete("/api/projects/<int:project_id>")
@require_auth(required_roles=["client", "admin"])
def delete_project(project_id):
    connection = get_db_connection()
    try:
        project = connection.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if project is None:
            return json_error("Project not found.", 404)
        if g.current_user["role"] != "admin" and project["client_id"] != g.current_user["id"]:
            return json_error("You cannot delete this project.", 403)
        connection.execute("DELETE FROM projects WHERE id=?", (project_id,))
        connection.commit()
        return jsonify({"message": "Project deleted."})
    finally:
        connection.close()


# APPLICATIONS
@app.post("/api/projects/<int:project_id>/applications")
@require_auth(required_roles=["freelancer"])
def apply_to_project(project_id):
    data = request.get_json(silent=True) or {}
    cover_letter = str(data.get("cover_letter", "")).strip()
    if len(cover_letter) > 3000:
        return json_error("Cover letter is too long.")
    connection = get_db_connection()
    try:
        project = connection.execute(
            "SELECT id,status FROM projects WHERE id=?", (project_id,)
        ).fetchone()
        if project is None or project["status"] != "open":
            return json_error("This project is not accepting applications.", 404)
        try:
            connection.execute("""
                INSERT INTO applications(project_id,freelancer_id,cover_letter,status,created_at)
                VALUES(?,?,?,'pending',?)
            """, (project_id, g.current_user["id"], cover_letter, now_iso()))
            connection.commit()
        except Exception as error:
            connection.rollback()
            if "UNIQUE constraint failed" in str(error):
                return json_error("You have already applied to this project.", 409)
            raise
        return jsonify({"message": "Application submitted successfully."}), 201
    finally:
        connection.close()


@app.get("/api/projects/<int:project_id>/applications")
@require_auth(required_roles=["client", "admin"])
def list_project_applications(project_id):
    connection = get_db_connection()
    try:
        project = connection.execute("SELECT client_id FROM projects WHERE id=?", (project_id,)).fetchone()
        if project is None:
            return json_error("Project not found.", 404)
        if g.current_user["role"] == "client" and project["client_id"] != g.current_user["id"]:
            return json_error("You cannot view these applications.", 403)
        rows = connection.execute("""
            SELECT a.id,a.project_id,a.cover_letter,a.status,a.created_at,
                   u.id freelancer_id,u.name,u.email,
                   fp.title,fp.skills
            FROM applications a JOIN users u ON u.id=a.freelancer_id
            LEFT JOIN freelancer_profiles fp ON fp.user_id=u.id
            WHERE a.project_id=? ORDER BY a.created_at DESC
        """, (project_id,)).fetchall()
        result = []
        for row in rows:
            item = dict(row)
            try:
                item["skills"] = json.loads(item["skills"] or "[]")
            except ValueError:
                item["skills"] = []
            result.append(item)
        return jsonify({"applications": result})
    finally:
        connection.close()


@app.patch("/api/applications/<int:application_id>")
@require_auth(required_roles=["client", "admin"])
def update_application(application_id):
    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).lower()
    if status not in ("accepted", "rejected", "pending"):
        return json_error("Status must be accepted, rejected, or pending.")
    connection = get_db_connection()
    try:
        row = connection.execute("""
            SELECT a.id,p.client_id FROM applications a
            JOIN projects p ON p.id=a.project_id WHERE a.id=?
        """, (application_id,)).fetchone()
        if row is None:
            return json_error("Application not found.", 404)
        if g.current_user["role"] == "client" and row["client_id"] != g.current_user["id"]:
            return json_error("You cannot update this application.", 403)
        connection.execute("UPDATE applications SET status=? WHERE id=?", (status, application_id))
        connection.commit()
        return jsonify({"message": "Application status updated."})
    finally:
        connection.close()


# FREELANCER APPLICATION HISTORY
@app.get("/api/my-applications")
@require_auth(required_roles=["freelancer"])
def my_applications():
    connection = get_db_connection()
    try:
        rows = connection.execute("""
            SELECT a.id,a.project_id,a.cover_letter,a.status,a.created_at,
                   p.title,p.category,p.budget,p.currency,p.duration,
                   COALESCE(NULLIF(cp.company_name,''),u.name,p.client) AS client
            FROM applications a
            JOIN projects p ON p.id=a.project_id
            LEFT JOIN users u ON u.id=p.client_id
            LEFT JOIN client_profiles cp ON cp.user_id=u.id
            WHERE a.freelancer_id=?
            ORDER BY a.created_at DESC
        """, (g.current_user["id"],)).fetchall()
        return jsonify({"applications":[dict(row) for row in rows]})
    finally:
        connection.close()


# CLIENT PROFILES
@app.get("/api/client-profile/me")
@require_auth(required_roles=["client"])
def get_my_client_profile():
    profile = get_client_profile(g.current_user["id"])
    if profile is None:
        return json_error("Could not find your account.", 404)
    return jsonify({"profile": profile})


@app.put("/api/client-profile/me")
@require_auth(required_roles=["client"])
def update_my_client_profile():
    data = request.get_json(silent=True) or {}
    fields = ("company_name", "industry", "location", "website", "description")
    limits = {"company_name":120,"industry":100,"location":120,"website":255,"description":2000}
    values = {}
    for field in fields:
        value = data.get(field, "")
        if not isinstance(value, str):
            return json_error(f"{field} must be text.")
        values[field] = value.strip()
        if len(values[field]) > limits[field]:
            return json_error(f"{field} must not exceed {limits[field]} characters.")
    website = values["website"]
    if website:
        parsed = urlparse(website)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            return json_error("Enter a valid website URL beginning with http:// or https://.")
    is_public = data.get("is_public", True)
    if not isinstance(is_public, bool):
        return json_error("is_public must be true or false.")
    connection = get_db_connection()
    try:
        connection.execute("""
            INSERT INTO client_profiles(user_id,company_name,industry,location,website,description,is_public,updated_at)
            VALUES(?,?,?,?,?,?,?,?)
            ON CONFLICT(user_id) DO UPDATE SET
                company_name=excluded.company_name,industry=excluded.industry,
                location=excluded.location,website=excluded.website,
                description=excluded.description,is_public=excluded.is_public,
                updated_at=excluded.updated_at
        """, (g.current_user["id"], values["company_name"], values["industry"],
              values["location"], values["website"], values["description"],
              int(is_public), now_iso()))
        connection.commit()
        profile = get_client_profile(g.current_user["id"])
        return jsonify({"message": "Client profile updated successfully.", "profile": profile})
    finally:
        connection.close()


@app.get("/api/clients")
@require_auth()
def search_clients():
    search = request.args.get("q", "").strip()
    if len(search) > 100:
        return json_error("Search query is too long.")
    pattern = f"%{search}%"
    connection = get_db_connection()
    try:
        rows = connection.execute("""
            SELECT u.id user_id,u.name,cp.company_name,cp.industry,cp.location,
                   cp.website,cp.description
            FROM users u JOIN client_profiles cp ON cp.user_id=u.id
            WHERE u.role='client' AND cp.is_public=1
              AND (u.name LIKE ? OR cp.company_name LIKE ? OR cp.industry LIKE ? OR cp.location LIKE ?)
            ORDER BY cp.updated_at DESC LIMIT 50
        """, (pattern,pattern,pattern,pattern)).fetchall()
        return jsonify({"clients": [dict(row) for row in rows]})
    finally:
        connection.close()


@app.get("/api/clients/<int:client_id>")
@require_auth()
def get_public_client(client_id):
    connection = get_db_connection()
    try:
        row = connection.execute("""
            SELECT u.id user_id,u.name,cp.company_name,cp.industry,cp.location,
                   cp.website,cp.description
            FROM users u JOIN client_profiles cp ON cp.user_id=u.id
            WHERE u.id=? AND u.role='client' AND cp.is_public=1
        """, (client_id,)).fetchone()
        if row is None:
            return json_error("Client profile not found or is private.", 404)
        return jsonify({"profile": dict(row)})
    finally:
        connection.close()


# FREELANCER PROFILE
@app.get("/api/freelancer-profile/me")
@require_auth(required_roles=["freelancer"])
def get_freelancer_profile():
    connection = get_db_connection()
    try:
        row = connection.execute("SELECT * FROM freelancer_profiles WHERE user_id=?", (g.current_user["id"],)).fetchone()
        if row is None:
            connection.execute("""
                INSERT INTO freelancer_profiles(user_id,updated_at) VALUES(?,?)
            """, (g.current_user["id"], now_iso()))
            connection.commit()
            row = connection.execute("SELECT * FROM freelancer_profiles WHERE user_id=?", (g.current_user["id"],)).fetchone()
        profile = dict(row)
        profile["name"] = g.current_user["name"]
        for field in ("skills", "portfolio"):
            try:
                profile[field] = json.loads(profile[field] or "[]")
            except ValueError:
                profile[field] = []
        return jsonify({"profile": profile})
    finally:
        connection.close()


@app.put("/api/freelancer-profile/me")
@require_auth(required_roles=["freelancer"])
def update_freelancer_profile():
    data = request.get_json(silent=True) or {}
    fields = ("title", "location", "bio", "education")
    limits = {"title":120,"location":120,"bio":2000,"education":200}
    values = {}
    for field in fields:
        value = data.get(field, "")
        if not isinstance(value, str):
            return json_error(f"{field} must be text.")
        values[field] = value.strip()
        if len(values[field]) > limits[field]:
            return json_error(f"{field} must not exceed {limits[field]} characters.")
    skills = data.get("skills", [])
    portfolio = data.get("portfolio", [])
    if not isinstance(skills, list) or not all(isinstance(x,str) for x in skills):
        return json_error("Skills must be a list of text values.")
    if not isinstance(portfolio, list) or not all(isinstance(x,dict) for x in portfolio):
        return json_error("Portfolio must be a list of project objects.")
    if len(skills)>50 or len(portfolio)>30:
        return json_error("Too many skills or portfolio items.")
    connection = get_db_connection()
    try:
        connection.execute("""
            INSERT INTO freelancer_profiles(user_id,title,location,bio,education,skills,portfolio,updated_at)
            VALUES(?,?,?,?,?,?,?,?)
            ON CONFLICT(user_id) DO UPDATE SET
                title=excluded.title,location=excluded.location,bio=excluded.bio,
                education=excluded.education,skills=excluded.skills,
                portfolio=excluded.portfolio,updated_at=excluded.updated_at
        """, (g.current_user["id"],values["title"],values["location"],values["bio"],
              values["education"],json.dumps(skills),json.dumps(portfolio),now_iso()))
        connection.commit()
        return jsonify({"message":"Freelancer profile saved."})
    finally:
        connection.close()


# ADMIN
@app.get("/api/admin/overview")
@require_auth(required_roles=["admin"])
def admin_overview():
    connection = get_db_connection()
    try:
        users = [dict(row) for row in connection.execute(
            "SELECT id,name,email,role,created_at,is_active FROM users ORDER BY id DESC"
        ).fetchall()]
        projects = [project_dict(row) for row in connection.execute("""
            SELECT p.*,COALESCE(NULLIF(cp.company_name,''),u.name,p.client) client_name,
                   u.name client_owner,
                   (SELECT COUNT(*) FROM applications a WHERE a.project_id=p.id) applications_count
            FROM projects p LEFT JOIN users u ON u.id=p.client_id
            LEFT JOIN client_profiles cp ON cp.user_id=u.id ORDER BY p.id DESC
        """).fetchall()]
        return jsonify({"users":users,"projects":projects})
    finally:
        connection.close()


@app.patch("/api/admin/users/<int:user_id>/status")
@require_auth(required_roles=["admin"])
def admin_update_user_status(user_id):
    data = request.get_json(silent=True) or {}
    is_active = data.get("is_active")
    if not isinstance(is_active, bool):
        return json_error("is_active must be true or false.")
    if user_id == g.current_user["id"]:
        return json_error("You cannot deactivate your own admin account.")
    connection = get_db_connection()
    try:
        cursor = connection.execute("UPDATE users SET is_active=? WHERE id=?", (int(is_active),user_id))
        connection.commit()
        if cursor.rowcount == 0:
            return json_error("User not found.",404)
        return jsonify({"message":"User status updated."})
    finally:
        connection.close()


@app.delete("/api/admin/projects/<int:project_id>")
@require_auth(required_roles=["admin"])
def admin_delete_project(project_id):
    connection = get_db_connection()
    try:
        cursor = connection.execute("DELETE FROM projects WHERE id=?", (project_id,))
        connection.commit()
        if cursor.rowcount == 0:
            return json_error("Project not found.",404)
        return jsonify({"message":"Project deleted."})
    finally:
        connection.close()


initialize_database()


if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))

    print("Youth Freelance Marketplace backend starting...")
    print(f"API running on port: {port}")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
