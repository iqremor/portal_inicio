import {
  setup as setupUI,
  mostrarPaginaInicio,
  renderizarImagen,
  mostrarAlertaPersonalizada,
} from './ui.js';
import {
  setupQuiz,
  iniciarQuiz,
  siguienteImagen,
  recargarImagen,
  saveUserAnswer,
} from './cuestionario.js';
import { obtenerNumeroDeIntentos } from './storage.js';
import { state } from './state.js';
import { fetchUserData, getExamQuestions, startExam } from '../api/index.js';
import { checkSession } from '../shared/auth.js';

import { quizConfig } from './constants.js'; // Import quizConfig

// Función para mostrar un error de carga y detener la ejecución
function mostrarErrorCarga(mensaje) {
  mostrarAlertaPersonalizada('Error de Carga', mensaje, 10000);
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
    mostrarErrorCarga('Error: Datos del examen no cargados previamente.');
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
    mostrarErrorCarga(
      "Error: No se encontró el elemento principal de la aplicación ('app')."
    );
    return;
  }
  setupUI(
    handleStartQuiz,
    siguienteImagen,
    appElement,
    recargarImagen,
    saveUserAnswer
  ); // Pass it
  setupQuiz(renderizarImagen);

  const urlParams = new URLSearchParams(window.location.search);
  const areaId = urlParams.get('area');
  const sessionId = urlParams.get('id');

  if (!areaId || !sessionId) {
    mostrarErrorCarga(
      'La URL es inválida. No se especificó un área o sesión de examen.'
    );
    return;
  }

  const session = checkSession();
  const userCode = session.codigo;

  if (!session.active || !userCode) {
    mostrarErrorCarga(
      'No se pudo obtener el código de usuario de la sesión o la sesión no está activa.'
    );
    return;
  }

  try {
    state.currentUser = await fetchUserData(userCode);
    state.userCodigo = userCode;
    state.sessionId = sessionId;

    let examData;
    try {
      examData = await getExamQuestions(sessionId);
    } catch (error) {
      // Si el servidor dice que no hay examen activo (404 o 400)
      if (error.status === 404 || error.status === 400) {
        // Si no hay areaId definido en la URL, no podemos auto-iniciar, redirigimos al lobby
        if (!areaId) {
          console.warn(
            'No hay examen activo y no se especificó área. Redirigiendo al lobby.'
          );
          window.location.href = '/frontend/pages/simulacro.html';
          return;
        }

        console.log(
          `Sesión de examen inactiva (${error.status}). Intentando recuperar datos para área: ${areaId}...`
        );

        try {
          // Intentar iniciar o recuperar el examen
          await startExam(areaId, userCode, state.currentUser.grado);
          examData = await getExamQuestions(sessionId);
        } catch (startError) {
          console.error('No se pudo recuperar el examen:', startError);
          // Si el inicio falla (ej: sin intentos), redirigir al lobby
          window.location.href = '/frontend/pages/simulacro.html';
          return;
        }
      } else {
        throw error;
      }
    }

    state.examData = examData;
    console.log('Fetched examData:', state.examData); // ADDED LOG

    // Format subject name for display
    if (state.examData.config && state.examData.config.subject) {
      let subject = state.examData.config.subject;
      subject = subject.charAt(0).toUpperCase() + subject.slice(1);
      subject = subject.replace(/_/g, ' ');
      state.examData.config.subject = subject;
    }

    // Fetch current attempts using cuadernilloId
    const attemptsData = await obtenerNumeroDeIntentos(state.examData.id); // Pass cuadernilloId
    state.currentAttempt = attemptsData;

    // Priorizar el valor que viene de la API del backend
    state.totalAttemptsAllowed =
      state.examData.numAttempts ||
      (state.examData.config && state.examData.config.numAttempts)
        ? state.examData.numAttempts || state.examData.config.numAttempts
        : quizConfig.numAttempts;

    mostrarPaginaInicio(
      examData.config,
      state.currentAttempt,
      state.totalAttemptsAllowed
    ); // Pass attempt data
  } catch (error) {
    console.error(
      'Error al verificar los intentos o cargar datos de usuario:',
      error
    );
    mostrarErrorCarga(
      `No se pudo verificar el número de intentos o cargar datos de usuario. ${error.message}`
    );
  }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', main);
