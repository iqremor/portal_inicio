import sqlite3

conn = sqlite3.connect("backend/instance/sistema_gestion.db")
cursor = conn.cursor()
cursor.execute("SELECT cuadernillo_id, area FROM cuadernillos")
rows = cursor.fetchall()
for row in rows:
    print(row)
conn.close()
