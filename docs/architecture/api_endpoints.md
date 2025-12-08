## APIs Disponibles

### Autenticación
- `POST /api/validar` - Valida el código de estudiante y devuelve información del usuario.
- `POST /api/logout` - Cierra la sesión activa del usuario.

### Exámenes
- `POST /api/examenes/:area_id/iniciar` - Inicia una sesión de examen para un usuario, asociando un cuadernillo. Retorna el `session_id`.
- `GET /api/examen/<session_id>` - **(Actualizado)** Obtiene las preguntas completas y la configuración de un examen para una sesión activa específica. Retorna objetos de pregunta con texto, opciones y URL de imagen.
- `POST /api/examen/<session_id>/finalizar` - **(Actualizado)** Recibe las respuestas del examen, las califica utilizando las preguntas presentadas almacenadas en la sesión activa, guarda los resultados y devuelve la calificación (0-5).
- `POST /api/upload_exam_answers` - **(Nuevo)** Recibe un archivo (JSON/CSV) con respuestas de examen para un `examId` y `userCodigo` específicos, las califica y guarda los resultados en la base de datos.

### Resultados
- `GET /api/resultados/:codigo` - Historial de resultados de examen de un estudiante.
- `GET /api/resultados/:codigo/:resultado_id` - Resultado específico de un examen.
