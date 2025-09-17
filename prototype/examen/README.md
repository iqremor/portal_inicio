# Documentación del Proyecto: Quiz Interactivo

---

### 1. Descripción General

Este proyecto es una aplicación web de tipo "quiz" o cuestionario, diseñada para ser modular, mantenible y fácil de extender. Permite a los usuarios visualizar una serie de preguntas en formato de imagen, con un límite de tiempo por pregunta y una experiencia inmersiva.

La aplicación ha evolucionado desde un script monolítico (`script.js`) a una arquitectura moderna basada en módulos de JavaScript (ESM), que es la que está actualmente en uso (`script.js` y sus dependencias).

---

### 2. Flujo de la Aplicación
flowchart LR
    A[Inicio] --> B[Página de Inicio]
    B -->|Clic en "Iniciar"| C[Inicio del Quiz]
    C --> D{Muestra Pregunta 1/10}
    D -->|Clic en "Siguiente" o Tiempo Agotado| E{Muestra Pregunta 2/10}
    E --> F[...]
    F --> G{Muestra Pregunta 10/10}
    G -->|Clic en "Siguiente" o Tiempo Agotado| H[Página Final]
    H -->|Volver a Intentar| C
    H -->|Volver al Inicio| B

    subgraph "Durante el Quiz"
        direction LR
        D -- Zoom/Arrastre --> D
        D -- Cambio de Pestaña/Sale de Pantalla Completa --> I[Intento Anulado]
    end

    I --> H


El recorrido del usuario a través del quiz sigue estos pasos:
1.  **Página de Inicio**: El usuario es recibido con un título y una descripción de la prueba.
    *   Se verifica el número de intentos realizados. Si el usuario ha alcanzado el límite permitido, se muestra un mensaje de bloqueo en lugar del botón para iniciar.
    *   Si quedan intentos, un botón "Iniciar" da comienzo a la experiencia.
2.  **Inicio del Quiz**: Al hacer clic en "Iniciar Quiz":
    *   La aplicación entra en **modo de pantalla completa** para una experiencia inmersiva.
    *   Se activa un detector que **anulará el intento** si el usuario cambia de pestaña, minimiza el navegador o sale del modo de pantalla completa.
    *   Se seleccionan **un número configurable de preguntas** (actualmente 10) de forma aleatoria del banco total de imágenes, se barajan y se muestra la primera pregunta.
3.  **Vista de Pregunta**:
    *   **Imagen de la Pregunta**: Se muestra la imagen con funcionalidad de **zoom y arrastre** para una mejor visualización, gracias a un módulo dedicado (`zoom.js`).
    *   **Temporizador por Pregunta**: Un contador (actualmente de 4 minutos) se inicia para cada pregunta.
    *   **Retraso del Botón "Siguiente"**: El botón para avanzar a la siguiente pregunta permanece deshabilitado durante un breve periodo configurable.
    *   **Alerta de Tiempo**: Cuando quedan 30 segundos, el temporizador se vuelve rojo, parpadea y se muestra una **alerta personalizada** (no nativa). Si el tiempo se agota, se avanza automáticamente.
    *   **Avance**: El usuario hace clic en "Siguiente" para pasar a la próxima pregunta.
4.  **Página Final**: Después de la última pregunta, el intento se guarda y se muestra una pantalla de "Prueba Finalizada".
    *   Ofrece botones para "Volver a Intentar" (que inicia un nuevo quiz) o "Volver al Inicio".

---

### 3. Arquitectura Técnica

El proyecto está construido con una arquitectura modular que separa claramente las responsabilidades.

*   **`index.html`**: El punto de entrada de la aplicación. Es un HTML semántico y limpio que define un único contenedor principal (`<main id="app">`) donde JavaScript renderiza toda la interfaz.
*   **`css/styles.css`**: Contiene todos los estilos. Está bien organizado con comentarios que separan los estilos generales, los del quiz modular y los de las diferentes vistas.
*   **`css/zoom.css`**: Contiene los estilos dedicados para la funcionalidad de zoom y arrastre de las imágenes.
*   **`js/script.js`**: Actúa como el **orquestador** de la aplicación. Su única responsabilidad es importar los módulos, conectarlos entre sí al cargar la página y mostrar la pantalla de inicio.
*   **`js/state.js`**: Es la **fuente única de verdad**. Exporta un objeto `state` que contiene todos los datos dinámicos de la aplicación (preguntas actuales, puntaje, respuestas del usuario, etc.). Centralizar el estado de esta manera simplifica enormemente la gestión de datos.
*   **`js/constants.js`**: Almacena los datos estáticos y de configuración del quiz (número de preguntas, tiempo, rutas de imágenes, etc.). Separar los datos de la lógica hace que sea muy fácil modificar las reglas y el contenido sin tocar el código funcional.
*   **`data/storage.js`**: Abstrae la lógica de persistencia de datos. Utiliza **IndexedDB** para guardar los intentos del quiz, contar el número de intentos y obtener la nota más alta. Su diseño asíncrono y robusto permite que en el futuro se pueda cambiar fácilmente a una API de backend sin modificar el resto de la aplicación.
*   **`js/cuestionario.js`**: Contiene toda la **lógica de negocio** del quiz. Se encarga de iniciar el juego, barajar y seleccionar las preguntas, gestionar el temporizador por pregunta, manejar las reglas anti-trampas y controlar el flujo entre preguntas. No interactúa directamente con el DOM.
*   **`js/ui.js`**: Es responsable de toda la **manipulación del DOM**. Contiene funciones para renderizar cada pantalla (`mostrarPaginaInicio`, `renderizarImagen`, etc.) y para manejar los eventos de la interfaz (clics en botones). No contiene lógica de negocio.
*   **`js/zoom.js`**: Módulo dedicado que encapsula toda la lógica para la funcionalidad de zoom y arrastre de las imágenes de las preguntas. Es reutilizable y mantiene su propio estado interno.

#### Patrón Clave: Inyección de Dependencias Manual

Los módulos `cuestionario.js` y `ui.js` se comunican de forma desacoplada gracias a un patrón de inyección de dependencias.

-   En `script.js`, se llaman a las funciones `setupQuiz()` y `setupUI()`.
-   `setupUI()` recibe funciones del módulo `cuestionario.js` (como `iniciarQuiz`).
-   `setupQuiz()` recibe funciones del módulo `ui.js` (como `renderizarImagen`).

Esto permite que, por ejemplo, `cuestionario.js` pueda llamar a `renderImage()` sin saber (ni importarle) cómo se renderiza una imagen de pregunta en el HTML.

---

### 4. Requisitos para Ejecutar el Proyecto

1.  **Navegador Web Moderno**: La aplicación requiere un navegador que soporte **Módulos ES6** (usado con `type="module"` en la etiqueta `<script>`). Prácticamente todos los navegadores actuales (Chrome, Firefox, Safari, Edge) son compatibles.
2.  **Servidor Web Local (Recomendado)**: Para evitar problemas de seguridad del navegador relacionados con la carga de archivos locales (CORS), se recomienda ejecutar el proyecto a través de un servidor de desarrollo local. Una extensión popular para Visual Studio Code es **Live Server**.

---

### 5. Posibles Mejoras y Siguientes Pasos

El proyecto tiene una base sólida, pero aquí hay algunas ideas para llevarlo al siguiente nivel:

1.  **Componentes de UI Reutilizables**: En lugar de usar `innerHTML` con grandes bloques de HTML, se podría refactorizar `ui.js` para tener funciones que creen y retornen elementos del DOM (ej: `createButton(config)`). Esto mejora la seguridad (previene ataques XSS), el rendimiento y la capacidad de mantenimiento.
2.  **Accesibilidad (a11y)**:
    *   Añadir atributos ARIA para mejorar la experiencia de los lectores de pantalla. Por ejemplo, usar `aria-live="polite"` en el temporizador para que anuncie el tiempo restante y en los controles de zoom.
    *   Asegurar que todos los elementos interactivos tengan un estado de `:focus-visible` claro para la navegación con teclado.
3.  **Pruebas Unitarias**: Implementar un framework de pruebas como Vitest o Jest para crear tests sobre la lógica pura en `cuestionario.js` y `data/storage.js`. Esto garantiza que la lógica central no se rompa al añadir nuevas funcionalidades.
4.  **Sistema de Puntuación**: Implementar un mecanismo para que el usuario seleccione respuestas y calcular una puntuación al final del intento, guardándola en la base de datos.
