# backend/routes/api.py
import json
import os
import random
from functools import wraps

from flask import Blueprint, current_app, jsonify, request, session
from sqlalchemy import func

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


def get_config_value(clave, default=None):
    """Obtiene un valor de configuración de la base de datos."""
    from models import ConfiguracionSistema

    config = ConfiguracionSistema.query.filter_by(clave=clave).first()
    return config.valor if config else default


@api_bp.route("/examenes/<string:area_id>/iniciar", methods=["POST"])
@api_login_required
def start_examen(area_id, active_session):
    """
    Inicia una sesión de examen para un usuario, asociando un cuadernillo a su sesión activa.
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
    if not user or user.id != active_session.user_id:
        return jsonify({"error": "Usuario inválido o no coincide con la sesión."}), 403

    cuadernillo = Cuadernillo.query.filter_by(area=area_id, grado=grade).first()
    if not cuadernillo:
        # Intento de búsqueda flexible si el área viene con espacios o mayúsculas
        cuadernillo = Cuadernillo.query.filter(
            func.lower(Cuadernillo.area) == area_id.lower(), Cuadernillo.grado == grade
        ).first()

    if not cuadernillo:
        return (
            jsonify({"error": f"No se encontró un cuadernillo para el área '{area_id}' y grado '{grade}'"}),
            404,
        )

    active_session.cuadernillo_id = cuadernillo.id
    active_session.presented_questions = None  # Resetear preguntas anteriores
    db.session.commit()

    return jsonify({"sesion_id": active_session.session_id})


@api_bp.route("/examenes", methods=["GET"])
def get_examenes():
    """Retorna una lista de todos los cuadernillos disponibles con tiempo calculado."""
    try:
        num_questions = int(get_config_value("EXAM_QUESTIONS_COUNT", 10))
        duration_per_q = int(get_config_value("EXAM_TIMER_DURATION", 240))
        calculated_minutes = (num_questions * duration_per_q) // 60

        cuadernillos = Cuadernillo.query.all()
        cuadernillos_data = []
        for cuadernillo in cuadernillos:
            cuadernillos_data.append(
                {
                    "id": cuadernillo.id,
                    "nombre": cuadernillo.nombre,
                    "area": cuadernillo.area,
                    "grado": cuadernillo.grado,
                    "dir_banco": cuadernillo.dir_banco,
                    "total_preguntas": getattr(cuadernillo, "total_preguntas_banco", 0),
                    "tiempo_limite_minutos": calculated_minutes,
                }
            )
        return jsonify(cuadernillos_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_bp.route("/examen/<string:session_id>", methods=["GET"])
@api_login_required
def get_exam_questions_by_session(session_id, active_session):
    """Obtiene las preguntas y la configuración de un examen para una sesión activa específica."""
    if active_session.session_id != session_id:
        return jsonify({"error": "El ID de sesión no coincide con la sesión activa."}), 403

    if not active_session.cuadernillo_id:
        return jsonify({"error": "No has iniciado ningún examen todavía.", "code": "NO_ACTIVE_EXAM"}), 400

    cuadernillo = Cuadernillo.query.get(active_session.cuadernillo_id)
    if not cuadernillo:
        return jsonify({"error": "Cuadernillo no encontrado."}), 404

    # Obtener configuraciones
    timer_duration = int(get_config_value("EXAM_TIMER_DURATION", 240))
    num_questions_to_present = int(get_config_value("EXAM_QUESTIONS_COUNT", 10))

    # Construir ruta de preguntas
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    cleaned_dir_banco = cuadernillo.dir_banco.strip("/")
    if cleaned_dir_banco.startswith("data/"):
        cleaned_dir_banco = cleaned_dir_banco[5:]

    questions_dir_path = os.path.join(project_root, "data", cleaned_dir_banco)

    if not os.path.isdir(questions_dir_path):
        return jsonify({"error": f"Directorio de preguntas no encontrado: {cleaned_dir_banco}"}), 500

    # Cargar respuestas correctas
    all_answers_path = os.path.join(project_root, "backend", "data", "respuestas.json")
    with open(all_answers_path, "r", encoding="utf-8") as f:
        all_correct_answers = json.load(f)

    mapa_grados = {"6": "sexto", "7": "septimo", "8": "octavo", "9": "noveno", "10": "decimo", "11": "once"}
    grado_palabra = mapa_grados.get(str(cuadernillo.grado))
    exam_key = f"{grado_palabra}_{cuadernillo.area}".lower().replace(" ", "_")
    correct_answers = all_correct_answers.get(exam_key)

    if correct_answers is None:
        return jsonify({"error": f"No se encontraron respuestas para {exam_key}"}), 500

    # Procesar imágenes/preguntas
    all_questions = []
    try:
        image_files = sorted(
            [f for f in os.listdir(questions_dir_path) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
        )
        option_map = {0: "A", 1: "B", 2: "C", 3: "D"}

        for i, img in enumerate(image_files):
            correct_letter = option_map.get(correct_answers[i], "N/A") if i < len(correct_answers) else "N/A"
            all_questions.append(
                {
                    "id": i + 1,
                    "question_number": i + 1,
                    "text": f"Pregunta {i + 1}",
                    "imagen": img,
                    "image_url": f"/data_files/{cleaned_dir_banco}/{img}",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": correct_letter,
                }
            )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Seleccionar aleatoriamente
    if not active_session.presented_questions:
        num_to_pick = min(len(all_questions), num_questions_to_present)
        active_session.presented_questions = random.sample(all_questions, num_to_pick)
        db.session.commit()

    return jsonify(
        {
            "id": cuadernillo.id,
            "titulo": cuadernillo.nombre,
            "total_preguntas_banco": cuadernillo.total_preguntas_banco,
            "config": {
                "timerDuration": timer_duration,
                "numQuestions": len(active_session.presented_questions),
                "subject": cuadernillo.area,
                "Grado": cuadernillo.grado,
            },
            "questions": active_session.presented_questions,
            "preguntas": active_session.presented_questions,  # Soporte para ambos nombres de campo
        }
    )


@api_bp.route("/usuario/<string:codigo>", methods=["GET"])
@api_login_required
def get_user_data(codigo, active_session):
    user = active_session.user
    if user.codigo != codigo:
        return jsonify({"error": "No autorizado"}), 403

    def is_mod_enabled(g_flag, gr_flag, u_grade):
        if get_config_value(g_flag, "0") != "1":
            return False
        enabled = [g.strip() for g in get_config_value(gr_flag, "").split(",")]
        return str(u_grade) in enabled

    return jsonify(
        {
            "codigo": user.codigo,
            "nombre_completo": user.nombre_completo,
            "grado": user.grado,
            "role": user.role.value,
            "modules": {
                "preicfes": is_mod_enabled("PREICFES_ENABLED", "MODULE_PREICFES_GRADES", user.grado),
                "preunal": is_mod_enabled("PREUNAL_ENABLED", "MODULE_PREUNAL_GRADES", user.grado),
                "laboratorios": is_mod_enabled("LABORATORIOS_ENABLED", "MODULE_LABORATORIOS_GRADES", user.grado),
            },
        }
    )


@api_bp.route("/examenes/grado/<string:grado>", methods=["GET"])
@api_login_required
def get_examenes_por_grado(grado, active_session):
    examenes = Cuadernillo.query.filter_by(grado=grado).all()
    return jsonify([e.to_dict() for e in examenes])


@api_bp.route("/examenes/<int:cuadernillo_id>/attempts", methods=["GET"])
@api_login_required
def get_attempts(cuadernillo_id, active_session):
    count = ExamResult.query.filter_by(user_id=active_session.user_id, cuadernillo_id=cuadernillo_id).count()
    return jsonify({"current_attempts": count})


@api_bp.route("/examen/<string:session_id>/finalizar", methods=["POST"])
@api_login_required
def finalizar_examen(session_id, active_session):
    data = request.get_json()
    if not data or not active_session.cuadernillo_id:
        return jsonify({"error": "Sesión inválida"}), 400

    correct_count = 0
    presented = active_session.presented_questions
    if not presented:
        return jsonify({"error": "No hay preguntas registradas"}), 400

    presented_map = {q["question_number"]: q for q in presented}
    rev_map = {"A": 0, "B": 1, "C": 2, "D": 3}

    # Conteo robusto de respuestas y preparación de revisión pedagógica
    answered_q_nums = set()
    correct_count = 0
    revision = []

    # Mapear respuestas del usuario por número de pregunta para facilitar revisión
    user_answers_map = {int(ans.get("question_number")): ans.get("selected_option") for ans in data.get("answers", [])}

    for q in presented:
        q_num = int(q["question_number"])
        sel = user_answers_map.get(q_num)
        is_correct = False

        user_choice = "NONE"
        if sel and str(sel).upper() in ["A", "B", "C", "D"]:
            user_choice = str(sel).upper()
            answered_q_nums.add(q_num)
            if user_choice == q["correct_answer"]:
                correct_count += 1
                is_correct = True

        revision.append(
            {
                "question_number": q_num,
                "image_url": q.get("image_url", ""),
                "correct_answer": q["correct_answer"],
                "user_answer": user_choice,
                "is_correct": is_correct,
            }
        )

    total_questions = len(presented)
    unanswered = total_questions - len(answered_q_nums)
    incorrect = len(answered_q_nums) - correct_count

    grade = (correct_count / total_questions) * 5.0

    try:
        new_result = ExamResult(
            user_id=active_session.user_id,
            cuadernillo_id=active_session.cuadernillo_id,
            final_score=grade,
            correct_answers=correct_count,
            incorrect_answers=incorrect,
            unanswered_questions=unanswered,
            time_used=data.get("tiempo_usado", 0),
            attempt_number=ExamResult.query.filter_by(
                user_id=active_session.user_id, cuadernillo_id=active_session.cuadernillo_id
            ).count()
            + 1,
        )
        db.session.add(new_result)

        # Guardar datos necesarios antes de limpiar la sesión
        resultado_detalle = {
            "puntuacion": round(grade, 2),
            "preguntas_correctas": correct_count,
            "preguntas_incorrectas": incorrect,
            "preguntas_sin_responder": unanswered,
            "total_preguntas": total_questions,
            "porcentaje": round((correct_count / total_questions) * 100, 1),
            "tiempo_usado": data.get("tiempo_usado", 0),
            "area": active_session.cuadernillo.area if active_session.cuadernillo else "General",
            "revision": revision,
        }

        active_session.cuadernillo_id = None
        active_session.presented_questions = None
        db.session.commit()

        return jsonify({"message": "OK", **resultado_detalle})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route("/resultados/usuario/mejores", methods=["GET"])
@api_login_required
def get_user_best_results(active_session):
    results = (
        db.session.query(ExamResult.cuadernillo_id, func.max(ExamResult.final_score).label("mejor_nota"))
        .filter_by(user_id=active_session.user_id)
        .group_by(ExamResult.cuadernillo_id)
        .all()
    )
    return jsonify([{"cuadernillo_id": r.cuadernillo_id, "mejor_nota": round(r.mejor_nota, 1)} for r in results])


@api_bp.route("/logout", methods=["POST"])
@api_login_required
def logout_user_api(active_session):
    db.session.delete(active_session)
    db.session.commit()
    return jsonify({"message": "Sesión cerrada"}), 200
