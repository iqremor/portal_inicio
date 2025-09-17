# server.py
import os
import sys
import time
import socket
import click
import webbrowser
import logging
import threading
import requests
from werkzeug.serving import run_simple, make_server
from app import create_app
from middleware.shutdown import ShutdownMiddleware
from dotenv import set_key # Added set_key
from models import db, User, UserRole # Added db, User, UserRole
from utils.server_control import server_manager # Added server_manager import

def get_local_ip():
    """Obtiene la dirección IP local de la máquina."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # No es necesario que sea alcanzable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'  # Fallback
    finally:
        s.close()
    return IP

def _print_server_info_box(is_running, host, port, debug_mode, db_status_message=None):
    """Imprime una caja con la información del estado del servidor."""
    status_text = click.style("EN EJECUCIÓN", fg='green', bold=True) if is_running else click.style("DETENIDO", fg='red', bold=True)
    
    click.echo(click.style("┌───────────────────────────────────────────┐", fg='cyan'))
    click.echo(click.style(f" Estado del Servidor: {status_text:<24} ", fg='cyan'))
    click.echo(click.style(f" Host:                {host:<24} ", fg='cyan'))
    click.echo(click.style(f" Puerto:              {port:<24} ", fg='cyan'))
    click.echo(click.style(f" Modo Debug:          {str(debug_mode):<24} ", fg='cyan'))
    if db_status_message:
        click.echo(click.style(f" Base de Datos:       {db_status_message:<24} ", fg='cyan'))
    click.echo(click.style("└───────────────────────────────────────────┘", fg='cyan'))
    click.echo()

@click.command()
@click.option('--host', default='127.0.0.1', help='Dirección IP del servidor')
@click.option('--port', default=5000, help='Puerto del servidor')
@click.option('--debug', is_flag=True, help='Activar mensajes de depuración')
@click.option('--reload', is_flag=True, help='Recargar automáticamente al detectar cambios')
@click.option('--open', 'open_browser', is_flag=True, help='Abrir el panel de administración en el navegador')
def run(host, port, debug, reload, open_browser):
    """
    Iniciar el servidor de desarrollo con un menú interactivo.
    """
    os.system('cls' if os.name == 'nt' else 'clear')
    
    # --- NUEVA LÍNEA DE DEPURACIÓN ---
    # Crear una instancia temporal para obtener la config
    if debug:
        app_instance = create_app()
        click.echo(f"DEBUG: SECRET_KEY utilizada: {app_instance.config.get('SECRET_KEY')}")
    # --- FIN NUEVA LÍNEA DE DEPURACIÓN ---

    import warnings
    warnings.filterwarnings("ignore", category=UserWarning, module='flask_admin.model.base')
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    # --- Verificación e Inicialización de DB ---
    from utils.db_utils import initialize_database_if_not_exists
    db_ready, db_status_for_box = initialize_database_if_not_exists() # Renombrar a db_status_for_box
    if not db_ready:
        sys.exit(1) # Salir si la DB no está lista y el usuario no la inicializó
    # --- Fin Verificación e Inicialización de DB ---

    # La creación de la app se mueve a run_server_thread para el modo interactivo
    admin_url = f"http://{host}:{port}/admin"

    if reload:
        click.echo("⚠️  El modo de recarga automática (`--reload`) no es compatible con el menú interactivo.")
        click.echo("    El servidor se iniciará de forma estándar.")
        app = create_app()  # Crear la app una vez para este modo
        if open_browser:
            threading.Timer(1.5, lambda: webbrowser.open(admin_url)).start()
        run_simple(hostname='0.0.0.0', port=port, application=app, use_reloader=True, use_debugger=debug)
        return

    title = """
████████╗███████╗███████╗████████╗    ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝    ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
   ██║   █████╗  ███████╗   ██║       ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
   ██║   ██╔══╝  ╚════██║   ██║       ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
   ██║   ███████╗███████║   ██║       ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
   ╚═╝   ╚══════╝╚═══════╝   ╚═╝       ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
    """
    subtitle = """
         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
         ░░  S E R V I D O R   T E S T ░░
         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    """
    click.echo(click.style(title, fg='cyan', bold=True))
    click.echo(click.style(subtitle, fg='yellow', bold=True))
    _print_server_info_box(False, host, port, debug, db_status_message=db_status_for_box)
    click.echo(click.style("Escriba 'Help' para ver comandos disponibles", fg='blue'))
    click.echo()

    if open_browser:
        webbrowser.open(admin_url)
        click.echo(click.style("🌍 Abriendo panel de administración en tu navegador...", fg='blue'))

    command_history = []
    while True:
        try:
            click.echo(click.style("┌─[servidor]──[esperando-comando]", fg='cyan'))
            command = click.prompt(click.style('└─╼', fg='green'), type=str, default='', show_default=False, prompt_suffix=' ').lower().strip()
            
            if command:
                command_history.append(command)

            if command == 'open':
                click.echo(click.style("🌍 Abriendo panel de administración...", fg='blue'))
                webbrowser.open(admin_url)

            elif command == 'browser':
                  main_url = f"http://{host}:{port}/"
                  click.echo(click.style(f"🌍 Abriendo página principal en {main_url}...", fg='blue'))
                  webbrowser.open(main_url)

            elif command == 'start':
                if server_manager.is_running():
                    click.echo(click.style("El servidor ya está en ejecución.", fg='yellow'))
                else:
                    click.echo(click.style("Iniciando el servidor...", fg='green'))
                    server_manager.start_server(host, port, debug)
                    click.echo(click.style("Estado: Activo", fg='green'))

            elif command == 'stop':
                if not server_manager.is_running():
                    click.echo(click.style("El servidor no está en ejecución.", fg='yellow'))
                else:
                    click.echo(click.style("Deteniendo el servidor...", fg='red'))
                    server_manager.stop_server()
                    click.echo(click.style("Estado: Inactivo", fg='red'))

            elif command == 'restart':
                 
                if server_manager._server_thread is None:
                    click.echo(click.style("No se puede reiniciar porque el hilo del servidor no está inicializado.", fg='red'))
                else:
                    if server_manager.stop_server is None:
                        server_manager.stop_server = threading.Event()
                    if not server_manager.is_running():
                        click.echo(click.style("No se puede reiniciar porque el servidor está inactivo.", fg='yellow'))
                    else:
                        click.echo(click.style("Reiniciando el servidor...", fg='yellow'))
                        server_manager.stop_server()
                        click.echo(click.style("Iniciando el servidor... ", fg='green'))
                        server_manager.start_server(host, port, debug)
                        time.sleep(1.5)
                        click.echo(click.style("Estado: Activo", fg='green'))

            elif command == 'exit':
                click.echo("\n 👋  Deteniendo el servidor y saliendo...")
                if server_manager.is_running():
                    server_manager.stop_server()
                sys.exit(0)

            elif command == 'status':
                click.echo(click.style(f" Estado del Servidor:", fg='cyan'))
                is_alive = server_manager.is_running()
                if is_alive:
                    click.echo("-> " + click.style("Activo", fg='green'))
                else:
                    click.echo("-> " +click.style("Inactivo", fg='red'))

            elif command == 'clear':
                os.system('cls' if os.name == 'nt' else 'clear')
                click.echo(click.style(title, fg='cyan', bold=True))
                click.echo(click.style(subtitle, fg='yellow', bold=True))
                is_alive = server_manager.is_running()
                _print_server_info_box(is_alive, host, port, debug, db_status_message=db_status_for_box)
                click.echo(click.style("Escriba 'Help' para ver comandos disponibles", fg='blue'))
                click.echo()

            elif command == 'history':
                if not command_history:
                    click.echo(click.style("El historial de comandos está vacío.", fg='yellow'))
                else:
                    click.echo(click.style("Historial de comandos de la sesión:", fg="cyan", bold=True))
                    for i, cmd in enumerate(command_history, 1):
                        click.echo(f"  {i}: {cmd}")

            elif command == 'admin':
                click.echo(click.style("\n--- Gestión de Administradores ---", fg='cyan', bold=True))
                click.echo(click.style("  Subcomandos disponibles:", fg='blue'))
                click.echo(click.style("  - show: Mostrar usuarios administradores", fg='green'))
                click.echo(click.style("  - add: Añadir un nuevo administrador", fg='green'))
                click.echo(click.style("  - set-password: Cambiar contraseña de un administrador", fg='green'))
                click.echo(click.style("  - delete: Eliminar un administrador", fg='green'))
                click.echo(click.style("  - back: Volver al menú principal", fg='yellow'))
                
                while True:
                    try:
                        click.echo(click.style("┌─[servidor]──[admin]──[esperando-subcomando]", fg='cyan'))
                        subcommand = click.prompt(click.style('└─╼', fg='green'), type=str, default='', show_default=False, prompt_suffix=' ').lower().strip()

                        if subcommand == 'show':
                            app = create_app()
                            with app.app_context():
                                admin_users = User.query.filter_by(role=UserRole.ADMIN).all()
                                if admin_users:
                                    click.echo(click.style("\nUsuarios Administradores:", fg='cyan', bold=True))
                                    for user in admin_users:
                                        click.echo(f"- ID: {user.id}, Usuario: {click.style(user.username, fg='green')}")
                                else:
                                    click.echo(click.style("No hay usuarios administradores registrados en la base de datos.", fg='yellow'))
                            click.echo(click.style("\n--- Fin de la lista de administradores ---", fg='cyan', bold=True))

                        elif subcommand == 'add':
                            click.echo(click.style("--- Añadir Nuevo Administrador ---", fg='cyan', bold=True))
                            username = click.prompt(click.style('Ingrese el nombre de usuario para el nuevo administrador', fg='green'))
                            codigo = click.prompt(click.style('Ingrese el código para el nuevo administrador', fg='green'))
                            password = click.prompt(click.style('Ingrese la contraseña para el nuevo administrador', fg='green'), hide_input=True, confirmation_prompt=True)
                            
                            app = create_app()
                            with app.app_context():
                                existing_user = User.query.filter_by(username=username).first()
                                if existing_user:
                                    click.echo(click.style(f"Error: El usuario '{username}' ya existe.", fg='red'))
                                else:
                                    new_admin = User(username=username, codigo=codigo, role=UserRole.ADMIN)
                                    new_admin.set_password(password)
                                    db.session.add(new_admin)
                                    db.session.commit()
                                    click.echo(click.style(f"Usuario administrador '{username}' añadido exitosamente.", fg='green'))
                            click.echo(click.style("--- Fin de añadir administrador ---", fg='cyan', bold=True))

                        elif subcommand == 'set-password':
                            click.echo(click.style("\n--- Cambiar Contraseña de Administrador ---", fg='cyan', bold=True))
                            username = click.prompt(click.style('Ingrese el nombre de usuario del administrador a modificar', fg='green'))
                            password = click.prompt(click.style('Ingrese la nueva contraseña', fg='green'), hide_input=True, confirmation_prompt=True)
                            
                            app = create_app()
                            with app.app_context():
                                user = User.query.filter_by(username=username, role=UserRole.ADMIN).first()
                                if user:
                                    user.set_password(password)
                                    db.session.commit()
                                    click.echo(click.style(f"Contraseña para el usuario '{username}' actualizada exitosamente.", fg='green'))
                                else:
                                    click.echo(click.style(f"Error: Usuario administrador '{username}' no encontrado.", fg='red'))
                            click.echo(click.style("\n--- Fin de cambiar contraseña ---", fg='cyan', bold=True))

                        elif subcommand == 'delete':
                            click.echo(click.style("\n--- Eliminar Administrador ---", fg='cyan', bold=True))
                            username = click.prompt(click.style('Ingrese el nombre de usuario del administrador a eliminar', fg='green'))
                            
                            app = create_app()
                            with app.app_context():
                                user_to_delete = User.query.filter_by(username=username, role=UserRole.ADMIN).first()
                                if user_to_delete:
                                    db.session.delete(user_to_delete)
                                    db.session.commit()
                                    click.echo(click.style(f"Usuario administrador '{username}' eliminado exitosamente.", fg='green'))
                                else:
                                    click.echo(click.style(f"Error: Usuario administrador '{username}' no encontrado o no tiene rol de administrador.", fg='red'))
                            click.echo(click.style("\n--- Fin de eliminar administrador ---", fg='cyan', bold=True))

                        elif subcommand == 'back':
                            click.echo(click.style("Volviendo al menú principal...", fg='yellow'))
                            break
                        
                        elif subcommand.strip() == '':
                            continue

                        else:
                            click.echo(click.style(f"Subcomando '{subcommand}' no reconocido. Escribe 'show', 'add', 'set-password', 'delete' o 'back'.", fg='red'))
                    except (KeyboardInterrupt, EOFError):
                        click.echo(click.style("\nOperación cancelada. Volviendo al menú principal...", fg='yellow'))
                        break

            elif command == 'help':
                click.echo(click.style("Comandos disponibles:", fg="cyan", bold=True))
                click.echo("- " + click.style("start", fg="green") + ":   Inicia el servidor de desarrollo.")
                click.echo("- " + click.style("stop", fg="red") + ":    Detiene el servidor de desarrollo.")
                click.echo("- " + click.style("restart", fg="yellow") + ": Reinicia el servidor de desarrollo.")
                click.echo("- " + click.style("status", fg="cyan") + ":  Muestra el estado del servidor de desarrollo.")
                click.echo("- " + click.style("open", fg="blue") + ":    Abrir el panel de administración en el navegador.")
                click.echo("- " + click.style("browser", fg="blue") + ":  Abrir la página principal en el navegador.") 
                click.echo("- " + click.style("clear", fg="blue") + ":   Limpiar la pantalla de la consola.")
                click.echo("- " + click.style("history", fg="yellow") + ": Muestra el historial de comandos de la sesión.")
                click.echo("- " + click.style("admin", fg="magenta") + ": Gestiona usuarios administradores (añadir, eliminar, cambiar contraseña).")
                click.echo("- " + click.style("production", fg="green", bold=True) + ": Inicia el servidor en modo producción (bloquea la CLI).")
                click.echo("- " + click.style("help", fg="white") + ":    Muestra esta ayuda.")
                click.echo("- " + click.style("exit", fg="magenta") + ":   Detiene el servidor y sale de la CLI.")

            elif command == 'production':
                if server_manager.is_running():
                    click.echo(click.style("El servidor de desarrollo ya está en ejecución. Deténlo ('stop') antes de iniciar el modo producción.", fg='red'))
                    continue
                
                try:
                    from waitress import serve
                    app = create_app()
                    local_ip = get_local_ip()
                    port = 5000 # Puerto para producción (cambiado a 5000)
                    
                    click.echo(click.style("🚀 Iniciando servidor en modo PRODUCCIÓN con Waitress...", bold=True, fg='green'))
                    click.echo(click.style("   Este modo bloqueará esta terminal. Presiona CTRL+C para detener.", fg='yellow'))
                    click.echo("   Puedes acceder desde:")
                    click.echo(f"     - Localmente: http://localhost:{port}")
                    click.echo(f"     - En tu red:  http://{local_ip}:{port}")
                    click.echo(click.style("     (Recuerda abrir el puerto en tu firewall para el acceso en red)", fg='yellow'))
                    
                    # Suppress waitress.queue warnings in production mode
                    waitress_logger = logging.getLogger('waitress.queue')
                    waitress_logger.setLevel(logging.ERROR)

                    serve(app, host='0.0.0.0', port=port)

                except ImportError:
                    click.echo(click.style("❌ Waitress no está instalado. Instálalo con: pip install waitress", fg='red'))
                except Exception as e:
                    click.echo(click.style(f"Error al iniciar el servidor de producción: {e}", fg='red'))

            elif command.strip() == '':
                command_history.pop() if command_history else None
                continue

            else:
                click.echo(click.style(f"Comando '{command}' no reconocido. Escribe 'help' para ver la lista de comandos.", fg='red'))
        except (KeyboardInterrupt, EOFError):
            click.echo("\n ���  Deteniendo el servidor y saliendo...")
            if server_manager.is_running():
                server_manager.stop_server()
            sys.exit(0)