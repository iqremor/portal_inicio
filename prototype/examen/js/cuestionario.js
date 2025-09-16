import { state } from './state.js';
import { imagePaths, quizConfig, Data } from './constants.js';
import { handleZoomKeys } from './zoom.js';
import { entrarEnModoInmersivo, mostrarAlertaPersonalizada, mostrarPaginaFinal, mostrarConfirmacion, mostrarAlertaPersonalizadaConBoton } from './ui.js';
import { guardarIntento } from '../data/storage.js';

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
/**
 * Algoritmo Fisher-Yates para barajar un array de forma aleatoria y sin sesgo.
 * @param {Array} array El array a barajar.
 * @returns {Array} El mismo array, pero barajado.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function iniciarQuiz() {
    state.paginaActual = 'quiz';
    const shuffledImages = shuffleArray([...imagePaths]).slice(0,Data.numQuestions); // Selecciona solo las primeras 10 imágenes barajadas
    state.imageList = shuffledImages;
    state.indicePreguntaActual = 0;
    state.intentoAnulado = false;
    entrarEnModoInmersivo();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleGlobalKeys);
    // Renderiza la primera imagen y luego inicia el temporizador.
    renderImage();
    iniciarTemporizador();
}

export function iniciarTemporizador() {
    // Limpiar cualquier temporizador anterior al iniciar uno nuevo para el quiz.
    if (state.temporizadorIntervalo) {
        clearInterval(state.temporizadorIntervalo);
    }

    state.tiempoRestante = quizConfig.timerDuration;

    function actualizarTemporizador() {
        // El elemento del temporizador se recrea en cada render, así que lo buscamos en cada tick.
        const temporizadorElemento = document.getElementById('temporizador-display');
        if (!temporizadorElemento) {
            // Si el elemento no existe (ej. en la página final), detenemos el intervalo.
            clearInterval(state.temporizadorIntervalo);
            return;
        }

        // Asegurarse de que el tiempo no siga corriendo si el intento fue anulado.
        if (state.intentoAnulado || state.tiempoRestante <= 0) {
            clearInterval(state.temporizadorIntervalo);
            return;
        }

        state.tiempoRestante--;
        const minutos = Math.floor(state.tiempoRestante / 60);
        const segundos = state.tiempoRestante % 60;
        temporizadorElemento.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;

        // Si el tiempo se agota, mostramos una alerta y pasamos a la siguiente pregunta.
        if (state.tiempoRestante <= 0) {
            clearInterval(state.temporizadorIntervalo);
            mostrarAlertaPersonalizadaConBoton("¡Tiempo Agotado!", "El tiempo para esta pregunta ha finalizado. ¡Sigue adelante!")
                .then(() => {
                    siguienteImagen();
                });
            return; // Detenemos la ejecución para este tick.
        }

        // Mostrar alerta de advertencia una sola vez cuando se alcanza el umbral.
        if (state.tiempoRestante === quizConfig.warningTime) {
            mostrarAlertaPersonalizada("¡Atención!", `¡Apúrate! Quedan solo ${quizConfig.warningTime} segundos.`, 3000);
        }

        // La condición de advertencia ahora es cuando el tiempo restante es MENOR O IGUAL al umbral.
        if (state.tiempoRestante <= quizConfig.warningTime && state.tiempoRestante > 0) {
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
        await guardarIntento({ nota: 0, fecha: new Date() });
        state.attemptCount++; // Incrementamos el contador en el estado local
        showEndPage();
    }
}