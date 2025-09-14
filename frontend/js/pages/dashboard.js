import {
    fetchUserData,
    loadExamAreas,
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
        document.querySelectorAll('.activity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const activity = e.target.getAttribute('data-activity');
                this.handleActivityClick(activity);
            });
        });

        const btnBack = document.getElementById('btnBackToActivities');
        if (btnBack) {
            btnBack.addEventListener('click', () => this.showActivitiesView());
        }

        const btnLogout = document.querySelector('.main-header__logout-btn');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => handleLogout(this.currentUser));
        }
    }

    async loadDashboardData() {
        this.examAreas = await loadExamAreas();
        this.renderExamAreas();
        const recentResults = await loadRecentResults(this.currentUser.codigo);
        this.renderRecentResults(recentResults);
    }

    handleActivityClick(activity) {
        if (activity === 'preunal') {
            this.showExamAreasView();
        } else {
            showNotification(`${activity} estará disponible próximamente.`, 'info');
        }
    }

    showActivitiesView() {
        document.querySelector('.activities-section').classList.remove('hidden');
        document.querySelector('.hero-section').classList.remove('hidden');
        document.getElementById('examAreasSection').classList.add('hidden');
    }

    showExamAreasView() {
        document.querySelector('.activities-section').classList.add('hidden');
        document.querySelector('.hero-section').classList.add('hidden');
        document.getElementById('examAreasSection').classList.remove('hidden');
    }

    renderExamAreas() {
        const examAreasGrid = document.getElementById('examAreasGrid');
        if (!examAreasGrid) return;

        examAreasGrid.innerHTML = '';
        this.examAreas.forEach(area => {
            const areaCard = this.createExamAreaCard(area);
            examAreasGrid.appendChild(areaCard);
        });
    }

    createExamAreaCard(area) {
        const card = document.createElement('div');
        card.className = 'exam-area-card';
        card.setAttribute('data-area', area.id);
        card.innerHTML = `
            <div class="exam-area-header">
                <div class="exam-area-icon"><i class="${area.icono}"></i></div>
                <div class="exam-area-title">
                    <h3>${area.nombre}</h3>
                    <p>${area.descripcion}</p>
                </div>
            </div>
            <div class="exam-area-stats">
                <div class="stat-item">
                    <span class="stat-value">${area.tiempo_limite}</span>
                    <span class="stat-label">Minutos</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${area.total_preguntas}</span>
                    <span class="stat-label">Preguntas</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value"><i class="fas fa-play-circle"></i></span>
                    <span class="stat-label">Iniciar</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => this.showExamConfirmation(area));
        return card;
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
}