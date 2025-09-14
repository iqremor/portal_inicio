# cli.py
import click
from server import run
import click
from server import run

@click.group()
def cli():
    """Sistema de Gestión - Interfaz de Línea de Comandos"""
    pass

cli.add_command(run)
