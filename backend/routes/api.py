# backend/routes/api.py
from flask import Blueprint, jsonify, request
from models import Cuadernillo, User, ActiveSession, db
import random

api_bp = Blueprint('api_bp', __name__)

@api_bp.route('/examenes/start', methods=['GET'])
def start_examen():
    """ 
    Inicia una sesión de examen, obtiene las preguntas y la configuración.
    """
    # Obtener parámetros de la URL (ej: /api/examenes/start?areaId=ciencias&grade=7)
    area_id = request.args.get('areaId')
    session_id = request.args.get('sessionId') # No se usa aún, pero se recibe
    grade = request.args.get('grade')
    user_codigo = request.args.get('userCodigo') # Obtener el código del usuario

    if not area_id or not grade or not user_codigo: # Validar también userCodigo
        return jsonify({"error": "Los parámetros 'areaId', 'grade' y 'userCodigo' son requeridos"}), 400

    # Buscar el cuadernillo correspondiente en la base de datos, filtrando por área Y grado
    cuadernillo = Cuadernillo.query.filter_by(area=area_id, grado=grade).first() # <--- MODIFICADO

    if not cuadernillo:
        return jsonify({"error": f"No se encontró un cuadernillo para el área '{area_id}' y grado '{grade}'"}), 404

    # --- INICIO DE LA MODIFICACIÓN ---
    # 1. Encontrar al usuario y su sesión activa
    user = User.query.filter_by(codigo=user_codigo).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    active_session = ActiveSession.query.filter_by(user_id=user.id).first()
    if not active_session:
        # Esto no debería pasar si el login funciona correctamente, pero es una buena verificación
        return jsonify({"error": "No se encontró una sesión activa para este usuario"}), 404

    # 2. Actualizar la sesión activa con el cuadernillo_id
    active_session.cuadernillo_id = cuadernillo.id
    db.session.commit()
    # --- FIN DE LA MODIFICACIÓN ---

    # Generar la lista de posibles preguntas
    total_preguntas = cuadernillo.total_preguntas_banco
    base_path = f"/static/{cuadernillo.dir_banco}"
    
    image_filenames = [f"pregunta_{i:02d}.jpg" for i in range(1, total_preguntas + 1)]
    
    random.shuffle(image_filenames)
    preguntas_seleccionadas = image_filenames[:10]

    questions_urls = [f"{base_path}/{filename}" for filename in preguntas_seleccionadas]

    exam_data = {
        "questions": questions_urls,
        "config": {
            "timerDuration": 240,
            "warningTime": 30,
            "nextButtonDelay": 1000,
            "numIntentos": cuadernillo.total_preguntas_banco, # Usar total_preguntas_banco del cuadernillo
            "subject": cuadernillo.area, # Asignatura del cuadernillo
            "Grado": cuadernillo.grado, # Grado del cuadernillo
            "numQuestions": len(preguntas_seleccionadas) # Número de preguntas seleccionadas
        }
    }

    return jsonify(exam_data)

@api_bp.route('/examenes/attempts', methods=['GET'])
def get_attempts():
    # Lógica de autenticación y base de datos irá aquí
    # Por ahora, devolvemos un valor fijo para que el frontend pueda avanzar
    return jsonify({"attemptCount": 0})

@api_bp.route('/examenes/submit', methods=['POST'])
def submit_exam():
    # Lógica para recibir respuestas, calcular nota y guardar en BD irá aquí
    # Por ahora, devolvemos un resultado de ejemplo
    data = request.get_json()
    # Assuming 'codigo' is sent in the JSON body for identification
    user_codigo = data.get('codigo') 

    if not user_codigo:
        return jsonify({"message": "Código de usuario no proporcionado para submit"}), 400

    user = User.query.filter_by(codigo=user_codigo).first()
    if user:
        active_session = ActiveSession.query.filter_by(user_id=user.id).first()
        if active_session:
            active_session.cuadernillo_id = None # Clear the exam ID
            db.session.commit()
    
    print(f"Recibido para guardar: {data}")
    return jsonify({"message": "Examen recibido", "score": 0})
