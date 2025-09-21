import { setup as setupUI, mostrarPaginaInicio, renderizarImagen, mostrarPaginaFinal, mostrarAlertaPersonalizada } from './ui.js';
import { setupQuiz, iniciarQuiz, siguienteImagen, iniciarTemporizador } from './cuestionario.js';
import { obtenerNumeroDeIntentos } from './storage.js';
import { state } from './state.js';
import { fetchUserData, getExamQuestions } from '../api/index.js';
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
    // Ya no necesitamos hacer fetch aquí, los datos ya están en state.examData
    if (!state.examData) {
        mostrarErrorCarga("Error: Datos del examen no cargados previamente.");
        return;
    }

    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `<div style="text-align: center; padding: 2rem;">Cargando examen...</div>`;

    iniciarQuiz(state.examData); // <--- MODIFICADO: Usar datos ya cargados
}

// Función principal que se ejecuta al cargar la página
async function main() {
    const appElement = document.getElementById('app'); // Get the element here
    if (!appElement) {
        mostrarErrorCarga("Error: No se encontró el elemento principal de la aplicación ('app').");
        return;
    }
    setupUI(handleStartQuiz, siguienteImagen, iniciarTemporizador, appElement); // Pass it
    setupQuiz(renderizarImagen, mostrarPaginaFinal);

    const urlParams = new URLSearchParams(window.location.search);
    const areaId = urlParams.get('area');
    const sessionId = urlParams.get('id');

    if (!areaId || !sessionId) {
        mostrarErrorCarga("La URL es inválida. No se especificó un área o sesión de examen.");
        return;
    }

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
        
        // --- MODIFICADO: Usar la nueva API GET para obtener examData ---
        const examData = await getExamQuestions(sessionId);
        state.examData = examData; // Guardar examData en el estado para usarlo en handleStartQuiz



        mostrarPaginaInicio(examData.config); // <--- MODIFICADO: Pasar examData.config a mostrarPaginaInicio

    } catch (error) {
        console.error("Error al verificar los intentos o cargar datos de usuario:", error);
        mostrarErrorCarga(`No se pudo verificar el número de intentos o cargar datos de usuario. ${error.message}`);
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', main);
