import os
from flask import current_app
from app import create_app # Importar create_app para crear un contexto
from models import db # Importar db para verificar tablas
import click

def get_db_path(app_instance):
    """Obtiene la ruta del archivo de la base de datos SQLite."""
    db_uri = app_instance.config.get('SQLALCHEMY_DATABASE_URI')
    if db_uri and db_uri.startswith('sqlite:///'):
        db_file = db_uri.replace('sqlite:///', '')
        if not os.path.isabs(db_file):
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
            db_file = os.path.join(project_root, db_file)
        return db_file
    return None

def check_db_file_exists():
    """Verifica si el archivo de la base de datos SQLite existe."""
    app = create_app()
    with app.app_context():
        db_path = get_db_path(app)
        file_exists = db_path and os.path.exists(db_path)
        if file_exists:
            try:
                db.session.execute(db.text("SELECT 1")).scalar()
                return True
            except Exception:
                return False
        return False

def initialize_database_if_not_exists():
    """
    Verifica si la base de datos existe y, si no, pregunta al usuario si desea inicializarla.
    Retorna una tupla (bool, str) donde bool indica si la DB está lista y str es el mensaje de estado.
    """
    if check_db_file_exists():
        return True, click.style("Cargada con éxito", fg='green')
    else:
        status_message = click.style(" No encontrada o corrupta", fg='yellow')
        click.echo(status_message) # Mostrar el mensaje de advertencia inmediatamente
        if click.confirm(click.style("¿Desea inicializar la base de datos ahora? (Esto creará nuevas tablas y datos de prueba)", fg='blue')):
            from db import init_db_command
            try:
                app = create_app()
                with app.app_context():
                    init_db_command.callback()
                return True, click.style("Inicializada con éxito", fg='green')
            except Exception as e:
                return False, click.style(f" Error al inicializar: {e}", fg='red')
        else:
            return False, click.style("Inicialización cancelada", fg='red')
