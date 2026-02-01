from flask import Blueprint, render_template, jsonify, session, redirect, url_for, request, flash
from utils.server_control import server_manager
from app import create_app, db # Added db import
from models import ActiveSession, User # Added User import
import logging
from functools import wraps # Added wraps

server_admin_bp = Blueprint('server_admin', __name__, url_prefix='/server-admin')
log = logging.getLogger(__name__)

# Decorator for authentication
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            flash('Por favor, inicia sesión para acceder a esta página.', 'warning')
            return redirect(url_for('admin.login_view', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@server_admin_bp.route('/dashboard')
@login_required
def dashboard():
    """Renders the server administration dashboard."""
    return render_template('server_admin/dashboard.html')

@server_admin_bp.route('/status', methods=['GET'])
@login_required
def get_status():
    """Returns the current status of the server."""
    status = "running" if server_manager.is_running() else "stopped"
    return jsonify(status=status)

@server_admin_bp.route('/start', methods=['POST'])
@login_required
def start_server():
    """Starts the server."""
    if server_manager.start_server():
        return jsonify(success=True, message="Servidor iniciado exitosamente.")
    else:
        return jsonify(success=False, message="El servidor ya está en ejecución o no se pudo iniciar."), 400

@server_admin_bp.route('/stop', methods=['POST'])
@login_required
def stop_server():
    """Stops the server."""
    if server_manager.stop_server():
        return jsonify(success=True, message="Servidor detenido exitosamente.")
    else:
        return jsonify(success=False, message="El servidor no está en ejecución o no se pudo detener."), 400

@server_admin_bp.route('/restart', methods=['POST'])
@login_required
def restart_server():
    """Restarts the server."""
    if server_manager.restart_server():
        return jsonify(success=True, message="Servidor reiniciado exitosamente.")
    else:
        return jsonify(success=False, message="El servidor no se pudo reiniciar."), 400

@server_admin_bp.route('/logout_user/<int:user_id>', methods=['POST'])
@login_required
def logout_user(user_id):
    """Logs out a specific user by deleting their active sessions."""
    try:
        sessions_to_delete = ActiveSession.query.filter_by(user_id=user_id).all()
        if not sessions_to_delete:
            return jsonify(success=False, message=f"No se encontraron sesiones activas para el usuario con ID {user_id}."), 404

        for session_to_delete in sessions_to_delete:
            db.session.delete(session_to_delete)
        db.session.commit()
        return jsonify(success=True, message=f"Se cerraron todas las sesiones para el usuario con ID {user_id}."), 200
    except Exception as e:
        db.session.rollback()
        log.error(f"Error al cerrar sesiones para el usuario {user_id}: {e}")
        return jsonify(success=False, message=f"Error interno al cerrar sesiones: {str(e)}"), 500

@server_admin_bp.route('/active_sessions', methods=['GET'])
@login_required
def get_active_sessions():
    """Returns a list of all active user sessions."""
    try:
        active_sessions = ActiveSession.query.all()
        sessions_data = []
        for session in active_sessions:
            user = User.query.get(session.user_id)
            if user:
                sessions_data.append({
                    'id': session.id,
                    'user_id': session.user_id,
                    'username': user.username,
                    'login_time': session.login_time.isoformat(),
                    'last_seen': session.last_seen.isoformat(),
                    'ip_address': session.ip_address,
                    'user_agent': session.user_agent
                })
        return jsonify(sessions=sessions_data), 200
    except Exception as e:
        log.error(f"Error al obtener sesiones activas: {e}")
        return jsonify(success=False, message=f"Error interno al obtener sesiones activas: {str(e)}"), 500