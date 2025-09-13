# Portal de Evaluación Académica IEM

## Descripción
Sistema web interactivo para evaluaciones académicas que permite a los estudiantes realizar pruebas en diferentes áreas del conocimiento. Desarrollado específicamente para la Institución Educativa Municipal (IEM).

## Características Principales
- 🔐 Sistema de autenticación por código estudiantil
- 📚 Evaluaciones en múltiples áreas curso de 6 a 11:
  - Matemáticas
  - Ciencias Naturales
  - Ciencias Sociales
  - Lectura 
  - Ingles (solo 9,10,11)
- ⏱️ Temporizador incorporado en las pruebas
- 📱 Diseño responsive
- 🎨 Interfaz moderna y profesional

## Tecnologías Utilizadas

### Backend
- **Python** - Lenguaje de programación principal.
- **Flask** - Microframework web para construir la API REST.
- **SQLAlchemy** - ORM para interactuar con la base de datos.

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript (ES6+)** - Funcionalidad interactiva

### Base de Datos
- **SQLite** - Base de datos SQL ligera basada en un archivo, gestionada a través de SQLAlchemy.

## Estructura del Proyecto

```
plataforma_examenes/
├── backend/
│   └── app.py               # Lógica del servidor Flask y API
├── frontend/
│   ├── css/
│   ├── js/
│   └── pages/
├── data/
│   ├── usuarios.json        # Datos iniciales de usuarios
│   ├── examenes.json        # Datos iniciales de exámenes y preguntas
│   └── portal_academico.db  # Base de datos SQLite (generada automáticamente)
├── docs/
├── index.html
├── requirements.txt         # Dependencias de Python
└── README.md                # Este archivo
```

## Requisitos Previos
- Python 3.8+
- Navegador web moderno

## Instalación y Puesta en Marcha

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

## Uso

1.  **Iniciar el servidor Flask:**
    ```bash
    flask run
    ```
    El servidor se iniciará en `http://127.0.0.1:5000` por defecto.

2.  **Acceder a la aplicación:**
    Abre `index.html` en tu navegador. El frontend se conectará automáticamente a la API de Flask en el puerto 5000.

### Códigos de prueba disponibles
Los usuarios se cargan desde `data/usuarios.json` al inicializar la base de datos.

## Flujo de la Base de Datos

El sistema está diseñado con una base de datos relacional que asegura la integridad de los datos:

1.  **Usuarios Fijos**: Los usuarios se cargan una única vez durante la inicialización de la base de datos. No hay una API para crear nuevos usuarios, garantizando un conjunto fijo de participantes.

2.  **Relación Grado-Área**: El sistema define qué áreas de examen están disponibles para cada grado a través de una tabla de asociación. Un estudiante de `10mo` solo verá los exámenes de Matemáticas y Ciencias, mientras que uno de `11vo` verá los de Matemáticas y Sociales (según la configuración inicial).

3.  **Banco de Preguntas**: Cada área tiene su propio conjunto de preguntas asociado, asegurando que cada examen sea específico a su materia.

## APIs Disponibles
(Las rutas de la API seguirán la misma estructura que la versión anterior, pero ahora son gestionadas por Flask)

### Autenticación
- `POST /api/validar`

### Exámenes
- `GET /api/examenes`
- `POST /api/examenes/<area>/iniciar`

### Resultados
- `GET /api/resultados/<codigo>`

## Desarrollo

### Modificar los datos iniciales
Si necesitas cambiar los usuarios, grados, áreas o preguntas iniciales, puedes modificar los archivos `data/usuarios.json` y `data/examenes.json` y luego **volver a ejecutar `flask init-db`**. 

**¡Atención!:** El comando `flask init-db` borra y re-crea la base de datos completamente, por lo que se perderán todos los intentos y resultados guardados.

## Solución de Problemas

### `flask` command not found
- Asegúrate de haber activado el entorno virtual (`source venv/bin/activate`).
- Confirma que Flask se instaló correctamente con `pip list`.

### Error de base de datos (e.g., `table not found`)
- Asegúrate de haber ejecutado `flask init-db` al menos una vez después de instalar las dependencias.
- Si has modificado los modelos en `backend/app.py`, necesitas volver a ejecutar `flask init-db`.

### Problemas de CORS
- El backend está configurado para aceptar peticiones desde cualquier origen (`*`). Si tienes problemas, revisa la consola del navegador para mensajes de error específicos de CORS.

## Contribución
1. Fork del proyecto
2. Crear rama para nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto
- **Institución**: Institución Educativa Mojarras
- **Soporte**: razcarvajal@iem.edu.co
- **Teléfono**: 3192076175

## Versión
**v1.0.0** - Versión inicial del Portal de Evaluación Académica IEM

---

© 2025 Institución Educativa Mojarras - Portal de Evaluación Académica

