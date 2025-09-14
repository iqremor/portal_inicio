import os
import json
from app import create_app
from models import db, User, UserRole
from werkzeug.security import generate_password_hash

# Configura la aplicación Flask
app = create_app()
app.app_context().push()

def seed_users_from_json():
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
    
    for codigo in users_data.get("usuarios_permitidos", []):
        user_info = users_data.get("nombres", {}).get(codigo)
        
        if user_info:
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
        else:
            print(f"Advertencia: Información incompleta para el código {codigo} en JSON.")

    try:
        db.session.commit()
        print("Seeding de usuarios completado exitosamente.")
    except Exception as e:
        db.session.rollback()
        print(f"Error durante el seeding: {e}")

if __name__ == '__main__':
    seed_users_from_json()