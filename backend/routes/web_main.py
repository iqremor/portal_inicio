# routes/web_main.py
import os
import shutil
import time
import logging
from functools import wraps
from flask import (
    Blueprint, send_from_directory, abort, jsonify, flash,
    render_template_string, session, redirect, url_for, request, render_template
)
from models import db, User, UserRole, ConfiguracionSistema

# --- Autenticación ---

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Por favor, inicia sesión para acceder a esta página.', 'danger')
            return redirect(url_for('web_main.login'))
        
        user = User.query.get(session['user_id'])
        if not user or user.role != UserRole.ADMIN:
            flash('No tienes permiso para acceder a esta página.', 'danger')
            return redirect(url_for('web_main.index_main'))
            
        return f(*args, **kwargs)
    return decorated_function

# -- Blueprints --

# Blueprint para el sitio principal
web_main_bp = Blueprint(
    'web_main',
    __name__,
    template_folder='../templates',
    static_folder='../templates/web_main'
)

@web_main_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['user_role'] = user.role.value
            session['logged_in'] = True
            flash('Has iniciado sesión correctamente.', 'success')
            return redirect(url_for('admin.index'))
        else:
            flash('Usuario o contraseña incorrectos.', 'danger')
            
    return render_template('admin/login.html')

@web_main_bp.route('/logout')
def logout():
    session.clear()
    flash('Has cerrado la sesión.', 'info')
    return redirect(url_for('web_main.login'))


@web_main_bp.route('/')
def index_main():
    """Renderiza la página principal del sitio web."""
    return render_template('web_main/index.html')

@web_main_bp.route('/<path:filename>')
def serve_static_main(filename):
    """Sirve archivos estáticos desde la carpeta web_main."""
    return send_from_directory(web_main_bp.static_folder, filename)

# Rutas administrativas en el mismo blueprint principal
@web_main_bp.route('/admin/promote-to-main', methods=['POST'])
@require_auth
def promote_to_main():
    """Promueve el contenido de web_test a web_main."""
    try:
        # Corrected paths to be absolute
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        test_dir = os.path.join(base_dir, 'templates', 'web_test')
        main_dir = os.path.join(base_dir, 'templates', 'web_main')
        
        if not os.path.exists(test_dir):
            return jsonify({
                'success': False, 
                'message': 'Directorio de prueba no encontrado'
            }), 404
        
        os.makedirs(main_dir, exist_ok=True)
        
        backup_dir = os.path.join(base_dir, 'backups', f'web_main_{int(time.time())}')
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
        
        return jsonify({
            'success': True, 
            'message': 'Sitio promovido exitosamente',
            'backup_created': os.path.exists(backup_dir)
        })
        
    except PermissionError:
        return jsonify({
            'success': False, 
            'message': 'Error de permisos al acceder a los archivos'
        }), 403
    except Exception as e:
        logging.error(f"Error al promover sitio: {str(e)}")
        return jsonify({
            'success': False, 
            'message': 'Error interno del servidor'
        }), 500

@web_main_bp.route('/admin/api/promote', methods=['POST'])
@require_auth
def api_promote_site():
    """API endpoint para promover el sitio de prueba a principal."""
    return promote_to_main()