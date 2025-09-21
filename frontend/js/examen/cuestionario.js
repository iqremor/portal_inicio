import { state } from './state.js';
// Se elimina la importación de datos fijos de constants.js
import { handleZoomKeys } from './zoom.js';
import { entrarEnModoInmersivo, mostrarAlertaPersonalizada, mostrarPaginaFinal, mostrarConfirmacion, mostrarAlertaPersonalizadaConBoton } from './ui.js';
import { guardarIntento } from './storage.js';

let renderImage;
let showEndPage;

export function setupQuiz(renderImageFn, showEndPageFn) {
    renderImage = renderImageFn;
    showEndPage = showEndPageFn;
}

function cleanup() {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('keydown', handleGlobalKeys);
    if (state.temporizadorIntervalo) {
        clearInterval(state.temporizadorIntervalo);
    }
}

async function anularIntentoPorInfraccion(motivo) {
    if (state.intentoAnulado || state.paginaActual !== 'quiz') return;

    // Pausar el temporizador
    clearInterval(state.temporizadorIntervalo);

    // Anular el intento directamente sin pedir confirmación.
    state.intentoAnulado = true;
    cleanup();
    // Mostrar un mensaje de que el intento fue anulado y por qué.
    await mostrarAlertaPersonalizada("Intento Anulado", `Has ${motivo}. Tu intento ha sido anulado.`, 4000);
    if (state.paginaActual === 'quiz') {
        showEndPage();
    }
}

function handleVisibilityChange() {
    if (document.hidden && state.paginaActual === 'quiz') {
        anularIntentoPorInfraccion('cambiado de pestaña');
    }
}

function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (!isFullscreen && state.paginaActual === 'quiz') {
        anularIntentoPorInfraccion('salido del modo de pantalla completa');
    }
}

function handleGlobalKeys(event) {
    handleZoomKeys(event);
}

// La función de barajar se mantiene por si se necesita en el futuro, pero el backend ya debería enviar las preguntas barajadas.
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function iniciarQuiz(examData) {
    state.paginaActual = 'quiz';
    state.imageList = examData.questions; // Usa las preguntas del backend
    state.config = examData.config;       // Usa la configuración del backend
    state.indicePreguntaActual = 0;
    state.intentoAnulado = false;
    
    entrarEnModoInmersivo();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleGlobalKeys);
    
    renderImage();
    iniciarTemporizador();
}

export function iniciarTemporizador() {
    if (state.temporizadorIntervalo) {
        clearInterval(state.temporizadorIntervalo);
    }

    // Usa la configuración de tiempo del estado, recibida del backend
    state.tiempoRestante = state.config.timerDuration;

    function actualizarTemporizador() {
        const temporizadorElemento = document.getElementById('temporizador-display');
        if (!temporizadorElemento) {
            clearInterval(state.temporizadorIntervalo);
            return;
        }

        if (state.intentoAnulado || state.tiempoRestante <= 0) {
            clearInterval(state.temporizadorIntervalo);
            return;
        }

        state.tiempoRestante--;
        const minutos = Math.floor(state.tiempoRestante / 60);
        const segundos = state.tiempoRestante % 60;
        temporizadorElemento.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;

        if (state.tiempoRestante <= 0) {
            clearInterval(state.temporizadorIntervalo);
            mostrarAlertaPersonalizadaConBoton("¡Tiempo Agotado!", "El tiempo para esta pregunta ha finalizado. ¡Sigue adelante!")
                .then(() => {
                    siguienteImagen();
                });
            return;
        }

        // Usa el warningTime de la configuración del estado
        if (state.tiempoRestante === state.config.warningTime) {
            mostrarAlertaPersonalizada("¡Atención!", `¡Apúrate! Quedan solo ${state.config.warningTime} segundos.`, 3000);
        }

        if (state.tiempoRestante <= state.config.warningTime && state.tiempoRestante > 0) {
            const timerContainer = temporizadorElemento.closest('.timer-container-quiz');
            if (timerContainer) {
                timerContainer.classList.add('timer-warning-quiz');
            }
        }
    }

    state.temporizadorIntervalo = setInterval(actualizarTemporizador, 1000);
}

export async function siguienteImagen() {
    if (state.indicePreguntaActual < state.imageList.length - 1) {
        state.indicePreguntaActual++;
        // Renderiza la nueva imagen y reinicia el temporizador para ella.
        renderImage();
        iniciarTemporizador();
    } else {
        cleanup();
        // Guardar el intento antes de mostrar la página final.
        // Por ahora, no tenemos un sistema de puntuación, así que guardamos una nota de 0.
        await guardarIntento({ nota: 0, fecha: new Date() }, state.currentUser.codigo); // Pass userCodigo
        state.attemptCount++; // Incrementamos el contador en el estado local
        showEndPage();
    }
}