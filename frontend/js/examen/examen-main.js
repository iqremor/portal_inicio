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
    setupUI(handleStartQuiz, siguienteImagen, iniciarTemporizador);
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

        // --- Lógica para construir imageList dinámicamente ---
        const imageBaseUrl = examData.dir_banco.startsWith('data/') ? 
                             `/data_files/${examData.dir_banco.replace('data/', '', 1)}` : 
                             `/static/${examData.dir_banco}`;
        const totalImages = examData.total_preguntas_banco;
        const imageList = Array.from({ length: totalImages }, (_, i) => {
            const num = (i + 1).toString().padStart(2, '0');
            return `${imageBaseUrl}pregunta_${num}.jpg`;
        });

        // Función para barajar (copiada de cuestionario.js)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        const shuffledImageList = shuffleArray(imageList);
        state.imageList = shuffledImageList.slice(0, examData.config.numQuestions); // Seleccionar solo numQuestions

        // FIX: Format subject name for display
        if (examData.config && examData.config.subject) {
            let subject = examData.config.subject;
            // Capitalize first letter
            subject = subject.charAt(0).toUpperCase() + subject.slice(1);
            // Replace underscores with spaces
            subject = subject.replace(/_/g, ' ');
            examData.config.subject = subject;
        }

        mostrarPaginaInicio(examData.config); // <--- MODIFICADO: Pasar examData.config a mostrarPaginaInicio

    } catch (error) {
        console.error("Error al verificar los intentos o cargar datos de usuario:", error);
        mostrarErrorCarga(`No se pudo verificar el número de intentos o cargar datos de usuario. ${error.message}`);
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', main);
