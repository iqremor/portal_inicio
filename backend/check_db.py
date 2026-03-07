import os
import sqlite3

# Construct the path to the database file
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, "instance", "sistema_gestion.db")

print(f"Attempting to connect to database at: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("\n--- Cuadernillos Table Content ---")
    cursor.execute("SELECT id, cuadernillo_id, nombre FROM cuadernillos")
    cuadernillos = cursor.fetchall()

    if cuadernillos:
        print("id | cuadernillo_id | nombre")
        print("---|----------------|-------")
        for row in cuadernillos:
            print(f"{row[0]} | {row[1]} | {row[2]}")
    else:
        print("No cuadernillos found in the database.")

    conn.close()

except sqlite3.Error as e:
    print(f"SQLite error: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
