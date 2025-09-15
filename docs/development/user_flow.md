## Flujo de Usuario Detallado

Este documento describe el flujo completo de interacción del usuario con el Portal de Evaluación Académica IEM, desde el acceso inicial hasta la finalización de un examen y la visualización de resultados.

### 1. Acceso a la Aplicación y Autenticación

1.  **Usuario accede a la aplicación**: El estudiante abre la aplicación en su navegador.
2.  **Página LOGIN**: Se muestra la página de inicio de sesión donde el usuario debe ingresar su ID.
3.  **Ingresa ID válido?**:
    *   **No**: Si el ID ingresado no es válido o no se encuentra, se muestra un mensaje de error ("ID no encontrado") y el usuario es redirigido a la Página LOGIN.
    *   **Sí**: Si el ID es válido, el sistema procede a validar si el usuario está activo y a obtener su grado.
4.  **Usuario activo?**:
    *   **No**: Si el usuario no está activo, se muestra un mensaje de error ("Usuario inactivo") y el usuario es redirigido a la Página LOGIN.
    *   **Sí**: Si el usuario está activo, se le permite el acceso a la Página MAIN.

### 2. Dashboard Principal (Página MAIN)

1.  **Mostrar exámenes disponibles para el grado del usuario**: En la Página MAIN, el sistema presenta una lista de los exámenes disponibles que corresponden al grado del estudiante.
2.  **Usuario selecciona examen**: El estudiante elige uno de los exámenes disponibles para realizar.

### 3. Inicio y Preparación del Examen

1.  **Backend verifica intentos restantes para el examen**: Antes de iniciar el examen, el backend comprueba si el estudiante tiene intentos disponibles para el examen seleccionado.
2.  **Intentos disponibles?**:
    *   **No**: Si no hay intentos disponibles, se muestra un mensaje ("Sin intentos restantes") y un botón para "Volver a MAIN", redirigiendo al usuario al dashboard.
    *   **Sí**: Si hay intentos disponibles, el sistema procede a preparar el examen.
3.  **Seleccionar cuadernillo aleatorio para el grado**: Se selecciona un cuadernillo de preguntas de forma aleatoria que sea apropiado para el grado del estudiante.
4.  **Seleccionar 10 preguntas aleatorias del banco**: De ese cuadernillo, se eligen 10 preguntas aleatoriamente del banco de preguntas.
5.  **Registrar inicio de intento en base de datos**: Se registra en la base de datos el inicio del intento del examen, incluyendo la fecha, hora y el cuadernillo/preguntas asignadas.
6.  **Página EXAM**: El usuario es redirigido a la página donde se realizará el examen.

### 4. Realización del Examen

1.  **Inicializar timer (4 min por pregunta)**: Al cargar la Página EXAM, se inicia un temporizador de 4 minutos para la primera pregunta.
2.  **Mostrar pregunta actual (imagen del cuadernillo)**: Se presenta la pregunta actual al usuario, que puede incluir una imagen del cuadernillo.
3.  **Timer contando**: El temporizador de la pregunta está en marcha.
4.  **Han pasado 3 minutos?**:
    *   **No**: El temporizador continúa contando.
    *   **Sí**: Se verifica si quedan 30 segundos.
5.  **Quedan 30 segundos?**:
    *   **Sí**: Se muestra una advertencia al usuario sobre el tiempo restante.
    *   **No**: El temporizador continúa contando.
6.  **Habilitar botón SIGUIENTE**: Una vez pasados 3 minutos, el botón "SIGUIENTE" se habilita, permitiendo al usuario avanzar antes de que termine el tiempo.
7.  **Usuario puede avanzar o esperar tiempo completo**: El usuario tiene la opción de responder y avanzar, o esperar a que el tiempo de la pregunta se agote.
8.  **Se acabó el tiempo de la pregunta?**:
    *   **No**: Se verifica si el usuario presiona "SIGUIENTE".
    *   **Sí**: Si el tiempo se agota, el sistema avanza automáticamente a la siguiente pregunta.
9.  **Usuario presiona SIGUIENTE?**:
    *   **Sí**: El sistema avanza a la siguiente pregunta.
    *   **No**: El sistema espera a que el tiempo se agote.
10. **Es la última pregunta?**:
    *   **No**: Si no es la última pregunta, se vuelve a mostrar la siguiente pregunta y se reinicia el temporizador.
    *   **Sí**: Si es la última pregunta, se registra el fin del intento y el tiempo total empleado.

### 5. Finalización del Examen y Resultados

1.  **Registrar fin de intento (tiempo total empleado)**: Se marca el intento como finalizado en la base de datos, registrando el tiempo total que el estudiante tardó en completar el examen.
2.  **Reducir intentos restantes para este examen**: Se actualiza el contador de intentos restantes para ese examen específico para el usuario.
3.  **Página RESULT**: El usuario es redirigido a la página de resultados.
4.  **Mostrar información del intento**: En la Página RESULT, se muestra un resumen detallado del intento, incluyendo:
    *   Cuadernillo usado
    *   Tiempo empleado
    *   Fecha y hora del intento
    *   Intentos restantes para ese examen
5.  **Botón: Volver a MAIN**: Se proporciona un botón para que el usuario pueda regresar al dashboard principal.

### 6. Manejo de Interrupciones (Cierre de Navegador/Pérdida de Conexión)

1.  **Usuario cierra navegador o pierde conexión?**: Durante la realización del examen, si el usuario cierra el navegador o pierde la conexión.
2.  **Intento se considera como usado/fallido**: El sistema registra automáticamente el intento como usado o fallido.
3.  **Reducir intentos restantes para este examen**: Se reduce el número de intentos restantes para ese examen, similar a una finalización normal.

