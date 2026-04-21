import logging
import os
import socket
import sys
import threading
import time
import webbrowser

import click
from werkzeug.serving import run_simple

from app import create_app
from models import User, UserRole, db
from utils.server_control import server_manager


def get_local_ip():
    """Obtiene la dirección IP local de la máquina."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # No es necesario que sea alcanzable
        s.connect(("10.255.255.255", 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = "127.0.0.1"  # Fallback
    finally:
        s.close()
    return IP


def _print_server_info_box(is_running, host, port, debug_mode, db_status_message=None):
    """Imprime una caja con la información del estado del servidor."""
    status_text = (
        click.style("EN EJECUCIÓN", fg="green", bold=True)
        if is_running
        else click.style("DETENIDO", fg="red", bold=True)
    )

    click.echo(click.style("┌───────────────────────────────────────────┐", fg="cyan"))
    click.echo(click.style(f" Estado del Servidor: {status_text:<24} ", fg="cyan"))
    click.echo(click.style(f" Host:                {host:<24} ", fg="cyan"))
    click.echo(click.style(f" Puerto:              {port:<24} ", fg="cyan"))
    click.echo(click.style(f" Modo Debug:          {str(debug_mode):<24} ", fg="cyan"))
    if db_status_message:
        click.echo(click.style(f" Base de Datos:       {db_status_message:<24} ", fg="cyan"))
    click.echo(click.style("└───────────────────────────────────────────┘", fg="cyan"))
    click.echo()


@click.command()
@click.option("--host", default="127.0.0.1", help="Dirección IP del servidor")
@click.option("--port", default=5000, help="Puerto del servidor")
@click.option("--debug", is_flag=True, help="Activar mensajes de depuración")
@click.option("--reload", is_flag=True, help="Recargar automáticamente al detectar cambios")
@click.option(
    "--open",
    "open_browser",
    is_flag=True,
    help="Abrir el panel de administración en el navegador",
)
def run(host, port, debug, reload, open_browser):
    """
    Iniciar el servidor de desarrollo con un menú interactivo.
    """
    # Configurar el logging global basado en el modo debug
    log_level = logging.INFO if debug else logging.WARNING
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%H:%M:%S",
    )

    # Silenciar logs específicos de librerías para mantener la consola limpia
    logging.getLogger("werkzeug").setLevel(logging.ERROR)
    logging.getLogger("urllib3").setLevel(logging.ERROR)
    logging.getLogger("requests").setLevel(logging.ERROR)

    os.system("cls" if os.name == "nt" else "clear")

    # --- Verificación e Inicialización de DB ---
    from utils.db_utils import initialize_database_if_not_exists

    db_ready, db_status_for_box = initialize_database_if_not_exists()
    if not db_ready:
        sys.exit(1)  # Salir si la DB no está lista
    # --- Fin Verificación e Inicialización de DB ---

    admin_url = f"http://{host}:{port}/admin"

    if reload:
        click.echo("⚠️  El modo de recarga automática (`--reload`) no es compatible con el menú interactivo.")
        click.echo("    El servidor se iniciará de forma estándar.")
        app = create_app()
        if open_browser:
            threading.Timer(1.5, lambda: webbrowser.open(admin_url)).start()
        run_simple(
            hostname="0.0.0.0",
            port=port,
            application=app,
            use_reloader=True,
            use_debugger=debug,
        )
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
    click.echo(click.style(title, fg="cyan", bold=True))
    click.echo(click.style(subtitle, fg="yellow", bold=True))
    _print_server_info_box(False, host, port, debug, db_status_message=db_status_for_box)
    click.echo(click.style("Escriba 'Help' para ver comandos disponibles", fg="blue"))
    click.echo()

    if open_browser:
        webbrowser.open(admin_url)
        click.echo(click.style("🌍 Abriendo panel de administración en tu navegador...", fg="blue"))

    command_history = []
    while True:
        try:
            click.echo(click.style("┌─[servidor]──[esperando-comando]", fg="cyan"))
            command = (
                click.prompt(
                    click.style("└─╼", fg="green"),
                    type=str,
                    default="",
                    show_default=False,
                    prompt_suffix=" ",
                )
                .lower()
                .strip()
            )

            if command:
                command_history.append(command)

            if command == "open":
                click.echo(click.style("🌍 Abriendo panel de administración...", fg="blue"))
                webbrowser.open(admin_url)

            elif command == "browser":
                main_url = f"http://{host}:{port}/"
                click.echo(click.style(f"🌍 Abriendo página principal en {main_url}...", fg="blue"))
                webbrowser.open(main_url)

            elif command == "start":
                if server_manager.is_running():
                    click.echo(click.style("El servidor ya está en ejecución.", fg="yellow"))
                else:
                    click.echo(click.style("Iniciando el servidor...", fg="green"))
                    server_manager.start_server(host, port, debug)
                    click.echo(click.style("Estado: Activo", fg="green"))

            elif command == "stop":
                if not server_manager.is_running():
                    click.echo(click.style("El servidor no está en ejecución.", fg="yellow"))
                else:
                    click.echo(click.style("Deteniendo el servidor...", fg="red"))
                    server_manager.stop_server()
                    click.echo(click.style("Estado: Inactivo", fg="red"))

            elif command == "restart":
                if server_manager._server_thread is None:
                    click.echo(
                        click.style(
                            "No se puede reiniciar porque el hilo del servidor no está inicializado.",
                            fg="red",
                        )
                    )
                else:
                    if not server_manager.is_running():
                        click.echo(click.style("No se puede reiniciar porque el servidor está inactivo.", fg="yellow"))
                    else:
                        click.echo(click.style("Reiniciando el servidor...", fg="yellow"))
                        server_manager.stop_server()
                        click.echo(click.style("Iniciando el servidor... ", fg="green"))
                        server_manager.start_server(host, port, debug)
                        time.sleep(1.5)
                        click.echo(click.style("Estado: Activo", fg="green"))

            elif command == "exit":
                click.echo("\n 👋  Deteniendo el servidor y saliendo...")
                if server_manager.is_running():
                    server_manager.stop_server()
                sys.exit(0)

            elif command == "status":
                click.echo(click.style(" Estado del Servidor:", fg="cyan"))
                if server_manager.is_running():
                    click.echo("-> " + click.style("Activo", fg="green"))
                else:
                    click.echo("-> " + click.style("Inactivo", fg="red"))

            elif command == "clear":
                os.system("cls" if os.name == "nt" else "clear")
                click.echo(click.style(title, fg="cyan", bold=True))
                click.echo(click.style(subtitle, fg="yellow", bold=True))
                is_alive = server_manager.is_running()
                _print_server_info_box(
                    is_alive,
                    host,
                    port,
                    debug,
                    db_status_message=db_status_for_box,
                )
                click.echo(click.style("Escriba 'Help' para ver comandos disponibles", fg="blue"))
                click.echo()

            elif command == "history":
                if not command_history:
                    click.echo(click.style("El historial de comandos está vacío.", fg="yellow"))
                else:
                    click.echo(click.style("Historial de comandos de la sesión:", fg="cyan", bold=True))
                    for i, cmd in enumerate(command_history, 1):
                        click.echo(f"  {i}: {cmd}")

            elif command == "admin":
                click.echo(click.style("\n--- Gestión de Administradores ---", fg="cyan", bold=True))
                click.echo(click.style("  Subcomandos disponibles:", fg="blue"))
                click.echo(click.style("  - show: Mostrar usuarios administradores", fg="green"))
                click.echo(click.style("  - add: Añadir un nuevo administrador", fg="green"))
                click.echo(click.style("  - set-password: Cambiar contraseña de un administrador", fg="green"))
                click.echo(click.style("  - delete: Eliminar un administrador", fg="green"))
                click.echo(click.style("  - back: Volver al menú principal", fg="yellow"))

                while True:
                    try:
                        click.echo(click.style("┌─[servidor]──[admin]──[esperando-subcomando]", fg="cyan"))
                        subcommand = (
                            click.prompt(
                                click.style("└─╼", fg="green"),
                                type=str,
                                default="",
                                show_default=False,
                                prompt_suffix=" ",
                            )
                            .lower()
                            .strip()
                        )

                        if subcommand == "show":
                            app = create_app()
                            with app.app_context():
                                admin_users = User.query.filter_by(role=UserRole.ADMIN).all()
                                if admin_users:
                                    click.echo(click.style("\nUsuarios Administradores:", fg="cyan", bold=True))
                                    for user in admin_users:
                                        click.echo(
                                            f"- ID: {user.id}, Usuario: {click.style(user.username, fg='green')}"
                                        )
                                else:
                                    click.echo(
                                        click.style(
                                            "No hay usuarios administradores registrados.",
                                            fg="yellow",
                                        )
                                    )
                            click.echo(click.style("\n--- Fin de la lista ---", fg="cyan", bold=True))

                        elif subcommand == "add":
                            click.echo(click.style("--- Añadir Nuevo Administrador ---", fg="cyan", bold=True))
                            username = click.prompt(click.style("Nombre de usuario", fg="green"))
                            codigo = click.prompt(click.style("Código", fg="green"))
                            password = click.prompt(
                                click.style("Contraseña", fg="green"),
                                hide_input=True,
                                confirmation_prompt=True,
                            )

                            app = create_app()
                            with app.app_context():
                                if User.query.filter_by(username=username).first():
                                    click.echo(click.style(f"Error: El usuario '{username}' ya existe.", fg="red"))
                                else:
                                    new_admin = User(
                                        username=username,
                                        codigo=codigo,
                                        role=UserRole.ADMIN,
                                    )
                                    new_admin.set_password(password)
                                    db.session.add(new_admin)
                                    db.session.commit()
                                    click.echo(click.style(f"Administrador '{username}' añadido.", fg="green"))

                        elif subcommand == "set-password":
                            click.echo(click.style("\n--- Cambiar Contraseña ---", fg="cyan", bold=True))
                            username = click.prompt(click.style("Nombre de usuario", fg="green"))
                            password = click.prompt(
                                click.style("Nueva contraseña", fg="green"),
                                hide_input=True,
                                confirmation_prompt=True,
                            )

                            app = create_app()
                            with app.app_context():
                                user = User.query.filter_by(username=username, role=UserRole.ADMIN).first()
                                if user:
                                    user.set_password(password)
                                    db.session.commit()
                                    click.echo(click.style(f"Contraseña actualizada para '{username}'.", fg="green"))
                                else:
                                    click.echo(click.style(f"Error: Usuario '{username}' no encontrado.", fg="red"))

                        elif subcommand == "delete":
                            click.echo(click.style("\n--- Eliminar Administrador ---", fg="cyan", bold=True))
                            username = click.prompt(click.style("Nombre de usuario", fg="green"))

                            app = create_app()
                            with app.app_context():
                                user_to_delete = User.query.filter_by(username=username, role=UserRole.ADMIN).first()
                                if user_to_delete:
                                    db.session.delete(user_to_delete)
                                    db.session.commit()
                                    click.echo(click.style(f"Administrador '{username}' eliminado.", fg="green"))
                                else:
                                    click.echo(click.style(f"Error: Usuario '{username}' no encontrado.", fg="red"))

                        elif subcommand == "back":
                            break

                        elif subcommand.strip() == "":
                            continue

                        else:
                            click.echo(click.style(f"Subcomando '{subcommand}' no reconocido.", fg="red"))
                    except (KeyboardInterrupt, EOFError):
                        break

            elif command == "help":
                click.echo(click.style("Comandos disponibles:", fg="cyan", bold=True))
                click.echo("- start:      Inicia el servidor.")
                click.echo("- stop:       Detiene el servidor.")
                click.echo("- restart:    Reinicia el servidor.")
                click.echo("- status:     Muestra el estado.")
                click.echo("- open:       Abre el panel admin.")
                click.echo("- browser:    Abre la página principal.")
                click.echo("- clear:      Limpia la pantalla.")
                click.echo("- history:    Muestra el historial.")
                click.echo("- admin:      Gestiona administradores.")
                click.echo("- production: Inicia en modo producción.")
                click.echo("- help:       Muestra esta ayuda.")
                click.echo("- exit:       Sale de la aplicación.")

            elif command == "production":
                if server_manager.is_running():
                    click.echo(click.style("El servidor ya está en ejecución. Deténgalo primero.", fg="yellow"))
                else:
                    local_ip = get_local_ip()
                    click.echo(
                        click.style("🚀 Iniciando servidor en modo PRODUCCIÓN (Waitress)...", bold=True, fg="green")
                    )
                    click.echo(f"   - Localmente: http://localhost:{port}")
                    click.echo(f"   - En tu red:  http://{local_ip}:{port}")

                    # Forzamos 0.0.0.0 en producción para que sea accesible en la red
                    server_manager.start_server("0.0.0.0", port, debug, mode="production")
                    click.echo(click.style("Estado: Activo (Producción)", fg="green"))

            elif command.strip() == "":
                continue

            else:
                click.echo(click.style(f"Comando '{command}' no reconocido.", fg="red"))
        except (KeyboardInterrupt, EOFError):
            if server_manager.is_running():
                server_manager.stop_server()
            sys.exit(0)
