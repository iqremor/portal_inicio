# Plan PRISMA: Transparencia y Análisis de Resultados

**Estado:** [BORRADOR]
**Fecha de Creación:** 19 de marzo de 2026
**Objetivo Principal:** Implementar la visualización grupal de resultados, la revisión detallada para estudiantes y la exportación masiva de datos.

---

## 📋 Fase 1: Visualización Grupal (Panel Admin/Docente) - ¡PRIORIDAD!

_Objetivo: Permitir al docente ver el panorama general del rendimiento por curso y materia._

**Paso a paso para lograrlo:**

1.  **Backend (API)**: Crear un endpoint `/api/admin/resultados/grado/<grado>/examen/<cuadernillo_id>` que devuelva la lista de estudiantes inscritos y sus resultados asociados.
2.  **Lógica de Consulta**: Realizar un JOIN entre `User`, `ExamResult` y `Cuadernillo` para consolidar:
    - Nombre completo del estudiante.
    - Nota del último intento (o promedio).
    - Cantidad total de intentos realizados por ese estudiante en ese examen específico.
3.  **Interfaz Admin (UI)**:
    - Crear una nueva vista en el Panel Administrativo llamada "Reporte por Grado".
    - Implementar selectores dinámicos: Primero seleccionar **Grado** (6°-11°), luego filtrar **Examen** disponible para ese grado.
    - Renderizar una tabla con las columnas: `Estudiante`, `Nota Final`, `Intentos`.

---

## 🛠️ Fase 2: Revisión de Respuestas (UX/UI Estudiante)

_Objetivo: Que el estudiante aprenda de sus errores._

1.  **Backend**: Modificar el endpoint de resultados para incluir el mapa de respuestas correctas vs marcadas.
2.  **Frontend (UI)**: Crear componente "Acordeón de Revisión" en `resultados.html`.
3.  **Lógica**: Implementar visualización de la imagen original con resaltado de la opción correcta y la opción elegida por el usuario.

---

## 📊 Fase 3: Exportación de Datos (Admin)

_Objetivo: Facilitar la gestión de reportes masivos._

1.  **Backend**: Crear endpoint para generar archivo Excel/CSV en memoria basado en la vista de la Fase 1.
2.  **Utilidad**: Desarrollar `backend/utils/export_utils.py`.
3.  **Admin UI**: Añadir botón "Descargar Excel" en la tabla de Visualización Grupal.

---

## 📝 Notas de Seguimiento

- _Sesión 26_: Re-priorización del plan. Se establece la Visualización Grupal como el primer objetivo técnico.
