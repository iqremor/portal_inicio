# Plan ANALYTICA: Desglose Detallado de Resultados por Categoría

**Estado:** [BORRADOR]
**Fecha de Creación:** 14 de abril de 2026
**Objetivo Principal:** Reemplazar el botón único de "Ver Respuestas" por una funcionalidad interactiva integrada en los paneles de estadísticas (Correctas, Incorrectas, No Marcadas), permitiendo al estudiante navegar a vistas filtradas de su desempeño manteniendo la consistencia visual del portal.

## 📋 Fases del Plan

### Fase 1: Rediseño de la Interfaz de Resultados

- Convertir las tarjetas (cards) de estadísticas de la página de resultados en elementos clicables (botones o enlaces con estilo de panel).
- Implementar estados "Habilitado/Deshabilitado" visualmente claros para estos paneles según la configuración del administrador.
- Asegurar que la estructura HTML de los paneles permita la navegación a nuevas rutas con parámetros (ej: `respuestas.html?filtro=correctas`).

### Fase 2: Creación de Vistas Filtradas (Frontend)

- Desarrollar o adaptar la lógica de `respuestas.js` para que acepte parámetros de filtrado.
- Crear una plantilla base para las páginas de detalle que importe dinámicamente el `header.html` y `footer.html`.
- Aplicar estilos CSS que aseguren que el contenedor de preguntas filtradas se integre orgánicamente entre el encabezado y el pie de página.

### Fase 3: Control Administrativo Granular (Backend)

- Evolucionar el flag `SHOW_CORRECT_ANSWERS` hacia un sistema de permisos más específico en `backend/admin.py`.
- Permitir que el administrador habilite el "Análisis Detallado" de forma global.
- Actualizar la API de configuración para informar al frontend si las acciones de los paneles deben estar activas o inactivas.

### Fase 4: Experiencia de Usuario y Navegación

- Implementar transiciones suaves entre el resumen de resultados y las vistas de detalle.
- Agregar un botón de "Volver al Resumen" en cada vista filtrada.
- Validar que los datos se carguen correctamente desde el `localStorage` o la API de resultados sin perder el contexto del intento actual.

---

## 📝 Notas de Seguimiento

- _Sesión 36_: Creación del plan para mejorar la pedagogía del error, permitiendo al estudiante enfocarse en sus áreas de mejora de forma independiente.
