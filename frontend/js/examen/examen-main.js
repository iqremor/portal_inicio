import { setup as setupUI, mostrarPaginaInicio, renderizarImagen, mostrarPaginaFinal, mostrarAlertaPersonalizada } from './ui.js';
import { setupQuiz, iniciarQuiz, siguienteImagen, iniciarTemporizador } from './cuestionario.js';
import { obtenerNumeroDeIntentos } from './storage.js';
import { state } from './state.js';
import { fetchUserData } from '../api/index.js';
import { checkSession } from '../shared/auth.js'; // <--- NUEVO: Importar checkSession

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
    const sessionId = urlParams.get('id'); 
    const userGrade = state.currentUser ? state.currentUser.grado : null; 

    if (!userGrade) {
        mostrarErrorCarga("No se pudo obtener el grado del usuario para iniciar el examen.");
        return;
    }

    try {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `<div style="text-align: center; padding: 2rem;">Cargando examen...</div>`;

        const apiUrl = `/api/examenes/start?sessionId=${sessionId}&areaId=${areaId}&grade=${userGrade}`;
        console.log(`--- DEBUG FRONTEND: Solicitando examen a la URL: ${apiUrl} ---`); // <--- NUEVO DEBUG

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }
        const examData = await response.json();

        iniciarQuiz(examData);

    } catch (error) {
        console.error("Error al cargar los datos del examen:", error);
        mostrarErrorCarga(`No se pudieron cargar las preguntas del examen. ${error.message}`);
    }
}

// Función principal que se ejecuta al cargar la página
async function main() {
    setupUI(handleStartQuiz, siguienteImagen, iniciarTemporizador);
    setupQuiz(renderizarImagen, mostrarPaginaFinal);

    const urlParams = new URLSearchParams(window.location.search);
    const areaId = urlParams.get('area');
    const sessionId = urlParams.get('id');

    if (!areaId || !sessionId) {
        mostrarErrorCarga("La URL es inválida. No se especificó un área o sesión de examen.");
        return;
    }

    // Obtener el código de usuario de la sesión usando la función checkSession
    const session = checkSession();
    const userCode = session.codigo; 

    if (!session.active || !userCode) { 
        mostrarErrorCarga("No se pudo obtener el código de usuario de la sesión o la sesión no está activa.");
        return;
    }

    try {
        state.currentUser = await fetchUserData(userCode);
        state.currentUser.codigo = userCode; 

        state.attemptCount = await obtenerNumeroDeIntentos(sessionId, areaId);
        
        mostrarPaginaInicio();

    } catch (error) {
        console.error("Error al verificar los intentos o cargar datos de usuario:", error);
        mostrarErrorCarga(`No se pudo verificar el número de intentos o cargar datos de usuario. ${error.message}`);
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', main);
