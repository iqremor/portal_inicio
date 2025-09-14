# main.py
"""
Punto de entrada principal - Llama a la interfaz de línea de comandos.
"""
import os
from cli import cli

if __name__ == '__main__':
    os.system('cls' if os.name == 'nt' else 'clear')
    cli()
