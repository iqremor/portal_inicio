import os

from app import create_app


def sync_exams():
    from models import db

    app = create_app()
    with app.app_context():
        # Configuración de carpetas y mapeo de nombres
        # Se asume que el script se corre desde la raíz o dentro de backend/
        base_data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

        # CATEGORÍAS DE EXÁMENES (Nueva Jerarquía)
        categorias = [
            {"path": "pruebas_saber", "tipo": "SABER"},
            {"path": "pruebas_unal", "tipo": "UNAL"},
            {"path": "laboratorios", "tipo": "LAB"},
        ]

        grados_carpetas = {"sexto": "6", "septimo": "7", "octavo": "8", "noveno": "9", "decimo": "10", "once": "11"}

        print(f"Buscando cuadernillos en: {base_data_path}")

        count_added = 0
        for cat in categorias:
            cat_path = os.path.join(base_data_path, cat["path"])
            if not os.path.exists(cat_path):
                continue

            print(f"\n--- Escaneando categoría: {cat['tipo']} ---")

            if cat["tipo"] == "SABER":
                for carpeta_grado, grado_num in grados_carpetas.items():
                    grado_path = os.path.join(cat_path, carpeta_grado)
                    if not os.path.exists(grado_path):
                        continue

                    for area_nombre in os.listdir(grado_path):
                        area_path = os.path.join(grado_path, area_nombre)
                        if os.path.isdir(area_path):
                            added = process_area(area_path, grado_num, area_nombre, cat["path"], carpeta_grado)
                            if added:
                                count_added += 1
            else:
                for area_nombre in os.listdir(cat_path):
                    area_path = os.path.join(cat_path, area_nombre)
                    if os.path.isdir(area_path):
                        added = process_area(area_path, "11", area_nombre, cat["path"], "")
                        if added:
                            count_added += 1

        db.session.commit()
        print(f"\nSincronización completada. Se añadieron/actualizaron {count_added} cuadernillos.")


def process_area(area_path, grado_num, area_nombre, cat_path, sub_folder):
    # Importar dentro para evitar conflictos de contexto
    from models import Cuadernillo, db

    imagenes = [f for f in os.listdir(area_path) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
    if not imagenes:
        return False

    # Crear ID único: incluye la categoría para evitar colisiones
    cid = f"{cat_path}_{grado_num}_{area_nombre.lower().replace(' ', '_')}"

    # Ruta relativa para el banco: ahora incluye la categoría
    dir_banco = f"{cat_path}/{sub_folder}/{area_nombre}".replace("//", "/")

    nombre_formateado = f"{cat_path.replace('_', ' ').title()} - {area_nombre.replace('_', ' ').title()} ({grado_num})"

    existente = Cuadernillo.query.filter_by(cuadernillo_id=cid).first()

    if existente:
        existente.nombre = nombre_formateado
        existente.total_preguntas_banco = len(imagenes)
        existente.dir_banco = dir_banco
        print(f" [M] Actualizado: {nombre_formateado}")
        return False
    else:
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
        print(f" [A] Añadido: {nombre_formateado} ({len(imagenes)} preguntas)")
        return True


if __name__ == "__main__":
    sync_exams()
