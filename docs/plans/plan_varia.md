# Plan VARIA: Soporte para Opciones de Respuesta Dinámicas (A-H)

**Estado:** [BORRADOR]
**Fecha de Creación:** 14 de abril de 2026
**Objetivo Principal:** Evolucionar el sistema de selección múltiple de un formato fijo (A-D) a uno dinámico (desde A-C hasta A-H), permitiendo que el examen se adapte automáticamente al número de opciones reales definidas en el banco de preguntas, especialmente para el área de Inglés.
**Estado:** [EN_PROGRESO]
**Fecha de Actualización:** 16 de abril de 2026

... (resto del contenido) ...

### Fase 1: Enriquecimiento del Banco de Datos [COMPLETADO]

- [x] **Estandarización de Nombres**: Implementar la convención de nombres de archivo donde el último carácter antes de la extensión defina el rango de opciones.
- [x] Revisar la estructura de `backend/data/respuestas.json`.
- [x] Identificar en los cuadernillos de Inglés el rango máximo de opciones requerido.

### Fase 2: Flexibilidad en la API del Backend [COMPLETADO]

- [x] **Parser de Nombres de Imagen**: Implementar en `backend/routes/api.py` una lógica de extracción que lea el sufijo del nombre del archivo para generar dinámicamente el array `options`.
- [x] Modificar el generador de preguntas para que el array `options` deje de ser un valor fijo.
- [x] Asegurar que el validador de respuestas acepte letras más allá de la "D".

### Fase 3: Adaptación de la Interfaz (UI) [COMPLETADO]

- [x] Actualizar `frontend/js/examen/ui.js` para que el método `renderizarImagen` genere los radio buttons dinámicamente.
- [x] Rediseñar el contenedor CSS `options-top-container` para que sea responsivo y maneje layouts de hasta 8 opciones.

### Fase 4: Validación Pedagógica y Técnica [COMPLETADO]

- [x] **Pruebas Técnicas**: Se verificó con simulaciones de Inglés que las opciones 'E', 'F', 'G' y 'H' se registran y califican correctamente.
- [x] **Resiliencia**: El flujo de "No Marcadas" (NONE) es estable.
- [x] **Responsividad**: El Grid de opciones se adapta correctamente a dispositivos móviles.
- [ ] **Prueba de Campo**: Pendiente feedback del público objetivo (estudiantes) para detectar mejoras de UX.

**Estado Final:** IMPLEMENTADO (Pendiente de feedback de usuarios reales)

---

## 📝 Notas de Seguimiento

- _Sesión 36_: Creación del plan para resolver la limitación técnica que impedía evaluar correctamente el área de Inglés con sus estándares internacionales.
