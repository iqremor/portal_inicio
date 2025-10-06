
import csv
import json
import os

# Define file paths relative to the script location
script_dir = os.path.dirname(__file__)
csv_file_path = os.path.join(script_dir, 'data', 'datos_alumnos.csv')
json_file_path = os.path.join(script_dir, 'data', 'usuarios.json')

print(f"Leyendo datos desde: {csv_file_path}")

# Lista para almacenar los diccionarios de usuarios
usuarios_data = []

try:
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as csv_file:
        # Usar DictReader para leer el CSV como una lista de diccionarios
        # Especificar el delimitador como punto y coma
        csv_reader = csv.DictReader(csv_file, delimiter=';')

        for row in csv_reader:
            # Ignorar filas vacías que puedan resultar de líneas en blanco al final
            if not row or not any(row.values()):
                continue

            # Crear un nuevo diccionario para el formato JSON deseado
            # y convertir los tipos de datos según sea necesario
            usuario = {
                "codigo": row.get("codigo"),
                "nombre_completo": row.get("nombre_completo"),
                "grado": row.get("grado"),
                # Convertir el string 'true'/'false' a un booleano
                "activo": row.get("activo", "false").lower() == 'true',
                "fecha_registro": row.get("fecha_registro"),
                "role": row.get("role")
            }
            usuarios_data.append(usuario)

    print(f"Se procesaron {len(usuarios_data)} registros de usuarios.")

    # Escribir los datos en el archivo JSON
    print(f"Escribiendo datos en: {json_file_path}")
    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        # Usar indent=2 para un formato legible y ensure_ascii=False para nombres con tildes
        json.dump(usuarios_data, json_file, indent=2, ensure_ascii=False)

    print("✅ Conversión completada exitosamente.")
    print(f"El archivo '{os.path.basename(json_file_path)}' ha sido actualizado.")

except FileNotFoundError:
    print(f"❌ Error: No se encontró el archivo de entrada: {csv_file_path}")
except Exception as e:
    print(f"❌ Ocurrió un error inesperado: {e}")
