# routes/web_main.py
import json
import logging
import os
import secrets
import shutil
import time
from datetime import datetime, timedelta
from functools import wraps

from flask import (
    Blueprint,
    Response,
    abort,
    flash,
    jsonify,
    redirect,
    render_template,
    render_template_string,
    request,
    send_from_directory,
    session,
    url_for,
)

from models import ActiveSession, ConfiguracionSistema, Cuadernillo, User, UserCuadernilloActivation, UserRole, db


# Función para cargar los usuarios desde el archivo JSON
def load_users_from_json():
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "usuarios.json")
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"Archivo de usuarios no encontrado en: {json_path}")
        return {"usuarios_permitidos": [], "nombres": {}}
    except json.JSONDecodeError:
        logging.error(f"Error al decodificar JSON de usuarios en: {json_path}")
        return {"usuarios_permitidos": [], "nombres": {}}


# --- Autenticación ---


def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Por favor, inicia sesión para acceder a esta página.", "danger")
            return redirect(url_for("web_main.login"))

        user = User.query.get(session["user_id"])
        if not user or user.role != UserRole.ADMIN:
            flash("No tienes permiso para acceder a esta página.", "danger")
            return redirect(url_for("web_main.index_main"))

        return f(*args, **kwargs)

    return decorated_function


# -- Blueprints --

# Blueprint para el sitio principal
web_main_bp = Blueprint(
    "web_main",
    __name__,
    template_folder="../templates",
    static_folder="../templates/web_main",
)


@web_main_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            session["user_id"] = user.id
            session["username"] = user.username
            session["user_role"] = user.role.value
            session["logged_in"] = True
            flash("Has iniciado sesión correctamente.", "success")
            return redirect(url_for("admin.index"))
        else:
            flash("Usuario o contraseña incorrectos.", "danger")

    return render_template("admin/login.html")


@web_main_bp.route("/logout")
def logout():
    session.clear()
    flash("Has cerrado la sesión.", "info")
    return redirect(url_for("web_main.login"))


@web_main_bp.route("/api/validar", methods=["POST"])
def validar_usuario():
    """Valida el código de usuario y devuelve si está permitido (usando DB)."""
    if not request.is_json:
        return (
            jsonify(
                {
                    "permitido": False,
                    "mensaje": "Content-Type debe ser application/json",
                }
            ),
            400,
        )

    data = request.get_json()
    codigo = data.get("codigo")

    if not codigo:
        return (
            jsonify({"permitido": False, "mensaje": "Código de usuario no proporcionado"}),
            400,
        )

    # Buscar usuario por código en la base de datos
    user = User.query.filter_by(codigo=codigo).first()

    if user and user.is_active:
        # --- INICIO DE LA MODIFICACIÓN ---
        # 1. Verificar si ya existe una sesión activa para este usuario.
        existing_session = ActiveSession.query.filter_by(user_id=user.id).first()
        if existing_session:
            # --- MEJORA: Verificar si la sesión está inactiva (ej. 5 minutos) ---
            # Si last_seen es más antiguo que 5 minutos, borramos la vieja y permitimos la nueva.
            inactivity_limit = datetime.utcnow() - timedelta(minutes=5)

            # Aseguramos que last_seen no sea None
            last_activity = existing_session.last_seen or existing_session.login_time

            if last_activity < inactivity_limit:
                db.session.delete(existing_session)
                db.session.commit()
            else:
                # Si está activa y es reciente, no permitir el nuevo login.
                return (
                    jsonify(
                        {
                            "permitido": False,
                            "mensaje": "Este usuario ya tiene una sesión activa reciente en otro dispositivo.",
                        }
                    ),
                    409,
                )  # 409 Conflict

        # 2. Si no hay sesión, crear el nuevo registro.
        new_session = ActiveSession(
            user_id=user.id,
            session_id=secrets.token_hex(16),  # Genera un ID de sesión único
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string,
        )
        db.session.add(new_session)
        db.session.commit()
        # --- FIN DE LA MODIFICACIÓN ---
        return (
            jsonify(
                {
                    "permitido": True,
                    "session_id": new_session.session_id,  # Devolver el session_id
                    "usuario": {
                        "codigo": user.codigo,
                        "nombre_completo": user.nombre_completo,
                        "grado": user.grado,
                        "role": user.role.value,
                    },
                }
            ),
            200,
        )
    else:
        return (
            jsonify(
                {
                    "permitido": False,
                    "mensaje": "Código de usuario no reconocido o inactivo.",
                }
            ),
            401,
        )


# Get the absolute path to the project root
bp_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(bp_dir, "..", ".."))


@web_main_bp.route("/")
def index_main():
    """Sirve el index.html del directorio raíz del proyecto."""
    return send_from_directory(project_root, "index.html")


# Rutas administrativas en el mismo blueprint principal
@web_main_bp.route("/admin/promote-to-main", methods=["POST"])
@require_auth
def promote_to_main():
    """Promueve el contenido de web_test a web_main."""
    try:
        # Corrected paths to be absolute
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        test_dir = os.path.join(base_dir, "templates", "web_test")
        main_dir = os.path.join(base_dir, "templates", "web_main")

        if not os.path.exists(test_dir):
            return (
                jsonify({"success": False, "message": "Directorio de prueba no encontrado"}),
                404,
            )

        os.makedirs(main_dir, exist_ok=True)

        backup_dir = os.path.join(base_dir, "backups", f"web_main_{int(time.time())}")
        if os.path.exists(main_dir) and os.listdir(main_dir):
            os.makedirs(backup_dir, exist_ok=True)
            for item in os.listdir(main_dir):
                src = os.path.join(main_dir, item)
                dst = os.path.join(backup_dir, item)
                if os.path.isdir(src):
                    shutil.copytree(src, dst)
                else:
                    shutil.copy2(src, dst)

        for item in os.listdir(test_dir):
            src = os.path.join(test_dir, item)
            dst = os.path.join(main_dir, item)
            if os.path.isdir(src):
                shutil.rmtree(dst, ignore_errors=True)
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)

        return jsonify(
            {
                "success": True,
                "message": "Sitio promovido exitosamente",
                "backup_created": os.path.exists(backup_dir),
            }
        )

    except PermissionError:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Error de permisos al acceder a los archivos",
                }
            ),
            403,
        )
    except Exception as e:
        logging.error(f"Error al promover sitio: {str(e)}")
        return jsonify({"success": False, "message": "Error interno del servidor"}), 500


@web_main_bp.route("/favicon.ico")
def favicon():
    icon_path = os.path.join(
        web_main_bp.root_path,
        "..",
        "frontend",
        "css",
        "assets",
        "images",
        "favicon.ico",
    )
    if os.path.exists(icon_path):
        return send_from_directory(
            os.path.dirname(icon_path),
            os.path.basename(icon_path),
            mimetype="image/vnd.microsoft.icon",
        )
    else:
        # Return 204 No Content if the favicon is not found
        return Response(status=204)


@web_main_bp.route("/admin/api/promote", methods=["POST"])
@require_auth
def api_promote_site():
    """API endpoint para promover el sitio de prueba a principal."""
    return promote_to_main()
