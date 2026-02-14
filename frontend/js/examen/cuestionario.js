import { state } from './state.js';
import { quizConfig } from './constants.js';
import { handleZoomKeys } from './zoom.js';
import { entrarEnModoInmersivo, mostrarAlertaPersonalizada, mostrarPaginaFinal, mostrarConfirmacion, mostrarAlertaPersonalizadaConBoton } from './ui.js';
import { submitExam } from '../api/index.js'; // Importar submitExam desde el API

let renderImage;
let showEndPage;

export function setupQuiz(renderImageFn, showEndPageFn) {
    renderImage = renderImageFn;
    showEndPage = showEndPageFn;
}

export function recargarImagen() {
    renderImage();
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

    clearInterval(state.temporizadorIntervalo);
    state.intentoAnulado = true;
    cleanup();
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

export function saveUserAnswer(questionIndex, selectedOption) {
    state.userAnswers[questionIndex] = selectedOption;
}

async function submitQuizResults() {
    try {
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        const userCodigo = userSession ? userSession.codigo : null;

        if (!userCodigo) {
            mostrarAlertaPersonalizada("Error", "Código de usuario no encontrado para finalizar el examen.", 4000);
            return;
        }

        // Prepare answers for submission in the expected format by the backend
        const answersToSubmit = state.userAnswers.map((answer, index) => {
            // Assuming presentedQuestions[index] has a 'question_number' property
            const questionNumber = state.presentedQuestions[index] ? state.presentedQuestions[index].question_number : (index + 1);
            return {
                question_number: questionNumber,
                selected_option: answer // 'A', 'B', 'C', 'D'
            };
        });

        const result = await submitExam(state.sessionId, answersToSubmit, userCodigo);
        localStorage.setItem('ultimoResultado', JSON.stringify(result));
        window.location.href = `/frontend/pages/resultados.html`;

    } catch (error) {
        console.error("Error al finalizar el examen:", error);
        mostrarAlertaPersonalizada("Error", error.message || "Ocurrió un error al finalizar el examen.", 4000);
    }
}

export function iniciarQuiz(examData) {
    console.log("iniciarQuiz received examData:", examData); // ADDED LOG
    state.paginaActual = 'quiz';
    state.indicePreguntaActual = 0;
    state.intentoAnulado = false;
    state.examData = examData; // Store full examData

    // Las preguntas ya vienen seleccionadas y con la URL de la imagen desde el backend
    state.presentedQuestions = examData.questions;
    state.imageList = state.presentedQuestions.map(q => q.image_url);

    // Initialize user answers array
    state.userAnswers = new Array(state.presentedQuestions.length).fill(null);

    // Format subject name for display
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

    state.tiempoRestante = quizConfig.timerDuration;

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
        renderImage();
        iniciarTemporizador();
    } else {
        cleanup();
        await submitQuizResults(); // Call submitQuizResults when quiz ends
        state.attemptCount++;
        // showEndPage(); // No longer needed as we redirect after submission
    }
}