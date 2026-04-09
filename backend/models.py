# models.py

# --Librerías Necesarias --
from datetime import datetime  # Para manejar fechas y horas
from enum import Enum  # Para definir enumeraciones

from flask_sqlalchemy import SQLAlchemy  # ORM para manejar la base de datos
from werkzeug.security import check_password_hash, generate_password_hash  # Para hashear contraseñas

# Se crea la instancia de SQLAlchemy sin asociarla a la app todavía
db = SQLAlchemy()

# --- Modelos de la Base de Datos ---


class UserRole(Enum):
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"


class PeticionEstado(Enum):
    PENDIENTE = "pendiente"
    EN_PROCESO = "en_proceso"
    COMPLETADA = "completada"
    RECHAZADA = "rechazada"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)  # Nuevo campo
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nombre_completo = db.Column(db.String(150), nullable=True)  # Nuevo campo
    grado = db.Column(db.String(50), nullable=True)  # Nuevo campo
    role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relaciones
    peticiones = db.relationship("Peticion", backref="usuario", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        """Establece la contraseña hasheada"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica la contraseña"""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<ExamSession {self.id} - User {self.user_id} - Exam {self.exam_id}>"


class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    data_activity_id = db.Column(db.String(80), unique=True, nullable=False)
    applicable_grades = db.Column(db.String(200), nullable=True)  # e.g., "6,7,8,9,10,11"

    def __repr__(self):
        return "<Activity %r>" % self.name

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "data_activity_id": self.data_activity_id,
            "applicable_grades": self.applicable_grades,
        }


class Cuadernillo(db.Model):
    __tablename__ = "cuadernillos"

    id = db.Column(db.Integer, primary_key=True)
    cuadernillo_id = db.Column(db.String(80), unique=True, nullable=False)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    activo = db.Column(db.Boolean, default=True)
    grado = db.Column(db.String(50), nullable=False)
    area = db.Column(db.String(80), nullable=False)
    dir_banco = db.Column(db.String(200), nullable=False)
    total_preguntas_banco = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Cuadernillo {self.nombre}>"

    def to_dict(self):
        return {
            "id": self.id,
            "cuadernillo_id": self.cuadernillo_id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "activo": self.activo,
            "grado": self.grado,
            "area": self.area,
            "dir_banco": self.dir_banco,
            "total_preguntas_banco": self.total_preguntas_banco,
        }


class UserCuadernilloActivation(db.Model):
    __tablename__ = "user_cuadernillo_activation"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    cuadernillo_id = db.Column(db.Integer, db.ForeignKey("cuadernillos.id"), primary_key=True)
    is_active = db.Column(db.Boolean, default=False, nullable=False)

    user = db.relationship(
        "User",
        backref=db.backref("cuadernillo_activations", cascade="all, delete-orphan"),
    )
    cuadernillo = db.relationship(
        "Cuadernillo",
        backref=db.backref("user_activations", cascade="all, delete-orphan"),
    )


class Peticion(db.Model):
    __tablename__ = "peticiones"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    estado = db.Column(db.Enum(PeticionEstado), default=PeticionEstado.PENDIENTE, nullable=False)
    prioridad = db.Column(db.Integer, default=1)  # 1=baja, 2=media, 3=alta
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    fecha_limite = db.Column(db.DateTime, nullable=True)

    # Clave foránea
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Relaciones
    comentarios = db.relationship("Comentario", backref="peticion", lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Peticion {self.titulo}>"

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "estado": self.estado.value,
            "prioridad": self.prioridad,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "fecha_limite": (self.fecha_limite.isoformat() if self.fecha_limite else None),
            "user_id": self.user_id,
            "usuario": self.usuario.username if self.usuario else None,
        }


class Comentario(db.Model):
    __tablename__ = "comentarios"

    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Claves foráneas
    peticion_id = db.Column(db.Integer, db.ForeignKey("peticiones.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Relaciones
    usuario = db.relationship("User", backref="comentarios")

    def __repr__(self):
        return f"<Comentario {self.id}>"

    def to_dict(self):
        return {
            "id": self.id,
            "contenido": self.contenido,
            "created_at": self.created_at.isoformat(),
            "peticion_id": self.peticion_id,
            "user_id": self.user_id,
            "usuario": self.usuario.username if self.usuario else None,
        }


class ConfiguracionSistema(db.Model):
    __tablename__ = "configuracion_sistema"

    id = db.Column(db.Integer, primary_key=True)
    clave = db.Column(db.String(100), unique=True, nullable=False)
    valor = db.Column(db.Text, nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Config {self.clave}: {self.valor}>"

    def to_dict(self):
        return {
            "id": self.id,
            "clave": self.clave,
            "valor": self.valor,
            "descripcion": self.descripcion,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Log(db.Model):
    __tablename__ = "logs"

    id = db.Column(db.Integer, primary_key=True)
    nivel = db.Column(db.String(20), nullable=False)  # INFO, WARNING, ERROR, DEBUG
    mensaje = db.Column(db.Text, nullable=False)
    modulo = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación
    usuario = db.relationship("User", backref="logs")

    def __repr__(self):
        return f"<Log {self.nivel}: {self.mensaje[:50]}...>"

    def to_dict(self):
        return {
            "id": self.id,
            "nivel": self.nivel,
            "mensaje": self.mensaje,
            "modulo": self.modulo,
            "user_id": self.user_id,
            "usuario": self.usuario.username if self.usuario else None,
            "created_at": self.created_at.isoformat(),
        }


class ActiveSession(db.Model):
    __tablename__ = "active_sessions"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    session_id = db.Column(db.String(256), unique=True, nullable=False)
    login_time = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(256))
    cuadernillo_id = db.Column(db.Integer, db.ForeignKey("cuadernillos.id"), nullable=True)
    presented_questions = db.Column(db.JSON, nullable=True)  # Almacena las preguntas presentadas al usuario como JSON

    # Relaciones
    user = db.relationship("User", backref=db.backref("active_sessions", lazy=True))
    cuadernillo = db.relationship("Cuadernillo")

    def __repr__(self):
        return f"<ActiveSession para {self.user.username}>"


class ExamAvailability(db.Model):
    __tablename__ = "exam_availability"
    id = db.Column(db.Integer, primary_key=True)
    cuadernillo_id = db.Column(db.Integer, db.ForeignKey("cuadernillos.id"), nullable=False)
    grado = db.Column(db.String(50), nullable=False)
    is_enabled = db.Column(db.Boolean, default=True, nullable=False)

    # Unique constraint to avoid duplicate entries
    __table_args__ = (db.UniqueConstraint("cuadernillo_id", "grado", name="_cuadernillo_grado_uc"),)

    cuadernillo = db.relationship("Cuadernillo")


class ExamAnswer(db.Model):
    __tablename__ = "exam_answers"
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(256), db.ForeignKey("active_sessions.session_id"), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    cuadernillo_id = db.Column(db.Integer, db.ForeignKey("cuadernillos.id"), nullable=False)
    question_number = db.Column(db.Integer, nullable=False)
    selected_option = db.Column(db.Integer, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=True)
    score_points = db.Column(db.Integer, nullable=True)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)

    active_session = db.relationship("ActiveSession", backref=db.backref("exam_answers", lazy=True))
    user = db.relationship("User", backref=db.backref("exam_answers", lazy=True))
    cuadernillo = db.relationship("Cuadernillo", backref=db.backref("exam_answers", lazy=True))

    def __repr__(self):
        return f"<ExamAnswer User:{self.user_id} Session:{self.session_id} Q:{self.question_number}>"


class ExamResult(db.Model):
    __tablename__ = "exam_results"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    cuadernillo_id = db.Column(db.Integer, db.ForeignKey("cuadernillos.id"), nullable=False)
    final_score = db.Column(db.Float, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    incorrect_answers = db.Column(db.Integer, nullable=False)
    unanswered_questions = db.Column(db.Integer, nullable=False)
    time_used = db.Column(db.Integer, nullable=True)  # Tiempo en segundos
    attempt_number = db.Column(db.Integer, nullable=False, default=1)
    completion_date = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("exam_results", lazy=True))
    cuadernillo = db.relationship("Cuadernillo", backref=db.backref("exam_results", lazy=True))

    def __repr__(self):
        return f"<ExamResult User:{self.user_id} Cuadernillo:{self.cuadernillo_id} Score:{self.final_score}>"


# Función para inicializar la base de datos
def init_db(app):
    """Inicializa la base de datos con la aplicación Flask"""
    db.init_app(app)


def create_tables():
    """Crea todas las tablas en la base de datos"""
    db.create_all()


def drop_tables():
    """Elimina todas las tablas de la base de datos"""
    db.drop_all()


def seed_data():
    """Crea los datos iniciales para la aplicación."""

    # Añadir configuraciones iniciales si no existen
    if not ConfiguracionSistema.query.filter_by(clave="TEST_SITE_ENABLED").first():
        config_test = ConfiguracionSistema(
            clave="TEST_SITE_ENABLED",
            valor="1",
            descripcion="Activa o desactiva el sitio de prueba (1=Activo, 0=Inactivo)",
        )
        db.session.add(config_test)

    if not ConfiguracionSistema.query.filter_by(clave="MAIN_SITE_ENABLED").first():
        config_main = ConfiguracionSistema(
            clave="MAIN_SITE_ENABLED",
            valor="1",
            descripcion="Activa o desactiva el sitio principal (1=Activo, 0=Inactivo)",
        )
        db.session.add(config_main)

    # Crear configuración inicial del sistema
    configs = [
        ("max_peticiones_por_usuario", "10", "Máximo número de peticiones por usuario"),
        ("tiempo_limite_peticion", "30", "Días límite para completar una petición"),
        ("email_notificaciones", "true", "Activar notificaciones por email"),
        ("EXAM_TIMER_DURATION", "240", "Duración del examen por pregunta (segundos)"),
        ("EXAM_WARNING_TIME", "30", "Tiempo de advertencia antes de finalizar (segundos)"),
        ("EXAM_NEXT_BUTTON_DELAY", "10000", "Retraso obligatorio del botón siguiente (ms)"),
        ("EXAM_NUM_ATTEMPTS", "1", "Número máximo de intentos permitidos"),
        ("EXAM_QUESTIONS_COUNT", "10", "Número de preguntas por examen"),
        ("SHOW_CORRECT_ANSWERS", "0", "Habilita el botón de ver respuestas correctas (1=Sí, 0=No)"),
        ("PREICFES_ENABLED", "1", "Activa o desactiva el módulo Preicfes (1=Activo, 0=Inactivo)"),
        ("PREUNAL_ENABLED", "1", "Activa o desactiva el módulo Preunal (1=Activo, 0=Inactivo)"),
        ("LABORATORIOS_ENABLED", "1", "Activa o desactiva el módulo Laboratorios (1=Activo, 0=Inactivo)"),
        ("MODULE_PREICFES_GRADES", "10,11", "Grados habilitados para el módulo Preicfes (separados por coma)"),
        ("MODULE_PREUNAL_GRADES", "10,11", "Grados habilitados para el módulo Preunal (separados por coma)"),
        (
            "MODULE_LABORATORIOS_GRADES",
            "6,7,8,9,10,11",
            "Grados habilitados para el módulo Laboratorios (separados por coma)",
        ),
    ]

    for clave, valor, desc in configs:
        config = ConfiguracionSistema.query.filter_by(clave=clave).first()
        if not config:
            config = ConfiguracionSistema(clave=clave, valor=valor, descripcion=desc)
            db.session.add(config)

    try:
        db.session.commit()
        print("✓ Datos iniciales creados correctamente")
    except Exception as e:
        db.session.rollback()
        print(f"✗ Error al crear datos iniciales: {e}")
