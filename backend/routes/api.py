# backend/routes/api.py
import json
import os
import random
from functools import wraps

from flask import Blueprint, current_app, jsonify, request

from models import ActiveSession, Cuadernillo, ExamAnswer, ExamResult, User, UserCuadernilloActivation, db


# Decorator for API authentication
def api_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            return (
                jsonify({"error": "Se requiere autenticación. Sesión no proporcionada."}),
                401,
            )

        active_session = ActiveSession.query.filter_by(session_id=session_id).first()
        if not active_session:
            return (
                jsonify({"error": "Sesión inválida o expirada. Por favor, inicie sesión nuevamente."}),
                401,
            )

        kwargs["active_session"] = active_session
        return f(*args, **kwargs)

    return decorated_function


api_bp = Blueprint("api_bp", __name__)


@api_bp.route("/examenes/<string:area_id>/iniciar", methods=["POST"])
@api_login_required
def start_examen(area_id, active_session):
    """
    Inicia una sesión de examen para un usuario, asociando un cuadernillo a su sesión activa.
    Devuelve el session_id de la sesión activa.
    """
    data = request.get_json()
    user_codigo = data.get("codigo")
    grade = data.get("grado")

    if not area_id or not grade or not user_codigo:
        return (
            jsonify({"error": "Los parámetros 'areaId', 'grade' y 'codigo' son requeridos"}),
            400,
        )

    user = User.query.filter_by(codigo=user_codigo).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if user.id != active_session.user_id:
        return (
            jsonify({"error": "El código de usuario no coincide con la sesión activa."}),
            403,
        )

    cuadernillo = Cuadernillo.query.filter_by(area=area_id, grado=grade).first()
    if not cuadernillo:
        return (
            jsonify({"error": f"No se encontró un cuadernillo para el área '{area_id}' y grado '{grade}'"}),
            404,
        )

    from models import ExamAvailability

    availability = ExamAvailability.query.filter_by(cuadernillo_id=cuadernillo.id, grado=grade).first()
    if availability and not availability.is_enabled:
        return (
            jsonify({"error": "Este examen no está disponible en este momento."}),
            403,
        )

    active_session.cuadernillo_id = cuadernillo.id
    db.session.commit()

    return jsonify({"sesion_id": active_session.session_id})


@api_bp.route("/examenes", methods=["GET"])
def get_examenes():
    """Retorna una lista de todos los cuadernillos disponibles."""
    cuadernillos = Cuadernillo.query.all()
    cuadernillos_data = []
    for cuadernillo in cuadernillos:
        cuadernillos_data.append(
            {
                "id": cuadernillo.id,
                "nombre": cuadernillo.nombre,
                "area": cuadernillo.area,
                "grado": cuadernillo.grado,
                "tiempo_limite_minutos": cuadernillo.tiempo_limite_minutos,
                "dir_banco": cuadernillo.dir_banco,
            }
        )
    return jsonify(cuadernillos_data)


@api_bp.route("/examen/<string:session_id>", methods=["GET"])
@api_login_required
def get_exam_questions_by_session(session_id, active_session):
    """Obtiene las preguntas y la configuración de un examen para una sesión activa específica."""
    if active_session.session_id != session_id:
        return (
            jsonify({"error": "El ID de sesión proporcionado no coincide con la sesión activa."}),
            403,
        )

    if not active_session.cuadernillo_id:
        return (
            jsonify({"error": "No hay un examen activo para esta sesión.", "code": "NO_ACTIVE_EXAM"}),
            404,
        )

    cuadernillo = Cuadernillo.query.get(active_session.cuadernillo_id)
    if not cuadernillo:

        return (
            jsonify({"error": "Cuadernillo asociado a la sesión no encontrado."}),
            404,
        )

    num_questions_to_present = 10
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    cleaned_dir_banco = cuadernillo.dir_banco
    while cleaned_dir_banco.startswith("data/") or cleaned_dir_banco.startswith("/data/"):
        if cleaned_dir_banco.startswith("/data/"):
            cleaned_dir_banco = cleaned_dir_banco[len("/data/") :]
        elif cleaned_dir_banco.startswith("data/"):
            cleaned_dir_banco = cleaned_dir_banco[len("data/") :]

    questions_dir_path = os.path.join(project_root, "data", cleaned_dir_banco)

    if not os.path.isdir(questions_dir_path):
        current_app.logger.error(f"Error: Directorio de preguntas '{questions_dir_path}' no encontrado.")
        return (
            jsonify({"error": f"Directorio de preguntas no encontrado en el servidor."}),
            500,
        )

    all_answers_file_path = os.path.join(project_root, "backend", "data", "respuestas.json")
    if not os.path.exists(all_answers_file_path):
        return (
            jsonify({"error": "Archivo de respuestas no encontrado en el servidor."}),
            500,
        )

    with open(all_answers_file_path, "r", encoding="utf-8") as f:
        all_correct_answers = json.load(f)

    mapa_grados_api = {
        "6": "sexto",
        "7": "septimo",
        "8": "octavo",
        "9": "noveno",
        "10": "decimo",
        "11": "once",
    }
    grado_str = str(cuadernillo.grado).lower()
    grado_en_palabra = mapa_grados_api.get(grado_str)

    if not grado_en_palabra:
        return (
            jsonify({"error": f"Grado '{cuadernillo.grado}' inválido."}),
            500,
        )

    exam_key = f"{grado_en_palabra}_{cuadernillo.area}".lower().replace(" ", "_")
    correct_answers = all_correct_answers.get(exam_key)

    if correct_answers is None:
        return (
            jsonify({"error": f"No se encontraron respuestas para '{cuadernillo.nombre}'."}),
            500,
        )

    all_questions_bank = []
    try:
        image_files = sorted(
            [f for f in os.listdir(questions_dir_path) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
        )
        option_map = {0: "A", 1: "B", 2: "C", 3: "D"}

        for i, image_file in enumerate(image_files):
            question_id = i + 1
            correct_answer_letter = "N/A"
            if i < len(correct_answers):
                correct_answer_letter = option_map.get(correct_answers[i], "N/A")

            all_questions_bank.append(
                {
                    "id": question_id,
                    "question_number": question_id,
                    "text": f"Pregunta {question_id}",
                    "imagen": image_file,
                    "image_url": f"/data_files/{cleaned_dir_banco}/{image_file}",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": correct_answer_letter,
                }
            )
    except Exception as e:
        return jsonify({"error": f"Error al procesar preguntas: {str(e)}"}), 500

    if not all_questions_bank:
        return jsonify({"error": "No se encontraron preguntas."}), 500

    if len(all_questions_bank) < num_questions_to_present:
        num_questions_to_present = len(all_questions_bank)

    presented_questions = random.sample(all_questions_bank, num_questions_to_present)
    active_session.presented_questions = presented_questions
    db.session.commit()

    return jsonify(
        {
            "id": cuadernillo.id,
            "titulo": cuadernillo.nombre,
            "total_preguntas_banco": cuadernillo.total_preguntas_banco,
            "config": {
                "nextButtonDelay": 10000,
                "subject": cuadernillo.area,
                "Grado": cuadernillo.grado,
                "numQuestions": num_questions_to_present,
            },
            "questions": presented_questions,
        }
    )


@api_bp.route("/usuario/<string:codigo>", methods=["GET"])
@api_login_required
def get_user_data(codigo, active_session):
    """Obtiene los datos completos de un usuario por su código."""
    user = active_session.user
    if user.codigo != codigo:
        return (
            jsonify({"error": "El código no coincide con la sesión activa."}),
            403,
        )

    return (
        jsonify(
            {
                "codigo": user.codigo,
                "nombre_completo": user.nombre_completo,
                "grado": user.grado,
                "role": user.role.value,
            }
        ),
        200,
    )


@api_bp.route("/examenes/grado/<string:grado>", methods=["GET"])
@api_login_required
def get_examenes_por_grado(grado, active_session):
    """Devuelve una lista de TODOS los exámenes para un grado específico."""
    user = active_session.user
    examenes = Cuadernillo.query.filter_by(grado=grado).all()

    examenes_dict = []
    for examen in examenes:
        examen_data = examen.to_dict()
        user_activation = UserCuadernilloActivation.query.filter_by(user_id=user.id, cuadernillo_id=examen.id).first()
        is_user_active = user_activation.is_active if user_activation else True

        from models import ExamAvailability

        exam_availability = ExamAvailability.query.filter_by(cuadernillo_id=examen.id, grado=examen.grado).first()
        is_general_available = exam_availability.is_enabled if exam_availability else True

        examen_data["activo"] = is_user_active and is_general_available
        examenes_dict.append(examen_data)

    return jsonify(examenes_dict)


@api_bp.route("/examenes/<int:cuadernillo_id>/attempts", methods=["GET"])
@api_login_required
def get_attempts(cuadernillo_id, active_session):
    """Retorna el número de intentos realizados por un usuario para un cuadernillo."""
    user_id = active_session.user_id
    cuadernillo = Cuadernillo.query.get(cuadernillo_id)
    if not cuadernillo:
        return jsonify({"error": "Cuadernillo no encontrado."}), 404

    current_attempts = ExamResult.query.filter_by(user_id=user_id, cuadernillo_id=cuadernillo_id).count()

    return jsonify({"current_attempts": current_attempts})


@api_bp.route("/examen/<string:session_id>/finalizar", methods=["POST"])
@api_login_required
def finalizar_examen(session_id, active_session):
    """Califica y guarda los resultados del examen."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Cuerpo de solicitud vacío"}), 400

    user_codigo = data.get("codigo")
    answers = data.get("answers")

    if not user_codigo or not isinstance(answers, list):
        return jsonify({"error": "Faltan datos requeridos"}), 400

    if active_session.session_id != session_id:
        return jsonify({"error": "ID de sesión no coincide"}), 403

    user = User.query.filter_by(codigo=user_codigo).first()
    if not user or user.id != active_session.user_id:
        return jsonify({"error": "Usuario inválido"}), 403

    if not active_session.cuadernillo_id:
        return jsonify({"error": "No hay examen activo en esta sesión"}), 400

    cuadernillo = Cuadernillo.query.get(active_session.cuadernillo_id)
    presented_questions = active_session.presented_questions

    if not presented_questions:
        return jsonify({"error": "No se encontraron preguntas"}), 400

    if len(answers) != len(presented_questions):
        return jsonify({"error": "Número de respuestas incorrecto"}), 400

    presented_questions_map = {q["question_number"]: q for q in presented_questions}
    correct_answers_count = 0
    incorrect_answers_count = 0
    unanswered_questions_count = 0
    reverse_option_map = {"A": 0, "B": 1, "C": 2, "D": 3}

    detailed_answers = []
    for user_ans in answers:
        q_num = user_ans.get("question_number")
        selected_opt_letter = str(user_ans.get("selected_option")).upper()

        if q_num not in presented_questions_map:
            continue

        presented_q = presented_questions_map[q_num]
        correct_opt = str(presented_q.get("correct_answer")).upper()
        is_correct = False
        score_points = 0
        selected_opt_index = reverse_option_map.get(selected_opt_letter, -1)

        if selected_opt_letter == "NONE":
            unanswered_questions_count += 1
        elif selected_opt_letter == correct_opt:
            correct_answers_count += 1
            is_correct = True
            score_points = 1
        else:
            incorrect_answers_count += 1

        detailed_answers.append(
            {
                "question_number": q_num,
                "user_answer": selected_opt_index,
                "correct_answer": correct_opt,
                "is_correct": is_correct,
                "score_points": score_points,
            }
        )

    grade = (correct_answers_count / len(answers)) * 5.0 if answers else 0.0
    tiempo_usado = data.get("tiempo_usado", 0)

    try:
        for ans_detail in detailed_answers:
            answer_record = ExamAnswer(
                session_id=session_id,
                user_id=user.id,
                cuadernillo_id=cuadernillo.id,
                question_number=ans_detail["question_number"],
                selected_option=ans_detail["user_answer"],
                is_correct=ans_detail["is_correct"],
                score_points=ans_detail["score_points"],
            )
            db.session.add(answer_record)

        previous_attempts = ExamResult.query.filter_by(user_id=user.id, cuadernillo_id=cuadernillo.id).count()

        exam_result = ExamResult(
            user_id=user.id,
            cuadernillo_id=cuadernillo.id,
            final_score=grade,
            correct_answers=correct_answers_count,
            incorrect_answers=incorrect_answers_count,
            unanswered_questions=unanswered_questions_count,
            time_used=tiempo_usado,
            attempt_number=previous_attempts + 1,
        )
        db.session.add(exam_result)

        active_session.cuadernillo_id = None
        active_session.presented_questions = None
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al guardar: {str(e)}"}), 500

    return (
        jsonify(
            {
                "message": "Examen finalizado con éxito.",
                "area": cuadernillo.area,
                "grado": cuadernillo.grado,
                "porcentaje": round((correct_answers_count / len(answers)) * 100, 2) if answers else 0,
                "preguntas_correctas": correct_answers_count,
                "total_preguntas": len(answers),
                "tiempo_usado": tiempo_usado,
                "puntuacion": round(grade, 2),
                "puntuacion_maxima": 5.0,
            }
        ),
        200,
    )


@api_bp.route("/logout", methods=["POST"])
@api_login_required
def logout_user_api(active_session):
    """Cierra la sesión activa del usuario."""
    try:
        db.session.delete(active_session)
        db.session.commit()
        return jsonify({"message": "Sesión cerrada correctamente."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error interno al cerrar sesión."}), 500


@api_bp.route("/upload_exam_answers", methods=["POST"])
def upload_exam_answers():
    """Recibe un archivo con respuestas, las califica y guarda."""
    user_codigo = request.form.get("userCodigo")
    exam_id = request.form.get("examId")
    exam_file = request.files.get("examFile")

    if not user_codigo or not exam_id or not exam_file:
        return jsonify({"error": "Faltan datos"}), 400

    user = User.query.filter_by(codigo=user_codigo).first()
    cuadernillo = Cuadernillo.query.get(exam_id)

    if not user or not cuadernillo:
        return jsonify({"error": "Usuario o examen no encontrado"}), 404

    try:
        file_content = exam_file.read().decode("utf-8")
        user_answers_data = json.loads(file_content)
    except Exception as e:
        return jsonify({"error": f"Error al leer archivo: {str(e)}"}), 400

    # Cargar respuestas correctas
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
    all_answers_file_path = os.path.join(project_root, "backend", "data", "all_exam_answers.json")

    with open(all_answers_file_path, "r", encoding="utf-8") as f:
        all_correct_bank = json.load(f)

    exam_key = f"{cuadernillo.area.lower()}_{cuadernillo.grado}".replace(" ", "_")
    correct_for_exam = all_correct_bank.get(exam_key)

    if not correct_for_exam:
        return jsonify({"error": "Respuestas no encontradas para este examen"}), 500

    correct_count = 0
    detailed = []
    for ua in user_answers_data:
        q_num = str(ua.get("question_number"))
        u_ans = str(ua.get("answer")).upper()
        is_correct = False
        score = 0
        if q_num in correct_for_exam:
            c_ans = str(correct_for_exam[q_num]).upper()
            if u_ans == c_ans:
                correct_count += 1
                is_correct = True
                score = 1
        detailed.append(
            {
                "question_number": int(q_num),
                "user_answer": u_ans,
                "is_correct": is_correct,
                "score": score,
            }
        )

    grade = (correct_count / len(user_answers_data)) * 5.0 if user_answers_data else 0.0

    try:
        for ans in detailed:
            rec = ExamAnswer(
                user_id=user.id,
                cuadernillo_id=cuadernillo.id,
                question_number=ans["question_number"],
                selected_option=ans["user_answer"],
                is_correct=ans["is_correct"],
                score_points=ans["score"],
            )
            db.session.add(rec)

        prev = ExamResult.query.filter_by(user_id=user.id, cuadernillo_id=cuadernillo.id).count()
        res = ExamResult(
            user_id=user.id,
            cuadernillo_id=cuadernillo.id,
            final_score=grade,
            correct_answers=correct_count,
            attempt_number=prev + 1,
        )
        db.session.add(res)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"success": True, "grade": grade, "correct": correct_count}), 200
