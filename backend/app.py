import os
import json
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import uuid

# ----------------- CONFIGURACIÓN -----------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuración de la base de datos SQLite
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
data_dir = os.path.join(BASE_DIR, '..', 'data')
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

db_path = os.path.join(data_dir, 'portal_academico.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ----------------- MODELOS DE DATOS -----------------

# Tabla de asociación para la relación muchos-a-muchos entre Grado y Area
grados_areas_association = db.Table('grados_areas',
    db.Column('grado_id', db.Integer, db.ForeignKey('grados.id'), primary_key=True),
    db.Column('area_id', db.Integer, db.ForeignKey('areas.id'), primary_key=True)
)

class Grado(db.Model):
    __tablename__ = 'grados'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    usuarios = db.relationship('Usuario', backref='grado', lazy=True)
    # Relación muchos-a-muchos con Area
    areas = db.relationship('Area', secondary=grados_areas_association, lazy='subquery',
        backref=db.backref('grados', lazy=True))

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    codigo = db.Column(db.String(20), primary_key=True, unique=True, nullable=False)
    nombre_completo = db.Column(db.String(120), nullable=False)
    grado_id = db.Column(db.Integer, db.ForeignKey('grados.id'), nullable=False)
    activo = db.Column(db.Boolean, default=True, nullable=False)
    intentos = db.relationship('Intento', backref='usuario', lazy=True, cascade="all, delete-orphan")

class Area(db.Model):
    __tablename__ = 'areas'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False)
    preguntas = db.relationship('Pregunta', backref='area', lazy=True, cascade="all, delete-orphan")

class Pregunta(db.Model):
    __tablename__ = 'preguntas'
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'), nullable=False)
    texto = db.Column(db.Text, nullable=False)
    opciones = db.Column(db.JSON, nullable=False)
    respuesta_correcta = db.Column(db.String(10), nullable=False)
    puntos = db.Column(db.Integer, default=10, nullable=False)

class Intento(db.Model):
    __tablename__ = 'intentos'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_codigo = db.Column(db.String(20), db.ForeignKey('usuarios.codigo'), nullable=False)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    puntuacion = db.Column(db.Integer, nullable=False)
    puntuacion_maxima = db.Column(db.Integer, nullable=False)
    porcentaje = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(20), default='completado', nullable=False)
    respuestas_enviadas = db.Column(db.JSON, nullable=True)

# ----------------- COMANDO PARA INICIALIZAR Y POBLAR LA BD -----------------
@app.cli.command('init-db')
def init_db_command():
    """Limpia y crea la base de datos con datos iniciales."""
    db.drop_all()  # Limpia la base de datos existente
    db.create_all() # Crea las tablas nuevas

    print("Poblando la base de datos...")

    # 1. Crear Grados
    grados = {'10mo': Grado(nombre='10mo'), '11vo': Grado(nombre='11vo')}
    db.session.add_all(grados.values())
    db.session.commit()

    # 2. Crear Áreas
    areas = {
        'matematicas': Area(nombre='Matemáticas', descripcion='Evaluación de razonamiento lógico y cálculo.'),
        'ciencias': Area(nombre='Ciencias Naturales', descripcion='Evaluación de biología, química y física.'),
        'sociales': Area(nombre='Ciencias Sociales', descripcion='Evaluación de historia, geografía y cívica.')
    }
    db.session.add_all(areas.values())
    db.session.commit()

    # 3. Asociar Grados con Áreas
    grados['10mo'].areas.append(areas['matematicas'])
    grados['10mo'].areas.append(areas['ciencias'])
    grados['11vo'].areas.append(areas['matematicas'])
    grados['11vo'].areas.append(areas['sociales'])
    db.session.commit()

    # 4. Cargar Usuarios desde JSON
    usuarios_json_path = os.path.join(data_dir, 'usuarios.json')
    try:
        with open(usuarios_json_path, 'r', encoding='utf-8') as f:
            usuarios_data = json.load(f)
            for codigo, info in usuarios_data.get('nombres', {}).items():
                if codigo in usuarios_data.get('usuarios_permitidos', []):
                    grado_nombre = info.get('grado')
                    grado_obj = grados.get(grado_nombre)
                    if grado_obj:
                        usuario = Usuario(
                            codigo=codigo,
                            nombre_completo=info.get('nombre_completo'),
                            grado=grado_obj,
                            activo=info.get('activo', True)
                        )
                        db.session.add(usuario)
    except FileNotFoundError:
        print(f"Advertencia: No se encontró el archivo '{usuarios_json_path}'. No se cargarán usuarios.")
    db.session.commit()

    # 5. Cargar Preguntas desde JSON (si existe)
    examenes_json_path = os.path.join(data_dir, 'examenes.json')
    try:
        with open(examenes_json_path, 'r', encoding='utf-8') as f:
            examenes_data = json.load(f)
            for area_key, examen_info in examenes_data.items():
                area_obj = Area.query.filter_by(nombre=examen_info.get('nombre')).first()
                if area_obj:
                    for pregunta_data in examen_info.get('preguntas', []):
                        pregunta = Pregunta(
                            area=area_obj,
                            texto=pregunta_data.get('pregunta'),
                            opciones=pregunta_data.get('opciones'),
                            respuesta_correcta=pregunta_data.get('respuesta_correcta'),
                            puntos=pregunta_data.get('puntos', 10)
                        )
                        db.session.add(pregunta)
    except FileNotFoundError:
        print(f"Advertencia: No se encontró el archivo '{examenes_json_path}'. No se cargarán preguntas.")
    db.session.commit()

    print(f'Base de datos inicializada y poblada en: {db_path}')

# ----------------- RUTAS DE LA API (Proximamente) -----------------
@app.route('/api/status')
def status():
    return jsonify({'status': 'ok', 'message': 'API en funcionamiento'})

# ----------------- MANEJO DE ERRORES -----------------
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": True, "mensaje": "Ruta no encontrada"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": True, "mensaje": "Error interno del servidor"}), 500

# ----------------- EJECUCIÓN DE LA APP -----------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)