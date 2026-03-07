import json
import os
import re


def seleccionar_directorio(directorio_base):
    """Muestra los directorios disponibles y pide al usuario que seleccione uno."""
    print(f"\nBuscando directorios en: {directorio_base}")
    try:
        directorios = [
            d
            for d in os.listdir(directorio_base)
            if os.path.isdir(os.path.join(directorio_base, d))
        ]
        if not directorios:
            print("No se encontraron directorios.")
            return None
    except FileNotFoundError:
        print(f"Error: El directorio base '{directorio_base}' no existe.")
        return None

    print(
        "Por favor, seleccione el directorio que contiene los archivos de respuestas .txt:"
    )
    for i, dirname in enumerate(directorios):
        print(f"  {i + 1}. {dirname}")

    while True:
        try:
            seleccion = int(
                input(f"Ingrese el número del directorio (1-{len(directorios)}): ")
            )
            if 1 <= seleccion <= len(directorios):
                return os.path.join(directorio_base, directorios[seleccion - 1])
            else:
                print("Selección fuera de rango. Intente de nuevo.")
        except ValueError:
            print("Entrada no válida. Por favor, ingrese un número.")


def generar_archivos_respuestas():
    """
    Este script lee los archivos .txt de un directorio seleccionado por el usuario,
    extrae las respuestas correctas y genera un único archivo 'all_exam_answers.json'
    con todas las respuestas agrupadas.
    """
    print("Iniciando generador de archivo consolidado de respuestas...")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    directorio_origen = seleccionar_directorio(script_dir)

    if not directorio_origen:
        print("No se seleccionó un directorio de origen. Saliendo del script.")
        return

    print(f"Directorio de origen seleccionado: '{directorio_origen}'")

    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
    directorio_base_destino = os.path.join(
        project_root, "backend", "data"
    )  # Cambiado para guardar en backend/data

    mapa_materias = {
        "ingles": "ingles",
        "lenguaje": "lenguaje",
        "naturales": "ciencias_naturales",
        "sociales": "ciencias_sociales",
        "matematicas": "matematicas",
    }

    mapa_grados = {
        "006": "sexto",
        "6": "sexto",
        "007": "septimo",
        "7": "septimo",
        "008": "octavo",
        "8": "octavo",
        "009": "noveno",
        "9": "noveno",
        "010": "decimo",
        "10": "decimo",
        "011": "once",
        "11": "once",
    }

    mapa_letras_a_indices = {chr(65 + i): i for i in range(26)}

    regex = re.compile(r"Respuesta correcta,\s*(?:\"Opción\s)?([A-Z])", re.IGNORECASE)

    try:
        archivos_txt = [f for f in os.listdir(directorio_origen) if f.endswith(".txt")]
        if not archivos_txt:
            print(f"No se encontraron archivos .txt en '{directorio_origen}'.")
            return
    except FileNotFoundError:
        print(f"Error: No se pudo acceder al directorio '{directorio_origen}'.")
        return

    print(
        f"\nSe encontraron {len(archivos_txt)} archivos de respuestas para procesar.\n"
    )

    all_exam_answers_data = {}  # Diccionario para almacenar todas las respuestas

    for nombre_archivo in archivos_txt:
        print(f"--- Procesando: {nombre_archivo} ---")

        try:
            nombre_lower = nombre_archivo.lower()
            materia_encontrada = None
            grado_encontrado = None

            for key in mapa_materias:
                if key in nombre_lower:
                    materia_encontrada = mapa_materias[key]
                    break

            numeros = re.findall(r"\d+", nombre_lower)
            if numeros:
                for num in numeros:
                    if num in mapa_grados:
                        grado_encontrado = mapa_grados[num]
                        break

            if not materia_encontrada or not grado_encontrado:
                print(
                    f"  [ADVERTENCIA] No se pudo determinar la materia o el grado para '{nombre_archivo}'. Archivo omitido."
                )
                continue

            # Construir clave única para el examen (ej: "noveno_matematicas")
            exam_identifier = f"{grado_encontrado}_{materia_encontrada}"

            ruta_origen = os.path.join(directorio_origen, nombre_archivo)
            with open(ruta_origen, "r", encoding="utf-8", errors="ignore") as f:
                contenido = f.read()

            letras_respuestas = regex.findall(contenido)

            if not letras_respuestas:
                print(f"  [ERROR] No se encontraron respuestas en '{nombre_archivo}'.")
                continue

            indices_respuestas = [
                mapa_letras_a_indices[letra.upper()] for letra in letras_respuestas
            ]

            all_exam_answers_data[exam_identifier] = indices_respuestas

            print(
                f"  [ÉXITO] Respuestas para '{exam_identifier}' extraídas ({len(indices_respuestas)} preguntas)."
            )

        except Exception as e:
            print(
                f"  [ERROR] Ocurrió un error inesperado al procesar '{nombre_archivo}': {e}"
            )

    # Escribir el archivo JSON consolidado
    if all_exam_answers_data:
        os.makedirs(
            directorio_base_destino, exist_ok=True
        )  # Asegura que la carpeta backend/data exista
        ruta_json_consolidado = os.path.join(directorio_base_destino, "respuestas.json")
        with open(ruta_json_consolidado, "w", encoding="utf-8") as f:
            json.dump(all_exam_answers_data, f, indent=2)
        print(
            f"\n[FINALIZADO] Archivo consolidado '{ruta_json_consolidado}' generado exitosamente."
        )
    else:
        print(
            "\n[FINALIZADO] No se generó ningún archivo consolidado ya que no se extrajeron respuestas."
        )


if __name__ == "__main__":
    generar_archivos_respuestas()
