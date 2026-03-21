# Plan PRISMA: Transparencia y Análisis de Resultados

**Estado:** [EN_PROGRESO]
**Fecha de Actualización:** 21 de marzo de 2026
**Objetivo Principal:** Implementar la visualización grupal de resultados, la revisión detallada para estudiantes y la exportación masiva de datos en formatos profesionales.

---

## ✅ Fase 1: Visualización Grupal (Panel Admin/Docente) - COMPLETADA

_Objetivo: Permitir al docente ver el panorama general del rendimiento por curso y materia._

- **Backend (API)**: Endpoint `/api/admin/resultados/grado/<grado>/examen/<cuadernillo_id>` implementado.
- **Interfaz Admin (UI)**: Vista "Reporte por Grado" con selectores dinámicos y tabla de resultados activa.

---

## 🛠️ Fase 2: Revisión de Respuestas (UX/UI Estudiante) - PRÓXIMA

_Objetivo: Que el estudiante aprenda de sus errores visualizando el detalle de su prueba._

1.  **Backend**: Modificar el endpoint de resultados para incluir el mapa de respuestas correctas vs marcadas y las URLs de las imágenes correspondientes.
2.  **Frontend (UI)**: Crear componente "Panel de Revisión" en `resultados.html`.
3.  **Lógica**: Implementar visualización de la imagen original con resaltado de la opción correcta y la opción elegida por el usuario.

---

## 📊 Fase 3: Exportación de Datos Profesional (Admin) - PLANIFICADA

_Objetivo: Facilitar la gestión de reportes masivos para planillas de notas._

1.  **Tecnología**: Uso de `openpyxl` para generar archivos **Excel (.xlsx)** nativos.
2.  **Funcionalidad**:
    - Exportación con formato: Celdas con colores según la nota (rojo para < 3.0, verde para >= 3.0).
    - Cálculo automático de promedios grupales en el archivo.
3.  **Admin UI**: Añadir botón "Descargar Excel (.xlsx)" en la tabla de Visualización Grupal.

---

## 📝 Notas de Seguimiento

- _Sesión 27_: Implementación exitosa de la Fase 1. Se detectaron y corrigieron errores de serialización.
- _Sesión 28_: Prioridad en Fase 2 para mejorar el feedback pedagógico al estudiante.
