import os
import json
from app import create_app
from models import db, User, UserRole, Cuadernillo
from werkzeug.security import generate_password_hash

# Configura la aplicación Flask
app = create_app()
app.app_context().push()

def seed_users():
    json_path = os.path.join(os.path.dirname(__file__), 'data', 'usuarios.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            users_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Archivo de usuarios no encontrado en: {json_path}")
        return
    except json.JSONDecodeError:
        print(f"Error: Error al decodificar JSON de usuarios en: {json_path}")
        return

    print("Iniciando seeding de usuarios...")
    
    for user_info in users_data:
        codigo = user_info.get("codigo")
        if not codigo:
            print(f"Advertencia: Información incompleta para un usuario en JSON (sin código).")
            continue

        # Verificar si el usuario ya existe por código
        existing_user = User.query.filter_by(codigo=codigo).first()
        if existing_user:
            print(f"Usuario con código {codigo} ya existe. Saltando.")
            continue

        # Crear un username simple (ej. ana.garcia)
        username = user_info.get("nombre_completo", "usuario").lower().replace(" ", ".")
        # Asegurarse de que el username sea único, añadir un número si ya existe
        original_username = username
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f"{original_username}{counter}"
            counter += 1

        # Generar una contraseña simple (ej. el código del usuario)
        password = generate_password_hash(codigo) 
        
        # Asignar un rol por defecto si no está en el JSON o si el rol no es válido
        role_str = user_info.get("role", "user").upper()
        try:
            role = UserRole[role_str]
        except KeyError:
            role = UserRole.USER # Rol por defecto si no es válido

        new_user = User(
            codigo=codigo,
            username=username,
            password_hash=password,
            nombre_completo=user_info.get("nombre_completo"),
            grado=user_info.get("grado"),
            role=role,
            is_active=user_info.get("activo", True)
        )
        db.session.add(new_user)
        print(f"Añadido usuario: {new_user.nombre_completo} ({new_user.codigo})")

    try:
        db.session.commit()
        print("Seeding de usuarios completado exitosamente.")
    except Exception as e:
        db.session.rollback()
        print(f"Error durante el seeding de usuarios: {e}")

def seed_cuadernillos():
    examenes_path = os.path.join(os.path.dirname(__file__), 'data', 'examenes.json')
    cuadernillos_path = os.path.join(os.path.dirname(__file__), 'data', 'cuadernillos.json')

    try:
        with open(examenes_path, 'r', encoding='utf-8') as f:
            examenes_data = json.load(f)
        with open(cuadernillos_path, 'r', encoding='utf-8') as f:
            cuadernillos_data = json.load(f)
    except FileNotFoundError as e:
        print(f"Error: Archivo no encontrado: {e.filename}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Error al decodificar JSON en: {e.doc.name}")
        return

    print("Iniciando seeding de cuadernillos...")

    for exam_key, exam_info in examenes_data.items():
        cuadernillo_id = exam_info.get("cuadernillo_id")
        if not cuadernillo_id:
            continue

        # Find the corresponding cuadernillo in cuadernillos.json
        cuadernillo_info = None
        for area, area_info in cuadernillos_data.items():
            for c in area_info.get("cuadernillos_disponibles", []):
                if c.get("cuadernillo_id") == cuadernillo_id:
                    cuadernillo_info = c
                    break
            if cuadernillo_info:
                break
        
        if not cuadernillo_info:
            print(f"Advertencia: Cuadernillo con id {cuadernillo_id} no encontrado en cuadernillos.json. Saltando.")
            continue

        existing_cuadernillo = Cuadernillo.query.filter_by(cuadernillo_id=cuadernillo_id).first()
        if existing_cuadernillo:
            print(f"Cuadernillo con id {cuadernillo_id} ya existe. Saltando.")
            continue

        new_cuadernillo = Cuadernillo(
            cuadernillo_id=cuadernillo_id,
            nombre=exam_info.get("nombre"),
            descripcion=exam_info.get("descripcion"),
            activo=exam_info.get("activo", True),
            grado=exam_info.get("grado"),
            area=exam_info.get("area"),
            dir_banco=cuadernillo_info.get("dir_banco"),
            total_preguntas_banco=cuadernillo_info.get("total_preguntas_banco")
        )
        db.session.add(new_cuadernillo)
        print(f"Añadido cuadernillo: {new_cuadernillo.nombre}")

    try:
        db.session.commit()
        print("Seeding de cuadernillos completado exitosamente.")
    except Exception as e:
        db.session.rollback()
        print(f"Error durante el seeding de cuadernillos: {e}")


if __name__ == '__main__':
    seed_users()
    seed_cuadernillos()