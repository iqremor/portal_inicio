# backend/routes/api.py
from flask import Blueprint, jsonify, request
from models import Cuadernillo
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
    grade = request.args.get('grade') # <--- NUEVO: Obtener el grado de la petición

    if not area_id or not grade: # <--- MODIFICADO: Validar también el grado
        return jsonify({"error": "Los parámetros 'areaId' y 'grade' son requeridos"}), 400

    # Buscar el cuadernillo correspondiente en la base de datos, filtrando por área Y grado
    cuadernillo = Cuadernillo.query.filter_by(area=area_id, grado=grade).first() # <--- MODIFICADO

    if not cuadernillo:
        return jsonify({"error": f"No se encontró un cuadernillo para el área '{area_id}' y grado '{grade}'"}), 404

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
    print(f"Recibido para guardar: {data}")
    return jsonify({"message": "Examen recibido", "score": 0})
