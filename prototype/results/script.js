// Application state
const state = {
    selectedAnswers: {},
    correctAnswers: {
        1: 'C', 2: 'B', 3: 'D', 4: 'C', 5: 'A',
        6: 'B', 7: 'D', 8: 'A', 9: 'C', 10: 'B',
        11: 'D', 12: 'A', 13: 'C', 14: 'B', 15: 'D',
        16: 'A', 17: 'C', 18: 'B', 19: 'D', 20: 'A'
    },
    totalQuestions: 20,
    showResults: false
};

// DOM Elements
const quizGrid = document.getElementById('quiz-grid');
const showResultsBtn = document.getElementById('show-results-btn');
const resultsSection = document.getElementById('results-section');
const resultsSummary = document.getElementById('results-summary');
const scoreBar = document.getElementById('score-bar');
const scorePercentage = document.getElementById('score-percentage');
const scoreProgress = document.getElementById('score-progress');
const clearAnswersBtn = document.getElementById('clear-answers-btn');
const printBtn = document.getElementById('print-btn');

// Initialize the quiz
function initQuiz() {
    renderQuizGrid();
    
    // Event listeners
    showResultsBtn.addEventListener('click', showResults);
    clearAnswersBtn.addEventListener('click', clearAnswers);
    printBtn.addEventListener('click', printResults);
}

// Render the quiz grid
function renderQuizGrid() {
    const questionsPerColumn = Math.ceil(state.totalQuestions / 2);
    const column1 = [];
    const column2 = [];
    
    for (let i = 1; i <= state.totalQuestions; i++) {
        if (i <= questionsPerColumn) {
            column1.push(i);
        } else {
            column2.push(i);
        }
    }
    
    quizGrid.innerHTML = `
        <div class="border-2 border-pink-300 rounded-lg overflow-hidden shadow-sm">
            ${column1.map(q => renderQuestionRow(q)).join('')}
        </div>
        <div class="border-2 border-pink-300 rounded-lg overflow-hidden shadow-sm">
            ${column2.map(q => renderQuestionRow(q)).join('')}
        </div>
    `;
    
    // Add event listeners to answer buttons (must be done after innerHTML is set)
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const questionNum = parseInt(e.target.dataset.question);
            const answer = e.target.dataset.answer;
            handleAnswerSelect(questionNum, answer);
        });
    });

    // Check if any answer is selected to enable the results button
    const answersCount = Object.keys(state.selectedAnswers).length;
    if (answersCount > 0) {
        showResultsBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        showResultsBtn.classList.add('bg-pink-600', 'text-white', 'hover:bg-pink-700');
        showResultsBtn.disabled = false;
    } else {
        showResultsBtn.classList.remove('bg-pink-600', 'text-white', 'hover:bg-pink-700');
        showResultsBtn.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        showResultsBtn.disabled = true;
    }
}

// Render a single question row
function renderQuestionRow(questionNumber) {
    const selectedAnswer = state.selectedAnswers[questionNumber];
    const correctAnswer = state.correctAnswers[questionNumber];
    
    // Solo se usa para el estilo visual del botón
    const isCorrect = selectedAnswer && correctAnswer && selectedAnswer === correctAnswer;
    const isWrong = selectedAnswer && correctAnswer && selectedAnswer !== correctAnswer;
    
    const bgColorClass = questionNumber % 2 === 0 ? 'bg-pink-50' : 'bg-white';
    
    return `
        <div class="flex items-center p-2 border-b ${bgColorClass} border-gray-200">
            <span class="w-8 text-center font-medium text-pink-800">${questionNumber}</span>
            <div class="flex space-x-2 ml-4">
                ${['A', 'B', 'C', 'D'].map(option => {
                    const isSelected = selectedAnswer === option;
                    let btnClass = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ';
                    
                    if (isSelected) {
                        if (state.showResults) { // Si se muestran resultados, resaltar la corrección
                            if (isCorrect) {
                                btnClass += 'bg-green-500 text-white border-2 border-green-600';
                            } else if (isWrong) {
                                btnClass += 'bg-red-500 text-white border-2 border-red-600';
                            }
                        } else { // Si no se muestran resultados, solo indicar que está seleccionado
                            btnClass += 'bg-pink-600 text-white border-2 border-pink-700';
                        }
                    } else {
                        // Resaltar la respuesta correcta cuando se muestran los resultados
                        if (state.showResults && correctAnswer === option) {
                             btnClass += 'bg-blue-300 text-blue-800 border-2 border-blue-400';
                        } else {
                            btnClass += 'bg-white text-pink-600 border-2 border-pink-300 hover:bg-pink-100';
                        }
                    }
                    
                    return `<button data-question="${questionNumber}" data-answer="${option}" class="answer-btn ${btnClass}">${option}</button>`;
                }).join('')}
            </div>
        </div>
    `;
}

// Handle answer selection
function handleAnswerSelect(questionNumber, answer) {
    state.selectedAnswers[questionNumber] = answer;
    state.showResults = false;
    resultsSection.classList.add('hidden');
    renderQuizGrid();
}

// Calculate score
function calculateScore() {
    let correctCount = 0;
    let totalCount = 0;
    
    for (let i = 1; i <= state.totalQuestions; i++) {
        if (state.selectedAnswers[i] && state.correctAnswers[i]) {
            totalCount++;
            if (state.selectedAnswers[i] === state.correctAnswers[i]) {
                correctCount++;
            }
        }
    }
    
    return {
        correct: correctCount,
        total: totalCount,
        percentage: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    };
}

// Show results
function showResults() {
    const score = calculateScore();
    state.showResults = true;
    
    // Primero, volver a renderizar la cuadrícula para mostrar los resultados en los botones
    renderQuizGrid(); 

    // Update results summary
    resultsSummary.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle w-6 h-6 text-green-500 mr-2"></i>
            <span class="text-lg font-medium text-green-600">${score.correct} correctas</span>
        </div>
        <div class="flex items-center">
            <i class="fas fa-times-circle w-6 h-6 text-red-500 mr-2"></i>
            <span class="text-lg font-medium text-red-600">${score.total - score.correct} incorrectas</span>
        </div>
        <div class="flex items-center">
            <i class="fas fa-exclamation-triangle w-6 h-6 text-yellow-500 mr-2"></i>
            <span class="text-lg font-medium text-yellow-600">${score.percentage}% de aciertos</span>
        </div>
    `;
    
    // Update score bar
    if (score.total > 0) {
        scoreBar.classList.remove('hidden');
        
        // Set percentage text and color
        scorePercentage.textContent = `${score.percentage}%`;
        
        let percentageClass, progressClass;
        if (score.percentage >= 90) {
            percentageClass = 'text-xl font-bold text-green-600';
            progressClass = 'h-2 rounded-full bg-green-500 transition-all duration-500';
        } else if (score.percentage >= 70) {
            percentageClass = 'text-xl font-bold text-blue-600';
            progressClass = 'h-2 rounded-full bg-blue-500 transition-all duration-500';
        } else if (score.percentage >= 50) {
            percentageClass = 'text-xl font-bold text-yellow-600';
            progressClass = 'h-2 rounded-full bg-yellow-500 transition-all duration-500';
        } else {
            percentageClass = 'text-xl font-bold text-red-600';
            progressClass = 'h-2 rounded-full bg-red-500 transition-all duration-500';
        }

        scorePercentage.className = percentageClass;
        scoreProgress.className = progressClass;
        
        // Animate progress bar
        setTimeout(() => {
            scoreProgress.style.width = `${score.percentage}%`;
        }, 100);
    } else {
        scoreBar.classList.add('hidden');
    }
    
    resultsSection.classList.remove('hidden');
}

// Clear answers
function clearAnswers() {
    if (confirm('¿Estás seguro de que quieres borrar todas las respuestas?')) {
        state.selectedAnswers = {};
        state.showResults = false;
        resultsSection.classList.add('hidden');
        renderQuizGrid();
    }
}

// Print results
function printResults() {
    window.print();
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initQuiz);