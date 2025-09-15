## APIs Disponibles

### Autenticación
- `POST /api/validar` - Validar código estudiantil
- `POST /api/logout` - Cerrar sesión

### Exámenes
- `GET /api/examenes/grado/:grado` - Listar exámenes (cuadernillos) disponibles para un grado específico
- `GET /api/examenes` - Listar áreas disponibles
- `GET /api/examenes/:area` - Información de examen específico
- `POST /api/examenes/:area/iniciar` - Iniciar examen
- `POST /api/examenes/:area/responder` - Enviar respuesta
- `POST /api/examenes/:area/finalizar` - Finalizar examen

### Resultados
- `GET /api/resultados/:codigo` - Historial del estudiante
- `GET /api/resultados/:codigo/:resultado_id` - Resultado específico
