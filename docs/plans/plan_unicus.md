# 🎯 Plan UNICUS: Asignación Flexible y Banco General de Cuadernillos

**Estado:** `[EN_PROGRESO]`
**Fecha de Actualización:** 16 de abril de 2026
**Objetivo Principal:** Evolucionar la gestión de disponibilidad hacia un modelo de **Banco General**, donde el administrador asigne cartillas de forma focalizada mediante un sistema de pestañas y búsqueda avanzada.

---

## 📋 Fases del Plan

### Fase 1: Reestructuración de Rutas y Datos [COMPLETADO]

- **Nueva Jerarquía**: Migración de rutas de `data/` a `data/pruebas_saber/` y `data/pruebas_unal/`.
- **Actualización de Registros**: Ajustar los campos `dir_banco` en la base de datos para apuntar a las nuevas ubicaciones.

### Fase 2: Interfaz de Banco Centralizado (Panel Admin) [EN_PROGRESO]

- **Navegación por Pestañas**:
  1. **Pruebas Saber**: Para organizar exámenes de 6° a 11°.
  2. **Preunal**: Para organizar exámenes de preparación a la Universidad Nacional.
  3. **Laboratorios**: Para organizar simulaciones prácticas.
- **Layout de 2 Columnas**:
  - **Columna Izquierda (Banco de Exámenes)**: Lista de todos los cuadernillos de la categoría seleccionada, con una **barra de búsqueda** integrada para filtrado rápido por área o nombre.
  - **Columna Derecha (Asignación)**: Un selector desplegable (**Dropdown**) para elegir el grado objetivo (ej: Grado 11).
- **Acción**: Al elegir un grado en la derecha, la lista de la izquierda mostrará switches para habilitar/deshabilitar los exámenes del banco para ese curso específico.

### Fase 3: Filtrado Dinámico en el Lobby [EN_ESPERA]

- **Consulta de Asignación**: El Dashboard del estudiante consultará `ExamAvailability` para mostrar cartillas asignadas (incluyendo las de otros grados).
- **Categorización**: El lobby respetará las categorías (Saber, UNAL, Laboratorios) según la pestaña donde se haya asignado.

### Fase 4: Reportes e Integridad [EN_ESPERA]

- **Trazabilidad**: Los reportes incluirán el "Grado de Origen" y la "Categoría" del examen para total claridad pedagógica.
- **Refactorización de Reporte de Grado**: Modificar `reporte_grado.html` para que, al seleccionar un grado (ej: 11°), la lista de exámenes muestre todos los cuadernillos **habilitados** para ese grupo mediante el Plan UNICUS, incluso si el cuadernillo pertenece originalmente a otro grado (ej: mostrar un examen de 10° asignado a 11°).

---

## 🛠️ Implementación Técnica Inmediata

1.  **Backend (`admin.py`)**: Actualizar la vista `ExamAvailabilityView` para manejar el filtrado por pestañas y la lógica de 2 columnas.
2.  **Template (`exam_availability.html`)**: Rediseñar completamente con Bootstrap Nav-Tabs y un layout de columnas.
3.  **Sincronización**: Actualizar `seed_cuadernillos.py` para que reconozca la nueva estructura de carpetas.

---

## 📝 Notas de Seguimiento

- _Sesión 38_: Cambio de diseño de Matriz a Banco General por solicitud de usabilidad. Adición de categorías por pestañas.
