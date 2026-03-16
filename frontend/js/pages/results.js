import { checkSession, handleLogout } from '../shared/auth.js';
import { formatDuration, getInitials } from '../shared/utils.js';

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
      puntuacion_maxima,
    } = this.examResult;

    document.getElementById('examAreaTitle').textContent = area;
    document.getElementById('scorePercentage').textContent = `${porcentaje}%`;
    document.getElementById('correctAnswers').textContent =
      `${preguntas_correctas} / ${total_preguntas}`;
    document.getElementById('incorrectAnswers').textContent = `${
      total_preguntas - preguntas_correctas
    } / ${total_preguntas}`;
    document.getElementById('timeUsed').textContent =
      formatDuration(tiempo_usado);
    document.getElementById('score').textContent =
      `${puntuacion} / ${puntuacion_maxima}`;

    this.updateScoreCircle(porcentaje);
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
    } else if (percentage >= 70) {
      statusText = '¡Buen Trabajo!';
      statusClass = 'good';
    } else if (percentage >= 50) {
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
    const btnBackExams = document.getElementById('backToExams');

    if (btnBackDashboard) {
      btnBackDashboard.addEventListener('click', () => {
        window.location.href = `/frontend/pages/dashboard.html`;
      });
    }

    if (btnBackExams) {
      btnBackExams.addEventListener('click', () => {
        window.location.href = `/frontend/pages/dashboard.html#exams`;
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
