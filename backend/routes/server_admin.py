import logging
from functools import wraps  # Added wraps

from flask import Blueprint, flash, jsonify, redirect, render_template, request, session, url_for

from app import db  # Removed unused create_app
from models import ActiveSession, Cuadernillo, ExamAnswer, ExamResult, User  # Added additional models
from utils.server_control import server_manager

server_admin_bp = Blueprint("server_admin", __name__, url_prefix="/server-admin")
log = logging.getLogger(__name__)


# Decorator for authentication
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("logged_in"):
            flash("Por favor, inicia sesión para acceder a esta página.", "warning")
            return redirect(url_for("admin.login_view", next=request.url))
        return f(*args, **kwargs)

    return decorated_function


@server_admin_bp.route("/dashboard")
@login_required
def dashboard():
    """Renders the server administration dashboard."""
    return render_template("server_admin/dashboard.html")


@server_admin_bp.route("/status", methods=["GET"])
@login_required
def get_status():
    """Returns the current status of the server."""
    status = "running" if server_manager.is_running() else "stopped"
    return jsonify(status=status)


@server_admin_bp.route("/start", methods=["POST"])
@login_required
def start_server():
    """Starts the server."""
    if server_manager.start_server():
        return jsonify(success=True, message="Servidor iniciado exitosamente.")
    else:
        return (
            jsonify(
                success=False,
                message="El servidor ya está en ejecución o no se pudo iniciar.",
            ),
            400,
        )


@server_admin_bp.route("/stop", methods=["POST"])
@login_required
def stop_server():
    """Stops the server."""
    if server_manager.stop_server():
        return jsonify(success=True, message="Servidor detenido exitosamente.")
    else:
        return (
            jsonify(
                success=False,
                message="El servidor no está en ejecución o no se pudo detener.",
            ),
            400,
        )


@server_admin_bp.route("/restart", methods=["POST"])
@login_required
def restart_server():
    """Restarts the server."""
    if server_manager.restart_server():
        return jsonify(success=True, message="Servidor reiniciado exitosamente.")
    else:
        return jsonify(success=False, message="El servidor no se pudo reiniciar."), 400


@server_admin_bp.route("/logout_user/<int:user_id>", methods=["POST"])
@login_required
def logout_user(user_id):
    """Logs out a specific user by deleting their active sessions."""
    try:
        sessions_to_delete = ActiveSession.query.filter_by(user_id=user_id).all()
        if not sessions_to_delete:
            return (
                jsonify(
                    success=False,
                    message=f"No se encontraron sesiones activas para el usuario con ID {user_id}.",
                ),
                404,
            )

        for session_to_delete in sessions_to_delete:
            db.session.delete(session_to_delete)
        db.session.commit()
        return (
            jsonify(
                success=True,
                message=f"Se cerraron todas las sesiones para el usuario con ID {user_id}.",
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        log.error(f"Error al cerrar sesiones para el usuario {user_id}: {e}")
        return (
            jsonify(success=False, message=f"Error interno al cerrar sesiones: {str(e)}"),
            500,
        )


@server_admin_bp.route("/logout_all_users", methods=["POST"])
@login_required
def logout_all_users():
    """Cierra todas las sesiones activas en el sistema."""
    try:
        num_deleted = db.session.query(ActiveSession).delete()
        db.session.commit()
        return (
            jsonify(
                success=True,
                message=f"Se han cerrado todas las sesiones activas ({num_deleted} sesiones eliminadas).",
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        log.error(f"Error al cerrar todas las sesiones: {e}")
        return (
            jsonify(
                success=False,
                message=f"Error interno al cerrar todas las sesiones: {str(e)}",
            ),
            500,
        )


@server_admin_bp.route("/active_sessions", methods=["GET"])
@login_required
def get_active_sessions():
    """Returns a list of all active user sessions."""
    try:
        active_sessions = ActiveSession.query.all()
        sessions_data = []
        for s in active_sessions:
            user = User.query.get(s.user_id)
            if user:
                sessions_data.append(
                    {
                        "id": s.id,
                        "user_id": s.user_id,
                        "username": user.username,
                        "login_time": s.login_time.isoformat(),
                        "last_seen": s.last_seen.isoformat(),
                        "ip_address": s.ip_address,
                        "user_agent": s.user_agent,
                    }
                )
        return jsonify(sessions=sessions_data), 200
    except Exception as e:
        log.error(f"Error al obtener sesiones activas: {e}")
        return (
            jsonify(
                success=False,
                message=f"Error interno al obtener sesiones activas: {str(e)}",
            ),
            500,
        )


@server_admin_bp.route("/users_by_grade/<string:grado>", methods=["GET"])
@login_required
def get_users_by_grade(grado):
    """Retorna una lista de usuarios filtrados por grado."""
    try:
        users = User.query.filter_by(grado=grado).all()
        users_data = [{"id": u.id, "codigo": u.codigo, "nombre_completo": u.nombre_completo} for u in users]
        return jsonify(success=True, users=users_data), 200
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500


@server_admin_bp.route("/user_results/<int:user_id>", methods=["GET"])
@login_required
def get_user_results(user_id):
    """Retorna los resultados de los exámenes realizados por un usuario."""
    try:
        results = ExamResult.query.filter_by(user_id=user_id).all()
        results_data = []
        for r in results:
            cuadernillo = Cuadernillo.query.get(r.cuadernillo_id)
            results_data.append(
                {
                    "id": r.id,
                    "cuadernillo_id": r.cuadernillo_id,
                    "area": cuadernillo.area if cuadernillo else "N/A",
                    "final_score": r.final_score,
                    "attempt_number": r.attempt_number,
                    "completion_date": r.completion_date.isoformat(),
                }
            )
        return jsonify(success=True, results=results_data), 200
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500


@server_admin_bp.route("/reset_exam_attempts", methods=["POST"])
@login_required
def reset_exam_attempts():
    """Elimina todos los intentos de un estudiante para un examen específico."""
    data = request.get_json()
    user_id = data.get("user_id")
    cuadernillo_id = data.get("cuadernillo_id")

    if not user_id or not cuadernillo_id:
        return jsonify(success=False, message="Faltan parámetros requeridos."), 400

    try:
        # Eliminar respuestas detalladas
        ExamAnswer.query.filter_by(user_id=user_id, cuadernillo_id=cuadernillo_id).delete()
        # Eliminar resultados (intentos)
        ExamResult.query.filter_by(user_id=user_id, cuadernillo_id=cuadernillo_id).delete()

        db.session.commit()
        return (
            jsonify(
                success=True,
                message="Intentos reactivados correctamente. El estudiante puede iniciar de nuevo.",
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify(success=False, message=f"Error al resetear: {str(e)}"), 500


@server_admin_bp.route("/reset_grade_attempts", methods=["POST"])
@login_required
def reset_grade_attempts():
    """Elimina todos los intentos de todos los estudiantes de un grado específico."""
    data = request.get_json()
    grado = data.get("grado")

    if not grado:
        return jsonify(success=False, message="Debe especificar el grado."), 400

    try:
        # Obtener IDs de todos los usuarios del grado
        user_ids = [u.id for u in User.query.filter_by(grado=grado).all()]

        if not user_ids:
            return (
                jsonify(success=False, message=f"No hay estudiantes en el grado {grado}."),
                404,
            )

        # Eliminar respuestas y resultados para todos esos usuarios
        ExamAnswer.query.filter(ExamAnswer.user_id.in_(user_ids)).delete(synchronize_session=False)
        ExamResult.query.filter(ExamResult.user_id.in_(user_ids)).delete(synchronize_session=False)

        db.session.commit()
        return (
            jsonify(
                success=True,
                message=f"Se han reactivado los intentos para TODOS los estudiantes del grado {grado}.",
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify(success=False, message=f"Error al resetear grado: {str(e)}"), 500
