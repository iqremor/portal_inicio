import { checkSession, handleLogout } from '../shared/auth.js';
import { getInitials } from '../shared/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const session = checkSession();
  if (!session.active) {
    window.location.href = '/frontend/pages/login.html';
    return;
  }

  const review = new ResponseReview(session);
  review.init();
});

class ResponseReview {
  constructor(session) {
    this.session = session;
    this.examResult = null;
  }

  init() {
    this.loadData();
    this.displayUserInfo();
    this.renderTable();
    this.setupEventListeners();

    // Re-intentar cargar info del header después de un delay (por carga asíncrona de fragmentos)
    setTimeout(() => this.displayUserInfo(), 500);
    setTimeout(() => this.displayUserInfo(), 1500);
  }

  loadData() {
    const data = localStorage.getItem('ultimoResultado');
    if (data) {
      this.examResult = JSON.parse(data);
      document.getElementById('examTitle').textContent = (
        this.examResult.area || 'Prueba'
      )
        .replace(/_/g, ' ')
        .toUpperCase();
    } else {
      window.location.href = 'resultados.html';
    }
  }

  displayUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userGrade = document.getElementById('userGrade');
    const grado =
      this.session.grado || (this.examResult ? this.examResult.grado : '');

    if (userAvatar)
      userAvatar.textContent = getInitials(this.session.nombre_completo);
    if (userName) userName.textContent = this.session.nombre_completo;
    if (userGrade) userGrade.textContent = grado ? `Grado ${grado}` : '';
  }

  renderTable() {
    const tbody = document.getElementById('answersTableBody');
    if (!tbody || !this.examResult.revision) return;

    // Filtrar solo las que tienen respuesta (diferente de 'NONE')
    const answeredQuestions = this.examResult.revision.filter(
      (q) => q.user_answer !== 'NONE'
    );

    if (answeredQuestions.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" style="text-align:center; padding: 3rem;">No respondiste ninguna pregunta en esta prueba.</td></tr>';
      return;
    }

    tbody.innerHTML = answeredQuestions
      .map(
        (q) => `
            <tr>
                <td>
                    <div class="col-pregunta">
                        <span class="q-number">${q.question_number}</span>
                        <img src="${q.image_url}" alt="Pregunta ${
                          q.question_number
                        }" class="img-review" onclick="window.open(this.src, '_blank')">
                    </div>
                </td>
                <td style="text-align: center;">
                    <span class="option-letter option-correct">${
                      q.correct_answer
                    }</span>
                </td>
                <td style="text-align: center;">
                    ${
                      !q.is_correct
                        ? `<span class="option-letter option-incorrect">${q.user_answer}</span>`
                        : `<span class="no-error">— (Correcta) —</span>`
                    }
                </td>
            </tr>
        `
      )
      .join('');
  }

  setupEventListeners() {
    document.getElementById('backToResults').addEventListener('click', () => {
      window.location.href = 'resultados.html';
    });

    // Configurar logout tras carga de fragmentos
    setTimeout(() => {
      const btnLogout = document.querySelector('.main-header__logout-btn');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => handleLogout(this.session));
      }
    }, 1000);
  }
}
