# models.py

# --Librerías Necesarias --
from flask_sqlalchemy import SQLAlchemy  # ORM para manejar la base de datos
from datetime import datetime # Para manejar fechas y horas
from werkzeug.security import generate_password_hash, check_password_hash # Para hashear contraseñas
from enum import Enum # Para definir enumeraciones

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
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False) # Nuevo campo
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nombre_completo = db.Column(db.String(150), nullable=True) # Nuevo campo
    grado = db.Column(db.String(50), nullable=True) # Nuevo campo
    role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relaciones
    peticiones = db.relationship('Peticion', backref='usuario', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Establece la contraseña hasheada"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica la contraseña"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<ExamSession {self.id} - User {self.user_id} - Exam {self.exam_id}>'

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    data_activity_id = db.Column(db.String(80), unique=True, nullable=False)
    applicable_grades = db.Column(db.String(200), nullable=True) # e.g., "6,7,8,9,10,11"

    def __repr__(self):
        return '<Activity %r>' % self.name
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'data_activity_id': self.data_activity_id,
            'applicable_grades': self.applicable_grades
        }

class Cuadernillo(db.Model):
    __tablename__ = 'cuadernillos'

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
        return f'<Cuadernillo {self.nombre}>'

class Peticion(db.Model):
    __tablename__ = 'peticiones'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    estado = db.Column(db.Enum(PeticionEstado), default=PeticionEstado.PENDIENTE, nullable=False)
    prioridad = db.Column(db.Integer, default=1)  # 1=baja, 2=media, 3=alta
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    fecha_limite = db.Column(db.DateTime, nullable=True)
    
    # Clave foránea
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relaciones
    comentarios = db.relationship('Comentario', backref='peticion', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Peticion {self.titulo}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'estado': self.estado.value,
            'prioridad': self.prioridad,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'fecha_limite': self.fecha_limite.isoformat() if self.fecha_limite else None,
            'user_id': self.user_id,
            'usuario': self.usuario.username if self.usuario else None
        }

class Comentario(db.Model):
    __tablename__ = 'comentarios'
    
    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Claves foráneas
    peticion_id = db.Column(db.Integer, db.ForeignKey('peticiones.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relaciones
    usuario = db.relationship('User', backref='comentarios')
    
    def __repr__(self):
        return f'<Comentario {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'contenido': self.contenido,
            'created_at': self.created_at.isoformat(),
            'peticion_id': self.peticion_id,
            'user_id': self.user_id,
            'usuario': self.usuario.username if self.usuario else None
        }

class ConfiguracionSistema(db.Model):
    __tablename__ = 'configuracion_sistema'
    
    id = db.Column(db.Integer, primary_key=True)
    clave = db.Column(db.String(100), unique=True, nullable=False)
    valor = db.Column(db.Text, nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Config {self.clave}: {self.valor}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'clave': self.clave,
            'valor': self.valor,
            'descripcion': self.descripcion,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Log(db.Model):
    __tablename__ = 'logs'
    
    id = db.Column(db.Integer, primary_key=True)
    nivel = db.Column(db.String(20), nullable=False)  # INFO, WARNING, ERROR, DEBUG
    mensaje = db.Column(db.Text, nullable=False)
    modulo = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación
    usuario = db.relationship('User', backref='logs')
    
    def __repr__(self):
        return f'<Log {self.nivel}: {self.mensaje[:50]}...>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nivel': self.nivel,
            'mensaje': self.mensaje,
            'modulo': self.modulo,
            'user_id': self.user_id,
            'usuario': self.usuario.username if self.usuario else None,
            'created_at': self.created_at.isoformat()
        }

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
    if not ConfiguracionSistema.query.filter_by(clave='TEST_SITE_ENABLED').first():
        config_test = ConfiguracionSistema(
            clave='TEST_SITE_ENABLED', 
            valor='1', 
            descripcion='Activa o desactiva el sitio de prueba (1=Activo, 0=Inactivo)'
        )
        db.session.add(config_test)

    if not ConfiguracionSistema.query.filter_by(clave='MAIN_SITE_ENABLED').first():
        config_main = ConfiguracionSistema(
            clave='MAIN_SITE_ENABLED',
            valor='1',
            descripcion='Activa o desactiva el sitio principal (1=Activo, 0=Inactivo)'
        )
        db.session.add(config_main)

    # Añadir roles de usuario si no existen
    if not UserRole.query.first():
        roles = [
            UserRole.ADMIN,
            UserRole.USER,
            UserRole.MODERATOR
        ]
        db.session.add(roles)
    
    # Crear usuario administrador por defecto
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@sistema.com',
            role=UserRole.ADMIN
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
    
    # Crear usuario de prueba
    test_user = User.query.filter_by(username='usuario_test').first()
    if not test_user:
        test_user = User(
            username='usuario_test',
            email='test@sistema.com',
            role=UserRole.USER
        )
        test_user.set_password('test123')
        db.session.add(test_user)
    
    # Crear configuración inicial del sistema
    configs = [
        ('max_peticiones_por_usuario', '10', 'Máximo número de peticiones por usuario'),
        ('tiempo_limite_peticion', '30', 'Días límite para completar una petición'),
        ('email_notificaciones', 'true', 'Activar notificaciones por email')
    ]
    
    for clave, valor, desc in configs:
        config = ConfiguracionSistema.query.filter_by(clave=clave).first()
        if not config:
            config = ConfiguracionSistema(
                clave=clave,
                valor=valor,
                descripcion=desc
            )
            db.session.add(config)
    
    try:
        db.session.commit()
        print("✓ Datos iniciales creados correctamente")
    except Exception as e:
        db.session.rollback()
        print(f"✗ Error al crear datos iniciales: {e}")