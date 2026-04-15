# Historial de Cambios

## Sesión 37 - 15 de abril de 2026

### Objetivos de la sesión:

- Finalizar la **Fase 4 del Plan NATURA**: Implementar la API de Resumen de Desempeño.
- Refactorizar la carga de puntajes en los lobbies de simulacro para mejorar la eficiencia y seguridad.
- Validar el estado inicial del proyecto tras la sesión anterior.

### Estado inicial:

- **Calidad de código:** Validada por ESLint y Flake8 en la Sesión 36.
- **Funcionalidad:** Fases 1, 2 y 3 del Plan NATURA completadas. Pendiente integración de datos reales en los paneles de puntaje.
- **Tests:** Pendiente implementación de framework de testing.

### Acciones Realizadas:

- **Backend (API):** Creación del endpoint `/api/usuario/<codigo>/resumen_notas` en `routes/api.py`. Este endpoint agrupa las mejores notas por área y grado del estudiante, validando la sesión activa.
- **Frontend (Lógica):** Refactorización completa de `simulacro.js` y `simulacro_unal.js`.
  - Se migró del endpoint administrativo (inseguro para el cliente) al nuevo endpoint de resumen de usuario.
  - Se optimizó el mapeo de puntajes por área (`exam.area`) en lugar de IDs, aumentando la resiliencia del sistema.
- **Plan NATURA:** Actualización de `docs/plans/plan_natura.md` marcando todas las fases como COMPLETADAS.
- **Navegación (Examen):** Implementación de un botón condicional "Volver al Simulacro" en `frontend/js/examen/ui.js` que aparece solo si el estudiante ya cuenta con al menos un intento previo, permitiendo una salida segura tras una anulación.
- **Plan FOCUS (Gestión de Usuarios):**
  - Inicio del plan para la gestión integral de la base de datos de usuarios.
  - Creación del motor de sincronización masiva en `backend/utils/user_management.py` con soporte para Excel y CSV.
  - Implementación de la vista `GestionUsuariosView` en el panel administrativo, incluyendo la descarga de plantillas oficiales y alta individual con contraseña automática.

### Estado final:

- **Calidad de código:** 100% validado por Flake8 (backend). Frontend funcional con el nuevo flujo de datos.
- **Funcionalidad:** Ecosistema NATURA 100% operativo. Los estudiantes ahora ven sus mejores puntajes actualizados en tiempo real en los lobbies de simulacro.
- **Pendiente:** Iniciar el siguiente plan estratégico o implementar el framework de testing.

### Finalización: miércoles, 15 de abril de 2026

---

## Sesión 36 - 14 de abril de 2026

### Objetivos de la sesión:

- Resolver la deuda técnica de calidad: Corregir la configuración de ESLint (Prettier plugin).
- Continuar con la **Fase 2/3 del Plan NATURA**: Refinar el flujo de navegación entre el Lobby de Simulacro y el Examen.
- Validar la persistencia de la configuración `SHOW_CORRECT_ANSWERS` implementada en la sesión anterior.

### Estado inicial:

- **Calidad de código:** Error de configuración en ESLint detectado en la Sesión 35.
- **Funcionalidad:** Control administrativo de visibilidad de respuestas operativo. Plan NATURA en Fase 2/3.
- **Tests:** Pendiente implementación de framework de testing.

### Acciones Realizadas:

- **Calidad:** Corrección de advertencias ESLint (`no-unused-vars`) en `respuestas.js` y `simulacro.js`.
- **Backend (Admin):** Integración de controles globales para los módulos Preicfes, Preunal y Laboratorios en `ConfigExamenesView` (`admin.py`).
- **Frontend (Admin):** Actualización de la plantilla `config_examenes.html` con interruptores (switches) dinámicos para la visibilidad de módulos.
- **Plan NATURA:** Fase 3 (Control Administrativo Dinámico) marcada como COMPLETADA. Validación del flujo de retorno al lobby en la Fase 2.

### Estado final:

- **Calidad de código:** 100% validado por ESLint y formateadores.
- **Funcionalidad:** Control administrativo total sobre la visibilidad de módulos en el Dashboard. Flujo de navegación NATURA estabilizado.
- **Pendiente:** Fase 4 del Plan NATURA (API de Resumen de Desempeño).

### Finalización: martes, 14 de abril de 2026

---

## Sesión 35 - 8 de abril de 2026

### Objetivos de la sesión:

- Implementar un botón de control administrativo para habilitar o deshabilitar la visualización de respuestas correctas para los estudiantes.
- Asegurar que el botón "ver respuestas" en la página de resultados sea dinámico y dependa de la configuración del administrador.

### Acciones Realizadas:

- **Backend (Modelos):** Consolidación de `seed_data` en `models.py` y adición de la clave de configuración `SHOW_CORRECT_ANSWERS`.
- **Backend (Admin):** Actualización de `ConfigExamenesView` en `admin.py` y su respectiva plantilla `config_examenes.html` para incluir un interruptor (switch) de control.
- **Backend (API):** Creación del endpoint `/api/configuracion/examen` con limpieza de caché de sesión (`expire_all`) para garantizar datos en tiempo real.
- **Frontend (UI):** Ocultación por defecto del botón de respuestas en `resultados.html` mediante CSS prioritario (`display: none !important`).
- **Frontend (Lógica):** Implementación de `checkAnswersButtonVisibility` en `results.js` con detección robusta de `sessionId` y manejo dinámico de visibilidad.
- **Calidad:** Formateo automático de archivos mediante pre-commit hooks (Black, Prettier, Trailing Whitespace).

### Estado final:

- **Calidad de código:** Validada por formateadores. Error de configuración de ESLint (Prettier plugin) detectado para corrección futura.
- **Funcionalidad:** Control administrativo de visibilidad de respuestas operativo al 100%.
- **Pendiente:** Corregir la configuración de ESLint en el entorno de desarrollo para permitir hooks completos.

### Finalización: miércoles, 8 de abril de 2026

---

## Sesión 34 - 25 de marzo de 2026

### Objetivos de la sesión:

- Resolver la **deuda técnica crítica** de la Sesión 33: Race condition en el header y bug visual del footer.
- Validar y corregir la redirección de los botones de "Empezar Simulacro" en los lobbies Preicfes/Preunal.
- Continuar con la **Fase 3 del Plan NATURA**: Control Administrativo Dinámico (Flags de visibilidad).

### Acciones Realizadas:

- **Frontend:** Implementación de `MutationObserver` en `simulacro.js` para garantizar la carga de datos del usuario y funcionalidad de logout independientemente del timing de inyección del header.
- **Backend (API):** Reescritura robusta de `routes/api.py` para evitar errores de atributos inexistentes (`getattr`) y asegurar la compatibilidad de campos (`questions`/`preguntas`).
- **Lógica de Negocio:** Implementación de cálculo dinámico del tiempo límite por examen basado en `EXAM_QUESTIONS_COUNT` y `EXAM_TIMER_DURATION`.
- **Backend (Rutas):** Restauración del endpoint de intentos (`/attempts`) y creación del endpoint seguro para mejores notas por usuario.

### Estado final:

- **Calidad de código:** API protegida contra fallos internos y frontend con detección reactiva de elementos.
- **Funcionalidad:** Flujo completo de inicio de examen desde el lobby Saber-IEM validado.
- **Pendiente:** Replicar la robustez del logout y sincronización en otros lobbies específicos.

### Finalización: miércoles, 25 de marzo de 2026

---

## Sesión 33 - 24 de marzo de 2026

### Objetivos de la sesión:

- Iniciar la **Fase 3 del Plan NATURA**: Control Administrativo Dinámico.
- Implementar flags de visibilidad para módulos (`PREICFES_ENABLED`, `PREUNAL_ENABLED`) en la configuración global.
- Crear la interfaz de control (toggles) en el panel de Ajustes Globales para el administrador.
- Validar la visibilidad condicional de módulos en el Dashboard del estudiante.

### Acciones Realizadas:

- **Estilos:** Rediseño total de `simulacro.css` eliminando tonos amarillos y aplicando la paleta verde orgánica (`--accent-color`).
- **Componentes:** Sincronización de Header y Footer en los Lobbies mediante carga asíncrona optimizada (`loadFragments`).
- **UI/UX:** Integración de FontAwesome 6, eliminación de botones redundantes y mejora de tarjetas de descripción.
- **Lógica:** Implementación inicial de `updateUI` en `simulacro.js` y `simulacro_unal.js` para mostrar datos de usuario (con delay de sincronización).
- **Calidad:** Estandarización de clases de footer (`.dashboard-footer`) y limpieza de selectores CSS.

### Estado final:

- **Calidad de código:** 100% validado por hooks (Prettier, ESLint, Flake8).
- **Funcionalidad:** Lobbies visualmente integrados al ecosistema NATURA.
- **Pendiente (Crítico):**
  - Corregir inconsistencia en la carga de nombre/grado en el header (race condition).
  - Validar redirección de botones de inicio de examen (Fase 2 Plan NATURA).
  - Resolver bug visual de "caja verde" en el contenedor del footer.

### Finalización: martes, 24 de marzo de 2026

---

## Sesión 32 - 23 de marzo de 2026 (12:00 PM)

### Objetivos de la sesión:

- Actualizar el estado del **Plan NATURA** (Fase 1 completada, Plan en progreso).
- Resolver deuda técnica de calidad (Flake8 en Backend).
- Iniciar la **Fase 2 del Plan NATURA**: Navegación por Componentes (Lobby de Simulacro).
- Implementar la visualización de notas por componente en el Lobby.

### Acciones Realizadas:

- **Calidad:** Limpieza total de advertencias Flake8 en el backend (0 advertencias).
- **Plan NATURA (Fase 2):** Implementación de los Lobbies para Preicfes y Preunal.
  - Creación de `simulacro.html` y `simulacro_unal.html` con integración de headers/footers dinámicos.
  - Desarrollo de `simulacro.js` y `simulacro_unal.js` para carga dinámica de áreas y puntajes.
  - Sincronización de estilos orgánicos en `simulacro.css`.
- **Frontend:** Ajuste de redirección en `dashboard.js` para conectar las tarjetas del dashboard con los nuevos lobbies.
- **Backend (Web Test):** Actualización de rutas para servir los nuevos archivos de simulacro.

### Estado final:

- **Calidad de código:** 100% validado (Flake8 limpio).
- **Funcionalidad:** Fase 2 del Plan NATURA completada. Sistema de lobbies operativo y navegable.

### Finalización: lunes, 23 de marzo de 2026

---

## Sesión 31 - 23 de marzo de 2026 (11:00 AM)

### Objetivos de la sesión:

- Finalizar la **Fase 3 del Plan FOCUS**: Validación del frontend y UX dinámico.
- Verificar el comportamiento de la API frente a límites de preguntas y bancos reducidos.
- Ejecutar controles de calidad (ESLint, Flake8) sobre los cambios de la sesión anterior.

### Estado inicial:

- **Calidad de código:** 100% validado en sesión 30.
- **Deuda técnica:** Validar la visualización del progreso del examen con el nuevo límite dinámico.
- **Tests:** Pendiente validación manual del ciclo completo con configuración variable.

### Finalización: lunes, 23 de marzo de 2026

- **Calidad de código:** Validada con Flake8 y ESLint.
- **Funcionalidad:** Fase 1 del Plan NATURA completada (Dashboard dinámico y modular). Plan FOCUS marcado como COMPLETADO.
- **Métricas:** Control de visibilidad por grado habilitado para 3 módulos.

---

## Sesión 26 - 19 de marzo de 2026

### Objetivos de la sesión:

- Corregir el bug del botón recargar imagen.
- Mejorar la visualización de la página de resultados.
- Implementar la funcionalidad de reintento directo de examen.
- Crear el sistema de gestión de planes estratégicos.

### Acciones Realizadas:

- **Examen:** Corregido bug del botón "Recargar" en cuestionario.js y ui.js. Ahora actualiza solo la imagen (con cache-buster) sin reiniciar el temporizador ni el bloqueo del botón "Siguiente".
- **Resultados:**
  - Se ajustó el umbral de aprobación al 60% en results.js.
  - Se simplificó la visualización de respuestas (solo número).
  - El campo "Puntaje" se renombró a "Nota Final" con formato de un decimal.
  - Se implementó el botón "Volver a intentar" con redirección automática al mismo examen.
  - Se unificó el estilo de los botones de acción con el estilo del botón de cierre de sesión.
- **Backend:** Se modificó finalizar_examen en api.py para incluir el id del cuadernillo en la respuesta.
- **Documentación y Planes:**
  - Se creó el directorio docs/plans/.
  - Se definió el **Plan PRISMA** (docs/plans/plan_prisma.md) para la visualización grupal de notas y revisión de errores.
  - Se actualizó GEMINI.md para incluir el protocolo de gestión de planes estratégicos.

### Estado final:

- Calidad de código: Git hooks validados (Prettier, Flake8, ESLint).
- Funcionalidad: Flujo de resultados y reintento optimizado. Sistema de planes activo.

### Finalización: jueves, 19 de marzo de 2026

## Sesión 27 - 21 de marzo de 2026

### Objetivos de la sesión:

- Implementar la **Fase 1 del Plan PRISMA**: Visualización grupal de resultados en el Panel Admin.
- Resolver errores técnicos de serialización y firma de funciones en el panel administrativo.

### Acciones Realizadas:

- **Backend (API):** Creación del endpoint /api/admin/resultados/grado/<grado>/examen/<cuadernillo_id> en backend/routes/api.py con autenticación híbrida (API Session y Flask-Admin Session).
- **Panel Admin:** Implementación de la vista ReporteGradoView en backend/admin.py y registro en el panel.
- **Frontend Admin:** Creación del template backend/templates/admin/reporte_grado.html con selectores dinámicos de grado/examen y exportación a CSV.
- **Calidad:** Limpieza de importaciones no utilizadas en backend/app.py y corrección de errores de serialización JSON en la plantilla administrativa.

### Estado final:

- **Calidad de código:** Linting limpio tras correcciones automáticas de Git hooks.
- **Funcionalidad:** Fase 1 del Plan PRISMA completada y probada (manualmente).

### Finalización: sábado, 21 de marzo de 2026

## Sesión 28 - 21 de marzo de 2026

### Objetivos de la sesión:

- **Estabilidad del Servidor:** Optimizar el servidor de producción (Waitress) y corregir errores de apagado (socket errors).
- **Plan PRISMA (Fase 2):** Implementar la revisión detallada de respuestas para los estudiantes en una vista independiente.
- **Mejoras UI/UX:** Refinar la página de resultados con la Nota Final gigante y estadísticas centradas.

### Acciones Realizadas:

- **Servidor:** Se integró Waitress en el ServerManager para ejecución en background. Se implementó un cierre diferido (Timer) para solucionar el error WinError 10038 y se optimizó la concurrencia con 12 hilos.
- **Backend:** Se enriqueció el endpoint /api/examen/<session_id>/finalizar para incluir el mapa de revisión pedagógica (imágenes, respuesta correcta vs elegida). Se robusteció la lógica de calificación para manejar respuestas nulas como NONE.
- **Frontend (Resultados):** Rediseño de la sección score-summary con layout horizontal, Nota Final prominente y estadísticas en columna con centrado absoluto.
- **Fase 2 PRISMA:** Creación de la página respuestas.html, su estilo CSS y lógica JS para mostrar una tabla detallada de errores/aciertos, filtrando automáticamente las preguntas no marcadas.
- **Calidad:** Corrección de errores de sintaxis en results.js y paso exitoso de pre-commit hooks (black, prettier, flake8, eslint).

### Estado final:

- **Calidad de cÃ³digo:** 100% validado por herramientas de linting y formateo.
- **Funcionalidad:** Fase 2 del Plan PRISMA completada. Servidor de producciÃ³n estable y controlable desde el menÃº.
- **Pendiente:** Fase 3 del Plan PRISMA (ExportaciÃ³n a Excel).

### FinalizaciÃ³n: sÃ¡bado, 21 de marzo de 2026

## SesiÃ³n 29 - 23 de marzo de 2026

### Objetivos de la sesiÃ³n:

- Implementar la **Fase 3 del Plan PRISMA**: ExportaciÃ³n de reportes grupales a Excel (.xlsx) con formato profesional.
- Integrar la librerÃ­a `openpyxl` para la generaciÃ³n de archivos.
- Configurar celdas con colores dinÃ¡micos (verde/rojo) y fÃ³rmulas de promedio en el reporte generado.

### Estado inicial:

- **Calidad de cÃ³digo:** 100% linting validado.
- **Deuda tÃ©cnica:** Pendiente la integraciÃ³n de exportaciÃ³n masiva en el panel admin.
- **Tests:** Pruebas manuales de las fases 1 y 2 exitosas.

### Acciones Realizadas:

- **Dependencias:** InstalaciÃ³n e integraciÃ³n de `openpyxl` en el proyecto.
- **Backend (Panel Admin):** ImplementaciÃ³n del mÃ©todo `exportar_excel` en `ReporteGradoView` (`backend/admin.py`).
- **Formato Excel:** ConfiguraciÃ³n de estilos profesionales:
  - Encabezados con fondo azul y texto blanco.
  - Celdas de nota con colores condicionales (Verde >= 3.0, Rojo < 3.0).
  - CÃ¡lculo de promedio grupal al final de la tabla con formato dinÃ¡mico.
  - Ajuste automÃ¡tico de ancho de columnas.
- **Frontend Admin:** AdiciÃ³n del botÃ³n "Exportar Excel" en el template `reporte_grado.html` y conexiÃ³n con el endpoint del servidor.
- **Plan PRISMA:** ActualizaciÃ³n del plan a estado **[COMPLETADO]**.

### Estado final:

- **Calidad de cÃ³digo:** 100% validado (Flake8 limpio).
- **Funcionalidad:** Plan PRISMA finalizado exitosamente. ExportaciÃ³n a Excel robusta y formateada.

### FinalizaciÃ³n: lunes, 23 de marzo de 2026

## SesiÃ³n 30 - 23 de marzo de 2026

### Objetivos de la sesiÃ³n:

- Implementar la **Fase 1 y 2 del Plan FOCUS**: ConfiguraciÃ³n dinÃ¡mica de la cantidad de preguntas del examen.
- Modificar el panel administrativo para incluir el ajuste global de preguntas.
- Actualizar la API de generaciÃ³n de exÃ¡menes para respetar el lÃ­mite configurado.

### Acciones Realizadas:

- **Backend (Admin):** ActualizaciÃ³n de `ConfigExamenesView` en `backend/admin.py` para soportar `EXAM_QUESTIONS_COUNT`.
- **Frontend (Admin):** AdiciÃ³n del campo "Cantidad de Preguntas por Examen" en el formulario de ajustes globales (`backend/templates/admin/config_examenes.html`).
- **Backend (API):** RefactorizaciÃ³n de `get_exam_questions_by_session` en `backend/routes/api.py` para leer dinÃ¡micamente el nÃºmero de preguntas a presentar desde la base de datos.
- **Calidad:** VerificaciÃ³n de lÃ³gica de fallback (mÃ­nimo 10 preguntas si no existe configuraciÃ³n) y manejo de bancos con menos preguntas de las configuradas.

### Estado final:

- **Calidad de cÃ³digo:** 100% validado.
- **Funcionalidad:** ImplementaciÃ³n del Plan FOCUS al 80% (pendiente validaciÃ³n final en entorno real).

### FinalizaciÃ³n: lunes, 23 de marzo de 2026

## SesiÃ³n 31 - 26 de marzo de 2026

### Objetivos de la sesiÃ³n:

- Corregir el fallo en la visualizaciÃ³n de resultados en `resultados.html`.
- Sincronizar el backend y frontend para el cÃ¡lculo preciso de la nota y el desglose de respuestas (correctas, incorrectas y sin marcar).
- Optimizar el flujo de finalizaciÃ³n del examen para incluir el tiempo usado.

### Acciones Realizadas:

- **Backend (API):** RefactorizaciÃ³n del endpoint `/api/examen/<session_id>/finalizar` en `backend/routes/api.py`. Se implementÃ³ una lÃ³gica de conteo robusta que distingue entre respuestas vÃ¡lidas (incorrectas) y casillas vacÃ­as (sin marcar).
- **Servidor:** Corregido el comando `production` en el menÃº interactivo de `backend/server.py` para vincularse a todas las interfaces (`0.0.0.0`), permitiendo el acceso desde cualquier dispositivo en la red local.
- **Frontend (API):** SincronizaciÃ³n de `submitExam` en `frontend/js/api/index.js` para enviar el objeto de respuestas y el tiempo transcurrido.
- **Frontend (Examen):** ActualizaciÃ³n de `frontend/js/pages/exam.js` para capturar las respuestas en formato JSON, calcular el tiempo usado mediante el `Timer` y redirigir a `resultados.html`.
- **Frontend (Resultados):** Ajuste de `frontend/js/pages/results.js` para renderizar dinÃ¡micamente el anillo de progreso, la nota final (escala 0.0-5.0) y las estadÃ­sticas detalladas.
- **Calidad:** Paso exitoso de los hooks de pre-commit (Black, Prettier, Flake8).

### Estado final:

- **Calidad de cÃ³digo:** 100% validado y formateado.
- **Funcionalidad:** Flujo de examen completo y visualizaciÃ³n de resultados 100% operativa y precisa.

### FinalizaciÃ³n: jueves, 26 de marzo de 2026

## Sesión 32 - 29/03/2026 09:11

### Objetivos de la sesión:

- Validación Fase 3 Plan FOCUS (Admin Panel vs UI).
- Integración de mejoras UX desde prototipos.
- Optimización de API (random.sample).
- Limpieza de deuda técnica (archivos de prototipo).

### Estado inicial:

- Calidad de código: Hooks configurados (Black, Prettier, Flake8).
- Deuda técnica: Falta de tests automáticos para flujo Admin -> UI.
- Tests: Cobertura manual verificada en Sesion 31.

### Acciones Realizadas:

- **Panel de Admin (Configuración):** Se eliminó la sección obsoleta de "Gestión de Módulos (Portal Estudiantil)" de `backend/templates/admin/config_examenes.html`, centralizando dicha funcionalidad en su panel dedicado.
- **Panel de Admin (Reportes):** Se implementó el botón "Limpiar Notas" en `backend/templates/admin/reporte_grado.html` para permitir el borrado masivo de resultados por grado y área con confirmación de seguridad.
- **Backend (API):**
  - Se optimizó el endpoint `finalizar_examen` para devolver `id`, `numAttempts` y `area_id`.
  - Se implementó una búsqueda ultra-flexible de áreas ignorando mayúsculas, espacios y guiones bajos.
- **Frontend (Examen/Resultados):**
  - Se habilitó el botón "Volver a Intentar" en la página de resultados, con validación dinámica de intentos restantes.
  - Se corrigió la comparación de intentos en `ui.js` forzando conversión a enteros para evitar bloqueos erróneos.
  - Se implementó auto-inicio de examen en el frontend para recuperar sesiones inactivas (error 400/404).
  - Se sincronizó la constante de intentos predeterminada a 5 en `constants.js`.
- **Seguridad e Intentos:** Se unificó el valor de seguridad (fallback) para `numAttempts` a **1** en todo el sistema (Backend: `api.py`, `admin.py`; Frontend: `constants.js`, `results.js`) para asegurar un comportamiento restrictivo y coherente ante la ausencia de configuración dinámica en el panel administrativo.
- **Correcciones:** Se resolvió el error `NameError: jsonify` en `backend/admin.py` y se actualizó la lógica de `fetch` en el frontend para mayor estabilidad.

### Estado final:

- **Calidad de código:** Validado por pre-commit (Black, Prettier, Flake8).
- **Funcionalidad:** Flujo de examen 100% robusto, con gestión de intentos dinámica y sincronizada con el panel administrativo.

### Finalización: domingo, 29 de marzo de 2026
