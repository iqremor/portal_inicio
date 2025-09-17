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
import json
from models import db, User, UserRole, ConfiguracionSistema, Cuadernillo, ActiveSession
import secrets

# Función para cargar los usuarios desde el archivo JSON
def load_users_from_json():
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'usuarios.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
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

@web_main_bp.route('/api/validar', methods=['POST'])
def validar_usuario():
    """Valida el código de usuario y devuelve si está permitido (usando DB)."""
    if not request.is_json:
        return jsonify({"permitido": False, "mensaje": "Content-Type debe ser application/json"}), 400

    data = request.get_json()
    codigo = data.get('codigo')

    if not codigo:
        return jsonify({"permitido": False, "mensaje": "Código de usuario no proporcionado"}), 400

    # Buscar usuario por código en la base de datos
    user = User.query.filter_by(codigo=codigo).first()

    if user and user.is_active:
        # --- INICIO DE LA MODIFICACIÓN ---
        # 1. Verificar si ya existe una sesión activa para este usuario.
        existing_session = ActiveSession.query.filter_by(user_id=user.id).first()
        if existing_session:
            # Si ya existe, no permitir el nuevo login.
            return jsonify({
                "permitido": False, 
                "mensaje": "Este usuario ya tiene una sesión activa en otro dispositivo."
            }), 409 # 409 Conflict

        # 2. Si no hay sesión, crear el nuevo registro.
        new_session = ActiveSession(
            user_id=user.id,
            session_id=secrets.token_hex(16),  # Genera un ID de sesión único
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string
        )
        db.session.add(new_session)
        db.session.commit()
        # --- FIN DE LA MODIFICACIÓN ---
        return jsonify({
            "permitido": True,
            "usuario": {
                "codigo": user.codigo,
                "nombre_completo": user.nombre_completo,
                "grado": user.grado,
                "role": user.role.value
            }
        }), 200
    else:
        return jsonify({"permitido": False, "mensaje": "Código de usuario no reconocido o inactivo."}), 401

@web_main_bp.route('/api/usuario/<string:codigo>', methods=['GET'])
def get_user_data(codigo):
    """Obtiene los datos completos de un usuario por su código."""
    user = User.query.filter_by(codigo=codigo).first()

    if user:
        return jsonify({
            "codigo": user.codigo,
            "nombre_completo": user.nombre_completo,
            "grado": user.grado,
            "role": user.role.value
        }), 200
    else:
        return jsonify({"mensaje": "Usuario no encontrado"}), 404

# Get the absolute path to the project root
bp_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(bp_dir, '..', '..'))

@web_main_bp.route('/')
def index_main():
    """Sirve el index.html del directorio raíz del proyecto."""
    return send_from_directory(project_root, 'index.html')



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

@web_main_bp.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(web_main_bp.root_path, '..', 'frontend', 'css', 'assets', 'images'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@web_main_bp.route('/admin/api/promote', methods=['POST'])
@require_auth
def api_promote_site():
    """API endpoint para promover el sitio de prueba a principal."""
    return promote_to_main()

@web_main_bp.route('/api/examenes/grado/<string:grado>')
def get_examenes_por_grado(grado):
    """
    Devuelve una lista de TODOS los exámenes (cuadernillos) para un grado específico.
    Ahora incluye los activos y los inactivos para que el frontend decida cómo mostrarlos.
    """
    # Se elimina el filtro `activo=True` para obtener todos los cuadernillos del grado.
    examenes = Cuadernillo.query.filter_by(grado=grado).all()
    
    # Convertir los objetos a una lista de diccionarios
    examenes_dict = [examen.to_dict() for examen in examenes]
    
    return jsonify(examenes_dict)

@web_main_bp.route('/api/logout', methods=['POST'])
def api_logout():
    """API endpoint para manejar el logout del estudiante."""
    if not request.is_json:
        return jsonify({"message": "Content-Type debe ser application/json"}), 400

    data = request.get_json()
    codigo = data.get('codigo')

    if not codigo:
        return jsonify({"message": "Código de usuario no proporcionado"}), 400

    user = User.query.filter_by(codigo=codigo).first()
    if user:
        ActiveSession.query.filter_by(user_id=user.id).delete()
        db.session.commit()
    
    return jsonify({"message": "Logout procesado"}), 200
