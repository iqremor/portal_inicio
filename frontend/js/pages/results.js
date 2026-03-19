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

    // Re-intentar cargar info del header después de un delay (por carga asíncrona de fragmentos)
    setTimeout(() => this.displayUserInfo(), 500);
    setTimeout(() => this.displayUserInfo(), 1500);
  }

  loadResultData() {
    const resultData = localStorage.getItem('ultimoResultado');
    if (resultData) {
      this.examResult = JSON.parse(resultData);
    } else {
      // Fallback si no hay resultados
      this.examResult = {
        area: 'Área Desconocida',
        porcentaje: 0,
        preguntas_correctas: 0,
        total_preguntas: 0,
        tiempo_usado: 0,
        puntuacion: 0,
        puntuacion_maxima: 5.0,
      };
    }
  }

  displayUserInfo() {
    // 1. Hero Section
    const heroUserName = document.getElementById('heroUserName');
    const heroUserGrade = document.getElementById('heroUserGrade');

    if (heroUserName) heroUserName.textContent = this.session.nombre_completo;

    const grado = this.session.grado || this.examResult.grado || '';
    if (heroUserGrade)
      heroUserGrade.textContent = grado ? `Grado ${grado}` : '';

    // 2. Header (Avatar e Info)
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userGrade = document.getElementById('userGrade');

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
      total_preguntas,
      tiempo_usado,
      puntuacion,
    } = this.examResult;

    // Formatear el nombre del área para mostrar (ej: ciencias_naturales -> Ciencias Naturales)
    let displayArea = area;
    if (displayArea) {
      displayArea = displayArea.charAt(0).toUpperCase() + displayArea.slice(1);
      displayArea = displayArea.replace(/_/g, ' ');
    }

    document.getElementById('examAreaTitle').textContent = displayArea;
    document.getElementById('scorePercentage').textContent = `${porcentaje}%`;
    document.getElementById('correctAnswers').textContent =
      `${preguntas_correctas}`;
    document.getElementById('incorrectAnswers').textContent = `${
      total_preguntas - preguntas_correctas
    }`;
    document.getElementById('timeUsed').textContent =
      formatDuration(tiempo_usado);
    document.getElementById('score').textContent = `${puntuacion.toFixed(1)}`;

    this.updateScoreCircle(porcentaje);
  }

  async checkRetryButton() {
    try {
      const retryBtn = document.getElementById('retryExam');
      if (!retryBtn) return;

      if (this.examResult.id) {
        const currentAttempts = await obtenerNumeroDeIntentos(
          this.examResult.id
        );
        // Obtenemos el máximo de intentos de la configuración o usamos 3 por defecto
        const maxAttempts = this.examResult.numAttempts || 3;
        if (currentAttempts < maxAttempts) {
          retryBtn.style.display = 'inline-block';
        }
      } else {
        // Si no tenemos el ID por alguna razón, mostramos el botón y dejamos que el flujo normal valide
        retryBtn.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Error checking retry availability:', error);
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

    if (btnBackDashboard) {
      btnBackDashboard.addEventListener('click', () => {
        window.location.href = `/frontend/pages/dashboard.html`;
      });
    }

    if (btnRetryExam) {
      btnRetryExam.addEventListener('click', async () => {
        try {
          // Deshabilitar botón para evitar múltiples clics
          btnRetryExam.disabled = true;
          btnRetryExam.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Iniciando...';

          const areaId = this.examResult.area;
          const userCodigo = this.session.codigo;
          const grado = this.session.grado;

          if (!areaId || !userCodigo || !grado) {
            throw new Error(
              'Información insuficiente para reintentar el examen.'
            );
          }

          const examData = await startExam(areaId, userCodigo, grado);
          window.location.href = `/frontend/pages/examen.html?id=${examData.sesion_id}&area=${areaId}`;
        } catch (error) {
          console.error('Error al reintentar el examen:', error);
          alert(
            error.message ||
              'No se pudo iniciar el examen. Por favor, intenta desde el inicio.'
          );
          btnRetryExam.disabled = false;
          btnRetryExam.innerHTML =
            '<i class="fas fa-redo"></i> Volver a Intentar';
        }
      });
    }

    // Configurar logout tras carga de fragmentos
    setTimeout(() => {
      const btnLogout = document.querySelector('.main-header__logout-btn');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => handleLogout(this.session));
      }
    }, 1000);
  }
}
