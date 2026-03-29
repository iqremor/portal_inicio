import { state } from './state.js';
import { quizConfig } from './constants.js';
import { handleZoomKeys } from './zoom.js';
import {
  entrarEnModoInmersivo,
  mostrarAlertaPersonalizada,
  mostrarAlertaPersonalizadaConBoton,
} from './ui.js';
import { submitExam } from '../api/index.js'; // Importar submitExam desde el API

let renderImage;

export function setupQuiz(renderImageFn) {
  renderImage = renderImageFn;
}

export function recargarImagen() {
  renderImage(true);
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

  // 1. Enviar resultados actuales (vacíos o parciales) para que cuente como intento
  try {
    // Pasamos false para que NO redirija a resultados.html
    await submitQuizResults(false);
  } catch (e) {
    console.error('Error al registrar anulación en el servidor:', e);
  }

  // 2. Mostrar la alerta de infracción
  await mostrarAlertaPersonalizada(
    'Intento Anulado',
    `Has ${motivo}. Este intento se ha descontado de tus oportunidades disponibles.`,
    5000
  );

  // 3. Recargar la página. Al recargar, el main() de examen-main.js volverá a ejecutarse,
  // consultará los intentos al backend (que ahora incluirá este) y mostrará la página de Inicio.
  window.location.reload();
}

function handleVisibilityChange() {
  if (document.hidden && state.paginaActual === 'quiz') {
    anularIntentoPorInfraccion('cambiado de pestaña');
  }
}

function handleFullscreenChange() {
  const isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;
  if (!isFullscreen && state.paginaActual === 'quiz') {
    anularIntentoPorInfraccion('salido del modo de pantalla completa');
  }
}

function handleGlobalKeys(event) {
  handleZoomKeys(event);
}

export function saveUserAnswer(questionIndex, selectedOption) {
  state.userAnswers[questionIndex] = selectedOption;
}

async function submitQuizResults(shouldRedirect = true) {
  try {
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    const userCodigo = userSession ? userSession.codigo : null;

    if (!userCodigo) {
      mostrarAlertaPersonalizada(
        'Error',
        'Código de usuario no encontrado para finalizar el examen.',
        4000
      );
      return;
    }

    // Prepare answers for submission in the expected format by the backend
    const answersToSubmit = state.userAnswers.map((answer, index) => {
      const questionNumber = state.presentedQuestions[index]
        ? state.presentedQuestions[index].question_number
        : index + 1;

      // Asegurarnos de enviar 'NONE' si no hay respuesta
      const selectedOption =
        answer === null || answer === undefined ? 'NONE' : answer;

      return {
        question_number: questionNumber,
        selected_option: selectedOption,
      };
    });

    const result = await submitExam(
      state.sessionId,
      answersToSubmit,
      userCodigo,
      state.tiempoTotalConsumido // Nuevo parámetro
    );

    if (shouldRedirect) {
      localStorage.setItem('ultimoResultado', JSON.stringify(result));
      window.location.href = `/frontend/pages/resultados.html`;
    }

    return result;
  } catch (error) {
    console.error('Error al finalizar el examen:', error);
    if (shouldRedirect) {
      mostrarAlertaPersonalizada(
        'Error',
        error.message || 'Ocurrió un error al finalizar el examen.',
        4000
      );
    }
    throw error;
  }
}

export function iniciarQuiz(examData) {
  console.log('iniciarQuiz received examData:', examData); // ADDED LOG
  state.paginaActual = 'quiz';
  state.indicePreguntaActual = 0;
  state.intentoAnulado = false;
  state.examData = examData; // Store full examData

  // Sincronizar quizConfig con la configuración dinámica del backend
  if (examData.config) {
    if (examData.config.timerDuration)
      quizConfig.timerDuration = examData.config.timerDuration;
    if (examData.config.warningTime)
      quizConfig.warningTime = examData.config.warningTime;
    if (examData.config.nextButtonDelay)
      quizConfig.nextButtonDelay = examData.config.nextButtonDelay;
    if (examData.config.numAttempts)
      quizConfig.numAttempts = examData.config.numAttempts;
  }

  // Las preguntas ya vienen seleccionadas y con la URL de la imagen desde el backend
  state.presentedQuestions = examData.questions;
  state.imageList = state.presentedQuestions.map((q) => q.image_url);

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

  // Inicializar el tiempo ANTES de renderizar la primera imagen
  state.tiempoRestanteActual =
    quizConfig.timerDuration + (state.sobrantePreguntaAnterior || 0);

  renderImage();
  iniciarTemporizador();
}

export function iniciarTemporizador() {
  if (state.temporizadorIntervalo) {
    clearInterval(state.temporizadorIntervalo);
  }

  // El tiempo ya debe estar inicializado en iniciarQuiz o siguienteImagen
  if (state.tiempoRestanteActual === undefined) {
    state.tiempoRestanteActual =
      quizConfig.timerDuration + (state.sobrantePreguntaAnterior || 0);
  }

  const temporizadorElemento = document.getElementById('temporizador-display');

  // Función interna para actualizar el DOM
  const refrescarDOM = () => {
    if (!temporizadorElemento) return;
    const minutos = Math.floor(state.tiempoRestanteActual / 60);
    const segundos = state.tiempoRestanteActual % 60;
    temporizadorElemento.textContent = `${minutos}:${segundos
      .toString()
      .padStart(2, '0')}`;
  };

  // Actualización inmediata antes de iniciar el intervalo
  refrescarDOM();

  function actualizarTemporizador() {
    if (!temporizadorElemento) {
      clearInterval(state.temporizadorIntervalo);
      return;
    }

    if (state.intentoAnulado || state.tiempoRestanteActual <= 0) {
      clearInterval(state.temporizadorIntervalo);
      return;
    }

    state.tiempoRestanteActual--;
    state.tiempoTotalConsumido++;
    refrescarDOM();

    if (state.tiempoRestanteActual <= 0) {
      clearInterval(state.temporizadorIntervalo);
      state.sobrantePreguntaAnterior = 0;
      mostrarAlertaPersonalizadaConBoton(
        '¡Tiempo Agotado!',
        'El tiempo para esta pregunta ha finalizado. ¡Sigue adelante!'
      ).then(() => {
        siguienteImagen();
      });
      return;
    }

    if (state.tiempoRestanteActual === quizConfig.warningTime) {
      mostrarAlertaPersonalizada(
        '¡Atención!',
        `¡Apúrate! Quedan solo ${quizConfig.warningTime} segundos.`,
        3000
      );
    }

    if (
      state.tiempoRestanteActual <= quizConfig.warningTime &&
      state.tiempoRestanteActual > 0
    ) {
      const timerContainer = temporizadorElemento.closest(
        '.timer-container-quiz'
      );
      if (timerContainer) {
        timerContainer.classList.add('timer-warning-quiz');
      }
    }
  }

  state.temporizadorIntervalo = setInterval(actualizarTemporizador, 1000);
}

export async function siguienteImagen() {
  // Antes de pasar, guardar el sobrante actual para la siguiente
  state.sobrantePreguntaAnterior = Math.max(0, state.tiempoRestanteActual);

  if (state.indicePreguntaActual < state.imageList.length - 1) {
    state.indicePreguntaActual++;
    // Inicializar el tiempo de la nueva pregunta ANTES de renderizar (base + sobrante)
    state.tiempoRestanteActual =
      quizConfig.timerDuration + state.sobrantePreguntaAnterior;
    renderImage();
    iniciarTemporizador();
  } else {
    cleanup();
    await submitQuizResults(); // Call submitQuizResults when quiz ends
    state.attemptCount++;
    // showEndPage(); // No longer needed as we redirect after submission
  }
}
