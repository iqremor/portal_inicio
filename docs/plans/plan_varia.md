# Plan VARIA: Soporte para Opciones de Respuesta Dinámicas (A-H)

**Estado:** [BORRADOR]
**Fecha de Creación:** 14 de abril de 2026
**Objetivo Principal:** Evolucionar el sistema de selección múltiple de un formato fijo (A-D) a uno dinámico (desde A-C hasta A-H), permitiendo que el examen se adapte automáticamente al número de opciones reales definidas en el banco de preguntas, especialmente para el área de Inglés.

## 📋 Fases del Plan

### Fase 1: Enriquecimiento del Banco de Datos

- Revisar la estructura de `backend/data/respuestas.json` para asegurar que el mapeo de letras soporte índices superiores a 3 (D).
- Identificar en los cuadernillos de Inglés el rango máximo de opciones requerido (ej: A-H).
- Determinar si el número de opciones se detectará automáticamente por el contenido del JSON de preguntas o si se definirá un estándar por cuadernillo.

### Fase 2: Flexibilidad en la API del Backend

- Modificar `backend/routes/api.py` para eliminar el hardcoding del array `["A", "B", "C", "D"]`.
- Implementar una lógica que genere el array de opciones (`options`) dinámicamente basado en la metadata de la pregunta o el rango de respuestas correctas permitidas.
- Asegurar que el validador de respuestas en el endpoint de finalización acepte letras más allá de la "D".

### Fase 3: Adaptación de la Interfaz (UI)

- Actualizar `frontend/js/examen/ui.js` para que el método `renderizarImagen` genere los radio buttons recorriendo el array `currentQuestion.options` sin importar su longitud.
- Rediseñar el contenedor CSS `options-top-container` para que sea responsivo y maneje estéticamente layouts de 3, 4, 6 u 8 opciones (posible uso de `grid-template-columns` dinámico).
- Asegurar que el tamaño de las etiquetas de opción sea legible incluso con un alto número de alternativas.

### Fase 4: Validación Pedagógica y Técnica

- Realizar pruebas con exámenes de Inglés para verificar que la selección de la opción "H" se registre y califique correctamente.
- Verificar que el flujo de "No Marcadas" (NONE) siga funcionando independientemente del rango de opciones.
- Validar la visualización en dispositivos móviles, donde el espacio para 8 opciones es crítico.

---

## 📝 Notas de Seguimiento

- _Sesión 36_: Creación del plan para resolver la limitación técnica que impedía evaluar correctamente el área de Inglés con sus estándares internacionales.
