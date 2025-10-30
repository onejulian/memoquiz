import { NotificationManager } from './NotificationManager.js';

/**
 * Vista de la pantalla de quiz
 */
export class QuizView {
    constructor(screenManager) {
        this.screenManager = screenManager;
        
        // Elementos del DOM
        this.currentSentenceNum = document.getElementById('current-sentence-num');
        this.totalSentences = document.getElementById('total-sentences');
        this.currentSentenceText = document.getElementById('current-sentence-text');
        this.readyBtn = document.getElementById('ready-btn');
        this.writingSection = document.getElementById('writing-section');
        this.userInput = document.getElementById('user-input');
        this.showSentenceBtn = document.getElementById('show-sentence-btn');
        this.submitSentenceBtn = document.getElementById('submit-sentence-btn');
        this.quitQuizBtn = document.getElementById('quit-quiz-btn');
        this.timerValue = document.getElementById('timer-value');
        
        this.studySection = document.querySelector('#quiz-screen .study-section');
        
        // Control del cronómetro
        this.timerInterval = null;
    }

    /**
     * Configura los event listeners
     * @param {Object} callbacks - Objeto con callbacks
     */
    setupEventListeners(callbacks) {
        this.readyBtn.addEventListener('click', callbacks.onReady);
        this.showSentenceBtn.addEventListener('click', callbacks.onShowSentence);
        this.submitSentenceBtn.addEventListener('click', callbacks.onSubmitSentence);
        this.quitQuizBtn.addEventListener('click', callbacks.onQuitQuiz);
        
        // Prevenir pegado
        this.userInput.addEventListener('paste', (e) => {
            e.preventDefault();
            NotificationManager.show('No se permite pegar texto. Debes escribir de memoria.', 'warning');
        });

        // Atajo de teclado: Ctrl + Enter para enviar frase
        this.userInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                callbacks.onSubmitSentence();
            }
        });

        // Atajo de teclado: Enter para comenzar a escribir (cuando está en la sección de estudio)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey) {
                // Solo funciona si la sección de estudio está visible
                if (this.studySection && !this.studySection.classList.contains('hidden')) {
                    e.preventDefault();
                    callbacks.onReady();
                }
            }
        });

        // Atajos de teclado para la pantalla de quiz
        this.quizKeydownHandler = (e) => {
            // Solo activar si estamos en la pantalla de quiz
            const quizScreen = document.getElementById('quiz-screen');
            if (!quizScreen || !quizScreen.classList.contains('active')) {
                return;
            }

            // Ignorar si el usuario está escribiendo en el textarea
            if (document.activeElement === this.userInput) {
                return;
            }

            const key = e.key.toLowerCase();

            // A = Abandonar
            if (key === 'a' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                callbacks.onQuitQuiz();
            }
            // L = Listo para escribir (solo si está en sección de estudio)
            else if (key === 'l' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                if (this.studySection && !this.studySection.classList.contains('hidden')) {
                    e.preventDefault();
                    callbacks.onReady();
                }
            }
            // V = Ver frase nuevamente (solo si está en sección de escritura)
            else if (key === 'v' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                if (this.writingSection && !this.writingSection.classList.contains('hidden')) {
                    e.preventDefault();
                    callbacks.onShowSentence();
                }
            }
            // E = Enviar frase (solo si está en sección de escritura)
            else if (key === 'e' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                if (this.writingSection && !this.writingSection.classList.contains('hidden')) {
                    e.preventDefault();
                    callbacks.onSubmitSentence();
                }
            }
        };

        document.addEventListener('keydown', this.quizKeydownHandler);
    }

    /**
     * Muestra la frase actual para estudiar
     * @param {string} sentence - Texto de la frase
     * @param {number} sentenceNum - Número de la frase
     * @param {number} totalSentences - Total de frases
     */
    showStudySection(sentence, sentenceNum, totalSentences) {
        this.currentSentenceNum.textContent = `Frase ${sentenceNum}`;
        this.totalSentences.textContent = `de ${totalSentences}`;
        sentence = sentence.endsWith('.') ? sentence.slice(0, -1) : sentence;
        this.currentSentenceText.textContent = sentence;

        this.screenManager.hideElement(this.writingSection);
        this.screenManager.showElement(this.studySection);
    }

    /**
     * Muestra la sección de escritura
     */
    showWritingSection() {
        this.screenManager.hideElement(this.studySection);
        this.screenManager.showElement(this.writingSection);
        this.userInput.innerText = '';
        this.userInput.focus();
    }

    /**
     * Obtiene el texto escrito por el usuario
     * @returns {string}
     */
    getUserInput() {
        return this.userInput.innerText.trim();
    }

    /**
     * Limpia el input del usuario
     */
    clearUserInput() {
        this.userInput.innerText = '';
        this.userInput.focus();
    }

    /**
     * Muestra una notificación
     * @param {string} message - Mensaje
     * @param {string} type - Tipo (success, error, warning, info)
     */
    showNotification(message, type) {
        NotificationManager.show(message, type);
    }

    /**
     * Inicia el cronómetro
     * @param {Function} updateCallback - Función que devuelve el tiempo formateado
     */
    startTimer(updateCallback) {
        this.stopTimer(); // Asegurarse de que no haya otro cronómetro corriendo
        this.timerInterval = setInterval(() => {
            const formattedTime = updateCallback();
            this.timerValue.textContent = formattedTime;
        }, 1000);
    }

    /**
     * Detiene el cronómetro
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Reinicia el display del cronómetro
     */
    resetTimer() {
        this.stopTimer();
        this.timerValue.textContent = '00:00';
    }

    /**
     * Actualiza el display del cronómetro manualmente
     * @param {string} formattedTime - Tiempo formateado (MM:SS)
     */
    updateTimerDisplay(formattedTime) {
        this.timerValue.textContent = formattedTime;
    }

    /**
     * Limpia los event listeners
     */
    cleanup() {
        if (this.quizKeydownHandler) {
            document.removeEventListener('keydown', this.quizKeydownHandler);
        }
    }
}

