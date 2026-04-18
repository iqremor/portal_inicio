import {
  fetchUserData,
  startExamById,
  loadExamsForGrade as apiLoadExamsForGrade, // Renamed to avoid conflict with method name
} from '../api/index.js';
import { checkSession, clearSession, handleLogout } from '../shared/auth.js';
import { getInitials } from '../shared/utils.js';
import { showNotification } from '../components/notification.js';
import { showModal } from '../components/modal.js';

document.addEventListener('DOMContentLoaded', () => {
  const session = checkSession();
  if (!session.active) {
    window.location.href = '/frontend/pages/login.html';
    return;
  }

  const dashboard = new Dashboard(session);
  dashboard.init();
});

class Dashboard {
  constructor(session) {
    this.session = session;
    this.currentUser = null;
    this.examAreas = [];
  }

  async init() {
    try {
      this.currentUser = await fetchUserData(this.session.codigo);
      this.currentUser.codigo = this.session.codigo;
      this.updateUI();
      this.setupEventListeners();
      this.loadDashboardData();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      clearSession();
      window.location.href = '/frontend/pages/login.html';
    }
  }

  updateUI() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userGrade = document.getElementById('userGrade');
    const heroUserName = document.getElementById('heroUserName');
    const heroUserGrade = document.getElementById('heroUserGrade');

    if (userAvatar)
      userAvatar.textContent = getInitials(this.currentUser.nombre_completo);
    if (userName) userName.textContent = this.currentUser.nombre_completo;
    if (userGrade) userGrade.textContent = this.currentUser.grado;
    if (heroUserName)
      heroUserName.textContent = this.currentUser.nombre_completo;
    if (heroUserGrade)
      heroUserGrade.textContent = `Grado ${this.currentUser.grado}`;
  }

  setupEventListeners() {
    const btnLogout = document.querySelector('.main-header__logout-btn');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => handleLogout(this.currentUser));
    }

    // Listeners para los nuevos módulos
    const btnPreicfes = document.getElementById('btn-preicfes');
    if (btnPreicfes) {
      btnPreicfes.addEventListener('click', () => {
        window.location.href = '/frontend/pages/simulacro.html'; // Redirige a la página específica de Preicfes
      });
    }

    const btnPreunal = document.getElementById('btn-preunal');
    if (btnPreunal) {
      btnPreunal.addEventListener('click', () => {
        window.location.href = '/frontend/pages/simulacro_unal.html'; // Redirige a la nueva página de Preunal
      });
    }

    const btnLaboratorios = document.getElementById('btn-laboratorios');
    if (btnLaboratorios) {
      btnLaboratorios.addEventListener('click', () => {
        showNotification('Módulo de Laboratorios en desarrollo.', 'info');
      });
    }
  }

  async loadDashboardData() {
    this.checkModulesAvailability();
    // await this.loadExamsForGrade(this.currentUser.grado); // Comentado temporalmente mientras migramos a módulos
  }

  checkModulesAvailability() {
    if (!this.currentUser || !this.currentUser.modules) {
      console.warn(
        'DEBUG DASHBOARD: No se encontró objeto de módulos en el usuario:',
        this.currentUser
      );
      return;
    }

    console.log(
      'DEBUG DASHBOARD: Datos de módulos recibidos:',
      this.currentUser.modules
    );

    const { preicfes, preunal, laboratorios } = this.currentUser.modules;

    const preicfesVisible = this.updateModuleStatus('btn-preicfes', preicfes);
    const preunalVisible = this.updateModuleStatus('btn-preunal', preunal);
    const laboratoriosVisible = this.updateModuleStatus(
      'btn-laboratorios',
      laboratorios
    );

    console.log(
      `DEBUG DASHBOARD: Visibilidad -> Saber: ${preicfesVisible}, UNAL: ${preunalVisible}, Labs: ${laboratoriosVisible}`
    );

    // Si todos los módulos están ocultos, mostrar mensaje sin destruir el grid
    if (!preicfesVisible && !preunalVisible && !laboratoriosVisible) {
      this.showNoActivitiesMessage(true);
    } else {
      this.showNoActivitiesMessage(false);
    }
  }

  updateModuleStatus(btnId, isEnabled) {
    const btn = document.getElementById(btnId);
    if (!btn) return false;

    const cardId = btnId.replace('btn-', 'card-');
    const card =
      btn.closest('.activity-card-new') || document.getElementById(cardId);

    if (isEnabled) {
      if (card) {
        card.style.display = 'flex';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
      }
      btn.disabled = false;
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
      btn.textContent = btnId === 'btn-preicfes' ? 'Prueba Saber' : 'Comenzar';
      return true;
    } else {
      if (card) {
        card.style.display = 'none';
      }
      btn.disabled = true;
      return false;
    }
  }

  showNoActivitiesMessage(show) {
    const activitiesGrid = document.querySelector('.activities-grid');
    let msgContainer = document.getElementById('no-activities-msg');

    if (show) {
      if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.id = 'no-activities-msg';
        msgContainer.className = 'no-activities-container';
        msgContainer.innerHTML = `
          <i class="fas fa-calendar-times"></i>
          <p>Sin actividades disponibles por el momento.</p>
        `;
        if (activitiesGrid) {
          activitiesGrid.parentNode.insertBefore(
            msgContainer,
            activitiesGrid.nextSibling
          );
        }
      }
      msgContainer.style.display = 'block';
      if (activitiesGrid) activitiesGrid.style.display = 'none';
    } else {
      if (msgContainer) msgContainer.style.display = 'none';
      if (activitiesGrid) activitiesGrid.style.display = 'grid';
    }
  }

  showExamConfirmation(area) {
    const body = `
            <div class="exam-info">
                <div class="info-item"><i class="fas fa-book"></i><span><strong>Área:</strong> ${
                  area.nombre
                }</span></div>
                <div class="info-item"><i class="fas fa-clock"></i><span><strong>Tiempo límite:</strong> ${
                  area.tiempo_limite
                } minutos</span></div>
                <div class="info-item"><i class="fas fa-question-circle"></i><span><strong>Preguntas:</strong> ${
                  area.total_preguntas
                }</span></div>
            </div>
            <div class="exam-description">${
              area.descripcion_completa || area.descripcion
            }</div>
            <div class="exam-warning"><i class="fas fa-exclamation-triangle"></i><div><strong>Importante:</strong> Una vez iniciado el examen, no podrás pausarlo.</div></div>
        `;

    showModal({
      title: 'Confirmar Examen',
      body: body,
      onConfirm: () => this.startExam(area.id),
    });
  }

  async startExam(cuadernilloId, areaId) {
    try {
      const examData = await startExamById(
        cuadernilloId,
        this.currentUser.codigo
      );
      window.location.href = `/frontend/pages/examen.html?id=${examData.sesion_id}&area=${areaId}`;
    } catch (error) {
      showNotification(
        'Error al iniciar el examen. Intenta nuevamente.',
        'error'
      );
    }
  }

  async loadExamsForGrade(grade) {
    try {
      // Use the imported API function which now handles authentication
      const exams = await apiLoadExamsForGrade(grade, this.currentUser.codigo);
      this.renderExamCards(exams);
    } catch (error) {
      console.error('Error loading exams for grade:', error);
      showNotification(
        'Error al cargar los exámenes. Intenta nuevamente.',
        'error'
      );
    }
  }

  renderExamCards(exams) {
    const activitiesSection = document.querySelector('.activities-section');
    if (!activitiesSection) return;

    let examsContainer = activitiesSection.querySelector('.exams-container');
    if (!examsContainer) {
      examsContainer = document.createElement('div');
      examsContainer.classList.add('exams-container');
      activitiesSection.appendChild(examsContainer);
    } else {
      examsContainer.innerHTML = ''; // Limpiar exámenes existentes si se recargan
    }

    const activeExams = exams.filter((exam) => exam.activo);

    if (activeExams.length === 0) {
      examsContainer.innerHTML =
        '<p class="no-exams-message">No hay exámenes disponibles para tu grado en este momento.</p>';
      return;
    }

    activeExams.forEach((exam) => {
      const card = document.createElement('div');
      card.className = 'activity-card';
      const isActive = exam.activo; // Usar el flag 'activo' que viene del backend

      // FIX: Remove grade from exam name for display
      const displayName = exam.nombre.split(' - Grado')[0];

      card.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="activity-info">
                    <h3>${displayName}</h3>
                    <p>${exam.descripcion}</p>
                </div>
                <button
                    class="start-exam-btn"
                    data-id="${exam.id}"
                    data-area-id="${exam.area}"
                    data-active="${isActive}"
                >
                    Iniciar Examen
                </button>
            `;
      examsContainer.appendChild(card);
    });

    // Añadir event listeners a los botones
    document.querySelectorAll('.start-exam-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const isActive = e.target.getAttribute('data-active') === 'true';

        if (!isActive) {
          showNotification(
            'Este examen no se encuentra disponible actualmente.',
            'info'
          );
          return;
        }

        const cuadernilloId = e.target.getAttribute('data-id');
        const areaId = e.target.getAttribute('data-area-id');
        this.startExam(cuadernilloId, areaId); // Llamar a la función startExam de la clase Dashboard
      });
    });
  }
}
