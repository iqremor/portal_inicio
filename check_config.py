import os
import sqlite3

db_path = "backend/instance/sistema_gestion.db"
if not os.path.exists(db_path):
    print(f"Base de datos no encontrada en {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT clave, valor FROM configuracion_sistema")
rows = cursor.fetchall()

print("--- Configuraciones Actuales ---")
for r in rows:
    if "ENABLED" in r[0] or "GRADES" in r[0]:
        print(f"{r[0]}: {r[1]}")
conn.close()
