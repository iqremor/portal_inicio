# 🎯 Plan UNICUS: Asignación Flexible de Cuadernillos

**Estado:** `[EN_PROGRESO]`
**Fecha de Creación:** 16 de abril de 2026
**Objetivo Principal:** Permitir que el administrador asigne cualquier cuadernillo (sin importar su grado original) a cualquier otro grado de forma dinámica.

---

## 📋 Fases del Plan

### Fase 1: Evolución del Modelo de Datos [EN_PROGRESO]

- **Mapeo Universal**: Actualmente `ExamAvailability` relaciona un cuadernillo con su grado original. Modificaremos la lógica para que sea una tabla de **Asignaciones Explícitas**.
- **Independencia**: El campo `grado` en el `Cuadernillo` pasará a ser solo una etiqueta de "Grado Sugerido", mientras que la disponibilidad real se definirá en una interfaz de asignación.

### Fase 2: Interfaz de "Súper Asignación" (Panel Admin) [EN_ESPERA]

- **Selector de Destino**: El administrador elige el grado al que desea asignar exámenes (ej: "Grado 11").
- **Biblioteca de Origen**: Se muestra una lista de todos los cuadernillos disponibles en el sistema (Grados 6 al 11).
- **Acción de Cruce**: Un sistema de _Checkboxes_ o _Drag & Drop_ para marcar qué cartillas de 6°, 7°, 8°, etc., estarán visibles para los estudiantes de 11°.

### Fase 3: Filtrado Dinámico en el Lobby [EN_ESPERA]

- **Consulta de Asignación**: El Dashboard del estudiante ya no buscará `Examenes donde grado == 11`, sino `Examenes ASIGNADOS a grado 11`.
- **Etiquetado Claro**: En el lobby del estudiante, si un examen de 6° se le asigna a 11°, aparecerá con una etiqueta descriptiva (ej: "Nivelación" o "Refuerzo Base").

### Fase 4: Control de Intentos y Resultados [EN_ESPERA]

- **Persistencia**: Asegurar que si un estudiante de 11° realiza un examen de 6°, el resultado se guarde correctamente en su historial de 11° para que el reporte de grado sea coherente.

---

## 🛠️ Implementación Inmediata

1.  Crear la vista `AsignacionEspecialView` en `backend/admin.py`.
2.  Desarrollar la plantilla `admin/asignacion_especial.html`.
3.  Actualizar el endpoint `/api/examenes` para que use la nueva lógica de asignación.

---

## 📝 Notas de Seguimiento

- _Sesión 38_: Se detecta la necesidad de organizar exámenes de forma no lineal (Grado 11 accediendo a cartillas inferiores).
