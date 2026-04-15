# backend/utils/user_management.py
import os

import pandas as pd

from models import User, UserRole, db


class UserSyncManager:
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
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        # Validar columnas
        required_columns = {"codigo", "nombre_completo", "grado"}
        if not required_columns.issubset(set(df.columns)):
            missing = required_columns - set(df.columns)
            raise ValueError(f"Faltan columnas obligatorias: {', '.join(missing)}")

        summary = {"created": 0, "updated": 0, "deleted": 0, "errors": []}
        incoming_codigos = set()

        for _, row in df.iterrows():
            try:
                codigo = str(row["codigo"]).strip()
                nombre = str(row["nombre_completo"]).strip()
                grado = str(row["grado"]).strip()

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
            to_deactivate = User.query.filter(User.role != UserRole.ADMIN, ~User.codigo.in_(incoming_codigos)).all()
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
