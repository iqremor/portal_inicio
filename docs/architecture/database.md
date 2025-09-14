## Base de Datos

### Estructura de Usuarios (usuarios.json)
```json
{
  "usuarios_permitidos": ["IEM1001", "IEM1002", "IEM1003"],
  "nombres": {
    "IEM1001": {
      "nombre_completo": "Ana María García",
      "grado": "9A",
      "activo": true
    }
  }
}
```

### Estructura del Banco de Preguntas (banco_preguntas.json)
Este archivo centraliza todas las preguntas disponibles en el sistema, permitiendo su reutilización y una gestión más modular. Cada pregunta incluye metadatos para filtrado y configuración específica según su tipo.

```json
{
  "preguntas": [
    {
      "id": "unique_question_id_1",
      "subject": "matematicas",
      "grade_level": ["6", "7", "8"],
      "type": "multiple_choice",
      "difficulty": "facil",
      "points": 1,
      "question_text": "¿Cuál es el resultado de 15 + 27?",
      "options": ["40", "42", "44", "46"],
      "correct_answer_index": 1,
      "explanation": "La suma de 15 y 27 es 42."
    },
    {
      "id": "unique_question_id_FV_1",
      "subject": "ciencias_naturales",
      "grade_level": ["6", "7", "8"],
      "type": "true_false",
      "difficulty": "facil",
      "points": 1,
      "question_text": "¿La fotosíntesis es el proceso por el cual las plantas convierten la luz solar en energía química?",
      "correct_answer": true,
      "explanation": "La fotosíntesis es el proceso fundamental para la producción de energía en las plantas."
    },
    {
      "id": "unique_question_id_IMG_ENUN_1",
      "subject": "analisis_imagen",
      "grade_level": ["8", "9", "10"],
      "type": "image_multiple_choice",
      "difficulty": "medio",
      "points": 2,
      "question_text": "Observa la imagen de un gráfico de barras que muestra ventas por mes. ¿En qué mes se registraron las mayores ventas?",
      "image_url": "/images/grafico_ventas.png",
      "options": ["Enero", "Marzo", "Junio", "Diciembre"],
      "correct_answer_index": 2,
      "explanation": "Según el gráfico, el mes de junio muestra la barra más alta, indicando las mayores ventas."
    },
    {
      "id": "unique_question_id_IMG_RESP_1",
      "subject": "arte",
      "grade_level": ["9", "10"],
      "type": "multiple_choice_image_options",
      "difficulty": "medio",
      "points": 2,
      "question_text": "¿Cuál de las siguientes imágenes representa la obra 'La Noche Estrellada' de Van Gogh?",
      "options": [
        {"type": "image", "value": "/images/obra_1.png"},
        {"type": "image", "value": "/images/noche_estrellada.png"},
        {"type": "image", "value": "/images/obra_3.png"},
        {"type": "image", "value": "/images/obra_4.png"}
      ],
      "correct_answer_index": 1,
      "explanation": "La Noche Estrellada es una de las obras más famosas de Vincent van Gogh."
    },
    {
      "id": "unique_question_id_IMG_ENUN_RESP_1",
      "subject": "biologia",
      "grade_level": ["10", "11"],
      "type": "image_question_image_options",
      "difficulty": "dificil",
      "points": 3,
      "question_text": "Observa la siguiente imagen de una célula. ¿Cuál de las opciones muestra correctamente la mitocondria?",
      "image_url": "/images/celula_diagrama.png",
      "options": [
        {"type": "image", "value": "/images/mitocondria_a.png"},
        {"type": "image", "value": "/images/mitocondria_b.png"},
        {"type": "image", "value": "/images/mitocondria_c.png"},
        {"type": "image", "value": "/images/mitocondria_d.png"}
      ],
      "correct_answer_index": 1,
      "explanation": "La mitocondria es el orgánulo encargado de la respiración celular."
    }
  ]
}
```
**Campos Comunes para todos los Tipos de Pregunta:**
*   **`id` (String, Requerido)**: Identificador único de la pregunta.
*   **`subject` (String, Requerido)**: Área temática a la que pertenece la pregunta.
*   **`grade_level` (Array de Strings, Requerido)**: Lista de grados para los que la pregunta es aplicable.
*   **`type` (String, Requerido)**: Tipo de pregunta (ej., `"multiple_choice"`, `"true_false"`, `"image_multiple_choice"`, etc.).
*   **`difficulty` (String, Requerido)**: Nivel de dificultad (ej., `"facil"`, `"medio"`, `"dificil"`).
*   **`points` (Número, Requerido)**: Puntos otorgados por una respuesta correcta.
*   **`question_text` (String, Requerido)**: El texto de la pregunta.
*   **`explanation` (String, Opcional)**: Explicación de la respuesta correcta.

**Campos Específicos por Tipo de Pregunta:**
*   **Para `multiple_choice`, `image_multiple_choice`, `text_multiple_choice`:**
    *   **`options` (Array de Strings, Requerido)**: Lista de posibles respuestas.
    *   **`correct_answer_index` (Número, Requerido)**: Índice (base 0) de la respuesta correcta.
*   **Para `image_multiple_choice`, `image_question_image_options`:**
    *   **`image_url` (String, Requerido)**: URL o ruta a la imagen asociada con la pregunta.
*   **Para `text_multiple_choice`:**
    *   **`text_content` (String, Requerido)**: El pasaje de texto en el que se basa la pregunta.
*   **Para `true_false`:**
    *   **`correct_answer` (Booleano, Requerido)**: `true` o `false`.
*   **Para `fill_in_the_blank`:**
    *   **`correct_answer` (String, Requerido)**: La palabra o frase exacta que llena el espacio en blanco.
*   **Para `multiple_choice_image_options`, `image_question_image_options`:**
    *   **`options` (Array de Objetos, Requerido)**: Cada objeto tiene `{"type": "image"|"text", "value": "url_o_texto"}`.

### Estructura de Exámenes (examenes.json)
Este archivo define los exámenes disponibles, su configuración general y las referencias a las preguntas del `banco_preguntas.json`.

```json
{
  "matematicas": {
    "nombre": "Matemáticas",
    "descripcion": "Evaluación de conceptos matemáticos básicos y avanzados",
    "tiempo_limite": 30,
    "numero_preguntas": 5,
    "activo": true,
    "applicable_grades": ["6", "7", "8", "9", "10", "11"],
    "question_ids": [
      "mat_q1",
      "mat_q2",
      "mat_q3",
      "mat_q4",
      "mat_q5"
    ]
  }
}
```
**Campos Clave:**
*   **`nombre` (String)**: Nombre del examen.
*   **`descripcion` (String)**: Descripción del examen.
*   **`tiempo_limite` (Número)**: Duración máxima del examen en minutos.
*   **`numero_preguntas` (Número)**: Cantidad total de preguntas que se presentarán en el examen.
*   **`activo` (Booleano)**: Indica si el examen está disponible.
*   **`applicable_grades` (Array de Strings)**: Lista de grados para los que este examen es relevante.
*   **`question_ids` (Array de Strings)**: Lista de IDs de preguntas que componen este examen, referenciadas desde `banco_preguntas.json`.

### Estructura de Resultados (resultados.json)
```json
{
  "IEM1001": [
    {
      "id": "uuid-resultado",
      "fecha": "2025-08-15T10:30:00Z",
      "area": "matematicas",
      "puntuacion": 18,
      "puntuacion_maxima": 20,
      "porcentaje": 90,
      "tiempo_usado": 25,
      "estado": "completado"
    }
  ]
}
```