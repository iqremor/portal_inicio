# Historial de Cambios

[Este archivo contendrá un registro de todos los cambios significativos realizados en el proyecto.]

## Sesión 1 - 13 de septiembre de 2025
### Objetivos de la sesión:
- Iniciar el análisis del repositorio y configurar el proyecto según la plantilla `GEMINI.md`.

### Acciones Realizadas:
- Análisis inicial del repositorio, identificando tecnologías (Python Flask, HTML/CSS/JS) y estado general.
- Identificación y aclaración de la discrepancia en la documentación sobre la tecnología de backend (confirmado Python Flask).
- Creación del directorio `prototype/`.
- Reestructuración de las ramas de Git a `main`, `develop`, `debug`.
- Identificación de áreas críticas y recomendaciones prioritarias para el proyecto.
### Estado del Proyecto al Final de la Sesión:
- **Backend:** Python Flask.
- **Ramas Git:** `main`, `develop`, `debug` configuradas.
- **Directorio `prototype/`:** Creado.
- **Análisis inicial del repositorio:** Completado.
- **Pendiente:** Implementación de herramientas de calidad, testing, documentación de estilo de código, auditoría de dependencias, creación de prototipos y plantillas, y establecimiento de métricas de calidad.

## Sesión 2 - 13 de septiembre de 2025
### Objetivos de la sesión:
- Resolver errores de rutas y configuración del servidor.
- Configurar el servicio de archivos estáticos del frontend.

### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Discrepancia Tecnológica en `overview.md` (Node.js/Express.js vs Python Flask).
    - Dependencias no auditadas.
- Tests: No hay testing framework configurado.

### Acciones Realizadas:
- Corrección de la ruta de `FileAdmin` en `backend/admin.py`.
- Creación y registro del `frontend_bp` en `backend/routes/frontend.py` y `backend/app.py` para servir archivos estáticos del directorio `frontend/`.
- Modificación de la ruta principal (`/`) en `backend/routes/web_main.py` para servir `index.html` de la raíz del proyecto.

### Finalización: [PENDIENTE]

## Sesión 3 - 13 de septiembre de 2025
### Objetivos de la sesión:
- Resolver el problema de redirección del dashboard.
- Migrar la autenticación y datos de usuario de JSON a la base de datos.
- Organizar modularmente los estilos CSS del login.
- Ajustar el logo y el texto del header.
- Solucionar errores de migración de base de datos.
- Implementar script de seeding para la base de datos.

### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Discrepancia Tecnológica en `overview.md` (Node.js/Express.js vs Python Flask).
    - Dependencias no auditadas.
- Tests: No hay testing framework configurado.
### Finalización: [PENDIENTE]
queda pendiente problema de cierre de sesión y carga dinamica de las areas a evaluar

## Sesión 4 - 14 de septiembre de 2025
### Objetivos de la sesión:
- Corregir la discrepancia tecnológica en el archivo `overview.md`.
- Modularizar el header y footer de la página `dashboard.html`.
- Modularizar y refactorizar los estilos del header.
- Integrar el escudo del colegio en el header.
- Mejorar la estructura y semántica del HTML del header.
- Reorganizar el layout del header para centrar el título.
- Establecer una imagen de fondo para el dashboard.
- Ajustar la visualización de los elementos transparentes.
- Ajustar el tamaño del botón de logout.
- Encerrar el contenido de la sección hero en un contenedor con estilo de tarjeta.

### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - **Discrepancia Tecnológica en `overview.md` (Node.js/Express.js vs Python Flask).**
    - Dependencias no auditadas.
- Tests: No hay testing framework configurado.

### Acciones Realizadas:
- Se actualizó el archivo `docs/project/overview.md` para reflejar que la tecnología del backend es Python/Flask en lugar de Node.js/Express.js.
- Se corrigieron las secciones de tecnologías, instalación, requisitos y configuración para que coincidan con un proyecto de Python/Flask.
- Se extrajo el contenido del header de `frontend/pages/dashboard.html` a un nuevo archivo `frontend/pages/header.html`.
- Se extrajo el contenido del footer de `frontend/pages/dashboard.html` a un nuevo archivo `frontend/pages/footer.html`.
- Se modificó `frontend/pages/dashboard.html` para cargar dinámicamente el `header.html` y `footer.html` mediante scripts de JavaScript.
- Se eliminó la información de usuario codificada del `header.html` para permitir la carga dinámica.
- Se creó un archivo `frontend/css/header.css` con los estilos específicos para el header.
- Se eliminaron los estilos del header de `frontend/css/dashboard.css` y se importó el nuevo archivo `header.css`.
- Se refactorizó el CSS del header utilizando la metodología BEM para mejorar la estructura y mantenibilidad.
- Se actualizó `frontend/pages/header.html` para utilizar las nuevas clases BEM.
- Se reemplazó el ícono del header por la imagen del escudo del colegio (`escudo.png`).
- Se ajustaron los estilos en `frontend/css/header.css` para la nueva imagen del logo.
- Se mejoró la estructura del `header.html` añadiendo comentarios, un enlace al dashboard en el logo y atributos de accesibilidad.
- Se ajustaron los estilos del logo en `header.css` para eliminar la decoración de texto del nuevo enlace.
- Se reestructuró el HTML de `header.html` para separar el logo, el título y la sección de usuario, permitiendo un layout más flexible.
- Se actualizó `header.css` para centrar el título y el eslogan en el espacio disponible.
- Se corrigió la ruta de la imagen de fondo en `dashboard.css` para que apunte a `assets/images/fondo.jpg`.
- Se añadió la regla CSS a `frontend/css/header.css` para mostrar "Grado: " antes del número de grado.
- Se aplicó el color `rgba(8, 145, 3, 0.432)` al fondo del footer (`.dashboard-footer`) y a las tarjetas de actividad (`.activity-card`) en `dashboard.css`.
- Se ajustó el tamaño del botón de logout en `frontend/css/header.css` (padding y font-size).
- Se envolvió el contenido de la sección hero en un contenedor (`.hero-card`) con un estilo similar a las tarjetas de actividad en `frontend/pages/dashboard.html` y se le aplicaron los estilos correspondientes en `frontend/css/dashboard.css`.

### Finalización: 14 de septiembre de 2025

## Sesión 5 - 14 de septiembre de 2025
### Objetivos de la sesión:
- 
### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Dependencias no auditadas.
    - Problema de cierre de sesión y carga dinamica de las areas a evaluar (pendiente de Sesión 3).
- Tests: No hay testing framework configurado.
### Finalización: 14 de septiembre de 2025
### Acciones Realizadas:
- Refactorización y organización de los archivos CSS del frontend (`dashboard.css`, `examen.css`, `global.css`, `resultados.css`) en una estructura modular (`base`, `components`, `sections`).
- Eliminación del archivo `frontend/css/styles.css` y sus referencias en los archivos HTML.
- Refactorización de la funcionalidad de "cerrar sesión" en JavaScript para hacerla reutilizable y corrección de su interactividad.
- Personalización del mensaje de bienvenida en el dashboard para incluir el nombre y grado del usuario.
- Aplicación de un color de fondo específico al header, footer y tarjetas.
- Modificación del estilo de `activities-section` para que se vea como un contenedor transparente con borde blanco.
- Revisión de rutas y etiquetas en `frontend//**` para asegurar la compatibilidad con la nueva estructura CSS.

## Sesión 6 - 15 de septiembre de 2025
### Objetivos de la sesión:
- Solucionar el problema de organización de los datos JSON para la inicialización de la base de datos.
### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Dependencias no auditadas.
    - Problema de cierre de sesión y carga dinamica de las areas a evaluar (pendiente de Sesión 3).
- Tests: No hay testing framework configurado.
### Acciones Realizadas:
- Refactorización de la estructura de datos de los archivos JSON de semilla (`usuarios.json`, `cuadernillos.json`, `examenes.json`).
- Creación del modelo `Cuadernillo` en `models.py` para los exámenes estáticos.
- Actualización del script `seed_db.py` para poblar la base de datos con la nueva estructura de datos.
- Creación del script `init_db.py` para la inicialización de la base de datos.
- Corrección de la lógica de relación entre `examenes.json` y `cuadernillos.json`.
### Finalización: 15 de septiembre de 2025

## Sesión 7 - 15 de septiembre de 2025
### Objetivos de la sesión:
- Reorganizar el directorio `frontend/js` para mejorar la modularidad y mantenibilidad.
- Centralizar la funcionalidad de `logout` y la carga dinámica de `header` y `footer` en un único punto de entrada.
- Crear un módulo `timer.js` para la funcionalidad del cronómetro del examen.
- Crear un módulo `utils.js` para funciones de utilidad compartidas.
- Refactorizar los scripts de las páginas para desacoplar la lógica y hacerla más reutilizable.

### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Dependencias no auditadas.
    - Problema de cierre de sesión y carga dinamica de las areas a evaluar (pendiente de Sesión 3).
- Tests: No hay testing framework configurado.

### Acciones Realizadas:
- Se reorganizó la estructura del directorio `frontend/js`, creando subdirectorios `api`, `components`, `pages` y `shared`.
- Se movieron los archivos JavaScript existentes a sus directorios correspondientes dentro de la nueva estructura.
- Se centralizó la lógica de carga del `header` y `footer`, y la funcionalidad de `logout` en el archivo `frontend/js/main.js` para evitar duplicación de código.
- Se eliminó la carga individual de `header` y `footer` de los archivos `dashboard.js` y `login.js`.
- Se creó el módulo `frontend/js/shared/timer.js` para encapsular toda la lógica del cronómetro del examen.
- Se creó el módulo `frontend/js/shared/utils.js` para funciones de utilidad (actualmente vacío, preparado para futuro uso).
- Se refactorizó `frontend/js/pages/exam.js` para importar y utilizar el nuevo módulo `timer.js`.
- Se actualizaron las rutas de los scripts en los archivos HTML (`login.html`, `dashboard.html`, `examen.html`, `resultados.html`) para reflejar la nueva estructura de directorios.
- Se eliminaron las funciones `loadHTML` y `logout` de `auth.js` ya que su funcionalidad fue centralizada en `main.js`.

### Finalización: 15 de septiembre de 2025

## Sesión 8 - 16 de septiembre de 2025
### Objetivos de la sesión:
- Ajustar el modelo `User` para eliminar el campo `email`.
- Corregir la lógica de creación de usuarios administradores en la CLI para solicitar el `codigo` y no el `email`.
- Actualizar la visualización de usuarios administradores en la CLI para no mostrar el `email`.
- Actualizar las dependencias del proyecto (`requirements.txt`).

### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Dependencias no auditadas.
    - Problema de cierre de sesión y carga dinamica de las areas a evaluar (pendiente de Sesión 3).
- Tests: No hay testing framework configurado.

### Acciones Realizadas:
- Se eliminó el campo `email` del modelo `User` en `backend/models.py` para que no sea un campo requerido.
- Se modificó el comando `admin add` en `backend/server.py` para solicitar el `codigo` del nuevo administrador en lugar del `email`.
- Se actualizó la creación de usuarios administradores en `backend/server.py` para pasar el `codigo` al constructor del modelo `User`.
- Se eliminó la visualización del campo `email` al listar usuarios administradores en el comando `admin show` de `backend/server.py`.
- Se actualizaron las dependencias en `requirements.txt`.

### Próximo a implementar:
- Revisión de usuarios conectados.
- Monitoreo del tráfico de usuarios.
- Desconexión de usuarios duplicados.
- Todas estas funcionalidades serán gestionadas a través del panel de administración de Flask-Admin.

### Finalización: 16 de septiembre de 2025

## Sesión 9 - 17 de septiembre de 2025
### Objetivos de la sesión:
- Corregir el error `Uncaught SyntaxError: redeclaration of import state` en `ui.js`.
### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Dependencias no auditadas.
    - Problema de cierre de sesión y carga dinamica de las areas a evaluar (pendiente de Sesión 3).
- Tests: No hay testing framework configurado.
### Acciones Realizadas:
- Se identificó que el archivo `frontend/js/examen/ui.js` contenía código duplicado, causando el error de redeclaración de importaciones.
- Se corrigió el archivo `frontend/js/examen/ui.js` eliminando el contenido duplicado.
### Finalización: 17 de septiembre de 2025
- mejoras y tareas para el futuro, basadas en la deuda técnica actual y
  el trabajo que hemos realizado:

   1. Implementar Herramientas de Calidad de Código y Testing:
   2. Resolver Deuda Técnica Pendiente de Sesiones Anteriores:
   3. Mejorar el Monitoreo de Tráfico de Usuarios en el Admin Panel:
   4. Refinar la Gestión de Sesiones (Seguridad):
   5. Habilitar Gestión de Exámenes desde el Panel Admin:
   6. Mejorar Gestión de Sesiones desde el Panel Admin:

## Sesión 10 - 20 de septiembre de 2025
### Objetivos de la sesión:
- Solucionado bug de visibilidad de exámenes en el dashboard.
- Implementado flujo de inicio de examen con `session_id` real.
- Nuevo bug introducido al iniciar el examen (falta de persistencia de preguntas).
### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Dependencias no auditadas.
    - Problema de cierre de sesión y carga dinamica de las areas a evaluar (pendiente de Sesión 3).
- Tests: No hay testing framework configurado.
### Acciones Realizadas:
- Ajuste de la lógica en `backend/routes/web_main.py` (`get_examenes_por_grado`) para considerar `UserCuadernilloActivation` y `ExamAvailability`.
- Modificación de `frontend/js/pages/dashboard.js` para eliminar la lógica de carga y renderización de resultados recientes.
- Eliminación de `console.log`s de depuración en `frontend/js/pages/dashboard.js`.
- `backend/routes/web_main.py` (`validar_usuario`) ahora devuelve un `session_id` real al iniciar sesión.
- `backend/routes/api.py` (`/examenes/<area_id>/iniciar`) ahora asocia el `cuadernillo_id` a la `ActiveSession` y devuelve el `session_id`.
- `backend/routes/api.py` (`/api/examen/<session_id>`) se añadió para obtener las preguntas de un examen activo usando el `session_id`.
- `frontend/js/pages/dashboard.js` ahora llama a la API `startExam` para obtener un `session_id` real.
- `frontend/js/pages/exam.js` ahora obtiene el `userCodigo` del `localStorage` para finalizar el examen.
### Finalización: 20 de septiembre de 2025

## Sesión 11 - 20 de septiembre de 2025
### Objetivos de la sesión:
- Implementar listado de cuadernillos.
- Refactorizar la lógica de inicio y finalización de exámenes.
- Mejorar el manejo de rutas de banco de preguntas.
- Ajustar la configuración del examen en el frontend.

### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Dependencias no auditadas.
    - Problema de cierre de sesión y carga dinamica de las areas a evaluar (pendiente de Sesión 3).
- Tests: No hay testing framework configurado.
### Finalización: [PENDIENTE]

## Sesión 12 - 15 de octubre de 2025
### Objetivos de la sesión:
- Corregir bug en el envío de resultados del examen (`guardarIntento`).
- Pausar la implementación de la funcionalidad de guardado en el backend.
- Documentar el plan de implementación del backend en el `roadmap.md`.

### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica: Funcionalidad de exámenes incompleta, falta de herramientas de calidad, documentación incompleta.
- Tests: No hay testing framework configurado.

### Acciones Realizadas:
- Se corrigió la llamada a `guardarIntento` en `cuestionario.js` para pasar los datos de sesión correctos.
- Se solucionó un `TypeError` en `storage.js` simplificando la función `guardarIntento`.
- Se comentó la llamada a `guardarIntento` en `cuestionario.js` para desactivar temporalmente la función.
- Se actualizó `roadmap.md` con el plan detallado para la implementación del backend.
- Se guardaron todos los cambios en el repositorio.

### Finalización: 15 de octubre de 2025

## Sesión 13 - 7 de diciembre de 2025
### Objetivos de la sesión:
- Iniciar una nueva sesión de trabajo y establecer el contexto.
### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta.
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada.
    - Dependencias no auditadas.
    - Problema de cierre de sesión y carga dinamica de las areas a evaluar (pendiente de Sesión 3).
- Tests: No hay testing framework configurado.
### Acciones Realizadas:
- Se implementó el endpoint backend `/api/examen/<session_id>/finalizar`, incluyendo extracción de datos, validación (sesión activa, usuario, cuadernillo, conteo de respuestas), lógica de calificación (lectura de `respuestas.json` para obtener respuestas correctas), almacenamiento en base de datos (`ExamAnswer` y `ExamResult`) y limpieza de sesión.
- Se resolvieron problemas de migración de la base de datos, re-inicializando la base de datos y aplicando una migración consolidada para todos los modelos.
- Se creó y refino `backend/data/generador_respuestas.py` para generar un único archivo `all_exam_answers.json` a partir de archivos `.txt` de respuestas en `backend/data/respuesta/`.
- Se actualizó el endpoint `/api/examen/<session_id>/finalizar` para utilizar el archivo consolidado `all_exam_answers.json` para la búsqueda de respuestas correctas.
- Se actualizó `docs/development/exam_answers_flow.md` con instrucciones detalladas sobre cómo agregar respuestas correctas.
- Se modificó `data/resultados/conversor.py` para eliminar rutas codificadas y permitir la selección interactiva de directorios de entrada/salida.
- Se limpió y actualizó `.gitignore` para ignorar correctamente los archivos generados y temporales.
### Finalización: 7 de diciembre de 2025

## Sesión 14 - 8 de diciembre de 2025
### Objetivos de la sesión:
- Implementar la funcionalidad de recargar imagen en la interfaz del examen (frontend).
- Desarrollar la página web para subir respuestas de exámenes (frontend y backend), incluyendo la calificación de 0 a 5.

### Acciones Realizadas:
- **Frontend:**
    - Se añadió la función `recargarImagen()` en `frontend/js/examen/cuestionario.js`.
    - Se modificó `frontend/js/examen/ui.js` para declarar `doRecargarImagen`, actualizar la función `setup` para recibir `recargarImagen`, e integrar un botón de "Recargar Imagen" (con icono SVG y estilo `btn-secondary`) junto al temporizador en la función `renderizarImagen`.
    - Se modificó `frontend/js/examen/examen-main.js` para importar y pasar `recargarImagen` a `setupUI`.
    - Se corrigió un error `Uncaught SyntaxError: Unexpected token 'export'` en `frontend/js/examen/ui.js` eliminando una definición de función duplicada.
    - Se creó el directorio `frontend/js/results/`.
    - Se creó el archivo `frontend/pages/upload_answers.html` con una estructura básica para la subida de archivos, utilizando estilos existentes e incluyendo un campo para el ID del examen.
    - Se añadió la función `uploadExamAnswers(formData)` en `frontend/js/api/index.js` para manejar la llamada a la API de subida de respuestas.
    - Se creó el archivo `frontend/js/pages/upload_answers.js` para la lógica frontend del formulario de subida, que incluye verificación de sesión, validación de tipo de archivo, manejo de estados de carga, y el uso de `uploadExamAnswers` para comunicarse con el backend, mostrando la calificación recibida.
- **Backend:**
    - Se añadió el endpoint `/api/upload_exam_answers` (POST) en `backend/routes/api.py`.
    - Este endpoint maneja la recepción de archivos (JSON/CSV), la validación de los datos (`examId`, `userCodigo`, formato del archivo), el procesamiento del contenido del archivo para extraer las respuestas, la carga de las respuestas correctas desde `backend/data/all_exam_answers.json`, la calificación de las respuestas del usuario en una escala de 0 a 5, y el almacenamiento detallado de `ExamAnswer` y `ExamResult` en la base de datos (incluyendo el número de intento).

### Estado inicial:
- Calidad de código: No hay checks automáticos configurados.
- Deuda técnica:
    - Funcionalidad de Exámenes Incompleta (específicamente la parte del frontend para la carga dinámica de áreas a evaluar).
    - Falta de Herramientas de Calidad y Testing.
    - Documentación Incompleta/Desorganizada (aún falta `CODE_STYLE.md` y organización general).
    - Dependencias no auditadas.
    - Problema de cierre de sesión.
- Tests: No hay testing framework configurado.

### Próximo a implementar:
- Realizar pruebas manuales exhaustivas de la funcionalidad de subida de respuestas (frontend y backend).
- Ajustar los estilos de `frontend/pages/upload_answers.html` si es necesario.
- Considerar la visualización de un historial de subidas o resultados en el frontend.
- Mejorar la robustez del manejo de errores y mensajes al usuario.

### Finalización: lunes, 8 de diciembre de 2025