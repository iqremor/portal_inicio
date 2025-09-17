import {
    fetchUserData,
    startExam,
    loadRecentResults
} from '../api/index.js';
import { checkSession, clearSession, handleLogout } from '../shared/auth.js';
import { getInitials, formatDate } from '../shared/utils.js';
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

        if (userAvatar) userAvatar.textContent = getInitials(this.currentUser.nombre_completo);
        if (userName) userName.textContent = this.currentUser.nombre_completo;
        if (userGrade) userGrade.textContent = this.currentUser.grado;
        if (heroUserName) heroUserName.textContent = this.currentUser.nombre_completo;
        if (heroUserGrade) heroUserGrade.textContent = `Grado ${this.currentUser.grado}`;
    }

    setupEventListeners() {
        const btnLogout = document.querySelector('.main-header__logout-btn');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => handleLogout(this.currentUser));
        }
    }

    async loadDashboardData() {
        await this.loadExamsForGrade(this.currentUser.grado);
        const recentResults = await loadRecentResults(this.currentUser.codigo);
        this.renderRecentResults(recentResults);
    }

    

    showExamConfirmation(area) {
        const body = `
            <div class="exam-info">
                <div class="info-item"><i class="fas fa-book"></i><span><strong>Área:</strong> ${area.nombre}</span></div>
                <div class="info-item"><i class="fas fa-clock"></i><span><strong>Tiempo límite:</strong> ${area.tiempo_limite} minutos</span></div>
                <div class="info-item"><i class="fas fa-question-circle"></i><span><strong>Preguntas:</strong> ${area.total_preguntas}</span></div>
            </div>
            <div class="exam-description">${area.descripcion_completa || area.descripcion}</div>
            <div class="exam-warning"><i class="fas fa-exclamation-triangle"></i><div><strong>Importante:</strong> Una vez iniciado el examen, no podrás pausarlo.</div></div>
        `;

        showModal({
            title: 'Confirmar Examen',
            body: body,
            onConfirm: () => this.startExam(area.id)
        });
    }

    async startExam(areaId) {
        try {
            const examData = await startExam(areaId, this.currentUser.codigo);
            window.location.href = `/frontend/pages/examen.html?id=${examData.sesion_id}&area=${areaId}`;
        } catch (error) {
            showNotification('Error al iniciar el examen. Intenta nuevamente.', 'error');
        }
    }

    renderRecentResults(results) {
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer) return;

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `<div class="no-results"><i class="fas fa-chart-line"></i><p>Aún no tienes resultados.</p></div>`;
            return;
        }

        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'results-grid';
        results.slice(0, 3).forEach(result => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            resultCard.innerHTML = `
                <div class="result-header">
                    <span class="result-area">${result.area}</span>
                    <span class="result-score">${result.puntuacion}%</span>
                </div>
                <div class="result-date">${formatDate(result.fecha)}</div>
            `;
            resultsGrid.appendChild(resultCard);
        });

        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(resultsGrid);
    }

    async loadExamsForGrade(grade) {
        try {
            const response = await fetch(`/api/examenes/grado/${grade}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const exams = await response.json();
            this.renderExamCards(exams);
        } catch (error) {
            console.error('Error loading exams for grade:', error);
            showNotification('Error al cargar los exámenes. Intenta nuevamente.', 'error');
        }
    }

    renderExamCards(exams) {
        const activitiesSection = document.querySelector('.activities-section');
        if (!activitiesSection) return;

        activitiesSection.innerHTML = '';

        if (exams.length === 0) {
            activitiesSection.innerHTML = `<div class="no-exams"><i class="fas fa-book-open"></i><p>No hay exámenes disponibles para tu grado.</p></div>`;
            return;
        }

        exams.forEach(exam => {
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
                    class="start-exam-btn ${isActive ? '' : 'disabled'}" 
                    data-area-id="${exam.area}"
                    data-active="${isActive}"
                >
                    ${isActive ? 'Iniciar Examen' : 'No Disponible'}
                </button>
            `;
            activitiesSection.appendChild(card);
        });

        // Añadir event listeners a los botones
        document.querySelectorAll('.start-exam-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const isActive = e.target.getAttribute('data-active') === 'true';

                if (!isActive) {
                    showNotification('Este examen no se encuentra disponible actualmente.', 'info');
                    return;
                }
                
                const areaId = e.target.getAttribute('data-area-id');
                // NOTA: El session ID '1' es un placeholder.
                const sessionId = '1'; 
                window.location.href = `/frontend/pages/examen.html?area=${areaId}&id=${sessionId}`;
            });
        });
    }
}