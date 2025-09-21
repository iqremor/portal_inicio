# routes/data_routes.py
import os
from flask import Blueprint, send_from_directory

# Creamos el Blueprint
data_files_bp = Blueprint('data_files', __name__)

# Definimos la ruta absoluta al directorio 'data' que está fuera de 'backend'
# .. significa subir un nivel desde la ubicación actual del script (backend/routes)
# y luego entrar a 'data'
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data'))

@data_files_bp.route('/<path:filename>')
def serve_data_file(filename):
    """Sirve un archivo desde el directorio 'data' del proyecto."""
    return send_from_directory(DATA_DIR, filename)
