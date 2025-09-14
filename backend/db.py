import click
from models import db, create_tables, seed_data
from app import create_app # Importar create_app

@click.command('init-db')
def init_db_command():
    """Clear existing data and create new tables."""
    app = create_app() # Crear una instancia de la aplicación
    with app.app_context(): # Establecer el contexto de la aplicación
        create_tables()
        seed_data()
    click.echo('Initialized the database.')