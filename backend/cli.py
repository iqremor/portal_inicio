import click
from server import run
from db import init_db_command

@click.group()
def cli():
    """Sistema de Gestión - Interfaz de Línea de Comandos"""
    pass

cli.add_command(run)
cli.add_command(init_db_command)