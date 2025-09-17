import os
from flask import Blueprint, send_from_directory

frontend_bp = Blueprint(
    'frontend',
    __name__,
    static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend')),
    static_url_path='/frontend'
)

@frontend_bp.route('/pages/<path:filename>')
def serve_frontend_pages(filename):
    """Sirve archivos estáticos desde la carpeta frontend/pages."""
    print("--- DEBUG: Intentando servir página desde /pages/<path:filename> ---")
    print(f"--- DEBUG: Filename solicitado: {filename}")
    
    directory = os.path.join(frontend_bp.static_folder, 'pages')
    print(f"--- DEBUG: Directorio de búsqueda: {directory}")
    
    # Comprobar si el archivo existe
    if not os.path.exists(os.path.join(directory, filename)):
        print(f"--- DEBUG: ¡ERROR! El archivo no existe en la ruta: {os.path.join(directory, filename)}")
    
    print("--- DEBUG: Llamando a send_from_directory... ---")
    return send_from_directory(directory, filename)

@frontend_bp.route('/test-login-page')
def test_login_route():
    print("--- DEBUG: RUTA DE PRUEBA /test-login-page ALCANZADA ---")
    pages_dir = os.path.join(frontend_bp.static_folder, 'pages')
    return send_from_directory(pages_dir, 'login.html')

# @frontend_bp.route('/<path:filename>')
# def serve_frontend_static(filename):
#     """Sirve archivos estáticos desde la carpeta frontend."""
#     return send_from_directory(frontend_bp.static_folder, filename)