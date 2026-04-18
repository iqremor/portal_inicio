import sqlite3

conn = sqlite3.connect("backend/instance/sistema_gestion.db")
cursor = conn.cursor()
cursor.execute("SELECT DISTINCT area FROM cuadernillos WHERE cuadernillo_id LIKE 'pruebas_unal%'")
rows = cursor.fetchall()
print([row[0] for row in rows])
conn.close()
