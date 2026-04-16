# backend/utils/user_management.py
import json
import os
from datetime import datetime

import pandas as pd

from models import User, UserRole, db


class UserSyncManager:
    @staticmethod
    def normalize_string(text, uppercase=True):
        """Limpia y normaliza cadenas de texto."""
        if not text or pd.isna(text):
            return ""
        text = str(text).strip()
        # Eliminar espacios múltiples internos
        text = " ".join(text.split())
        return text.upper() if uppercase else text

    @staticmethod
    def normalize_grado(grado):
        """Estandariza el formato del grado."""
        g = str(grado).strip().lower()
        mapping = {
            "6": "6",
            "sexto": "6",
            "7": "7",
            "septimo": "7",
            "séptimo": "7",
            "8": "8",
            "octavo": "8",
            "9": "9",
            "noveno": "9",
            "10": "10",
            "decimo": "10",
            "décimo": "10",
            "11": "11",
            "once": "11",
        }
        return mapping.get(g, g.upper())

    @staticmethod
    def create_backup():
        """Crea un respaldo de la tabla User actual en formato JSON."""
        try:
            backup_dir = os.path.join("instance", "backups")
            os.makedirs(backup_dir, exist_ok=True)

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(backup_dir, f"users_backup_{timestamp}.json")

            users = User.query.all()
            backup_data = []
            for u in users:
                backup_data.append(
                    {
                        "username": u.username,
                        "codigo": u.codigo,
                        "nombre_completo": u.nombre_completo,
                        "grado": u.grado,
                        "role": u.role.value,
                        "is_active": u.is_active,
                    }
                )

            with open(backup_path, "w", encoding="utf-8") as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=4)

            return backup_path
        except Exception as e:
            print(f"Error creando respaldo: {str(e)}")
            return None

    @staticmethod
    def generate_template(file_path):
        """Genera un archivo Excel de plantilla para la carga de usuarios."""
        try:
            # Asegurar que el directorio base exista
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            data = {
                "codigo": ["123456", "789012"],
                "nombre_completo": ["Juan Perez", "Maria Garcia"],
                "grado": ["10", "once"],
            }
            df = pd.DataFrame(data)
            df.to_excel(file_path, index=False)
            return file_path
        except Exception as e:
            print(f"Error generando plantilla: {str(e)}")
            raise e

    @staticmethod
    def sync_from_file(file_path, delete_others=False):
        """
        Sincroniza la base de datos de usuarios desde un archivo Excel o CSV.
        Retorna un resumen de la operación.
        """
        # Crear respaldo antes de empezar
        backup_file = UserSyncManager.create_backup()

        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        # Validar columnas
        required_columns = {"codigo", "nombre_completo", "grado"}
        if not required_columns.issubset(set(df.columns)):
            missing = required_columns - set(df.columns)
            raise ValueError(f"Faltan columnas obligatorias: {', '.join(missing)}")

        summary = {"created": 0, "updated": 0, "deleted": 0, "errors": [], "backup": backup_file}
        incoming_codigos = set()

        for _, row in df.iterrows():
            try:
                codigo = UserSyncManager.normalize_string(row["codigo"])
                nombre = UserSyncManager.normalize_string(row["nombre_completo"])
                grado = UserSyncManager.normalize_grado(row["grado"])

                if not codigo:
                    continue

                incoming_codigos.add(codigo)

                user = User.query.filter_by(codigo=codigo).first()
                if user:
                    # No actualizar administradores por seguridad si vienen en el excel
                    if user.role == UserRole.ADMIN:
                        continue

                    user.nombre_completo = nombre
                    user.grado = grado
                    summary["updated"] += 1
                else:
                    new_user = User(
                        username=codigo,
                        codigo=codigo,
                        nombre_completo=nombre,
                        grado=grado,
                        role=UserRole.USER,
                        is_active=True,
                    )
                    new_user.set_password(codigo)  # Password por defecto = codigo
                    db.session.add(new_user)
                    summary["created"] += 1
            except Exception as e:
                summary["errors"].append(f"Error en fila {codigo if 'codigo' in locals() else 'desconocida'}: {str(e)}")

        if delete_others:
            # Desactivar usuarios que no están en el archivo (excepto admins)
            to_deactivate = User.query.filter(
                User.role != UserRole.ADMIN, ~User.codigo.in_(incoming_codigos), User.is_active
            ).all()

            for u in to_deactivate:
                u.is_active = False
                summary["deleted"] += 1

        db.session.commit()
        return summary

    @staticmethod
    def clear_all_students():
        """
        Elimina a todos los usuarios con rol ESTUDIANTE de la base de datos.
        Retorna el conteo de usuarios eliminados.
        """
        # Crear respaldo antes de borrar todo
        UserSyncManager.create_backup()

        try:
            # Contar antes de borrar para el reporte
            count = User.query.filter_by(role=UserRole.USER).count()

            # Realizar borrado masivo
            User.query.filter_by(role=UserRole.USER).delete()

            db.session.commit()
            return count
        except Exception as e:
            db.session.rollback()
            print(f"Error al limpiar base de datos de usuarios: {str(e)}")
            raise e
