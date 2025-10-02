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
        
        this.studySection = document.querySelector('#quiz-screen .study-section');
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
        this.userInput.value = '';
        this.userInput.focus();
    }

    /**
     * Obtiene el texto escrito por el usuario
     * @returns {string}
     */
    getUserInput() {
        return this.userInput.value.trim();
    }

    /**
     * Limpia el input del usuario
     */
    clearUserInput() {
        this.userInput.value = '';
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
}

