import { getExamQuestions, submitExam } from '../api/index.js';
import { Timer } from '../shared/timer.js';
import { showNotification } from '../components/notification.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('id');
    const areaId = urlParams.get('area');

    if (!sessionId || !areaId) {
        showNotification('Parámetros de examen inválidos', 'error');
        return;
    }

    const exam = new Exam(sessionId, areaId);
    exam.init();
});

class Exam {
    constructor(sessionId, areaId) {
        this.sessionId = sessionId;
        this.areaId = areaId;
        this.examData = null;
        this.answers = [];
        this.currentQuestion = 0;
        this.timer = null;
    }

    async init() {
        try {
            this.examData = await getExamQuestions(this.sessionId);
            this.answers = new Array(this.examData.preguntas.length).fill(null);
            this.render();
            this.startTimer();
            this.setupEventListeners();
        } catch (error) {
            showNotification('Error al cargar el examen', 'error');
        }
    }

    render() {
        document.getElementById('examTitle').textContent = this.examData.titulo;
        document.getElementById('examArea').textContent = this.areaId.replace('_', ' ').toUpperCase();
        this.renderQuestion();
        this.renderQuestionGrid();
    }

    renderQuestion() {
        const question = this.examData.preguntas[this.currentQuestion];
        document.getElementById('questionNumber').textContent = this.currentQuestion + 1;
        document.getElementById('questionPoints').innerHTML = `<i class="fas fa-star"></i><span>${question.puntos} puntos</span>`;
        document.getElementById('questionText').textContent = question.pregunta;

        const progress = ((this.currentQuestion + 1) / this.examData.preguntas.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `Pregunta ${this.currentQuestion + 1} de ${this.examData.preguntas.length}`;

        this.renderOptions(question);
        this.updateNavigation();
        this.updateQuestionGrid();
    }

    renderOptions(question) {
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        question.opciones.forEach((opcion, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            const isSelected = this.answers[this.currentQuestion] === index;
            if (isSelected) {
                optionDiv.classList.add('selected');
            }
            optionDiv.innerHTML = `<input type="radio" name="question_${this.currentQuestion}" value="${index}" ${isSelected ? 'checked' : ''}><span class="option-text">${opcion}</span>`;
            optionDiv.addEventListener('click', () => this.selectAnswer(index));
            optionsContainer.appendChild(optionDiv);
        });
    }

    renderQuestionGrid() {
        const grid = document.getElementById('questionGrid');
        grid.innerHTML = '';
        this.examData.preguntas.forEach((_, index) => {
            const item = document.createElement('div');
            item.className = 'question-grid-item';
            item.textContent = index + 1;
            item.addEventListener('click', () => this.goToQuestion(index));
            grid.appendChild(item);
        });
        this.updateQuestionGrid();
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

    updateNavigation() {
        document.getElementById('btnPrevious').disabled = this.currentQuestion === 0;
        document.getElementById('btnNext').disabled = this.currentQuestion === this.examData.preguntas.length - 1;
    }

    selectAnswer(optionIndex) {
        this.answers[this.currentQuestion] = optionIndex;
        this.renderOptions(this.examData.preguntas[this.currentQuestion]);
        this.updateQuestionGrid();
    }

    goToQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < this.examData.preguntas.length) {
            this.currentQuestion = questionIndex;
            this.renderQuestion();
        }
    }

    startTimer() {
        const timeRemaining = this.examData.tiempo_limite * 60;
        this.timer = new Timer(
            timeRemaining,
            (duration) => {
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            },
            () => {
                showNotification('¡Tiempo agotado! El examen se enviará automáticamente.', 'error');
                this.finishExam();
            }
        );
        this.timer.start();
    }

    setupEventListeners() {
        document.getElementById('btnPrevious').addEventListener('click', () => this.goToQuestion(this.currentQuestion - 1));
        document.getElementById('btnNext').addEventListener('click', () => this.goToQuestion(this.currentQuestion + 1));
        document.getElementById('btnFinishExam').addEventListener('click', () => this.showFinishModal());
        window.addEventListener('beforeunload', (e) => {
            if (this.timer) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    showFinishModal() {
        // This should be refactored to use the modal component
        const answeredCount = this.answers.filter(answer => answer !== null).length;
        const unansweredCount = this.examData.preguntas.length - answeredCount;
        document.getElementById('examSummary').innerHTML = `
            <div class="summary-item"><span>Total de preguntas:</span><span>${this.examData.preguntas.length}</span></div>
            <div class="summary-item"><span>Preguntas respondidas:</span><span>${answeredCount}</span></div>
            <div class="summary-item"><span>Preguntas sin responder:</span><span>${unansweredCount}</span></div>
        `;
        document.getElementById('finishModal').style.display = 'flex';
        document.getElementById('btnCancelFinish').addEventListener('click', () => this.hideFinishModal());
        document.getElementById('btnConfirmFinish').addEventListener('click', () => this.finishExam());
    }

    hideFinishModal() {
        document.getElementById('finishModal').style.display = 'none';
    }

    async finishExam() {
        if (this.timer) {
            this.timer.stop();
            this.timer = null;
        }
        try {
            const userSession = JSON.parse(localStorage.getItem('userSession'));
            const userCodigo = userSession ? userSession.codigo : null;

            if (!userCodigo) {
                showNotification('Error: Código de usuario no encontrado para finalizar el examen.', 'error');
                return;
            }

            const attemptsCount = this.answers.filter(answer => answer !== null).length;
            const result = await submitExam(this.sessionId, attemptsCount, userCodigo);
            localStorage.setItem('ultimoResultado', JSON.stringify(result));
            window.location.href = `/frontend/pages/resultados.html`;
        } catch (error) {
            showNotification('Error al finalizar el examen', 'error');
        }
    }
}
