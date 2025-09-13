// Dashboard JavaScript - Funcionalidad principal

class Dashboard {
    constructor() {
        this.currentUser = null;
        this.examAreas = [];
        this.currentView = 'activities'; // 'activities' o 'exams'
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.showActivitiesView();
    }

    loadUserData() {
        // Obtener datos del usuario desde la URL o localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const codigo = urlParams.get('codigo') || localStorage.getItem('codigoEstudiantil');
        
        if (codigo) {
            this.fetchUserData(codigo);
        } else {
            this.redirectToLogin();
        }
    }

    async fetchUserData(codigo) {
        try {
            const response = await fetch(`/api/usuario/${codigo}`);
            if (response.ok) {
                this.currentUser = await response.json();
                // Agregar el código al objeto del usuario para referencia
                this.currentUser.codigo = codigo;
                this.updateUserInterface();
            } else {
                throw new Error('Usuario no encontrado');
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            this.redirectToLogin();
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Actualizar información del usuario en el header
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userGrade = document.getElementById('userGrade');

        if (userAvatar) {
            userAvatar.textContent = this.getInitials(this.currentUser.nombre_completo);
        }
        
        if (userName) {
            userName.textContent = this.currentUser.nombre_completo;
        }
        
        if (userGrade) {
            userGrade.textContent = this.currentUser.grado;
        }

        // Actualizar título de bienvenida
        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) {
            const firstName = this.currentUser.nombre_completo.split(' ')[0];
            welcomeName.textContent = firstName;
        }
    }

    getInitials(fullName) {
        const names = fullName.trim().split(' ');
        if (names.length >= 3) {
            // Para nombres como "Ana María García" -> A + G (primer nombre + primer apellido)
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        } else if (names.length === 2) {
            // Para nombres como "Carlos López" -> C + L
            return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
        } else if (names.length === 1) {
            // Solo un nombre, tomar las dos primeras letras
            return names[0].substring(0, 2).toUpperCase();
        }
        return 'NN'; // Fallback
    }

    setupEventListeners() {
        // Event listeners para botones de actividades
        document.querySelectorAll('.activity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const activity = e.target.getAttribute('data-activity');
                this.handleActivityClick(activity);
            });
        });

        // Event listener para botón de volver a actividades
        const btnBack = document.getElementById('btnBackToActivities');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.showActivitiesView();
            });
        }

        // Event listener para botón de logout
        const btnLogout = document.querySelector('.btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Event listener para botón de retry
        const btnRetry = document.getElementById('btnRetry');
        if (btnRetry) {
            btnRetry.addEventListener('click', () => {
                this.loadExamAreas();
            });
        }
    }

    handleActivityClick(activity) {
        switch (activity) {
            case 'preunal':
                this.showExamAreasView();
                break;
            case 'preicfes':
                this.showComingSoon('Preicfes');
                break;
            case 'laboratorios':
                this.showComingSoon('Laboratorios Interactivos');
                break;
            default:
                console.log('Actividad no reconocida:', activity);
        }
    }

    showActivitiesView() {
        this.currentView = 'activities';
        
        // Mostrar sección de actividades
        const activitiesSection = document.querySelector('.activities-section');
        const heroSection = document.querySelector('.hero-section');
        const examAreasSection = document.getElementById('examAreasSection');
        
        if (activitiesSection) activitiesSection.classList.remove('hidden');
        if (heroSection) heroSection.classList.remove('hidden');
        if (examAreasSection) examAreasSection.classList.add('hidden');
    }

    showExamAreasView() {
        this.currentView = 'exams';
        
        // Ocultar sección de actividades y mostrar áreas de examen
        const activitiesSection = document.querySelector('.activities-section');
        const heroSection = document.querySelector('.hero-section');
        const examAreasSection = document.getElementById('examAreasSection');
        
        if (activitiesSection) activitiesSection.classList.add('hidden');
        if (heroSection) heroSection.classList.add('hidden');
        if (examAreasSection) examAreasSection.classList.remove('hidden');
        
        // Cargar áreas de examen
        this.loadExamAreas();
    }

    async loadExamAreas() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const examAreasGrid = document.getElementById('examAreasGrid');

        // Mostrar estado de carga
        if (loadingState) loadingState.classList.remove('hidden');
        if (errorState) errorState.classList.add('hidden');
        if (examAreasGrid) examAreasGrid.innerHTML = '';

        try {
            const response = await fetch('/api/examenes');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.examAreas = await response.json();
            this.renderExamAreas();
            this.loadRecentResults();
            
        } catch (error) {
            console.error('Error al cargar áreas de examen:', error);
            this.showErrorState();
        } finally {
            if (loadingState) loadingState.classList.add('hidden');
        }
    }

    renderExamAreas() {
        const examAreasGrid = document.getElementById('examAreasGrid');
        if (!examAreasGrid || !this.examAreas) return;

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
                <div class="exam-area-icon">
                    <i class="${area.icono}"></i>
                </div>
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
                    <span class="stat-value">
                        <i class="fas fa-play-circle"></i>
                    </span>
                    <span class="stat-label">Iniciar</span>
                </div>
            </div>
        `;

        // Agregar event listener para abrir modal
        card.addEventListener('click', () => {
            this.showExamModal(area);
        });

        return card;
    }

    showExamModal(area) {
        // Crear modal dinámicamente
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirmar Examen</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="exam-info">
                        <div class="info-item">
                            <i class="fas fa-book"></i>
                            <span><strong>Área:</strong> ${area.nombre}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span><strong>Tiempo límite:</strong> ${area.tiempo_limite} minutos</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-question-circle"></i>
                            <span><strong>Preguntas:</strong> ${area.total_preguntas}</span>
                        </div>
                    </div>
                    <div class="exam-description">
                        ${area.descripcion_completa || area.descripcion}
                    </div>
                    <div class="exam-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <strong>Importante:</strong> Una vez iniciado el examen, no podrás pausarlo. 
                            Asegúrate de tener tiempo suficiente para completarlo.
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-cancel">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                    <button class="btn-primary modal-start" data-area="${area.id}">
                        <i class="fas fa-play"></i>
                        Iniciar Examen
                    </button>
                </div>
            </div>
        `;

        // Agregar event listeners del modal
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        const startBtn = modal.querySelector('.modal-start');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        startBtn.addEventListener('click', () => {
            this.startExam(area.id);
            closeModal();
        });

        // Agregar modal al DOM
        document.body.appendChild(modal);
    }

    async startExam(areaId) {
        try {
            const response = await fetch(`/api/examenes/${areaId}/iniciar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo: this.currentUser.codigo
                })
            });

            if (response.ok) {
                const examData = await response.json();
                // Redirigir a la página del examen
                window.location.href = `/frontend/pages/examen.html?id=${examData.sesion_id}&area=${areaId}`;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || 'Error al iniciar el examen');
            }
        } catch (error) {
            console.error('Error al iniciar examen:', error);
            this.showNotification('Error al iniciar el examen. Intenta nuevamente.', 'error');
        }
    }

    async loadRecentResults() {
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer || !this.currentUser) return;

        const loadingResults = document.getElementById('loadingResults');
        if (loadingResults) loadingResults.classList.remove('hidden');

        try {
            const response = await fetch(`/api/resultados/${this.currentUser.codigo}`);
            if (response.ok) {
                const results = await response.json();
                this.renderRecentResults(results);
            } else {
                this.showNoResults();
            }
        } catch (error) {
            console.error('Error al cargar resultados:', error);
            this.showNoResults();
        } finally {
            if (loadingResults) loadingResults.classList.add('hidden');
        }
    }

    renderRecentResults(results) {
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer) return;

        if (!results || results.length === 0) {
            this.showNoResults();
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
                <div class="result-date">${this.formatDate(result.fecha)}</div>
            `;
            
            resultsGrid.appendChild(resultCard);
        });

        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(resultsGrid);
    }

    showNoResults() {
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-chart-line"></i>
                <p>Aún no tienes resultados de evaluaciones.</p>
            </div>
        `;
    }

    showErrorState() {
        const errorState = document.getElementById('errorState');
        if (errorState) {
            errorState.classList.remove('hidden');
        }
    }

    showComingSoon(activityName) {
        this.showNotification(`${activityName} estará disponible próximamente.`, 'info');
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    async handleLogout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo: this.currentUser?.codigo
                })
            });

            // Limpiar todos los datos locales independientemente de la respuesta
            localStorage.removeItem('codigoEstudiantil');
            localStorage.removeItem('usuario_nombre');
            localStorage.removeItem('usuario_grado');
            localStorage.removeItem('sesion_inicio');
            
            // Mostrar mensaje de confirmación
            this.showNotification('Sesión cerrada correctamente', 'info');
            
            // Redirigir al login después de un breve delay
            setTimeout(() => {
                this.redirectToLogin();
            }, 1000);
            
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Limpiar datos locales y redirigir aún con error
            localStorage.removeItem('codigoEstudiantil');
            localStorage.removeItem('usuario_nombre');
            localStorage.removeItem('usuario_grado');
            localStorage.removeItem('sesion_inicio');
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        window.location.href = '/';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Dashboard...');
    new Dashboard();
});

// Agregar estilos CSS para las animaciones de notificación
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

