import os
import re

import pandas as pd


def parse_seleccion(seleccion_str, num_archivos):
    """Parsea la cadena de selección del usuario, admitiendo números y rangos (ej: '1, 3-5')."""
    indices = set()
    partes = seleccion_str.split(",")
    for parte in partes:
        parte = parte.strip()
        if "-" in parte:
            try:
                inicio, fin = map(int, parte.split("-"))
                if inicio > fin or inicio < 1 or fin > num_archivos:
                    raise ValueError(f"Rango inválido: '{parte}'. Los números deben estar entre 1 y {num_archivos}.")
                indices.update(range(inicio - 1, fin))
            except ValueError:
                raise ValueError(f"Formato de rango no válido: '{parte}'. Use números, ej: '3-5'.")
        else:
            try:
                num = int(parte)
                if num < 1 or num > num_archivos:
                    raise ValueError(f"Número fuera de rango: '{num}'. Debe estar entre 1 y {num_archivos}.")
                indices.add(num - 1)
            except ValueError:
                raise ValueError(f"Número no válido: '{parte}'.")
    return sorted(list(indices))


def convertir_txt_a_excel():
    """
    Convierte archivos de texto (.txt) a archivos Excel (.xlsx) individuales.
    Permite selección por rango, filtrado interactivo y vista previa antes de guardar.
    """
    while True:
        dir_respuestas = input("Por favor, ingrese la ruta a la carpeta que contiene los archivos .txt: ").strip()
        if os.path.isdir(dir_respuestas):
            break
        else:
            print(f"Error: El directorio '{dir_respuestas}' no existe o no es una carpeta válida. Intente de nuevo.")

    try:
        archivos_txt = [f for f in os.listdir(dir_respuestas) if f.endswith(".txt")]
        if not archivos_txt:
            print(f"No se encontraron archivos .txt en '{dir_respuestas}'.")
            return
    except OSError as e:
        print(f"Error al leer el directorio '{dir_respuestas}': {e}")
        return

    os.system("cls")
    print("\n--- Menú Principal: Conversor de .txt a .xlsx ---")
    print("\nArchivos .txt disponibles:")
    for i, archivo in enumerate(archivos_txt):
        print(f"{i+1}. {archivo}")

    while True:
        seleccion_str = input("\nSeleccione archivos (ej: 1,3,5-8 o 0 para cancelar): ")
        if seleccion_str.strip() == "0":
            print("Operación cancelada.")
            return
        try:
            indices_seleccionados = parse_seleccion(seleccion_str, len(archivos_txt))
            break
        except ValueError as e:
            print(f"Error en la selección: {e}")

    archivos_seleccionados = [archivos_txt[i] for i in indices_seleccionados]
    print(f"\nArchivos seleccionados: {', '.join(archivos_seleccionados)}")

    output_dir_name = input("\nIngrese el nombre para el directorio de salida (por defecto 'output'): ") or "output"
    output_dir_path = os.path.join(dir_respuestas, output_dir_name)
    os.makedirs(output_dir_path, exist_ok=True)

    regex = None
    if input("\n¿Desea filtrar el contenido? (s/n): ").lower() == "s":
        os.system("cls")

        primer_archivo_contenido = ""
        try:
            primer_archivo_path = os.path.join(dir_respuestas, archivos_seleccionados[0])
            with open(primer_archivo_path, "r", encoding="utf-8") as f:
                primer_archivo_contenido = f.read()
        except Exception as e:
            print(f"Error al leer el archivo de vista previa: {e}")

        while True:
            print("\n--- Vista previa del primer archivo (sin filtrar) ---")
            for i, line in enumerate(primer_archivo_contenido.splitlines()):
                if i >= 15:
                    break
                print(line)
            print("-------------------------------------------------")

            print("\nPuede filtrar por palabras, caracteres o expresiones regulares.")
            print("  - Ejemplo: `(?<=Respuesta correcta,)[A-Z]`")
            regex_input = input("\nIngrese la expresión regular para el filtro (o deje en blanco para cancelar): ")

            if not regex_input:
                regex = None
                break

            try:
                matches = re.finditer(regex_input, primer_archivo_contenido, re.MULTILINE | re.IGNORECASE)
                contenido_filtrado_preview = [match.group(0) for match in matches]

                print("\n--- Vista previa del resultado del filtro ---")
                if not contenido_filtrado_preview:
                    print("El filtro no encontró ninguna coincidencia.")
                else:
                    for linea in contenido_filtrado_preview[:15]:
                        print(linea)
                print("-------------------------------------------")

                confirmar = input("¿Es este el resultado esperado para el filtro? (s/n): ").lower()
                if confirmar == "s":
                    regex = regex_input
                    break
                else:
                    os.system("cls")
                    print("Intentémoslo de nuevo...")

            except re.error as e:
                print(f"Error en la expresión regular: {e}. Intente de nuevo.")

    for archivo_nombre in archivos_seleccionados:
        ruta_archivo = os.path.join(dir_respuestas, archivo_nombre)
        print(f"\nProcesando archivo: {archivo_nombre}...")

        try:
            with open(ruta_archivo, "r", encoding="utf-8") as f:
                contenido_original = f.read()
        except Exception as e:
            print(f"  Error al leer el archivo: {e}")
            continue

        contenido_final = None
        filtro_actual = regex
        while True:
            if filtro_actual:
                matches = re.finditer(filtro_actual, contenido_original, re.MULTILINE | re.IGNORECASE)
                contenido_procesado = [match.group(0) for match in matches]
                if contenido_procesado:
                    contenido_final = contenido_procesado
                    break
                else:
                    print(f"  El filtro no encontró ninguna coincidencia en '{archivo_nombre}'.")
                    accion = input(
                        "  ¿Qué desea hacer? [R]eintentar, [S]in filtrar, [O]mitir archivo (R/S/O): "
                    ).lower()
                    if accion == "r":
                        filtro_actual = input("  Ingrese la nueva expresión regular para este archivo: ")
                        continue
                    elif accion == "s":
                        contenido_final = contenido_original.splitlines()
                        break
                    else:
                        contenido_final = None
                        break
            else:
                contenido_final = contenido_original.splitlines()
                break

        if not contenido_final:
            print(f"  Archivo '{archivo_nombre}' omitido.")
            continue

        print("\n--- Vista previa del contenido a guardar ---")
        for linea in contenido_final[:10]:
            print(f"  {linea}")
        if len(contenido_final) > 10:
            print(f"  ... y {len(contenido_final) - 10} más.")
        print("------------------------------------------")

        if input("¿Guardar este resultado en Excel? (s/n): ").lower() != "s":
            print(f"  Creación de archivo para '{archivo_nombre}' cancelada.")
            continue

        df = pd.DataFrame({"Respuesta": contenido_final})
        nombre_base = os.path.splitext(archivo_nombre)[0]
        nombre_excel = f"{nombre_base}.xlsx"
        ruta_excel = os.path.join(output_dir_path, nombre_excel)

        try:
            with pd.ExcelWriter(ruta_excel, engine="xlsxwriter") as writer:
                df.to_excel(writer, sheet_name="Respuesta", index=False, header=False)
            print(f"  Archivo '{nombre_excel}' creado exitosamente en '{output_dir_path}'.")
        except ImportError:
            print("\nError: El paquete 'xlsxwriter' no está instalado.")
            print("Por favor, instálelo en su terminal ejecutando: pip install xlsxwriter")
            return
        except Exception as e:
            print(f"  Error al crear el archivo Excel: {e}")

    print("\nProceso completado.")


def main():
    """Función principal que ejecuta el programa en un bucle."""
    while True:
        convertir_txt_a_excel()

        while True:
            continuar = input("\n¿Desea realizar otra conversión? (s/n): ").lower()
            if continuar in ["s", "n"]:
                break
            print("Respuesta no válida. Por favor, ingrese 's' o 'n'.")

        if continuar == "n":
            print("Saliendo del programa. ¡Hasta luego!")
            break


if __name__ == "__main__":
    main()
