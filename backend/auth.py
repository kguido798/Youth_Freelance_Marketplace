
import os
from functools import wraps

from flask import Blueprint, jsonify, request, g
from itsdangerous import (
    URLSafeTimedSerializer,
    BadSignature,
    SignatureExpired,
)
from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)

from database import get_db_connection

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

SECRET_KEY = os.environ.get("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "Set the SECRET_KEY environment variable before starting Flask."
    )

serializer = URLSafeTimedSerializer(
    SECRET_KEY,
    salt="youth-marketplace-auth",
)

TOKEN_MAX_AGE = 60 * 60 * 8


def public_user(user):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
    }


def create_auth_token(user):
    return serializer.dumps({
        "user_id": user["id"],
        "role": user["role"],
    })


def get_current_user():
    authorization = request.headers.get("Authorization", "")

    if not authorization.startswith("Bearer "):
        return None

    token = authorization[len("Bearer "):].strip()

    try:
        payload = serializer.loads(
            token,
            max_age=TOKEN_MAX_AGE,
        )
    except (BadSignature, SignatureExpired):
        return None

    connection = get_db_connection()

    try:
        user = connection.execute(
            "SELECT * FROM users WHERE id = ?",
            (payload.get("user_id"),),
        ).fetchone()
    finally:
        connection.close()

    # Read the role from the database, not from client input.
    if user is None or not user["is_active"]:
        return None

    return user


def require_auth(required_roles=None):
    def decorator(view_function):
        @wraps(view_function)
        def wrapped(*args, **kwargs):
            user = get_current_user()

            if user is None:
                return jsonify({
                    "error": "Authentication required."
                }), 401

            if (
                required_roles
                and user["role"] not in required_roles
            ):
                return jsonify({
                    "error": "You do not have permission."
                }), 403

            g.current_user = user
            return view_function(*args, **kwargs)

        return wrapped

    return decorator


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    role = str(
        data.get("role", "freelancer")
    ).strip().lower()

    if not name or not email or not isinstance(password, str):
        return jsonify({
            "error": "Name, email, and password are required."
        }), 400

    if len(name) > 100 or len(email) > 254:
        return jsonify({
            "error": "Name or email is too long."
        }), 400

    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        return jsonify({
            "error": "Enter a valid email address."
        }), 400

    if len(password) < 8 or len(password) > 128:
        return jsonify({
            "error": "Password must contain 8 to 128 characters."
        }), 400

    # Admin accounts cannot be created through public registration.
    if role not in ("freelancer", "client"):
        return jsonify({
            "error": "Choose Freelancer or Client."
        }), 400

    connection = get_db_connection()

    try:
        cursor = connection.execute(
            """
            INSERT INTO users
                (name, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            """,
            (
                name,
                email,
                generate_password_hash(password),
                role,
            ),
        )
        connection.commit()

        user = connection.execute(
            "SELECT * FROM users WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()

    except Exception as error:
        connection.rollback()

        # Do not expose database details to the client.
        if "UNIQUE constraint failed" in str(error):
            return jsonify({
                "error": "An account with this email already exists."
            }), 409

        raise

    finally:
        connection.close()

    return jsonify({
        "message": "Account created successfully.",
        "user": public_user(user),
        "token": create_auth_token(user),
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not email or not isinstance(password, str) or not password:
        return jsonify({
            "error": "Email and password are required."
        }), 400

    connection = get_db_connection()

    try:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    finally:
        connection.close()

    if user is None or not user["is_active"] or not check_password_hash(
        user["password_hash"], password
    ):
        return jsonify({
            "error": "Invalid email or password."
        }), 401

    return jsonify({
        "message": "Login successful.",
        "user": public_user(user),
        "token": create_auth_token(user),
    })


@auth_bp.get("/me")
@require_auth()
def current_user():
    return jsonify({
        "user": public_user(g.current_user)
    })


@auth_bp.post("/logout")
@require_auth()
def logout():
    # The frontend must discard the token.
    # Stateless tokens remain valid until expiration otherwise.
    return jsonify({
        "message": "Logged out. Remove the saved token in the frontend."
    })
