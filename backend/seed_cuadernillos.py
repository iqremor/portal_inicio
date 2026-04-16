import os

from app import create_app
from models import Cuadernillo, db


def sync_exams():
    app = create_app()
    with app.app_context():
        # Configuración de carpetas y mapeo de nombres
        base_data_path = os.path.join(os.getcwd(), "..", "data")
        grados_carpetas = {"sexto": "6", "septimo": "7", "octavo": "8", "noveno": "9", "decimo": "10", "once": "11"}

        print(f"Buscando cuadernillos en: {base_data_path}")

        count_added = 0
        for carpeta_grado, grado_num in grados_carpetas.items():
            grado_path = os.path.join(base_data_path, carpeta_grado)

            if not os.path.exists(grado_path):
                continue

            # Escanear áreas (subcarpetas como 'matematicas', 'lenguaje', etc.)
            for area_nombre in os.listdir(grado_path):
                area_path = os.path.join(grado_path, area_nombre)

                if os.path.isdir(area_path):
                    # Contar imágenes en la carpeta
                    imagenes = [f for f in os.listdir(area_path) if f.lower().endswith((".png", ".jpg", ".jpeg"))]

                    if not imagenes:
                        continue

                    # Crear ID único
                    cid = f"{grado_num}_{area_nombre.lower().replace(' ', '_')}"

                    # Verificar si ya existe
                    existente = Cuadernillo.query.filter_by(cuadernillo_id=cid).first()

                    nombre_formateado = f"Saber {grado_num} - {area_nombre.replace('_', ' ').title()}"
                    dir_banco = f"{carpeta_grado}/{area_nombre}"

                    if existente:
                        # Actualizar si ya existe
                        existente.nombre = nombre_formateado
                        existente.total_preguntas_banco = len(imagenes)
                        existente.dir_banco = dir_banco
                        print(f" [M] Actualizado: {nombre_formateado}")
                    else:
                        # Crear nuevo
                        nuevo = Cuadernillo(
                            cuadernillo_id=cid,
                            nombre=nombre_formateado,
                            area=area_nombre.replace("_", " ").title(),
                            grado=grado_num,
                            dir_banco=dir_banco,
                            total_preguntas_banco=len(imagenes),
                            activo=True,
                        )
                        db.session.add(nuevo)
                        count_added += 1
                        print(f" [A] Añadido: {nombre_formateado} ({len(imagenes)} preguntas)")

        db.session.commit()
        print(f"\nSincronización completada. Se añadieron {count_added} nuevos cuadernillos.")


if __name__ == "__main__":
    sync_exams()
