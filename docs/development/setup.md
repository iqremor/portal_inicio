## Instalación y Puesta en Marcha

### Requisitos Previos
- Python 3.8+
- Navegador web moderno

### Instalación
1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd plataforma_examenes
    ```

2.  **Crear un entorno virtual (recomendado):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Windows: venv\Scripts\activate
    ```

3.  **Instalar las dependencias de Python:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Inicializar la Base de Datos:**
    Este es un paso crucial que prepara la base de datos por primera vez.
    ```bash
    flask init-db
    ```
    Este comando:
    - Crea el archivo de base de datos `data/portal_academico.db`.
    - Define toda la estructura de tablas (Usuarios, Grados, Áreas, etc.).
    - Puebla las tablas con los datos iniciales extraídos de los archivos `data/usuarios.json` y `data/examenes.json`.

### Uso
1.  **Iniciar el servidor Flask:**
    ```bash
    flask run
    ```
    El servidor se iniciará en `http://127.0.0.1:5000` por defecto.

2.  **Acceder a la aplicación:**
    Abre `index.html` en tu navegador. El frontend se conectará automáticamente a la API de Flask en el puerto 5000.

### Códigos de prueba disponibles
Los usuarios se cargan desde `data/usuarios.json` al inicializar la base de datos.
### Acceder a la aplicación
1. Abrir el navegador web
2. Visitar `http://localhost:8000`
3. Ingresar con un código estudiantil válido

### Códigos de prueba disponibles
- `IEM0601` - Ana María García (Grado 6)
- `IEM0702` - Carlos Eduardo López (Grado 7)
- `IEM0803` - María José Rodríguez (Grado 8)
- `IEM0901` - Andrés Felipe Gómez (Grado 9)
- `IEM1001` - Laura Sofía Hernández (Grado 10)
- `IEM1101` - Maria Vargas (Grado 11)
