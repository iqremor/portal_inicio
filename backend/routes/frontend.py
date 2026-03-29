import os

from flask import Blueprint, send_from_directory

frontend_bp = Blueprint(
    "frontend",
    __name__,
    static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend")),
    static_url_path="/frontend",
)


@frontend_bp.route("/pages/<path:filename>")
def serve_frontend_pages(filename):
    """Sirve archivos estáticos desde la carpeta frontend/pages."""
    return send_from_directory(os.path.join(frontend_bp.static_folder, "pages"), filename)


@frontend_bp.route("/<path:subpath>/<path:filename>")
def serve_frontend_assets(subpath, filename):
    """Sirve archivos estáticos (css, js, etc.) desde subcarpetas de frontend."""
    return send_from_directory(os.path.join(frontend_bp.static_folder, subpath), filename)
