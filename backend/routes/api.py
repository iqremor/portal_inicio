# backend/routes/api.py
from flask import Blueprint, jsonify, request
from models import Cuadernillo, User, ActiveSession, db
import random

api_bp = Blueprint('api_bp', __name__)

@api_bp.route('/examenes/<string:area_id>/iniciar', methods=['POST'])
def start_examen(area_id):
    """
    Inicia una sesión de examen para un usuario, asociando un cuadernillo a su sesión activa.
    Devuelve el session_id de la sesión activa.
    """
    data = request.get_json()
    user_codigo = data.get('codigo')
    grade = data.get('grado') # Asumimos que el grado también viene en el body para consistencia

    if not area_id or not grade or not user_codigo:
        return jsonify({"error": "Los parámetros 'areaId', 'grade' y 'codigo' son requeridos"}), 400

    user = User.query.filter_by(codigo=user_codigo).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    active_session = ActiveSession.query.filter_by(user_id=user.id).first()
    if not active_session:
        return jsonify({"error": "No se encontró una sesión activa para este usuario. Por favor, inicie sesión nuevamente."}), 404

    cuadernillo = Cuadernillo.query.filter_by(area=area_id, grado=grade).first()
    if not cuadernillo:
        return jsonify({"error": f"No se encontró un cuadernillo para el área '{area_id}' y grado '{grade}'"}), 404

    from models import ExamAvailability
    availability = ExamAvailability.query.filter_by(cuadernillo_id=cuadernillo.id, grado=grade).first()
    if availability and not availability.is_enabled:
        return jsonify({"error": "Este examen no está disponible en este momento."}), 403

    active_session.cuadernillo_id = cuadernillo.id
    db.session.commit()

    return jsonify({"sesion_id": active_session.session_id})

@api_bp.route('/examenes', methods=['GET'])
def get_examenes():
    """
    Retorna una lista de todos los cuadernillos disponibles.
    """
    cuadernillos = Cuadernillo.query.all()
    cuadernillos_data = []
    for cuadernillo in cuadernillos:
        cuadernillos_data.append({
            'id': cuadernillo.id,
            'nombre': cuadernillo.nombre,
            'area': cuadernillo.area,
            'grado': cuadernillo.grado,
            'tiempo_limite_minutos': cuadernillo.tiempo_limite_minutos,
            'dir_banco': cuadernillo.dir_banco
        })
    return jsonify(cuadernillos_data)

@api_bp.route('/examen/<string:session_id>', methods=['GET'])
def get_exam_questions_by_session(session_id):
    """
    Obtiene las preguntas y la configuración de un examen para una sesión activa específica.
    """
    active_session = ActiveSession.query.filter_by(session_id=session_id).first()

    if not active_session:
        return jsonify({"error": "Sesión de examen no encontrada o inactiva."}), 404

    print(f"DEBUG: Sesión activa encontrada. cuadernillo_id: {active_session.cuadernillo_id}")
    cuadernillo = Cuadernillo.query.get(active_session.cuadernillo_id)
    if not cuadernillo:
        print(f"DEBUG: Cuadernillo no encontrado para cuadernillo_id: {active_session.cuadernillo_id}")
        return jsonify({"error": "Cuadernillo asociado a la sesión no encontrado."}), 404

    # Aquí deberíamos recuperar las preguntas que se seleccionaron al iniciar la sesión.
    # Por ahora, para que el flujo funcione, generaremos un conjunto aleatorio de preguntas.
    # Esto es una deuda técnica: las preguntas seleccionadas deberían persistir en la ActiveSession
    # o en una tabla intermedia al iniciar el examen.
    total_preguntas = cuadernillo.total_preguntas_banco
    
    # Ensure dir_banco starts with the correct relative path for /data_files/
    # It should remove any leading 'data/' or '/data/'
    print(f"DEBUG: Raw cuadernillo.dir_banco: {cuadernillo.dir_banco}")
    cleaned_dir_banco = cuadernillo.dir_banco

    # Remove leading 'data/' or '/data/' repeatedly until no more prefixes are found
    while cleaned_dir_banco.startswith('data/') or cleaned_dir_banco.startswith('/data/'):
        if cleaned_dir_banco.startswith('/data/'):
            cleaned_dir_banco = cleaned_dir_banco[len('/data/'):]
        elif cleaned_dir_banco.startswith('data/'):
            cleaned_dir_banco = cleaned_dir_banco[len('data/'):]
    print(f"DEBUG: Cleaned dir_banco: {cleaned_dir_banco}")
    base_path = f"/data_files/{cleaned_dir_banco}"
    
    image_filenames = [f"pregunta_{i:02d}.jpg" for i in range(1, total_preguntas + 1)]
    
    random.shuffle(image_filenames)
    # Asumimos que siempre se seleccionan 10 preguntas, como en la ruta /examenes/start
    preguntas_seleccionadas = image_filenames[:10] 

    questions_urls = [f"{base_path}/{filename}" for filename in preguntas_seleccionadas]

    exam_data = {
        "titulo": cuadernillo.nombre, # Usar el nombre del cuadernillo como título del examen
        "dir_banco": cuadernillo.dir_banco, # Añadir dir_banco
        "total_preguntas_banco": cuadernillo.total_preguntas_banco, # Añadir total_preguntas_banco
        "config": { # Añadir la configuración esperada por el frontend
            "nextButtonDelay": 1000, # Valor fijo o configurable
            "subject": cuadernillo.area,
            "Grado": cuadernillo.grado,
            "numQuestions": 10 # Asumir 10 preguntas seleccionadas para el examen
        }
    }

    return jsonify(exam_data)

@api_bp.route('/examenes/attempts', methods=['GET'])
def get_attempts():
    # Lógica de autenticación y base de datos irá aquí
    # Por ahora, devolvemos un valor fijo para que el frontend pueda avanzar
    return jsonify({"attemptCount": 0})

@api_bp.route('/examen/<string:session_id>/finalizar', methods=['POST'])
def submit_exam(session_id):
    # Lógica para recibir respuestas, calcular nota y guardar en BD irá aquí
    # Por ahora, devolvemos un resultado de ejemplo
    data = request.get_json()
    user_codigo = data.get('codigo')
    attempts_count = data.get('intentos')

    if not user_codigo:
        return jsonify({"message": "Código de usuario no proporcionado para finalizar el examen"}), 400

    print(f"Sesión ID: {session_id}, Código de Usuario: {user_codigo}, Intentos: {attempts_count}")

    user = User.query.filter_by(codigo=user_codigo).first()
    if user:
        active_session = ActiveSession.query.filter_by(user_id=user.id, session_id=session_id).first()
        if active_session:
            active_session.cuadernillo_id = None # Clear the exam ID
            db.session.commit()
    
    return jsonify({"message": "Examen recibido", "score": 0})

from functools import wraps
from flask import session, redirect, url_for, flash

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in') or session.get('user_role') != 'admin':
            flash('Se requieren permisos de administrador para esta acción.', 'danger')
            return redirect(url_for('admin.login_view'))
        return f(*args, **kwargs)
    return decorated_function

@api_bp.route('/users/<int:user_id>/cuadernillos/<int:cuadernillo_id>/toggle-activation', methods=['POST'])
@admin_required
def toggle_cuadernillo_activation(user_id, cuadernillo_id):
    """
    Activa o desactiva un cuadernillo para un usuario específico.
    """
    from models import UserCuadernilloActivation

    # Verificar que el usuario y el cuadernillo existen
    user = User.query.get(user_id)
    cuadernillo = Cuadernillo.query.get(cuadernillo_id)

    if not user or not cuadernillo:
        return jsonify({"success": False, "message": "Usuario o cuadernillo no encontrado."}), 404

    # Buscar el registro de activación
    activation = UserCuadernilloActivation.query.filter_by(
        user_id=user_id,
        cuadernillo_id=cuadernillo_id
    ).first()

    if activation:
        # Si existe, cambiar el estado
        activation.is_active = not activation.is_active
        new_status = activation.is_active
    else:
        # Si no existe, crear uno nuevo y activarlo
        activation = UserCuadernilloActivation(
            user_id=user_id,
            cuadernillo_id=cuadernillo_id,
            is_active=True
        )
        db.session.add(activation)
        new_status = True

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": f"Estado de activación del cuadernillo cambiado a {'Activo' if new_status else 'Inactivo'}.",
            "is_active": new_status
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error al actualizar la base de datos: {str(e)}"}), 500
