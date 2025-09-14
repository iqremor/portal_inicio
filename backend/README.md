# Crear un servidor web local con Flask, Flask-Admin y Flask-SQLAlchemy

Crear un servidor web local usando Flask, Flask-Admin y Flask-SQLAlchemy es una excelente manera de desarrollar aplicaciones web con una interfaz administrativa y una base de datos integrada. A continuación, te guiaré paso a paso para configurar un servidor básico.

Este servidor tendrá una interfaz administrativa para gestionar usuarios, bases de datos , peticiones y demas para pagina web de prueba que se guardaran en el directorio web_test ruta:`templates/web_test/index.html`.

# Preparación
- Asegúrate de tener Python instalado (preferiblemente Python 3.6 o superior).
- Instala pip si no lo tienes (viene preinstalado con Python 3.4+).
- Crea un directorio para tu proyecto y navega a él en la terminal. 
- Crear plantilla de pagina administrador y pagina web de prueba.
# Plantilla para server de uso local con Flask
    mi_server/
    ├── venv/                   # Entorno virtual (aislado)
    ├── server.py               # Tu código principal
    ├── requirements.txt        # Las librerías que usas
    ├── .gitignore              # Archivos a ignorar por Git
    ├── static/                 # Para archivos CSS/JS/imágenes
    │   ├── css/                 # Archivos CSS
    │   │   └── style.css       # Estilos CSS
    │   ├── js/                  # Archivos JavaScript
    │   └── images/              # Imágenes
    └── templates/                # Plantillas HTML
        └── web_test/             # ★ PÁGINA WEB DE PRUEBA AISLADA ★
            ├── index.html        # Página principal de prueba
            ├── css/              # CSS específico de esta prueba
            ├── js/               # JS específico de esta prueba
            ├── images/           # Imágenes específicas de esta prueba
        └── assets/           # Otros recursos específicos

## Implementación Modularizada

### Estructura Actualizada del Proyecto
```
mi_server/
├── app.py              # Fábrica de la aplicación Flask
├── cli.py              # Comandos CLI con Click
├── server.py           # Lógica del servidor y middleware
├── main.py             # Punto de entrada principal
├── requirements.txt    # Dependencias actualizadas
└── (resto de estructura...)
```

### Dependencias Principales
```
Flask==3.0.3
Click==8.2.1
Werkzeug==3.1.3
python-dotenv==1.1.1
``` Framework Web Principal
- **Flask (3.0.3)**: Framework web ligero para Python
- **Flask-Admin (1.6.1)**: Interfaz de administración automática para Flask
- **Flask-SQLAlchemy (3.1.1)**: Integración de SQLAlchemy ORM con Flask
- **Werkzeug (3.1.3)**: Biblioteca WSGI que Flask utiliza internamente
- **Jinja2 (3.1.6)**: Motor de plantillas usado por Flask
- **MarkupSafe (3.0.2)**: Manejo seguro de cadenas HTML/XML
- **itsdangerous (2.2.0)**: Firma criptográfica segura de datos
- **click (8.2.1)**: Framework para crear interfaces de línea de comandos
- **blinker (1.9.0)**: Sistema de señales para Python (usado por Flask)
- **Flask-migrate (4.0.6)**: Herramienta de migración de bases de datos para Flask

## Base de Datos
- **SQLAlchemy (2.0.43)**: ORM (Object-Relational Mapping) para Python
- **psycopg2-binary (2.9.10)**: Adaptador para PostgreSQL
- **PyMySQL (1.1.2)**: Cliente MySQL puro en Python
- **greenlet (3.2.4)**: Soporte para programación asíncrona ligera

## Procesamiento de Datos y Científico
- **pandas (2.3.1)**: Análisis y manipulación de datos
- **numpy (2.3.1)**: Computación numérica fundamental
- **scipy (1.16.0)**: Algoritmos científicos y matemáticos
- **sympy (1.14.0)**: Matemáticas simbólicas
- **mpmath (1.3.0)**: Aritmética de precisión arbitraria

## Audio y Reconocimiento de Voz
- **piper-tts (1.3.0)**: Sistema de síntesis de voz (Text-to-Speech)
- **vosk (0.3.45)**: Reconocimiento de voz offline
- **sounddevice (0.5.2)**: Reproducción y grabación de audio
- **srt (3.5.3)**: Manejo de archivos de subtítulos SRT
- **websockets (15.0.1)**: Comunicación WebSocket (posiblemente para streaming de audio)

## Machine Learning e IA
- **onnxruntime (1.22.1)**: Runtime para ejecutar modelos ONNX (Open Neural Network Exchange)
- **flatbuffers (25.2.10)**: Serialización eficiente de datos (usado por frameworks ML)
- **protobuf (6.31.1)**: Serialización de datos de Google (usado en ML)

## Validación y Configuración de Datos
- **pydantic (2.11.7)**: Validación de datos usando anotaciones de tipos
- **pydantic_core (2.33.2)**: Core en Rust para Pydantic
- **annotated-types (0.7.0)**: Tipos anotados para validación
- **jsonschema (4.24.0)**: Validación de esquemas JSON
- **jsonschema-specifications (2025.4.1)**: Especificaciones para jsonschema

## Gestión de Archivos y Configuración
- **PyYAML (6.0.2)**: Parser y emiter para YAML
- **oyaml (1.0)**: YAML ordenado
- **python-dotenv (1.1.1)**: Carga variables de entorno desde archivos .env
- **yacman (0.9.3)**: Gestor de configuración YAML
- **eido (0.2.4)**: Validación de esquemas de configuración

## Pipeline de Datos Bioinformáticos
- **peppy (0.40.7)**: Manejo de metadatos de experimentos (PEP - Portable Encapsulated Projects)
- **pephubclient (0.4.5)**: Cliente para PEPHub (repositorio de metadatos)
- **pipestat (0.12.1)**: Gestión de estadísticas de pipelines
- **logmuse (0.2.8)**: Sistema de logging
- **attmap (0.13.2)**: Mapas de atributos
- **ubiquerg (0.8.1)**: Utilidades genéricas

## HTTP y Web
- **requests (2.32.4)**: Cliente HTTP elegante y simple
- **urllib3 (2.5.0)**: Cliente HTTP con pooling de conexiones
- **certifi (2025.7.9)**: Certificados CA de Mozilla
- **charset-normalizer (3.4.2)**: Detección de codificación de caracteres
- **idna (3.10)**: Soporte para nombres de dominio internacionalizados

## Interfaz de Usuario y CLI
- **typer (0.16.0)**: Framework moderno para CLIs basado en type hints
- **rich (14.0.0)**: Texto enriquecido y layouts para terminal
- **coloredlogs (15.0.1)**: Logs coloridos
- **colorama (0.4.6)**: Texto colorido multiplataforma
- **Pygments (2.19.2)**: Resaltado de sintaxis
- **tqdm (4.67.1)**: Barras de progreso

## Servidor Web
- **waitress (3.0.2)**: Servidor WSGI para producción

## Windows y Sistema
- **pywin32 (310)**: Extensiones Win32 para Python
- **pypiwin32 (223)**: Instalador PyPI para pywin32
- **comtypes (1.4.11)**: Biblioteca COM para Windows
- **pyreadline3 (3.5.4)**: Readline para Windows
- **psutil (7.0.0)**: Información del sistema y procesos

## Formularios Web
- **WTForms (3.2.1)**: Validación y renderizado de formularios web

## Utilidades de Desarrollo
- **attrs (25.3.0)**: Creación de clases sin boilerplate
- **packaging (25.0)**: Utilidades de empaquetado
- **setuptools (80.9.0)**: Herramientas de construcción de paquetes
- **shellingham (1.5.4)**: Detección de shell
- **humanfriendly (10.0)**: Formato humano-legible

## Fechas y Tipos
- **python-dateutil (2.9.0.post0)**: Extensiones para datetime
- **pytz (2025.2)**: Zonas horarias
- **tzdata (2025.2)**: Base de datos de zonas horarias
- **typing_extensions (4.14.1)**: Backport de características de typing
- **typing-inspection (0.4.1)**: Inspección de tipos en tiempo de ejecución
- **six (1.17.0)**: Compatibilidad Python 2/3

## Utilidades Adicionales
- **cffi (1.17.1)**: Interfaz de función extranjera para C
- **pycparser (2.22)**: Parser de C en Python puro
- **markdown-it-py (3.0.0)**: Parser de Markdown
- **mdurl (0.1.2)**: Utilidades de URL para Markdown
- **referencing (0.36.2)**: Implementación de referencias JSON
- **rpds-py (0.26.0)**: Estructuras de datos persistentes en Python
```
## Resumen del Proyecto

Este proyecto parece ser una **aplicación web Flask** con capacidades de:

1. **Procesamiento de audio y voz**: TTS, reconocimiento de voz, manejo de subtítulos
2. **Análisis de datos científicos**: Pandas, NumPy, SciPy para procesamiento numérico
3. **Machine Learning**: ONNX Runtime para inferencia de modelos
4. **Pipelines bioinformáticos**: Herramientas especializadas para manejo de metadatos experimentales
5. **Interfaz web administrativa**: Flask-Admin para gestión
6. **Base de datos**: Soporte para PostgreSQL y MySQL
7. **CLI rica**: Interfaces de línea de comandos con Typer y Rich
8. **Desarrollo en Windows**: Varias dependencias específicas para compatibilidad con Windows

## Instalación

1. Clona este repositorio:
    ```bash
    git clone https://github.com/tu-usuario/tu-proyecto.git
    cd tu-proyecto
    ```

2. Crea un entorno virtual y actívalo:
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Windows, usa `venv\Scripts\activate`
    ```

3.  **Configura la `SECRET_KEY`:**
    La `SECRET_KEY` es crucial para la seguridad de las sesiones de Flask y para el correcto funcionamiento de la autenticación. **Nunca uses la clave por defecto en producción.**

    *   **Genera y configura una clave segura usando `key.py`:**
        Ejecuta el siguiente script en la raíz de tu proyecto:
        ```bash
        python key.py
        ```
        Este script generará una clave segura y te preguntará si deseas añadirla automáticamente a tu archivo `.env`.

    *   **Importante sobre `key.py`:** Por razones de seguridad, se recomienda **mover o eliminar el archivo `key.py`** de la raíz de tu proyecto una vez que hayas generado y configurado tu `SECRET_KEY`.

    *   **Recordatorio sobre `.env`:**
        Asegúrate de que el archivo `.env` (que contiene tu `SECRET_KEY`) esté incluido en tu `.gitignore` para evitar que se suba al control de versiones.

4. Instala las dependencias
    pip install -r requirements.txt
    ```
        annotated-types==0.7.0
        attmap==0.13.2
        attrs==25.3.0
        blinker==1.9.0
        certifi==2025.7.9
        cffi==1.17.1
        charset-normalizer==3.4.2
        click==8.2.1
        colorama==0.4.6
        coloredlogs==15.0.1
        comtypes==1.4.11
        eido==0.2.4
        Flask==3.0.3
        flatbuffers==25.2.10
        humanfriendly==10.0
        idna==3.10
        itsdangerous==2.2.0
        Jinja2==3.1.6
        jsonschema==4.24.0
        jsonschema-specifications==2025.4.1
        logmuse==0.2.8
        markdown-it-py==3.0.0
        MarkupSafe==3.0.2
        mdurl==0.1.2
        mpmath==1.3.0
        numpy==2.3.1
        onnxruntime==1.22.1
        oyaml==1.0
        packaging==25.0
        pandas==2.3.1
        pephubclient==0.4.5
        peppy==0.40.7
        piper-tts==1.3.0
        pipestat==0.12.1
        protobuf==6.31.1
        psutil==7.0.0
        pycparser==2.22
        pydantic==2.11.7
        pydantic_core==2.33.2
        Pygments==2.19.2
        pypiwin32==223
        pyreadline3==3.5.4
        python-dateutil==2.9.0.post0
        pytz==2025.2
        pywin32==310
        PyYAML==6.0.2
        referencing==0.36.2
        requests==2.32.4
        rich==14.0.0
        rpds-py==0.26.0
        scipy==1.16.0
        setuptools==80.9.0
        shellingham==1.5.4
        six==1.17.0
        sounddevice==0.5.2
        srt==3.5.3
        sympy==1.14.0
        tqdm==4.67.1
        typer==0.16.0
        typing-inspection==0.4.1
        typing_extensions==4.14.1
        tzdata==2025.2
        ubiquerg==0.8.1
        urllib3==2.5.0
        vosk==0.3.45
        websockets==15.0.1
        Werkzeug==3.1.3
        yacman==0.9.3
    ```
    


## Código del Servidor
- Crea el archivo `server.py` y agrega el siguiente código:
    ```python
    from flask import Flask, render_template
    from flask_admin import Admin
    from flask_admin.contrib.sqla import ModelView
    from flask_sqlalchemy import SQLAlchemy

    app = Flask(__name__)
    # Es crucial configurar una SECRET_KEY para las sesiones (usadas por Flask-Admin).
    # ¡Cámbiala por una cadena de caracteres aleatoria y mantenla en secreto!
    app.config['SECRET_KEY'] = 'tu-clave-secreta-aqui'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mi_base_de_datos.db'
    
    db = SQLAlchemy(app)

    # --- Modelos de la Base de Datos ---
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(80), unique=True, nullable=False)

        def __repr__(self):
            return f'<User {self.username}>'

    # --- Configuración de Flask-Admin ---
    admin = Admin(app, name='Mi Panel de Admin', template_mode='bootstrap4')
    # Añade vistas de los modelos al panel de admin
    admin.add_view(ModelView(User, db.session))

    @app.route('/')
    def index():
        return render_template('index.html')

    if __name__ == '__main__':
        app.run(debug=True)
    ``` 
- Crea la carpeta `templates` y dentro un archivo `index.html`.
    ```html
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mi Servidor Flask</title>
    </head>
    <body>
        <h1>¡Hola desde mi servidor Flask!</h1>
        <p>Esta es una plantilla HTML servida por Flask.</p>
        <p>Puedes acceder al panel de administración en <a href="/admin">/admin</a>.</p>
    </body>
    </html>
    ```
- Crea la base de datos. Abre una terminal con el entorno virtual activado y ejecuta `python`.
    ```sh
    # En la terminal, ejecuta el intérprete de Python
    python
    ```
    Dentro del intérprete, importa `db` desde tu app y crea las tablas:
    ```python
    >>> from server import db
    >>> db.create_all()
    >>> exit()
    ```
- Guarda las dependencias
    pip freeze > requirements.txt


## Creación del Panel de Administración (Flask-Admin)

Para configurar el panel de administración utilizando Flask-Admin, sigue estos pasos:

1.  **Importar las Clases Necesarias:**
    Asegúrate de importar `Admin`, `ModelView` de `flask_admin` y `flask_admin.contrib.sqla`, y `SQLAlchemy` de `flask_sqlalchemy`.

    ```python
    from flask_admin import Admin
    from flask_admin.contrib.sqla import ModelView
    from flask_sqlalchemy import SQLAlchemy
    ```

2.  **Configurar la Aplicación Flask y la Base de Datos:**
    Define la `SECRET_KEY` (esencial para la seguridad de las sesiones de Flask-Admin) y la URI de la base de datos. Luego, inicializa la instancia de `SQLAlchemy`.

    ```python
    app.config['SECRET_KEY'] = 'tu-clave-secreta-aqui' # ¡Cámbiala por una cadena segura!
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mi_base_de_datos.db'

    db = SQLAlchemy(app)
    ```

3.  **Definir Modelos de Base de Datos:**
    Crea tus modelos de SQLAlchemy. Estos serán las tablas que Flask-Admin te permitirá gestionar. Por ejemplo, un modelo `User`:

    ```python
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(80), unique=True, nullable=False)

        def __repr__(self):
            return f'<User {self.username}>'
    ```
    (Nota: En un proyecto modular, estos modelos deberían estar en `models.py`.)

4.  **Inicializar Flask-Admin:**
    Crea una instancia de `Admin`, pasándole la aplicación Flask, un nombre para el panel y el modo de plantilla.

    ```python
    admin = Admin(app, name='Mi Panel de Admin', template_mode='bootstrap4')
    ```

5.  **Añadir Vistas de Modelos al Panel de Admin:**
    Para cada modelo que quieras gestionar a través del panel, añade una `ModelView`. Esto le dice a Flask-Admin cómo interactuar con tu modelo y la sesión de la base de datos.

    ```python
    admin.add_view(ModelView(User, db.session))
    ```
    Puedes añadir más `ModelView` para otros modelos que definas.

6.  **Crear la Base de Datos (si no existe):**
    Desde la terminal con tu entorno virtual activado, ejecuta el intérprete de Python y crea las tablas de la base de datos:

    ```bash
    python
    >>> from server import db # O desde tu archivo principal si la instancia 'db' está allí
    >>> db.create_all()
    >>> exit()
    ```
    Esto creará el archivo `mi_base_de_datos.db` (o conectará a tu base de datos configurada) y creará las tablas definidas por tus modelos.

Una vez completados estos pasos, podrás acceder a tu panel de administración visitando la ruta `/admin` en tu navegador (por ejemplo, `http://127.0.0.1:5000/admin` si estás ejecutando el servidor localmente).


# Logica de uso
    - Asegúrate de tener el entorno virtual activado


### Ejecución del Servidor
```bash
    # Modo desarrollo con debug
    python main.py run --debug

    # Modo producción
    python main.py run --host 0.0.0.0 --port 5000
``` 
       
# Documentación útil
- Flask: https://flask.palletsprojects.com/en/latest/
- Flask-Admin: https://flask-admin.readthedocs.io/en/stable/
- Flask-SQLAlchemy: https://flask-sqlalchemy.palletsprojects.com/en/latest/

# Plan de Desarrollo Sugerido

A continuación se presenta un plan de desarrollo en fases para construir una aplicación robusta y escalable.

### Fase 1: Estructura Modular (Implementada)

- ✅ Separación en módulos especializados
- ✅ CLI con comandos usando Click
- ✅ Configuración centralizada en app.py
- ✅ Middleware de gestión de servidor

1.  **Separar Componentes:** Dividir la lógica de `server.py` en archivos especializados:
    *   **`main.py`:** Punto de entrada que inicializa la aplicación Flask y las extensiones.
    *   **`models.py`:** Contendrá las definiciones de los modelos de base de datos (SQLAlchemy).
    *   **`admin.py`:** Se encargará de toda la configuración de `Flask-Admin`.

2.  **Adaptar el Código:** Mover las clases y configuraciones a sus respectivos archivos nuevos.

### Fase 2: Creación de Vistas para los Modelos

Implementar las vistas administrativas para gestionar los datos de la aplicación (usuarios, peticiones, etc.).

1.  **Definir los Modelos:** Crear todas las clases de modelos de SQLAlchemy en `models.py`.
2.  **Registrar las Vistas en el Admin:** En `admin.py`, importar los modelos y crear una `ModelView` para cada uno, añadiéndolos a la instancia de `Admin`.
3.  **Probar la Interfaz:** Asegurarse de que todas las vistas funcionan correctamente y permiten crear, editar y eliminar registros.
4.  **Interfaze CLI**: Mejorar la  interfaz de línea de comandos (CLI) de  `main.py` para facilitar tareas comunes como inicializar el servidor y hacer mantenimientos.
    *   **Inicializar la Base de Datos:** Añadir un comando para crear o actualizar la base de datos.
    *   **Ejecutar Migraciones:** Incluir comandos para manejar cambios en los modelos y aplicar migraciones.
    *   **Comandos Personalizados:** Añadir comandos específicos para tareas como importar datos o exportar información.

### Fase 3: Personalización de la Interfaz

Mejorar la usabilidad de las vistas administrativas básicas.

1.  **Personalizar Vistas:** Crear clases que hereden de `ModelView` para definir:
    *   `column_list`: Columnas a mostrar en las listas.
    *   `column_searchable_list`: Campos por los que se puede buscar.
    *   `column_filters`: Filtros para acotar los datos.
    *   `form_columns`: Campos que aparecerán en los formularios de creación/edición.

### Fase 4: Implementar Seguridad

**Crítico:** Proteger el panel de administración para que solo usuarios autorizados puedan acceder.

1.  **Crear Vistas Seguras:** Heredar de `ModelView` y `AdminIndexView` para sobreescribir el método `is_accessible`.
2.  **Verificar Autenticación:** Dentro de `is_accessible`, comprobar si el usuario ha iniciado sesión (por ejemplo, revisando la `session` de Flask).
3.  **Redirigir si no hay acceso:** Implementar `inaccessible_callback` para redirigir a los usuarios no autorizados a una página de login.

### Fase 5: Refactorización a una Arquitectura de Servicios

A medida que la aplicación crece, es fundamental separar la lógica de negocio (las operaciones y reglas específicas del dominio) de la lógica de presentación (las rutas de Flask que manejan las peticiones HTTP). El patrón **Capa de Servicio (Service Layer)** es ideal para esto.

**Ventajas:**
- **Separación de Responsabilidades:** Las rutas solo se encargan de recibir peticiones y devolver respuestas, mientras que los servicios contienen la lógica de negocio.
- **Reutilización:** La misma lógica de servicio puede ser utilizada por rutas, comandos CLI o tareas en segundo plano.
- **Testeabilidad:** Es mucho más fácil realizar pruebas unitarias a los servicios de forma aislada.
- **Mantenibilidad:** El código queda más limpio, organizado y fácil de entender.

**Ejemplo: Refactorizar la promoción de sitios**

La lógica para promover el sitio de `web_test` a `web_main` se puede extraer a un servicio.

1.  **Crear el Servicio:**
    Crea un nuevo directorio `services/` y dentro un archivo `site_service.py`.

    ```python
    # services/site_service.py
    import os
    import shutil
    import time
    import logging

    class SitePromotionError(Exception):
        pass

    class SiteService:
        def __init__(self, test_dir, main_dir, backup_dir):
            self.test_dir = test_dir
            self.main_dir = main_dir
            self.backup_dir = backup_dir

        def promote_test_to_main(self):
            if not os.path.exists(self.test_dir):
                raise SitePromotionError('El directorio de prueba no fue encontrado.')
            try:
                if os.path.exists(self.main_dir):
                    backup_path = os.path.join(self.backup_dir, f'web_main_backup_{int(time.time())}')
                    shutil.copytree(self.main_dir, backup_path)
                
                shutil.rmtree(self.main_dir, ignore_errors=True)
                shutil.copytree(self.test_dir, self.main_dir)
                logging.info(f"Sitio promovido de {self.test_dir} a {self.main_dir}")
            except Exception as e:
                logging.error(f"Error durante la promoción: {e}")
                raise SitePromotionError(f"Ocurrió un error inesperado: {e}")

    # Instancia única que será usada en la aplicación
    base_dir = os.path.dirname(os.path.dirname(__file__))
    site_service = SiteService(
        test_dir=os.path.join(base_dir, 'templates', 'web_test'),
        main_dir=os.path.join(base_dir, 'templates', 'web_main'),
        backup_dir=os.path.join(base_dir, 'backups')
    )
    ```

2.  **Actualizar la Ruta en `main.py`:**
    La ruta ahora importa y utiliza el servicio, simplificando enormemente su código.

    ```python
    # main.py
    from services.site_service import site_service, SitePromotionError

    @web_main_bp.route('/admin/promote-to-main', methods=['POST'])
    @require_auth
    def promote_to_main():
        try:
            site_service.promote_test_to_main()
            return jsonify({
                'success': True, 
                'message': 'Sitio promovido exitosamente.'
            })
        except SitePromotionError as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    ```

Esta estructura hace que el proyecto sea mucho más escalable y robusto.

# Próximas Mejoras

- Implementar autenticación JWT
- Adición de pruebas unitarias con pytest
- Integración con Docker
- Configuración de logging avanzado
- Documentación API con Swagger (login/logout) para el panel de administración.
- Añadir validaciones y restricciones a los modelos.
 - Crear vistas personalizadas para reportes o estadísticas.
 - Integrar con otras herramientas o servicios según las necesidades del proyecto.
 - Mejorar la interfaz de usuario  del admin panel con CSS/JS personalizados.
 - Trasladar la base de datos a un sistema más robusto (PostgreSQL, MySQL) para producción.
 - Implementar pruebas unitarias para asegurar la calidad del código.
 - Escalar la aplicación para manejar más tráfico y datos a un framework más complejo y robusto como Django o FastAPI  para trabajar proyecto con logica asincrona como uvicorn o hypercorn.