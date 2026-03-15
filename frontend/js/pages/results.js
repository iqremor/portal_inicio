import { checkSession } from '../shared/auth.js';
import { getInitials, formatDuration } from '../shared/utils.js';

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
  }

  loadResultData() {
    const resultData = localStorage.getItem('ultimoResultado');
    if (resultData) {
      this.examResult = JSON.parse(resultData);
    } else {
      // Mock data for fallback
      this.examResult = {
        area: 'Matemáticas',
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
    const heroUserName = document.getElementById('heroUserName');
    const heroUserGrade = document.getElementById('heroUserGrade');

    // Priorizar el nombre de la sesión
    if (heroUserName) heroUserName.textContent = this.session.nombre_completo;

    // Obtener grado de la sesión o del resultado del examen
    const grado = this.session.grado || this.examResult.grado || 'estudiante';
    if (heroUserGrade) heroUserGrade.textContent = `del grado ${grado}°`;
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
    this.updateScoreStatus(porcentaje);
  }

  updateScoreCircle(percentage) {
    const circle = document.getElementById('scoreRing');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, 100);
  }

  updateScoreStatus(percentage) {
    const statusEl = document.getElementById('scoreStatus');
    if (percentage >= 90) {
      statusEl.textContent = '¡Excelente!';
      statusEl.style.color = 'var(--accent-color)';
    } else if (percentage >= 70) {
      statusEl.textContent = '¡Buen Trabajo!';
      statusEl.style.color = 'var(--primary-color)';
    } else if (percentage >= 50) {
      statusEl.textContent = 'Aprobado';
      statusEl.style.color = 'var(--warning-color)';
    } else {
      statusEl.textContent = 'Necesitas Mejorar';
      statusEl.style.color = 'var(--danger-color)';
    }
  }

  setupEventListeners() {
    document.getElementById('backToDashboard').addEventListener('click', () => {
      window.location.href = `/frontend/pages/dashboard.html?codigo=${this.session.codigo}`;
    });

    document.getElementById('backToExams').addEventListener('click', () => {
      window.location.href = `/frontend/pages/dashboard.html?codigo=${this.session.codigo}&view=exams`;
    });
  }
}
