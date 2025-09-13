class ExamManager {
    constructor() {
        this.currentQuestion = 0;
        this.examData = null;
        this.answers = [];
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.sessionId = null;
        this.areaId = null;
        
        this.init();
    }

    init() {
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        this.sessionId = urlParams.get('id');
        this.areaId = urlParams.get('area');

        if (!this.sessionId || !this.areaId) {
            this.showError('Parámetros de examen inválidos');
            return;
        }

        this.setupEventListeners();
        this.loadExamData();
    }

    setupEventListeners() {
        // Navegación
        document.getElementById('btnPrevious').addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('btnNext').addEventListener('click', () => {
            this.nextQuestion();
        });

        // Finalizar examen
        document.getElementById('btnFinishExam').addEventListener('click', () => {
            this.showFinishModal();
        });

        document.getElementById('btnCancelFinish').addEventListener('click', () => {
            this.hideFinishModal();
        });

        document.getElementById('btnConfirmFinish').addEventListener('click', () => {
            this.finishExam();
        });

        // Prevenir salida accidental
        window.addEventListener('beforeunload', (e) => {
            if (this.examData && this.timeRemaining > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    async loadExamData() {
        try {
            this.showLoading(true);
            
            // En este caso, los datos del examen ya están en la sesión del servidor
            // Solo necesitamos obtener la información básica del área
            const areaResponse = await fetch(`/api/examenes/${this.areaId}`);
            if (!areaResponse.ok) {
                throw new Error('Error al cargar información del examen');
            }
            
            const areaData = await areaResponse.json();
            
            // Simular datos de examen (en una implementación real, esto vendría del servidor)
            this.examData = {
                titulo: areaData.examen.nombre,
                area: this.areaId,
                tiempo_limite: areaData.examen.tiempo_limite,
                preguntas: this.generateSampleQuestions(areaData.examen.numero_preguntas)
            };

            this.timeRemaining = this.examData.tiempo_limite * 60; // Convertir a segundos
            this.answers = new Array(this.examData.preguntas.length).fill(null);

            this.renderExam();
            this.startTimer();
            this.showLoading(false);

        } catch (error) {
            console.error('Error cargando examen:', error);
            this.showError('Error al cargar el examen. Por favor, intenta nuevamente.');
        }
    }

    generateSampleQuestions(numQuestions) {
        const sampleQuestions = [
            {
                id: 1,
                pregunta: "¿Cuál es el resultado de 2 + 2?",
                opciones: ["3", "4", "5", "6"],
                puntos: 2
            },
            {
                id: 2,
                pregunta: "¿Cuál es la capital de Colombia?",
                opciones: ["Medellín", "Cali", "Bogotá", "Barranquilla"],
                puntos: 2
            },
            {
                id: 3,
                pregunta: "¿Cuál es la fórmula del agua?",
                opciones: ["H2O", "CO2", "NaCl", "CH4"],
                puntos: 3
            }
        ];

        // Repetir preguntas si es necesario para alcanzar el número requerido
        const questions = [];
        for (let i = 0; i < numQuestions; i++) {
            const baseQuestion = sampleQuestions[i % sampleQuestions.length];
            questions.push({
                ...baseQuestion,
                id: i + 1,
                pregunta: `${baseQuestion.pregunta} (Pregunta ${i + 1})`
            });
        }

        return questions;
    }

    renderExam() {
        // Actualizar información del examen
        document.getElementById('examTitle').textContent = this.examData.titulo;
        document.getElementById('examArea').textContent = this.areaId.replace('_', ' ').toUpperCase();

        // Crear grid de navegación de preguntas
        this.renderQuestionGrid();

        // Mostrar primera pregunta
        this.renderCurrentQuestion();
    }

    renderQuestionGrid() {
        const grid = document.getElementById('questionGrid');
        grid.innerHTML = '';

        this.examData.preguntas.forEach((_, index) => {
            const item = document.createElement('div');
            item.className = 'question-grid-item';
            item.textContent = index + 1;
            item.addEventListener('click', () => {
                this.goToQuestion(index);
            });
            grid.appendChild(item);
        });

        this.updateQuestionGrid();
    }

    renderCurrentQuestion() {
        const question = this.examData.preguntas[this.currentQuestion];
        
        // Actualizar información de la pregunta
        document.getElementById('questionNumber').textContent = this.currentQuestion + 1;
        document.getElementById('questionPoints').innerHTML = `
            <i class="fas fa-star"></i>
            <span>${question.puntos} puntos</span>
        `;
        document.getElementById('questionText').textContent = question.pregunta;

        // Actualizar progreso
        const progress = ((this.currentQuestion + 1) / this.examData.preguntas.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = 
            `Pregunta ${this.currentQuestion + 1} de ${this.examData.preguntas.length}`;

        // Renderizar opciones
        this.renderOptions(question);

        // Actualizar botones de navegación
        document.getElementById('btnPrevious').disabled = this.currentQuestion === 0;
        document.getElementById('btnNext').disabled = this.currentQuestion === this.examData.preguntas.length - 1;

        // Actualizar grid
        this.updateQuestionGrid();
    }

    renderOptions(question) {
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';

        question.opciones.forEach((opcion, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            
            const isSelected = this.answers[this.currentQuestion] === index;
            if (isSelected) {
                optionDiv.classList.add('selected');
            }

            optionDiv.innerHTML = `
                <input type="radio" name="question_${this.currentQuestion}" value="${index}" ${isSelected ? 'checked' : ''}>
                <span class="option-text">${opcion}</span>
            `;

            optionDiv.addEventListener('click', () => {
                this.selectAnswer(index);
            });

            container.appendChild(optionDiv);
        });
    }

    selectAnswer(optionIndex) {
        this.answers[this.currentQuestion] = optionIndex;
        this.renderCurrentQuestion();
    }

    updateQuestionGrid() {
        const gridItems = document.querySelectorAll('.question-grid-item');
        gridItems.forEach((item, index) => {
            item.classList.remove('current', 'answered');
            
            if (index === this.currentQuestion) {
                item.classList.add('current');
            } else if (this.answers[index] !== null) {
                item.classList.add('answered');
            }
        });
    }

    goToQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < this.examData.preguntas.length) {
            this.currentQuestion = questionIndex;
            this.renderCurrentQuestion();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderCurrentQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestion < this.examData.preguntas.length - 1) {
            this.currentQuestion++;
            this.renderCurrentQuestion();
        }
    }

    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;

        // Cambiar color cuando queda poco tiempo
        const timerContainer = document.querySelector('.timer-container');
        if (this.timeRemaining <= 300) { // 5 minutos
            timerContainer.style.background = 'rgba(239, 68, 68, 0.2)';
        } else if (this.timeRemaining <= 600) { // 10 minutos
            timerContainer.style.background = 'rgba(245, 158, 11, 0.2)';
        }
    }

    timeUp() {
        clearInterval(this.timerInterval);
        alert('¡Tiempo agotado! El examen se enviará automáticamente.');
        this.finishExam();
    }

    showFinishModal() {
        const answeredCount = this.answers.filter(answer => answer !== null).length;
        const unansweredCount = this.examData.preguntas.length - answeredCount;

        document.getElementById('examSummary').innerHTML = `
            <div class="summary-item">
                <span>Total de preguntas:</span>
                <span>${this.examData.preguntas.length}</span>
            </div>
            <div class="summary-item">
                <span>Preguntas respondidas:</span>
                <span>${answeredCount}</span>
            </div>
            <div class="summary-item">
                <span>Preguntas sin responder:</span>
                <span>${unansweredCount}</span>
            </div>
            <div class="summary-item">
                <span>Tiempo restante:</span>
                <span>${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
        `;

        document.getElementById('finishModal').style.display = 'flex';
    }

    hideFinishModal() {
        document.getElementById('finishModal').style.display = 'none';
    }

    async finishExam() {
        try {
            clearInterval(this.timerInterval);
            this.showLoading(true);

            // En una implementación real, aquí se enviarían las respuestas al backend
            // y se recibiría el resultado.
            // Por ahora, simularemos un resultado y lo guardaremos en localStorage.
            
            const mockResult = {
                area: this.examData.titulo,
                porcentaje: Math.floor(Math.random() * 50 + 50), // Random score between 50-100
                preguntas_correctas: Math.floor(this.examData.preguntas.length * 0.8),
                total_preguntas: this.examData.preguntas.length,
                tiempo_usado: this.examData.tiempo_limite * 60 - this.timeRemaining,
                puntuacion: Math.floor(Math.random() * 500 + 500),
                puntuacion_maxima: 1000
            };

            localStorage.setItem('ultimoResultado', JSON.stringify(mockResult));
            
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simular espera

            // Redirigir a la página de resultados correcta
            window.location.href = `/frontend/pages/resultados.html`;

        } catch (error) {
            console.error('Error al finalizar examen:', error);
            this.showError('Error al finalizar el examen. Por favor, intenta nuevamente.');
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        this.showLoading(false);
        alert(message);
        // En una implementación real, podrías redirigir al dashboard
        window.location.href = '/frontend/pages/inicio.html';
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ExamManager();
});

