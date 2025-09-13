document.addEventListener('DOMContentLoaded', () => {
    const resultsManager = new ResultsManager();
    resultsManager.init();
});

class ResultsManager {
    constructor() {
        this.currentUser = {};
        this.examResult = {};
    }

    init() {
        this.loadUserData();
        this.loadResultData();
        this.displayResults();
        this.setupEventListeners();
    }

    loadUserData() {
        this.currentUser.nombre = localStorage.getItem('usuario_nombre') || 'Estudiante';
        this.currentUser.grado = localStorage.getItem('usuario_grado') || 'Grado X';
        this.currentUser.codigo = localStorage.getItem('codigoEstudiantil') || 'IEM0000';

        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userGrade = document.getElementById('userGrade');

        if (userAvatar) userAvatar.textContent = this.getInitials(this.currentUser.nombre);
        if (userName) userName.textContent = this.currentUser.nombre;
        if (userGrade) userGrade.textContent = this.currentUser.grado;
    }

    loadResultData() {
        const resultData = localStorage.getItem('ultimoResultado');
        if (resultData) {
            this.examResult = JSON.parse(resultData);
        } else {
            // Mock data for demonstration purposes
            this.examResult = {
                area: 'Matemáticas',
                porcentaje: 85,
                preguntas_correctas: 17,
                total_preguntas: 20,
                tiempo_usado: 1530, // seconds
                puntuacion: 850,
                puntuacion_maxima: 1000
            };
        }
    }

    displayResults() {
        const { area, porcentaje, preguntas_correctas, total_preguntas, tiempo_usado, puntuacion, puntuacion_maxima } = this.examResult;

        document.getElementById('examAreaTitle').textContent = area;
        document.getElementById('scorePercentage').textContent = `${porcentaje}%`;
        document.getElementById('correctAnswers').textContent = `${preguntas_correctas} / ${total_preguntas}`;
        document.getElementById('incorrectAnswers').textContent = `${total_preguntas - preguntas_correctas} / ${total_preguntas}`;
        document.getElementById('timeUsed').textContent = this.formatTime(tiempo_usado);
        document.getElementById('score').textContent = `${puntuacion} / ${puntuacion_maxima}`;

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
        }, 100); // Delay to allow for transition
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
        const backToActivitiesButton = document.getElementById('backToDashboard');
        if (backToActivitiesButton) {
            backToActivitiesButton.addEventListener('click', () => {
                // Redirige a la vista de actividades principal
                window.location.href = `/frontend/pages/inicio.html?codigo=${this.currentUser.codigo}`;
            });
        }

        const backToExamsButton = document.getElementById('backToExams');
        if (backToExamsButton) {
            backToExamsButton.addEventListener('click', () => {
                // Redirige a la vista de áreas de examen
                window.location.href = `/frontend/pages/inicio.html?codigo=${this.currentUser.codigo}&view=exams`;
            });
        }
    }

    getInitials(fullName) {
        const names = fullName.trim().split(' ');
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        } else if (names.length === 1 && names[0] !== '') {
            return names[0].substring(0, 2).toUpperCase();
        }
        return '--';
    }

    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    async handleLogout() {
        try {
            const codigo = localStorage.getItem('codigoEstudiantil');
            await fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo })
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.clear();
            this.showNotification('Sesión cerrada correctamente', 'info');
            setTimeout(() => {
                this.redirectToLogin();
            }, 1500);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    redirectToLogin() {
        window.location.href = '/';
    }
}

// Agregar estilos CSS para las animaciones de notificación
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
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
    }
    .notification-error {
        background: #ef4444;
    }
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