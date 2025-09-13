## Flujo de Usuario (Ejemplo)

1.  El estudiante accede a `index.html`.
2.  Ingresa su código estudiantil en el formulario de login.
3.  El frontend valida el formato y envía el código al backend (`/api/validar`).
4.  El backend verifica el código en `usuarios.json`.
5.  Si es válido, el backend responde con éxito, y el frontend guarda la sesión en `localStorage` y redirige a `frontend/pages/inicio.html`.
6.  En `inicio.html` (asumo que es el dashboard), el estudiante puede ver la lista de exámenes disponibles (`/api/examenes`).
7.  Elige un examen y lo inicia (`/api/examenes/:area/iniciar`).
8.  El frontend muestra las preguntas del examen, y el estudiante las responde. Cada respuesta puede ser enviada al backend (`/api/examenes/:area/responder`) para actualizar la sesión en memoria.
9.  Al finalizar el examen o agotarse el tiempo, el estudiante lo finaliza (`/api/examenes/:area/finalizar`).
10. El backend calcula la puntuación y guarda el resultado.
11. El estudiante puede ver sus resultados (`/api/resultados/:codigo`) o un resultado específico (`/api/resultados/:codigo/:resultado_id`).
