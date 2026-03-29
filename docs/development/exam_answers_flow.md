# Flujo de Procesamiento y Almacenamiento de Respuestas de Examen

Este documento describe el flujo de trabajo completo para el manejo de las respuestas de un examen, desde que el usuario lo finaliza en el frontend hasta que los resultados son calculados y almacenados en el backend.

## 1. Frontend: Flujo del Examen

1.  **Inicio del Examen y Visualización de Preguntas:**
    *   El usuario inicia el examen para un área específica.
    *   El frontend carga todas las preguntas del examen (por ejemplo, en un orden aleatorio: 1, 12, 3, 5, 16, 15, 9, 10, 8, 2).
    *   Las preguntas se muestran en un formato de visualización (por ejemplo, una tras otra en la misma página, o como imágenes que el usuario puede revisar). Durante esta fase, no se seleccionan respuestas.
    *   Una vez que el usuario ha visto todas las preguntas, hace clic en un botón como "Ir a la Hoja de Respuestas".

2.  **Página de Hoja de Respuestas (`answer_sheet.html`):**
    *   El usuario es redirigido a una nueva página que funciona como una hoja de respuestas digital.
    *   Esta página muestra una lista de todas las preguntas por su número (en el orden en que se presentaron), cada una con sus opciones de respuesta (ej. A, B, C, D).
    *   El usuario marca la opción que considera correcta para cada pregunta.
    *   La página contiene dos botones principales:
        *   **"Limpiar":** Borra todas las respuestas seleccionadas en la hoja.
        *   **"Enviar Respuestas":** Inicia el proceso de finalización del examen.

3.  **Recopilación y Envío de Respuestas:**
    *   Cuando el usuario hace clic en "Enviar Respuestas", el JavaScript de la página recopila todas las respuestas seleccionadas.
    *   Se crea un objeto JSON que contiene:
        *   `sessionId`: El ID de la sesión de examen activa.
        *   `codigo`: El código del estudiante.
        *   `answers`: Un array de objetos, donde cada objeto representa una respuesta e incluye:
            *   `questionNumber`: El número de la pregunta (índice o número real).
            *   `selectedOption`: El índice de la opción seleccionada por el usuario (ej. 0 para A, 1 para B, etc.).
    *   Se realiza una petición `POST` al endpoint del backend `/api/examen/<sessionId>/finalizar`, enviando el objeto JSON en el cuerpo de la solicitud.

## 2. Backend: Recepción de Respuestas

1.  **Endpoint:** La ruta `@api_bp.route('/examen/<session_id>/finalizar', methods=['POST'])` en `backend/routes/api.py` recibe la solicitud.

2.  **Extracción de Datos:** El backend extrae `sessionId`, `codigo` y el array `answers` del cuerpo de la petición.

## 3. Backend: Validación de Datos

Antes de procesar, el sistema realiza las siguientes validaciones:

1.  **Sesión Activa:** Verifica que el `session_id` corresponda a una sesión activa en la tabla `active_sessions`.
2.  **Usuario y Cuadernillo:** Confirma que la sesión activa está asociada a un `user_id` y un `cuadernillo_id` válidos.
3.  **Coherencia de Datos:** Asegura que la cantidad de respuestas recibidas coincida con la cantidad de preguntas esperadas para el cuadernillo.

Si alguna validación falla, se devuelve una respuesta de error (ej. `400 Bad Request` o `404 Not Found`).

## 4. Backend: Lógica de Calificación

Esta es la parte central del proceso:

1.  **Obtención de Respuestas Correctas:** El sistema necesita saber cuáles son las respuestas correctas para el cuadernillo. **Propuesta:** Se creará un archivo JSON (ej. `respuestas.json`) en el directorio del banco de preguntas de cada cuadernillo (ej. `data/decimo/matematicas/`). Este archivo contendrá un array con los índices de las respuestas correctas para cada pregunta.

2.  **Iteración y Comparación:** El backend itera sobre el array `answers` enviado por el frontend. En cada iteración:
    *   Compara la `selectedOption` del usuario con la respuesta correcta obtenida del archivo `respuestas.json`.
    *   Determina si la respuesta es correcta (`is_correct = True/False`).
    *   Asigna los puntos correspondientes a la pregunta (`score_points`). Se puede asumir una puntuación fija por pregunta o definirla en el `cuadernillo`.

3.  **Cálculo de Resultados Finales:**
    *   Suma de los `score_points` para obtener la puntuación total.
    *   Cálculo del número de respuestas correctas e incorrectas.
    *   Cálculo del porcentaje de acierto.

## 5. Backend: Almacenamiento en Base de Datos

Una vez calificadas las respuestas, los datos se guardan en la base de datos:

1.  **Guardado de Respuestas Individuales:** Por cada respuesta en el array `answers`, se crea un nuevo registro en la tabla `exam_answers` con la siguiente información:
    *   `session_id`
    *   `user_id`
    *   `cuadernillo_id`
    *   `question_number`
    *   `selected_option`
    *   `is_correct`
    *   `score_points`

2.  **Creación/Actualización de un Resultado General:** Se crea un nuevo modelo/tabla llamado `ExamResult` para almacenar el resumen del examen. Este registro contendrá:
    *   `user_id`
    *   `cuadernillo_id`
    *   `final_score` (puntuación total)
    *   `correct_answers` (número de respuestas correctas)
    *   `incorrect_answers` (número de respuestas incorrectas)
    *   `completion_date` (fecha de finalización)

3.  **Limpieza de Sesión:** Finalmente, el `cuadernillo_id` en la tabla `active_sessions` se establece en `None` para indicar que el examen ha finalizado y esa sesión ya no puede ser usada para responder preguntas.

4.  **Commit a la Base de Datos:** Se realiza un `db.session.commit()` para guardar todos los cambios de forma atómica.

## 6. Backend: Respuesta al Frontend

1.  **Respuesta Exitosa:** Si todo el proceso se completa correctamente, el backend envía una respuesta JSON al frontend con los resultados del examen (ej. `200 OK`). El cuerpo de la respuesta incluirá:
    *   `message`: "Examen finalizado con éxito".
    *   `score`: La puntuación final obtenida.
    *   `totalQuestions`: El número total de preguntas.
    *   `correctAnswers`: El número de respuestas correctas.

2.  **Respuesta de Error:** Si ocurre algún error durante el proceso, se devuelve una respuesta con un código de error apropiado (ej. `500 Internal Server Error`) y un mensaje descriptivo.

Este flujo asegura que las respuestas sean procesadas, calificadas y almacenadas de manera robusta y persistente.

---

### 7. ¿Cómo Agregar las Respuestas Correctas para un Examen?

Para que la calificación automática funcione, es necesario crear un archivo de respuestas para cada cuadernillo de examen.

#### Paso 1: Crear el Archivo `respuestas.json`

Crea un archivo de texto con el nombre exacto `respuestas.json`.

#### Paso 2: Definir las Respuestas Correctas

Dentro de este archivo, debes escribir una estructura JSON que contenga una clave `"respuestas"` y, como valor, un array (una lista) de números. Cada número en el array representa el **índice de la opción correcta** para cada pregunta, en orden.

**Importante:** Los índices de las opciones de respuesta comienzan en `0`.
- `0` corresponde a la opción A.
- `1` corresponde a la opción B.
- `2` corresponde a la opción C.
- `3` corresponde a la opción D.
- Y así sucesivamente si hay más opciones.

**Ejemplo de contenido para `respuestas.json` (para un examen de 10 preguntas):**

```json
{
  "respuestas": [
    0, 
    1, 
    2, 
    3, 
    0, 
    1, 
    2, 
    3, 
    0, 
    1
  ]
}
```

En este ejemplo:
- Para la Pregunta 1, la respuesta correcta es la A (índice `0`).
- Para la Pregunta 2, la respuesta correcta es la B (índice `1`).
- Para la Pregunta 3, la respuesta correcta es la C (índice `2`).
- ... y así sucesivamente.

#### Paso 3: Ubicar el Archivo en el Directorio Correcto

El archivo `respuestas.json` debe ser colocado dentro del **directorio del banco de preguntas** correspondiente al cuadernillo. Este directorio es el que está especificado en el campo `dir_banco` del modelo `Cuadernillo`.

Por ejemplo, si para el cuadernillo de **Matemáticas de Grado Décimo** el `dir_banco` es `data/decimo/matematicas`, entonces la ruta completa del archivo deberá ser:

`data/decimo/matematicas/respuestas.json`

Siguiendo estos pasos, el sistema podrá encontrar y utilizar automáticamente las respuestas correctas para calificar cualquier examen que sea finalizado por un usuario.
