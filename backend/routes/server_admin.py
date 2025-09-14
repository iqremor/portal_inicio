from flask import Blueprint, render_template, jsonify, session, redirect, url_for, request, flash
from utils.server_control import server_manager
from app import create_app # Needed for app context in some cases, though server_manager handles it
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