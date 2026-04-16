import os
import sys

import pytest

# Añadir el directorio backend al path para que los imports funcionen
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app import create_app  # noqa: E402
from models import db as _db  # noqa: E402


@pytest.fixture
def app():
    """Fixture para crear la aplicación de pruebas."""
    app = create_app()
    app.config.update(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",  # Base de datos en memoria para pruebas
        }
    )

    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture
def db(app):
    """Fixture para la base de datos."""
    return _db


@pytest.fixture
def client(app):
    """Fixture para el cliente de pruebas."""
    return app.test_client()
