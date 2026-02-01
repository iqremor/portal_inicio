# backend/routes/api.py
import os
import json
from flask import Blueprint, jsonify, request, current_app
from models import Cuadernillo, User, ActiveSession, db, ExamAnswer, ExamResult, UserCuadernilloActivation
import random
from functools import wraps # Added for decorator

# Decorator for API authentication
def api_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        session_id = request.headers.get('X-Session-ID')
        if not session_id:
            return jsonify({"error": "Se requiere autenticación. Sesión no proporcionada."}), 401

        active_session = ActiveSession.query.filter_by(session_id=session_id).first()
        if not active_session:
            return jsonify({"error": "Sesión inválida o expirada. Por favor, inicie sesión nuevamente."}), 401

        # Optionally pass the active_session object to the decorated function
        kwargs['active_session'] = active_session
        return f(*args, **kwargs)
    return decorated_function

api_bp = Blueprint('api_bp', __name__)

@api_bp.route('/examenes/<string:area_id>/iniciar', methods=['POST'])
@api_login_required
def start_examen(area_id, active_session): # active_session is passed by the decorator
    """
    Inicia una sesión de examen para un usuario, asociando un cuadernillo a su sesión activa.
    Devuelve el session_id de la sesión activa.
    """
    data = request.get_json()
    user_codigo = data.get('codigo')
    grade = data.get('grado')

    if not area_id or not grade or not user_codigo:
        return jsonify({"error": "Los parámetros 'areaId', 'grade' y 'codigo' son requeridos"}), 400

    user = User.query.filter_by(codigo=user_codigo).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # The decorator already ensures active_session is valid, just verify it matches the requested user
    if user.id != active_session.user_id:
        return jsonify({"error": "El código de usuario no coincide con la sesión activa."}), 403

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
@api_login_required
def get_exam_questions_by_session(session_id, active_session):
    """
    Obtiene las preguntas y la configuración de un examen para una sesión activa específica.
    """
    # The decorator already ensures active_session is valid, just verify the session_id matches
    if active_session.session_id != session_id:
        return jsonify({"error": "El ID de sesión proporcionado no coincide con la sesión activa."}), 403

    cuadernillo = Cuadernillo.query.get(active_session.cuadernillo_id)
    if not cuadernillo:
        return jsonify({"error": "Cuadernillo asociado a la sesión no encontrado."}), 404

    # Determine the number of questions to present
    num_questions_to_present = 10 # Default value, can be configurable later

    # Construct path to questions.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    # Clean dir_banco to get the relative path from the 'data' folder
    cleaned_dir_banco = cuadernillo.dir_banco
    while cleaned_dir_banco.startswith('data/') or cleaned_dir_banco.startswith('/data/'):
        if cleaned_dir_banco.startswith('/data/'):
            cleaned_dir_banco = cleaned_dir_banco[len('/data/'):]
        elif cleaned_dir_banco.startswith('data/'):
            cleaned_dir_banco = cleaned_dir_banco[len('data/'):]
            
    questions_dir_path = os.path.join(project_root, 'data', cleaned_dir_banco)

    if not os.path.isdir(questions_dir_path):
        current_app.logger.error(f"Error: Directorio de preguntas '{questions_dir_path}' no encontrado para el cuadernillo '{cuadernillo.nombre}'.")
        return jsonify({"error": f"Directorio de preguntas no encontrado en el servidor para el cuadernillo '{cuadernillo.nombre}'."}), 500

    # Load all correct answers
    all_answers_file_path = os.path.join(project_root, 'backend', 'data', 'respuestas.json')
    if not os.path.exists(all_answers_file_path):
        current_app.logger.error(f"Error: Archivo de respuestas '{all_answers_file_path}' no encontrado.")
        return jsonify({"error": "Archivo de respuestas no encontrado en el servidor."}), 500
    
    with open(all_answers_file_path, 'r', encoding='utf-8') as f:
        all_correct_answers = json.load(f)

    # Mapa para convertir el número del grado a palabra, asegurando consistencia con generador_respuestas.py
    mapa_grados_api = {
        '6': 'sexto',
        '7': 'septimo',
        '8': 'octavo',
        '9': 'noveno',
        '10': 'decimo',
        '11': 'once'
    }
    
    # Convertir el grado del cuadernillo (que puede ser un número) a string para la búsqueda
    grado_str = str(cuadernillo.grado).lower()
    grado_en_palabra = mapa_grados_api.get(grado_str)
    
    if not grado_en_palabra:
        current_app.logger.error(f"Error: Grado '{cuadernillo.grado}' no es válido o no se encuentra en el mapa de grados.")
        return jsonify({"error": f"Grado '{cuadernillo.grado}' inválido para generar la clave del examen."}), 500

    # Construir la clave del examen de forma consistente (ej: "sexto_ciencias_sociales")
    exam_key = f"{grado_en_palabra}_{cuadernillo.area}".lower().replace(' ', '_')
    correct_answers = all_correct_answers.get(exam_key)

    if correct_answers is None:
        current_app.logger.error(f"Error: No se encontraron respuestas para el examen con clave '{exam_key}' en '{all_answers_file_path}'.")
        return jsonify({"error": f"No se encontraron respuestas para el cuadernillo '{cuadernillo.nombre}'."}), 500

    all_questions_bank = []
    try:
        image_files = sorted([f for f in os.listdir(questions_dir_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
        
        # Mapping from index to option letter
        option_map = {0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H'}

        for i, image_file in enumerate(image_files):
            question_id = i + 1
            
            if i < len(correct_answers):
                correct_answer_index = correct_answers[i]
                correct_answer_letter = option_map.get(correct_answer_index, 'N/A')
            else:
                correct_answer_letter = 'N/A' # No answer found for this question

            all_questions_bank.append({
                "id": question_id,
                "question_number": question_id,
                "text": f"Pregunta {question_id}",
                "imagen": image_file,
                "image_url": f"/data_files/{cleaned_dir_banco}/{image_file}",
                "options": ["A", "B", "C", "D"],
                "correct_answer": correct_answer_letter
            })

    except Exception as e:
        current_app.logger.error(f"Error: Ocurrió un error inesperado al procesar las imágenes de las preguntas en '{questions_dir_path}': {str(e)}")
        return jsonify({"error": f"Error inesperado al procesar las preguntas para el cuadernillo '{cuadernillo.nombre}'."}), 500
    
    # Ensure all_questions_bank is not empty
    if not all_questions_bank:
        current_app.logger.error(f"Error: No se encontraron archivos de imagen de preguntas en '{questions_dir_path}' para el cuadernillo '{cuadernillo.nombre}'.")
        return jsonify({"error": f"No se encontraron preguntas para el cuadernillo '{cuadernillo.nombre}'."}), 500

    # Ensure enough questions are available
    if len(all_questions_bank) < num_questions_to_present:
        num_questions_to_present = len(all_questions_bank) # Present all available questions

    # Randomly select questions
    presented_questions = random.sample(all_questions_bank, num_questions_to_present)

    # Store presented questions in the ActiveSession
    active_session.presented_questions = presented_questions
    db.session.commit()

    # Prepare data for frontend
    exam_data = {
        "titulo": cuadernillo.nombre,
        "total_preguntas_banco": cuadernillo.total_preguntas_banco,
        "config": {
            "nextButtonDelay": 1000,
            "subject": cuadernillo.area,
            "Grado": cuadernillo.grado,
            "numQuestions": num_questions_to_present
        },
        "questions": presented_questions # Pass the full question objects
    }

    return jsonify({
        "titulo": cuadernillo.nombre,
        "total_preguntas_banco": cuadernillo.total_preguntas_banco,
        "config": {
            "nextButtonDelay": 1000,
            "subject": cuadernillo.area,
            "Grado": cuadernillo.grado,
            "numQuestions": num_questions_to_present
        },
        "questions": presented_questions # Pass the full question objects
    })

@api_bp.route('/usuario/<string:codigo>', methods=['GET'])
@api_login_required
def get_user_data(codigo, active_session):
    """Obtiene los datos completos de un usuario por su código."""
    user = active_session.user # User object is available via active_session relation

    # Verify that the requested user_codigo matches the session's user
    if user.codigo != codigo:
        return jsonify({"error": "El código de usuario solicitado no coincide con la sesión activa."}), 403

    if user:
        return jsonify({
            "codigo": user.codigo,
            "nombre_completo": user.nombre_completo,
            "grado": user.grado,
            "role": user.role.value
        }), 200
    else:
        # This case should ideally not be reached if api_login_required works
        return jsonify({"mensaje": "Usuario no encontrado"}), 404

@api_bp.route('/examenes/grado/<string:grado>', methods=['GET'])
@api_login_required
def get_examenes_por_grado(grado, active_session):
    """
    Devuelve una lista de TODOS los exámenes (cuadernillos) para un grado específico.
    Ahora incluye los activos y los inactivos para que el frontend decida cómo mostrarlos.
    """
    user = active_session.user
    
    examenes = Cuadernillo.query.filter_by(grado=grado).all()
    
    examenes_dict = []
    for examen in examenes:
        examen_data = examen.to_dict()
        
        # 1. Verificar UserCuadernilloActivation (específico del usuario)
        user_activation = UserCuadernilloActivation.query.filter_by(
            user_id=user.id,
            cuadernillo_id=examen.id
        ).first()
        # Si no hay un registro específico para el usuario, asumimos que está activo por defecto
        is_user_active = user_activation.is_active if user_activation else True 

        # 2. Verificar ExamAvailability (general)
        from models import ExamAvailability 
        exam_availability = ExamAvailability.query.filter_by(
            cuadernillo_id=examen.id,
            grado=examen.grado 
        ).first()
        # Si no hay un registro de disponibilidad general, asumimos que está habilitado
        is_general_available = exam_availability.is_enabled if exam_availability else True 

        # El examen está activo si AMBAS condiciones son verdaderas
        examen_data['activo'] = is_user_active and is_general_available
        examenes_dict.append(examen_data)
    
    return jsonify(examenes_dict)

@api_bp.route('/examenes/attempts', methods=['GET'])
@api_login_required
def get_attempts(active_session): # Lógica de autenticación y base de datos irá aquí
    # Por ahora, devolvemos un valor fijo para que el frontend pueda avanzar
    return jsonify({"attemptCount": 0})

@api_bp.route('/examen/<string:session_id>/finalizar', methods=['POST'])
@api_login_required
def finalizar_examen(session_id, active_session): # active_session is passed by the decorator
    """
    Recibe las respuestas del examen, las califica, las guarda en la base de datos
    y devuelve el resultado final al usuario.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Cuerpo de la solicitud vacío o no es JSON"}), 400

    # 1. Extracción de Datos
    user_codigo = data.get('codigo')
    answers = data.get('answers')

    if not user_codigo or not isinstance(answers, list):
        return jsonify({"error": "Faltan 'codigo' o 'answers' en la solicitud"}), 400

    # The decorator already ensures active_session is valid, just verify it matches the requested user
    if active_session.session_id != session_id:
        return jsonify({"error": "El ID de sesión proporcionado no coincide con la sesión activa."}), 403
    
    user = User.query.filter_by(codigo=user_codigo).first()
    if not user or user.id != active_session.user_id:
        return jsonify({"error": "El usuario no corresponde a la sesión activa."}), 403

    if not active_session.cuadernillo_id:
        return jsonify({"error": "La sesión no está asociada a ningún examen activo."}), 400

    cuadernillo = Cuadernillo.query.get(active_session.cuadernillo_id)
    if not cuadernillo:
        return jsonify({"error": "El cuadernillo asociado a la sesión no fue encontrado."}), 404
        
    presented_questions = active_session.presented_questions
    if not presented_questions:
        return jsonify({"error": "No se encontraron preguntas presentadas para esta sesión de examen."}), 400

    NUM_PREGUNTAS_EXAMEN = len(presented_questions)
    if len(answers) != NUM_PREGUNTAS_EXAMEN:
        return jsonify({"error": f"Se esperaban {NUM_PREGUNTAS_EXAMEN} respuestas, pero se recibieron {len(answers)}."}), 400

    # Construir un mapa de preguntas presentadas para una búsqueda eficiente
    presented_questions_map = {q['question_number']: q for q in presented_questions}

    # 3. Lógica de Calificación
    correct_answers_count = 0
    incorrect_answers_count = 0
    unanswered_questions_count = 0
    total_questions_answered = len(answers)
    detailed_answers = []
    
    # Mapa inverso para convertir la letra de la opción a un índice numérico
    reverse_option_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7}

    for user_ans in answers:
        q_num = user_ans.get('question_number')
        selected_opt_letter = str(user_ans.get('selected_option')).upper()

        if q_num not in presented_questions_map:
            continue 

        presented_q = presented_questions_map[q_num]
        correct_opt = str(presented_q.get('correct_answer')).upper()

        is_correct = False
        score_points = 0
        selected_opt_index = reverse_option_map.get(selected_opt_letter, -1)

        if selected_opt_letter == "NONE":
            unanswered_questions_count += 1
        elif selected_opt_letter == correct_opt:
            correct_answers_count += 1
            is_correct = True
            score_points = 1
        else: # Selected option is incorrect
            incorrect_answers_count += 1

        detailed_answers.append({
            'question_number': q_num,
            'user_answer': selected_opt_index,
            'correct_answer': correct_opt,
            'is_correct': is_correct,
            'score_points': score_points
        })

    # Calificación en escala de 0 a 5
    grade = 0.0
    if total_questions_answered > 0:
        grade = (correct_answers_count / total_questions_answered) * 5.0

    # 4. Almacenamiento en BD y Limpieza de Sesión
    try:
        # Guardar cada respuesta individual
        for ans_detail in detailed_answers:
            answer_record = ExamAnswer(
                session_id=session_id,
                user_id=user.id,
                cuadernillo_id=cuadernillo.id,
                question_number=ans_detail['question_number'],
                selected_option=ans_detail['user_answer'],
                is_correct=ans_detail['is_correct'],
                score_points=ans_detail['score_points']
            )
            db.session.add(answer_record)

        # Contar intentos previos para este examen y usuario
        previous_attempts = ExamResult.query.filter_by(
            user_id=user.id,
            cuadernillo_id=cuadernillo.id
        ).count()

        # Guardar el resultado general del examen
        exam_result = ExamResult(
            user_id=user.id,
            cuadernillo_id=cuadernillo.id,
            final_score=grade,
            correct_answers=correct_answers_count,
            incorrect_answers=incorrect_answers_count,
            unanswered_questions=unanswered_questions_count,
            attempt_number=previous_attempts + 1
        )
        db.session.add(exam_result)
        
        # Limpiar el cuadernillo de la sesión activa y las preguntas presentadas
        active_session.cuadernillo_id = None
        active_session.presented_questions = None
        
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al guardar los resultados en la base de datos: {str(e)}"}), 500

    # 5. Respuesta al Frontend
    return jsonify({
        "message": "Examen finalizado con éxito.",
        "grade": round(grade, 2),
        "correct_answers": correct_answers_count,
        "total_questions_graded": total_questions_answered
    }), 200

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


@api_bp.route('/upload_exam_answers', methods=['POST'])
def upload_exam_answers():
    """
    Recibe un archivo con respuestas de examen (JSON o CSV), las califica
    y guarda el resultado en la base de datos.
    """
    user_codigo = request.form.get('userCodigo')
    exam_id = request.form.get('examId')
    exam_file = request.files.get('examFile')

    if not user_codigo or not exam_id or not exam_file:
        return jsonify({"success": False, "message": "Faltan datos: userCodigo, examId o examFile."}), 400

    user = User.query.filter_by(codigo=user_codigo).first()
    if not user:
        return jsonify({"success": False, "message": "Usuario no encontrado."}), 404

    cuadernillo = Cuadernillo.query.filter_by(id=exam_id).first()
    if not cuadernillo:
        return jsonify({"success": False, "message": f"Examen (Cuadernillo) con ID '{exam_id}' no encontrado."}), 404

    # Validar tipo de archivo
    file_extension = exam_file.filename.rsplit('.', 1)[1].lower()
    if file_extension not in ['json', 'csv']:
        return jsonify({"success": False, "message": "Tipo de archivo no permitido. Solo se aceptan JSON y CSV."}), 400

    user_answers_data = []
    try:
        file_content = exam_file.read().decode('utf-8')
        if file_extension == 'json':
            user_answers_data = json.loads(file_content)
        elif file_extension == 'csv':
            import csv
            from io import StringIO
            csv_file = StringIO(file_content)
            reader = csv.DictReader(csv_file)
            for row in reader:
                # Asumimos que el CSV tiene columnas 'question_number' y 'answer'
                if 'question_number' in row and 'answer' in row:
                    user_answers_data.append({
                        'question_number': int(row['question_number']),
                        'answer': row['answer']
                    })
                else:
                    raise ValueError("El archivo CSV debe contener las columnas 'question_number' y 'answer'.")
    except Exception as e:
        return jsonify({"success": False, "message": f"Error al leer o parsear el archivo: {str(e)}"}), 400

    if not isinstance(user_answers_data, list):
        return jsonify({"success": False, "message": "El contenido del archivo debe ser una lista de respuestas."}), 400

    # Cargar respuestas correctas
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    all_answers_file_path = os.path.join(project_root, 'backend', 'data', 'all_exam_answers.json')

    if not os.path.exists(all_answers_file_path):
        return jsonify({"success": False, "message": "Archivo consolidado de respuestas 'all_exam_answers.json' no encontrado en el servidor."}), 500

    with open(all_answers_file_path, 'r', encoding='utf-8') as f:
        all_correct_answers_bank = json.load(f)

    exam_identifier = f"{cuadernillo.area.lower()}_{cuadernillo.grado}".replace(" ", "_") # ej: matematicas_7
    
    # Assuming all_correct_answers_bank is a dictionary where keys are exam_identifier
    # and values are dictionaries of question_number to correct_answer
    correct_answers_for_exam = all_correct_answers_bank.get(exam_identifier)

    if not correct_answers_for_exam:
        return jsonify({"success": False, "message": f"No se encontraron respuestas correctas para el examen '{exam_identifier}'."}), 500
    
    correct_answers_count = 0
    total_questions_answered = len(user_answers_data)
    detailed_answers = [] # Para almacenar el detalle de cada respuesta

    for ua in user_answers_data:
        q_num = str(ua.get('question_number')) # Asegurarse de que la clave sea string para la búsqueda
        u_ans = str(ua.get('answer')).upper() # Normalizar la respuesta del usuario
        
        is_correct = False
        score_points = 0

        if q_num in correct_answers_for_exam:
            c_ans = str(correct_answers_for_exam[q_num]).upper() # Normalizar la respuesta correcta
            if u_ans == c_ans:
                correct_answers_count += 1
                is_correct = True
                score_points = 1 # Cada acierto suma 1 punto base para el cálculo de la calificación 0-5
        
        detailed_answers.append({
            'question_number': int(q_num),
            'user_answer': u_ans,
            'correct_answer': correct_answers_for_exam.get(q_num),
            'is_correct': is_correct,
            'score_points': score_points
        })

    # Calificación en escala de 0 a 5
    grade = 0.0
    if total_questions_answered > 0:
        grade = (correct_answers_count / total_questions_answered) * 5.0

    # Almacenar resultados en la base de datos
    try:
        # Guardar cada respuesta individual
        for ans_detail in detailed_answers:
            answer_record = ExamAnswer(
                session_id=None, # No hay session_id de ActiveSession aquí, es un upload
                user_id=user.id,
                cuadernillo_id=cuadernillo.id,
                question_number=ans_detail['question_number'],
                selected_option=ans_detail['user_answer'],
                is_correct=ans_detail['is_correct'],
                score_points=ans_detail['score_points']
            )
            db.session.add(answer_record)

        # Contar intentos previos para este examen y usuario
        previous_attempts = ExamResult.query.filter_by(
            user_id=user.id,
            cuadernillo_id=cuadernillo.id
        ).count()

        # Guardar el resultado general del examen
        exam_result = ExamResult(
            user_id=user.id,
            cuadernillo_id=cuadernillo.id,
            final_score=grade, # Guardar la calificación de 0 a 5
            correct_answers=correct_answers_count,
            incorrect_answers=incorrect_answers_count, # Actualizado
            unanswered_questions=unanswered_questions_count, # Actualizado
            attempt_number=previous_attempts + 1
        )
        db.session.add(exam_result)
        
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error al guardar los resultados en la base de datos: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": "Respuestas subidas y calificadas exitosamente.",
        "grade": grade,
        "correct_answers": correct_answers_count,
        "total_questions_graded": total_questions_answered
    }), 200

@api_bp.route('/logout', methods=['POST'])
@api_login_required
def logout_user_api(active_session):
    """
    Cierra la sesión activa del usuario actual.
    """
    try:
        db.session.delete(active_session)
        db.session.commit()
        return jsonify({"message": "Sesión cerrada correctamente."}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error al cerrar la sesión {active_session.session_id}: {e}")
        return jsonify({"error": "Error interno al cerrar la sesión."}), 500