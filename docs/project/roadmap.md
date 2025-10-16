## Próximos Desarrollos

### Prioridad Alta
1. **Completar funcionalidad de exámenes**
   - Integración frontend-backend
   - Cálculo de resultados
   - Página de resultados

2. **Sistema de resultados**
   - Historial de exámenes
   - Estadísticas de rendimiento
   - Exportación de datos

### Prioridad Media
3. **Panel administrativo**
   - Gestión de usuarios
   - Configuración de exámenes
   - Reportes estadísticos

4. **Mejoras de UX**
   - Notificaciones elegantes
   - Animaciones suaves
   - Mejor responsive design

### Prioridad Baja
5. **Funcionalidades avanzadas**
   - Exámenes con imágenes
   - Preguntas de desarrollo
   - Sistema de calificaciones

## Próxima Sesión: Implementación de Guardado de Resultados

### Plan para Guardar los Resultados en la Base de Datos

1.  **Crear un Nuevo Modelo en la Base de Datos:**
    *   Crear un modelo `RespuestaUsuario` para almacenar cada respuesta individual.
    *   Columnas:
        *   `resultado_id`: Para vincularla al intento general del examen.
        *   `pregunta_path`: Para guardar la ruta de la imagen (ej: `/data_files/.../pregunta_14.jpg`).
        *   `orden`: Para saber en qué posición apareció (de 1 a 10).
        *   `respuesta_usuario`: (Futuro) Para guardar la respuesta que elija.

2.  **Actualizar el Endpoint del Backend (`/api/examen/<session_id>/finalizar`):**
    *   En `api.py`, el endpoint deberá:
        1.  Buscar el resultado activo usando el `sessionId`.
        2.  Recorrer la lista de preguntas recibida.
        3.  Crear una nueva entrada en `RespuestaUsuario` por cada pregunta.
        4.  Marcar el examen como "finalizado".