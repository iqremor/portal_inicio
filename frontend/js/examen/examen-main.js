import { setup as setupUI, mostrarPaginaInicio, renderizarImagen, mostrarPaginaFinal, mostrarAlertaPersonalizada } from './ui.js';
import { setupQuiz, iniciarQuiz, siguienteImagen, iniciarTemporizador } from './cuestionario.js';
import { obtenerNumeroDeIntentos } from './storage.js';
import { state } from './state.js';

// Función para mostrar un error de carga y detener la ejecución
function mostrarErrorCarga(mensaje) {
    mostrarAlertaPersonalizada("Error de Carga", mensaje, 10000);
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.innerHTML = `<div style="text-align: center; padding: 2rem;">
            <h2 style="color: #d9534f;">Error</h2>
            <p>${mensaje}</p>
            <a href="/frontend/pages/dashboard.html" class="btn btn-primary" style="margin-top: 1rem;">Volver al Dashboard</a>
        </div>`;
    }
}

// Esta función se pasa al módulo UI y se ejecuta cuando el usuario hace clic en "Iniciar"
async function handleStartQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const areaId = urlParams.get('area');
    const sessionId = urlParams.get('id'); // Mantenemos el sessionId por consistencia

    try {
        // Mostrar un indicador de carga
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `<div style="text-align: center; padding: 2rem;">Cargando examen...</div>`;

        // 1. Obtener los datos del examen desde el backend
        // NOTA: La ruta de la API es un ejemplo y la crearemos en el backend más adelante
        const response = await fetch(`/api/examenes/start?sessionId=${sessionId}&areaId=${areaId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }
        const examData = await response.json();

        // 2. Iniciar el quiz con los datos recibidos del backend
        iniciarQuiz(examData);

    } catch (error) {
        console.error("Error al cargar los datos del examen:", error);
        mostrarErrorCarga(`No se pudieron cargar las preguntas del examen. ${error.message}`);
    }
}

// Función principal que se ejecuta al cargar la página
async function main() {
    // 1. Configurar la inyección de dependencias entre módulos (patrón del prototipo)
    setupUI(handleStartQuiz, siguienteImagen, iniciarTemporizador);
    setupQuiz(renderizarImagen, mostrarPaginaFinal);

    // 2. Obtener identificadores de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const areaId = urlParams.get('area');
    const sessionId = urlParams.get('id');

    if (!areaId || !sessionId) {
        mostrarErrorCarga("La URL es inválida. No se especificó un área o sesión de examen.");
        return;
    }

    // 3. Obtener el número de intentos previos para saber si se puede iniciar el examen
    try {
        state.attemptCount = await obtenerNumeroDeIntentos(sessionId, areaId);
        
        // 4. Mostrar la página de inicio. La UI decidirá si muestra el botón "Iniciar" o un mensaje de "No más intentos".
        mostrarPaginaInicio();

    } catch (error) {
        console.error("Error al verificar los intentos:", error);
        mostrarErrorCarga("No se pudo verificar el número de intentos previos.");
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', main);
