# app.py
import os
from dotenv import load_dotenv
from flask import Flask
from flask_migrate import Migrate
from models import db, init_db, create_tables
from admin import init_admin

load_dotenv() # <-- Esta llamada ya está correctamente posicionada

def create_app():
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__, instance_relative_config=True)
    
    # Asegurarse de que la carpeta de instancia exista
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Configuración básica
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-key-change-in-production'),
        SQLALCHEMY_DATABASE_URI=os.environ.get(
            'DATABASE_URL',
            f'sqlite:///{os.path.join(app.instance_path, "sistema_gestion.db")}'
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    # Inicializar extensiones
    init_db(app)

    

    Migrate(app, db)
    init_admin(app)

    # Registrar Blueprints
    from routes.web_main import web_main_bp
    from routes.web_test import web_test_bp
    from routes.server_admin import server_admin_bp
    from routes.frontend import frontend_bp
    from routes.api import api_bp

    # REORDENADO: Registrando frontend_bp primero para descartar conflictos
    app.register_blueprint(frontend_bp)
    app.register_blueprint(web_main_bp, url_prefix='')
    app.register_blueprint(web_test_bp, url_prefix='/test')
    app.register_blueprint(server_admin_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    return app