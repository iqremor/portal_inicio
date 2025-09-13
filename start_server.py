
import os
import webbrowser
import json
import time
import subprocess
import urllib.request

# --- Funciones de Visualización ---

def display_active_users():
    """Obtiene y muestra los usuarios activos desde el endpoint del servidor."""
    print("\n--- Usuarios Activos (en tiempo real) ---")
    try:
        with urllib.request.urlopen("http://localhost:8080/api/active-users") as response:
            if response.status == 200:
                data = json.load(response)
                active_users = data.get('active_users', {})
                if not active_users:
                    print("No hay usuarios activos en este momento.")
                else:
                    for user_code, user_data in active_users.items():
                        login_time = user_data.get('loginTime', 'N/A')
                        nombre = user_data.get('nombre', 'No especificado')
                        
                        # Formatear la fecha para que sea más legible
                        try:
                            login_time_formatted = time.strftime('%H:%M:%S', time.strptime(login_time, "%Y-%m-%dT%H:%M:%S.%fZ"))
                        except (ValueError, TypeError):
                            login_time_formatted = "Hora inválida"

                        print(f"  - Nombre: {nombre}, Hora de Ingreso: {login_time_formatted}")
            else:
                print(f"Error al contactar el servidor. Código: {response.status}")
    except urllib.error.URLError as e:
        print(f"No se pudo conectar al servidor: {e.reason}")
    except json.JSONDecodeError:
        print("Error: La respuesta del servidor no es un JSON válido.")
    except Exception as e:
        print(f"Error inesperado: {e}")

def display_exam_results():
    """Muestra los resultados de los exámenes guardados."""
    results_file = os.path.join('data', 'resultados.json')
    if not os.path.exists(results_file):
        return # No mostrar nada si el archivo no existe

    print("\n--- Últimos Resultados de Exámenes ---")
    try:
        with open(results_file, 'r', encoding='utf-8') as f:
            results = json.load(f)
        
        if not results:
            print("Aún no hay resultados de exámenes.")
            return

        for student_code, student_results in results.items():
            if student_results:
                last_result = student_results[-1] # Tomar solo el último resultado
                print(f"  - Estudiante: {student_code}, Examen: {last_result.get('area', 'N/A')}, "
                      f"Puntaje: {last_result.get('porcentaje', 'N/A')}")
    except Exception as e:
        print(f"Error inesperado al leer resultados: {e}")

# --- Funciones de Control del Servidor ---

def start_node_server():
    """Inicia el servidor de Node.js en un proceso separado y abre el navegador."""
    print("Iniciando el servidor de Node.js...")
    os.system('start cmd /c "npm start"')
    print("El servidor debería estar iniciándose en una nueva ventana.")
    web_url = "http://localhost:8080"
    print(f"Esperando para abrir el navegador en {web_url}...")
    time.sleep(5)
    webbrowser.open(web_url)
    return True

def stop_node_server():
    """Detiene el servidor Node.js de forma precisa usando su PID."""
    print("Intentando detener el servidor de Node.js...")
    pid_file = os.path.join('backend', 'server.pid')
    
    try:
        if os.path.exists(pid_file):
            with open(pid_file, 'r') as f:
                pid = f.read().strip()
            
            print(f"Encontrado archivo PID. Intentando detener el proceso con PID: {pid}...")
            # Comando para Windows para matar un proceso por su PID
            result = subprocess.run(f"taskkill /F /PID {pid}", capture_output=True, text=True, shell=True)
            
            if "SUCCESS" in result.stdout:
                print(f"Servidor con PID {pid} detenido correctamente.")
            else:
                # Si falla, puede que el proceso ya no exista
                print(f"No se pudo detener el proceso con PID {pid}. Puede que ya no estuviera en ejecución.")
                print(result.stderr)
            
            os.remove(pid_file) # Limpiar el archivo PID
        else:
            print("No se encontró el archivo PID. Usando método de fuerza bruta.")
            print("ADVERTENCIA: Esto detendrá TODOS los procesos de Node.js en el sistema.")
            result = subprocess.run("taskkill /F /IM node.exe", capture_output=True, text=True, shell=True)
            if "SUCCESS" in result.stdout:
                print("Servidores Node.js detenidos.")
            else:
                print("No se encontraron procesos de Node.js para detener.")

    except Exception as e:
        print(f"Ocurrió un error durante el proceso de detención: {e}")
        
    return False # Indicar que el servidor está detenido

# --- Lógica Principal ---

def main():
    """Función principal que maneja el menú interactivo y el bucle de monitoreo."""
    server_running = False
    
    while True:
        if not server_running:
            os.system('cls' if os.name == 'nt' else 'clear')
            print("===================================================")
            print("==   Panel de Control del Portal de Evaluación   ==")
            print("===================================================")
            print("\nEl servidor está DETENIDO.")
            print("Selecciona una opción:")
            print("  1. Iniciar Servidor y Monitorear")
            print("  2. Detener Servidor (forzar, si quedó alguno activo)")
            print("  3. Salir")
            
            choice = input("\nOpción: ")
            
            if choice == '1':
                server_running = start_node_server()
            elif choice == '2':
                server_running = stop_node_server()
                input("Presiona Enter para continuar...")
            elif choice == '3':
                print("Saliendo del panel de control.")
                break
            else:
                print("Opción no válida. Inténtalo de nuevo.")
                time.sleep(2)
        
        if server_running:
            # Bucle de monitoreo
            try:
                while True:
                    os.system('cls' if os.name == 'nt' else 'clear')
                    print("===================================================")
                    print("==        Monitoreo de Actividad en Vivo       ==")
                    print("===================================================")
                    print("Presiona Ctrl+C para pausar y ver opciones.")
                    print(f"(Actualizado por última vez: {time.strftime('%H:%M:%S')})")
                    
                    display_active_users()
                    display_exam_results()
                    
                    print("\n---------------------------------------------------")
                    print("El informe se actualizará en 20 segundos.")
                    time.sleep(20)

            except KeyboardInterrupt:
                os.system('cls' if os.name == 'nt' else 'clear')
                print("\nMONITOREO PAUSADO.")
                confirm = input(">> ¿Estás seguro de que deseas detener el servidor? (s/n): ").lower()
                if confirm == 's':
                    print("\nDeteniendo el servidor...")
                    server_running = stop_node_server()
                    time.sleep(2)
                else:
                    print("\nOperación cancelada. El servidor sigue funcionando.")
                    print("Volviendo al menú principal...")
                    time.sleep(3)
                # Al salir del bloque except, el bucle principal se reanudará
                # y como server_running puede haber cambiado, mostrará el menú correcto.

if __name__ == "__main__":
    main()
