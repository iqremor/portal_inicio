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
├── backend/            # Lógica del servidor Flask y API
├── frontend/           # Interfaz de usuario
├── docs/               # Documentación del proyecto
|── test/               # Pruebas unitarias y de integración
|── data/               # Banco de preguntas
├── index.html          # Página principal de la aplicación
├── requirements.txt    # Dependencias de Python
└── README.md           # Documentación general del proyecto
```
### Backend
```
plataforma_examenes/backend/
├── data/
│   ├── usuarios.json        # Datos iniciales de usuarios
│   ├── examenes.json        # Datos iniciales de exámenes y preguntas
│   └── portal_academico.db  # Base de datos SQLite (generada automáticamente)
└── app.py                   # Lógica del servidor Flask y API

```
### Frontend
```
plataforma_examenes/frontend/           
├── css/
├── js/
│   ├── api/
│   │   └── index.js            # Centraliza todas las llamadas a la API.
│   ├── components/
│   │   ├── modal.js            # Componente de modal reutilizable.
│   │   └── notification.js     # Componente de notificación reutilizable.
│   ├── pages/
│   │   ├── dashboard.js        # Lógica específica de la página de dashboard.
│   │   ├── exam.js             # Lógica específica de la página de examen.
│   │   ├── login.js            # Lógica específica de la página de login.
│   │   └── results.js          # Lógica específica de la página de resultados.
│   ├── shared/
│   │   ├── auth.js             # Funciones de autenticación (sesiones, etc.).
│   │   ├── timer.js            # Clase de temporizador reutilizable.
│   │   └── utils.js            # Funciones de utilidad (formateo de fechas, etc.).
│   └── main.js                 # Punto de entrada principal de la aplicación.
└── pages/                      
    ├── dashboard.html          # Página de dashboard
    ├── examen.html             # Página de examen
    ├── footer.html             # Componente de pie de página
    ├── header.html             # Componente de encabezado
    ├── login-form.html         # Componente de formulario de login
    ├── login.html              # Página de login
    └── resultados.html         # Página de resultados
```
### Docs
```
plataforma_examenes/docs/    # Documentación del proyecto
├── requirements.txt         # Dependencias de Python
├── Frontend.md              # Descripción Fronted
|── log.md                   # Descripción de historial de cambios
|── Backend.md               # Descripción Backend
|── bugs.md                  # Reportar bugs
|── contributing.md          # Contribuir al proyecto
|── license.md               # Licencia del proyecto
└── README.md                # Descripción detalla del proyecto
```
### data 
```
plataforma_examenes/data/    # Banco de preguntas
├──Grado_6/
|      ├──Ciencias/
|      ├──Matematicas/
|      ├──Lectura/
|      └──Sociales/
├──Grado_7/
|      ├──Ciencias/
|      ├──Matematicas/
|      ├──Lectura/
|      └──Sociales/
├──Grado_8/
|      ├──Ciencias/
|      ├──Matematicas/
|      ├──Lectura/
|      └──Sociales/
├──Grado_9/
|      ├──Ciencias/
|      ├──Matematicas/
|      ├──Ingles/
|      ├──Lectura/
|      └──Sociales/
├──Grado_10/
|      ├──Ciencias/
|      ├──Matematicas/
|      ├──Ingles/
|      ├──Lectura/
|      └──Sociales/
└────Grado_11/
      ├──Ciencias/
      ├──Matematicas/
      ├──Ingles/
      ├──Lectura/
      └──Sociales/
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

## Flujo de la Aplicación

### 1. Autenticación
- El usuario ingresa su código estudiantil (formato: IEMdddd)
- El sistema valida el formato y verifica en la base de datos
- Si es válido, redirige al dashboard personalizado

### 2. Dashboard
- Muestra información personalizada del estudiante
- Lista las áreas de evaluación disponibles
- Permite ver resultados anteriores
- Opción de cerrar sesión

### 3. Selección de Examen
- El estudiante selecciona un área de evaluación
- Se muestra información detallada del examen
- Confirmación antes de iniciar

### 4. Realización del Examen
- Temporizador activo durante la evaluación
- Navegación entre preguntas
- Guardado automático de respuestas
- Finalización automática al agotar el tiempo

### 5. Resultados
- Cálculo automático de puntuación
- Almacenamiento en historial
- Visualización de resultados

## APIs Disponibles

### Autenticación
- `POST /api/validar` - Validar código estudiantil
- `POST /api/logout` - Cerrar sesión

### Exámenes
- `GET /api/examenes` - Listar áreas disponibles
- `GET /api/examenes/:area` - Información de examen específico
- `POST /api/examenes/:area/iniciar` - Iniciar examen
- `POST /api/examenes/:area/responder` - Enviar respuesta
- `POST /api/examenes/:area/finalizar` - Finalizar examen

### Resultados
- `GET /api/resultados/:codigo` - Historial del estudiante
- `GET /api/resultados/:codigo/:resultado_id` - Resultado específico


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

