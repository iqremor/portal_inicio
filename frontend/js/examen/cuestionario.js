import { state } from './state.js';
import { quizConfig, Data } from './constants.js'; // <--- MODIFICADO: Importar quizConfig y Data
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function iniciarQuiz(examData) {
    state.paginaActual = 'quiz';
    state.indicePreguntaActual = 0;
    state.intentoAnulado = false;

    // --- Lógica para construir imageList dinámicamente ---
    let cleanedDirBanco = examData.dir_banco;
    // Remove leading 'data/' or '/data/' repeatedly until no more prefixes are found
    while (cleanedDirBanco.startsWith('data/') || cleanedDirBanco.startsWith('/data/')) {
        if (cleanedDirBanco.startsWith('/data/')) {
            cleanedDirBanco = cleanedDirBanco.substring('/data/'.length);
        } else if (cleanedDirBanco.startsWith('data/')) {
            cleanedDirBanco = cleanedDirBanco.substring('data/'.length);
        }
    }
    const imageBaseUrl = `/data_files/${cleanedDirBanco}`; // Always use /data_files/
    
    const totalImages = examData.total_preguntas_banco;
    const imageList = Array.from({ length: totalImages }, (_, i) => {
        const num = (i + 1).toString().padStart(2, '0');
        return `${imageBaseUrl}pregunta_${num}.jpg`;
    });

    const shuffledImageList = shuffleArray(imageList); // Use the shuffleArray from this file
    state.imageList = shuffledImageList.slice(0, examData.config.numQuestions); // Seleccionar solo numQuestions

    // Format subject name for display (moved from examen-main.js)
    if (examData.config && examData.config.subject) {
        let subject = examData.config.subject;
        subject = subject.charAt(0).toUpperCase() + subject.slice(1);
        subject = subject.replace(/_/g, ' ');
        examData.config.subject = subject;
    }

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
    state.tiempoRestante = quizConfig.timerDuration; // <--- MODIFICADO: Usar quizConfig.timerDuration

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
        if (state.tiempoRestante === quizConfig.warningTime) {
            mostrarAlertaPersonalizada("¡Atención!", `¡Apúrate! Quedan solo ${quizConfig.warningTime} segundos.`, 3000);
        }

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