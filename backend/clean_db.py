import os
import shutil

# Obtiene la ruta absoluta del directorio donde se encuentra el script.
# Esto asegura que el script se pueda ejecutar desde cualquier ubicación.
script_dir = os.path.dirname(os.path.abspath(__file__))
instance_folder_path = os.path.join(script_dir, 'instance')

print(f"Buscando el directorio de instancia en: {instance_folder_path}")

# Verifica si la carpeta 'instance' existe.
if os.path.exists(instance_folder_path) and os.path.isdir(instance_folder_path):
    try:
        # Elimina la carpeta 'instance' y todo su contenido.
        shutil.rmtree(instance_folder_path)
        print("✅ Directorio 'instance' y su contenido (base de datos) eliminados correctamente.")
    except Exception as e:
        print(f"❌ Error al eliminar el directorio 'instance': {e}")
else:
    print("ℹ️  No se encontró el directorio 'instance'. No hay nada que limpiar.")

print("\nLimpieza finalizada. Ahora puedes ejecutar 'init_db.py' y 'seed_db.py' para empezar desde cero.")
