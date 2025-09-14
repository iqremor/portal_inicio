# routes/web_test.py
import os
from flask import Blueprint, send_from_directory, abort
from models import ConfiguracionSistema

# Construir rutas absolutas para evitar ambigüedades
bp_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(bp_dir, '..'))
template_dir = os.path.join(project_root, 'templates', 'web_test')

# Blueprint para el sitio de prueba
web_test_bp = Blueprint(
    'web_test',
    __name__,
    template_folder=template_dir,
    static_folder=template_dir,
    static_url_path=''  # Sirve los archivos estáticos desde la raíz del blueprint (/test/)
)

# @web_test_bp.before_request
# def check_test_site_status():
#     """Verifica si el sitio de prueba está activado antes de cada petición."""
#     config = ConfiguracionSistema.query.filter_by(clave='TEST_SITE_ENABLED').first()
#     if not config or config.valor != '1':
#         abort(404)

@web_test_bp.route('/')
def index_test():
    """Sirve el index.html del sitio de prueba."""
    return send_from_directory(web_test_bp.template_folder, 'index.html')
