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
    this.config = {
      show_correct_answers: true,
      show_marked_answers: true,
    };
  }

  async init() {
    this.loadData();
    await this.loadConfig();
    this.displayUserInfo();
    this.renderTable();
    this.setupEventListeners();

    // Re-intentar cargar info del header después de un delay (por carga asíncrona de fragmentos)
    setTimeout(() => this.displayUserInfo(), 500);
    setTimeout(() => this.displayUserInfo(), 1500);
  }

  async loadConfig() {
    try {
      const sessionId =
        this.session.sessionId ||
        this.session.session_id ||
        this.session.sessionID ||
        this.session.token ||
        this.session.id;

      const response = await fetch('/api/configuracion/examen', {
        headers: {
          'X-Session-ID': sessionId,
        },
      });

      if (response.ok) {
        this.config = await response.json();
      }
    } catch (error) {
      console.error('Error al cargar la configuración de revisión:', error);
    }
  }

  loadData() {
    const data = localStorage.getItem('ultimoResultado');
    if (data) {
      this.examResult = JSON.parse(data);
      const titleEl = document.getElementById('examTitle');
      if (titleEl) {
        titleEl.textContent = (this.examResult.area || 'Prueba')
          .replace(/_/g, ' ')
          .toUpperCase();
      }
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
    const thead = document.querySelector('.review-table thead tr');
    const filterContainer = document.querySelector('.review-filters');

    if (!tbody || !this.examResult.revision || !thead) return;

    // Obtener filtro de la URL
    const urlParams = new URLSearchParams(window.location.search);
    let filter = urlParams.get('filter') || 'all';

    // Mantener los filtros activos: El usuario siempre puede filtrar lo que respondió
    // Ocultar visualmente las pestañas de éxito/error SOLO si el admin quiere total privacidad
    // Pero si el usuario llega vía clic desde Resultados, debemos mostrarle su categoría.

    let filteredQuestions = this.examResult.revision;

    // Ajustar encabezado según el filtro y la configuración
    if (filter === 'unmarked') {
      thead.innerHTML = '<th>Pregunta</th>';
    } else if (!this.config.show_correct_answers) {
      // Modo "A ciegas": Solo mostramos la pregunta y lo que el usuario marcó
      thead.innerHTML = `
        <th>Pregunta</th>
        <th style="text-align: center;">Tu Respuesta Marcada</th>
      `;
    } else {
      // Modo Completo: Mostramos pregunta, clave y respuesta del usuario
      thead.innerHTML = `
        <th>Pregunta</th>
        <th style="text-align: center;">Respuesta Correcta</th>
        <th style="text-align: center;">Tu Respuesta</th>
      `;
    }

    if (filter === 'correct') {
      filteredQuestions = this.examResult.revision.filter((q) => q.is_correct);
      document.getElementById('viewTitle').textContent = 'Tus Aciertos';
    } else if (filter === 'incorrect') {
      filteredQuestions = this.examResult.revision.filter(
        (q) => !q.is_correct && q.user_answer !== 'NONE'
      );
      document.getElementById('viewTitle').textContent = 'Tus Errores';
    } else if (filter === 'unmarked') {
      filteredQuestions = this.examResult.revision.filter(
        (q) => q.user_answer === 'NONE'
      );
      document.getElementById('viewTitle').textContent = 'Preguntas Sin Marcar';
    } else {
      document.getElementById('viewTitle').textContent = this.config
        .show_correct_answers
        ? 'Revisión General'
        : 'Mis Elecciones Marcadas';
    }

    // Marcar pestaña activa
    document.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.classList.remove('active');
      if (tab.id === `filter-${filter}`) {
        tab.classList.add('active');
      }
    });

    if (filteredQuestions.length === 0) {
      const colspan = filter === 'unmarked' ? 1 : 3;
      tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; padding: 3rem;">No hay preguntas para mostrar en esta categoría.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredQuestions
      .map((q) => {
        const isUnmarked = filter === 'unmarked';
        const rowContent = `
            <td style="${isUnmarked ? 'text-align: center;' : ''}">
                <div class="col-pregunta" style="${
                  isUnmarked ? 'justify-content: center;' : ''
                }">
                    <img src="${q.image_url}" alt="Pregunta ${
                      q.question_number
                    }" class="img-review">
                </div>
            </td>
        `;

        if (isUnmarked) {
          return `<tr>${rowContent}</tr>`;
        }

        // Caso: Solo ver respuestas marcadas
        if (!this.config.show_correct_answers) {
          return `
            <tr>
                ${rowContent}
                <td style="text-align: center;">
                    <span class="option-letter option-unmarked">${
                      q.user_answer === 'NONE' ? 'N/M' : q.user_answer
                    }</span>
                </td>
            </tr>
          `;
        }

        // Caso: Revisión completa (Normal)
        return `
            <tr>
                ${rowContent}
                <td style="text-align: center;">
                    ${
                      q.user_answer === 'NONE'
                        ? '<span class="no-error">—</span>'
                        : `<span class="option-letter option-correct">${q.correct_answer}</span>`
                    }
                </td>
                <td style="text-align: center;">
                    ${
                      q.user_answer === 'NONE'
                        ? `<span class="option-letter option-unmarked">N/M</span>`
                        : !q.is_correct
                          ? `<span class="option-letter option-incorrect">${q.user_answer}</span>`
                          : `<span class="no-error">— (Correcta) —</span>`
                    }
                </td>
            </tr>
        `;
      })
      .join('');

    // Configurar el modal para todas las imágenes
    this.setupImageModal();
  }

  setupImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const closeBtn = document.querySelector('.modal-close');

    if (!modal || !modalImg) return;

    // Abrir modal al hacer clic en imagen de revisión
    document.querySelectorAll('.img-review').forEach((img) => {
      img.addEventListener('click', () => {
        modal.style.display = 'block';
        modalImg.src = img.src;
      });
    });

    // Cerrar con el botón X
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Cerrar al hacer clic fuera de la imagen
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
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
