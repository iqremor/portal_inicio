import os

import pandas as pd

from models import User, UserRole
from utils.user_management import UserSyncManager


def test_normalize_string():
    assert UserSyncManager.normalize_string("  juan perez  ") == "JUAN PEREZ"
    assert UserSyncManager.normalize_string("MARIA   GARCIA") == "MARIA GARCIA"
    assert UserSyncManager.normalize_string(None) == ""


def test_normalize_grado():
    assert UserSyncManager.normalize_grado("10") == "10"
    assert UserSyncManager.normalize_grado("decimo") == "10"
    assert UserSyncManager.normalize_grado("DÉCIMO") == "10"
    assert UserSyncManager.normalize_grado("once") == "11"
    assert UserSyncManager.normalize_grado("sexto") == "6"
    assert UserSyncManager.normalize_grado("desconocido") == "DESCONOCIDO"


def test_sync_from_file_creates_users(app, db):
    # Preparar archivo Excel temporal
    df = pd.DataFrame(
        {"codigo": ["1010", "2020"], "nombre_completo": ["Estudiante Uno", "Estudiante Dos"], "grado": ["10", "11"]}
    )
    file_path = "test_users.xlsx"
    df.to_excel(file_path, index=False)

    try:
        summary = UserSyncManager.sync_from_file(file_path)

        assert summary["created"] == 2
        assert summary["updated"] == 0

        user1 = User.query.filter_by(codigo="1010").first()
        assert user1 is not None
        assert user1.nombre_completo == "ESTUDIANTE UNO"
        assert user1.grado == "10"
        assert user1.role == UserRole.USER
        # Verificar que el código sirve como contraseña
        assert user1.check_password("1010") is True
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


def test_sync_from_file_updates_existing_users(app, db):
    # Crear un usuario previo (el código de ingreso es su contraseña)
    u = User(username="3030", codigo="3030", nombre_completo="ANTERIOR", grado="9", role=UserRole.USER)
    u.set_password("3030")
    db.session.add(u)
    db.session.commit()

    df = pd.DataFrame({"codigo": ["3030"], "nombre_completo": ["Nuevo Nombre"], "grado": ["decimo"]})
    file_path = "test_update.xlsx"
    df.to_excel(file_path, index=False)

    try:
        summary = UserSyncManager.sync_from_file(file_path)

        assert summary["updated"] == 1

        user = User.query.filter_by(codigo="3030").first()
        assert user.nombre_completo == "NUEVO NOMBRE"
        assert user.grado == "10"
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


def test_sync_from_file_skips_admins(app, db):
    # Crear un admin con su código
    admin = User(username="admin", codigo="admin", nombre_completo="ADMIN", grado="N/A", role=UserRole.ADMIN)
    admin.set_password("admin")
    db.session.add(admin)
    db.session.commit()

    df = pd.DataFrame({"codigo": ["admin"], "nombre_completo": ["HACKED"], "grado": ["HACKED"]})
    file_path = "test_admin.xlsx"
    df.to_excel(file_path, index=False)

    try:
        UserSyncManager.sync_from_file(file_path)

        updated_admin = User.query.filter_by(codigo="admin").first()
        assert updated_admin.nombre_completo == "ADMIN"  # No cambió por seguridad
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


def test_create_backup(app):
    # Crear usuario de prueba para el respaldo
    with app.app_context():
        from models import db as _db

        u = User(username="test", codigo="test", nombre_completo="Test User", grado="10", role=UserRole.USER)
        u.set_password("test")
        _db.session.add(u)
        _db.session.commit()

        backup_path = UserSyncManager.create_backup()
        assert backup_path is not None
        assert os.path.exists(backup_path)

        if os.path.exists(backup_path):
            os.remove(backup_path)
