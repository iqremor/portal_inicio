# Documentación Detallada del Proyecto: Portal de Evaluación Académica IEM

## 1. Visión General

El "Portal de Evaluación Académica IEM" es una aplicación web diseñada para facilitar la realización de evaluaciones académicas a estudiantes. Proporciona un sistema de autenticación seguro, gestión de exámenes cronometrados y un registro detallado de los resultados.

## 2. Arquitectura del Sistema

El proyecto sigue una arquitectura cliente-servidor, dividida en un frontend, un backend y un sistema de almacenamiento de datos basado en archivos JSON.

### 2.1. Frontend

*   **Tecnologías:** HTML5, CSS3, JavaScript (ES6+).
*   **Estructura:**
    *   `index.html`: Página principal de inicio de sesión.
    *   `frontend/css/`: Contiene los estilos CSS (`styles.css`, `global.css`, y específicos para dashboard, examen, resultados).
    *   `frontend/js/`: Contiene los scripts JavaScript.
        *   `global.js`: Carga estilos globales y el pie de página (`footer.html`).
        *   `script.js`: Lógica principal de la página de inicio de sesión, incluyendo validación de código estudiantil y comunicación con el backend para autenticación.
        *   `validacion.js`: (Asumo que contiene funciones de validación de formato de código, aunque no se leyó directamente, su nombre lo sugiere y `script.js` hace referencia a validaciones).
        *   `dashboard.js`, `examen.js`, `resultados.js`: (Asumo que manejan la lógica de las respectivas páginas del frontend).
    *   `frontend/pages/`: Contiene las páginas HTML secundarias (`inicio.html`, `examen.html`, `resultados.html`, `footer.html`).
*   **Funcionalidad Clave:**
    *   Interfaz de usuario para el inicio de sesión.
    *   Validación en tiempo real del formato del código estudiantil.
    *   Manejo de la sesión del usuario (almacenamiento en `localStorage`, verificación de expiración).
    *   Redirección a las páginas de exámenes o resultados.

### 2.2. Backend

*   **Tecnologías:** Node.js, Express.js.
*   **Archivos Clave:** `backend/server.js`.
*   **Middleware Utilizado:**
    *   `helmet`: Para establecer cabeceras HTTP de seguridad.
    *   `morgan`: Para el registro de solicitudes HTTP (logging).
    *   `cors`: Para habilitar Cross-Origin Resource Sharing. Actualmente configurado para permitir todos los orígenes (`*`), lo cual podría requerir ajuste en producción.
    *   `body-parser`: Para parsear cuerpos de solicitud JSON y URL-encoded.
    *   `verificarUsuario`: Middleware personalizado para autenticación de código estudiantil en rutas protegidas.
*   **Funcionalidad Clave (API RESTful):**
    *   **Autenticación:**
        *   `POST /api/validar`: Valida el código estudiantil con los datos de `usuarios.json`.
        *   `POST /api/logout`: Cierra la sesión (lógica simple de mensaje de éxito).
        *   `GET /api/usuario/:codigo`: Obtiene los datos de un usuario específico.
    *   **Gestión de Exámenes:**
        *   `GET /api/examenes`: Lista las áreas de examen disponibles.
        *   `GET /api/examenes/:area`: Obtiene información detallada de un examen por área.
        *   `POST /api/examenes/:area/iniciar`: Inicia una nueva sesión de examen, selecciona y mezcla preguntas, y las almacena en memoria (`global.sesionesExamen`). Las respuestas correctas se omiten en el envío al frontend.
        *   `POST /api/examenes/:area/responder`: Guarda la respuesta de una pregunta en la sesión de examen en memoria.
        *   `POST /api/examenes/:area/finalizar`: Calcula la puntuación final del examen, guarda el resultado en `resultados.json` y marca la sesión como completada.
    *   **Gestión de Resultados:**
        *   `GET /api/resultados/:codigo`: Obtiene el historial de resultados de un estudiante.
        *   `GET /api/resultados/:codigo/:resultado_id`: Obtiene los detalles de un resultado de examen específico.
*   **Manejo de Archivos:** Funciones auxiliares `leerArchivo` y `escribirArchivo` para interactuar con los archivos JSON de datos.
*   **Sesiones de Examen:** Se gestionan en memoria (`global.sesionesExamen`) en el servidor. Esto implica que las sesiones se perderán si el servidor se reinicia.

### 2.3. Almacenamiento de Datos

*   **Tipo:** Archivos JSON planos.
*   **Archivos:**
    *   `data/usuarios.json`: Contiene una lista de códigos estudiantiles permitidos y los detalles de cada usuario (nombre, grado, estado activo).
    *   `data/examenes.json`: Define las diferentes áreas de examen, incluyendo su nombre, descripción, tiempo límite, número de preguntas y el banco de preguntas con sus opciones y respuesta correcta.
    *   `data/resultados.json`: Almacena los resultados de los exámenes de cada estudiante, organizados por código estudiantil.
    *   `data/configuracion.json`: Contiene ajustes globales del sistema, autenticación, exámenes, puntuación e interfaz.

## 3. Lógica de Negocio Clave

*   **Validación de Código Estudiantil:** Se realiza tanto en el frontend (formato `IEM####`) como en el backend (existencia y estado activo en `usuarios.json`).
*   **Gestión de Sesiones:** Las sesiones de usuario en el frontend se controlan mediante `localStorage` con una expiración de 24 horas. Las sesiones de examen en el backend son efímeras (en memoria) y se asocian a un `sesion_id` único.
*   **Selección y Aleatorización de Preguntas:** Al iniciar un examen, las preguntas se seleccionan del banco de `examenes.json`, se mezclan aleatoriamente y se limitan al número configurado. Las respuestas correctas se ocultan al frontend.
*   **Cálculo de Puntuación:** Al finalizar un examen, el backend compara las respuestas del estudiante con las respuestas correctas almacenadas en la sesión en memoria para calcular la puntuación y el porcentaje.
*   **Registro de Resultados:** Los resultados detallados de cada examen completado se guardan en `resultados.json`.

## 4. Tecnologías y Dependencias

### 4.1. Backend (package.json)

*   `express`: Framework web para Node.js.
*   `cors`: Middleware para habilitar CORS.
*   `body-parser`: Middleware para parsear cuerpos de solicitud.
*   `helmet`: Colección de middlewares para seguridad HTTP.
*   `morgan`: Middleware para logging de solicitudes HTTP.
*   `uuid`: Para generar IDs únicos (utilizado para `sesion_id` y `resultado.id`).
*   `moment`: Para manipulación de fechas y tiempos.
*   `nodemon` (dev): Para recargar automáticamente el servidor durante el desarrollo.
*   `jest` (dev): Framework de pruebas.
*   `eslint` (dev): Herramienta de linting de código.

### 4.2. Frontend

*   HTML, CSS, JavaScript.
*   Font Awesome: Para iconos.
*   Google Fonts (Inter): Para la tipografía.

## 5. Flujo de Usuario (Ejemplo)

1.  El estudiante accede a `index.html`.
2.  Ingresa su código estudiantil en el formulario de login.
3.  El frontend valida el formato y envía el código al backend (`/api/validar`).
4.  El backend verifica el código en `usuarios.json`.
5.  Si es válido, el backend responde con éxito, y el frontend guarda la sesión en `localStorage` y redirige a `frontend/pages/inicio.html`.
6.  En `inicio.html` (asumo que es el dashboard), el estudiante puede ver la lista de exámenes disponibles (`/api/examenes`).
7.  Elige un examen y lo inicia (`/api/examenes/:area/iniciar`).
8.  El frontend muestra las preguntas del examen, y el estudiante las responde. Cada respuesta puede ser enviada al backend (`/api/examenes/:area/responder`) para actualizar la sesión en memoria.
9.  Al finalizar el examen o agotarse el tiempo, el estudiante lo finaliza (`/api/examenes/:area/finalizar`).
10. El backend calcula la puntuación y guarda el resultado.
11. El estudiante puede ver sus resultados (`/api/resultados/:codigo`) o un resultado específico (`/api/resultados/:codigo/:resultado_id`).

## 6. Consideraciones y Posibles Mejoras

*   **Persistencia de Sesiones de Examen:** Actualmente, las sesiones de examen se almacenan en memoria. Esto significa que si el servidor se reinicia, todas las sesiones en curso se perderán. Para un entorno de producción, se debería considerar una base de datos (ej. MongoDB, PostgreSQL) para almacenar estas sesiones de forma persistente.
*   **Seguridad CORS:** La configuración de CORS (`origin: '*'`) es muy permisiva. En un entorno de producción, debería restringirse a los dominios específicos del frontend.
*   **Manejo de Errores Frontend:** Aunque el backend tiene manejo de errores, el frontend podría beneficiarse de una gestión de errores más robusta y amigable para el usuario.
*   **Escalabilidad:** El uso de archivos JSON para el almacenamiento de datos puede volverse ineficiente con un gran número de usuarios o exámenes. Una base de datos sería más adecuada para la escalabilidad.
*   **Pruebas:** El `package.json` menciona `jest`, lo que indica que hay una intención de pruebas unitarias. Asegurar una buena cobertura de pruebas es crucial.
*   **Documentación de API:** Considerar generar documentación de API (ej. con Swagger/OpenAPI) para facilitar el desarrollo y mantenimiento.
*   **Internacionalización:** El archivo `configuracion.json` tiene un campo `idioma`, lo que sugiere una posible futura internacionalización.
*   **Manejo de Concurrencia:** Si múltiples estudiantes intentan iniciar o finalizar exámenes simultáneamente, el manejo de archivos JSON podría presentar problemas de concurrencia. Una base de datos gestionaría esto de manera más robusta.
*   **Validación de Datos:** Aunque hay validación de código estudiantil, se podría reforzar la validación de otros datos de entrada en el backend para prevenir inyecciones o datos malformados.
*   **Frontend Routing:** La navegación entre `inicio.html`, `examen.html`, `resultados.html` parece manejarse con redirecciones directas. Un router de frontend (ej. con una librería como `react-router-dom` si se usara React, o un router simple de JS) podría ofrecer una experiencia de usuario más fluida y una mejor gestión del estado.
