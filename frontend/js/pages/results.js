import { checkSession, handleLogout } from '../shared/auth.js';
import { formatDuration, getInitials } from '../shared/utils.js';
import { obtenerNumeroDeIntentos } from '../examen/storage.js';
import { startExam } from '../api/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const session = checkSession();
  if (!session.active) {
    window.location.href = '/frontend/pages/login.html';
    return;
  }

  const results = new Results(session);
  results.init();
});

class Results {
  constructor(session) {
    this.session = session;
    this.examResult = {};
  }

  init() {
    this.loadResultData();
    this.displayUserInfo();
    this.displayResults();
    this.setupEventListeners();
    this.checkRetryButton();
    this.checkAnswersButtonVisibility();

    // Re-intentar cargar info del header después de un delay
    setTimeout(() => this.displayUserInfo(), 500);
    setTimeout(() => this.displayUserInfo(), 1500);
  }

  async checkAnswersButtonVisibility() {
    console.log(
      'Iniciando verificación de disponibilidad de revisión de respuestas...'
    );

    const cardCorrect = document.getElementById('cardCorrect');
    const cardIncorrect = document.getElementById('cardIncorrect');
    const cardUnselected = document.getElementById('cardUnselected');

    const statCards = [cardCorrect, cardIncorrect, cardUnselected];

    // Intentar obtener el ID de sesión
    const sessionId =
      this.session.sessionId ||
      this.session.session_id ||
      this.session.sessionID ||
      this.session.token ||
      this.session.id;

    if (!sessionId) {
      console.error('ERROR: No se pudo encontrar un ID de sesión');
      statCards.forEach((card) => {
        if (card) card.classList.add('stat-card--disabled');
      });
      return;
    }

    try {
      const response = await fetch('/api/configuracion/examen', {
        headers: {
          'X-Session-ID': sessionId,
        },
      });

      if (response.ok) {
        const config = await response.json();
        console.log('Configuración de examen recibida:', config);

        if (
          config.show_correct_answers === true ||
          config.show_marked_answers === true
        ) {
          console.log(
            'Revisiones habilitadas por configuración (Completa o Marcadas)'
          );
          statCards.forEach((card) => {
            if (card) {
              card.classList.remove('stat-card--disabled');
              card.classList.add('stat-card--clickable');

              if (
                config.show_correct_answers === false &&
                config.show_marked_answers === true
              ) {
                card.title = 'Ver mis elecciones marcadas';
              } else {
                card.title = 'Ver detalle pedagógico';
              }
            }
          });
        } else {
          console.log('Revisiones deshabilitadas por configuración');
          statCards.forEach((card) => {
            if (card) {
              card.classList.add('stat-card--disabled');
              card.classList.remove('stat-card--clickable');
              card.title = 'Revisión deshabilitada por el administrador';
            }
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar la configuración de respuestas:', error);
      statCards.forEach((card) => {
        if (card) card.classList.add('stat-card--disabled');
      });
    }
  }

  loadResultData() {
    const resultData = localStorage.getItem('ultimoResultado');
    if (resultData) {
      this.examResult = JSON.parse(resultData);
    } else {
      this.examResult = {
        area: 'Área Desconocida',
        porcentaje: 0,
        preguntas_correctas: 0,
        preguntas_incorrectas: 0,
        preguntas_sin_responder: 0,
        total_preguntas: 0,
        tiempo_usado: 0,
        puntuacion: 0,
        puntuacion_maxima: 5.0,
      };
    }
  }

  displayUserInfo() {
    const heroUserName = document.getElementById('heroUserName');
    if (heroUserName) heroUserName.textContent = this.session.nombre_completo;

    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userGrade = document.getElementById('userGrade');
    const grado = this.session.grado || this.examResult.grado || '';

    if (userAvatar)
      userAvatar.textContent = getInitials(this.session.nombre_completo);
    if (userName) userName.textContent = this.session.nombre_completo;
    if (userGrade) userGrade.textContent = grado ? `Grado ${grado}` : '';
  }

  displayResults() {
    const {
      area,
      porcentaje,
      preguntas_correctas,
      preguntas_incorrectas,
      preguntas_sin_responder,
      tiempo_usado,
      puntuacion,
    } = this.examResult;

    let displayArea = area || 'Área';
    displayArea = displayArea.charAt(0).toUpperCase() + displayArea.slice(1);
    displayArea = displayArea.replace(/_/g, ' ');

    document.getElementById('examAreaTitle').textContent = displayArea;
    document.getElementById('scorePercentage').textContent = `${porcentaje}%`;
    document.getElementById('correctAnswers').textContent =
      `${preguntas_correctas}`;
    document.getElementById('incorrectAnswers').textContent = `${
      preguntas_incorrectas ?? 0
    }`;
    document.getElementById('unselectedAnswers').textContent = `${
      preguntas_sin_responder ?? 0
    }`;
    document.getElementById('timeUsed').textContent =
      formatDuration(tiempo_usado);

    const bigScoreEl = document.getElementById('bigScore');
    if (bigScoreEl) bigScoreEl.textContent = (puntuacion || 0).toFixed(1);

    this.updateScoreCircle(porcentaje);
  }

  async checkRetryButton() {
    try {
      const retryBtn = document.getElementById('retryExam');
      if (!retryBtn) return;

      // Si no tenemos el ID directo del resultado, no podemos consultar intentos específicos
      if (!this.examResult.id) {
        console.warn(
          'No se encontró ID de examen en los resultados. Buscando alternativa...'
        );
        // Opcional: Podríamos intentar cargar el ID desde la lista de exámenes si es necesario
        return;
      }

      const currentAttempts = await obtenerNumeroDeIntentos(this.examResult.id);

      // Intentar obtener el máximo de intentos del resultado o usar el valor por defecto configurado
      let maxAttempts = parseInt(this.examResult.numAttempts);

      // Si no viene en el resultado (por caché antigua), usar 1 como último recurso (seguridad).
      if (isNaN(maxAttempts)) {
        maxAttempts = 1;
      }

      console.log(
        `Verificando intentos: Actuales=${currentAttempts}, Máximos=${maxAttempts}`
      );

      if (currentAttempts < maxAttempts) {
        retryBtn.style.setProperty('display', 'inline-flex', 'important');
      } else {
        retryBtn.style.display = 'none';
        console.info('Se han agotado los intentos para este examen.');
      }
    } catch (error) {
      console.error('Error al verificar disponibilidad de reintento:', error);
    }
  }

  updateScoreCircle(percentage) {
    const circle = document.getElementById('scoreRing');
    const statusEl = document.getElementById('scoreStatus');
    const scoreContainer = document.querySelector('.score-circle');

    if (!circle || !statusEl) return;

    setTimeout(() => {
      circle.setAttribute('stroke-dasharray', `${percentage}, 100`);
    }, 100);

    let statusText = '';
    let statusClass = '';

    if (percentage >= 90) {
      statusText = '¡Excelente!';
      statusClass = 'excellent';
    } else if (percentage >= 80) {
      statusText = '¡Buen Trabajo!';
      statusClass = 'good';
    } else if (percentage >= 60) {
      statusText = 'Aprobado';
      statusClass = 'warning';
    } else {
      statusText = 'Necesitas Mejorar';
      statusClass = 'danger';
    }

    statusEl.textContent = statusText;
    if (scoreContainer) {
      scoreContainer.classList.remove('excellent', 'good', 'warning', 'danger');
      scoreContainer.classList.add(statusClass);
    }
  }

  setupEventListeners() {
    const btnBackDashboard = document.getElementById('backToDashboard');
    const btnRetryExam = document.getElementById('retryExam');

    // Paneles de estadísticas clicables
    const cardCorrect = document.getElementById('cardCorrect');
    const cardIncorrect = document.getElementById('cardIncorrect');
    const cardUnselected = document.getElementById('cardUnselected');

    if (btnBackDashboard) {
      btnBackDashboard.addEventListener('click', () => {
        window.location.href = `/frontend/pages/simulacro.html`;
      });
    }

    const navigateToFilteredReview = (filter) => {
      // Solo navegar si las tarjetas no están deshabilitadas
      if (cardCorrect && cardCorrect.classList.contains('stat-card--disabled'))
        return;
      window.location.href = `respuestas.html?filter=${filter}`;
    };

    if (cardCorrect) {
      cardCorrect.addEventListener('click', () =>
        navigateToFilteredReview('correct')
      );
    }
    if (cardIncorrect) {
      cardIncorrect.addEventListener('click', () =>
        navigateToFilteredReview('incorrect')
      );
    }
    if (cardUnselected) {
      cardUnselected.addEventListener('click', () =>
        navigateToFilteredReview('unmarked')
      );
    }

    if (btnRetryExam) {
      btnRetryExam.addEventListener('click', async () => {
        try {
          btnRetryExam.disabled = true;
          btnRetryExam.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Iniciando...';

          // Usar area_id técnico si está disponible, de lo contrario intentar con area
          const areaId = this.examResult.area_id || this.examResult.area;

          const examData = await startExam(
            areaId,
            this.session.codigo,
            this.session.grado
          );
          window.location.href = `/frontend/pages/examen.html?id=${examData.sesion_id}&area=${areaId}`;
        } catch (error) {
          console.error('Error al reintentar:', error);
          btnRetryExam.disabled = false;
          btnRetryExam.innerHTML =
            '<i class="fas fa-redo"></i> Volver a Intentar';
        }
      });
    }

    // Logout
    setTimeout(() => {
      const btnLogout = document.querySelector('.main-header__logout-btn');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => handleLogout(this.session));
      }
    }, 1000);
  }
}
