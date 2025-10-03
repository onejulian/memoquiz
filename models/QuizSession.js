/**
 * Clase que representa una sesión de quiz en curso
 */
export class QuizSession {
    /**
     * @param {Paragraph} paragraph - Párrafo del quiz
     */
    constructor(paragraph) {
        this.paragraph = paragraph;
        this.sentences = [...paragraph.sentences];
        this.currentSentenceIndex = 0;
        this.userProgress = []; // Número de revisiones por frase
        this.userErrors = []; // Número de errores por frase
        this.totalAttempts = 0;
        this.startTime = null; // Marca de tiempo de inicio
        this.elapsedTime = 0; // Tiempo transcurrido en segundos
    }

    /**
     * Obtiene la frase actual
     * @returns {string}
     */
    getCurrentSentence() {
        return this.sentences[this.currentSentenceIndex];
    }

    /**
     * Obtiene el número de la frase actual (1-indexed)
     * @returns {number}
     */
    getCurrentSentenceNumber() {
        return this.currentSentenceIndex + 1;
    }

    /**
     * Obtiene el total de frases
     * @returns {number}
     */
    getTotalSentences() {
        return this.sentences.length;
    }

    /**
     * Registra una revisión de la frase actual
     */
    recordReview() {
        this.userProgress[this.currentSentenceIndex] =
            (this.userProgress[this.currentSentenceIndex] || 0) + 1;
        this.totalAttempts++;
    }

    /**
     * Registra un error en la frase actual
     */
    recordError() {
        this.userErrors[this.currentSentenceIndex] =
            (this.userErrors[this.currentSentenceIndex] || 0) + 1;
    }

    /**
     * Avanza a la siguiente frase
     * @returns {boolean} - true si hay más frases, false si se completó
     */
    nextSentence() {
        this.currentSentenceIndex++;
        return this.currentSentenceIndex < this.sentences.length;
    }

    /**
     * Verifica si el quiz está completo
     * @returns {boolean}
     */
    isComplete() {
        return this.currentSentenceIndex >= this.sentences.length;
    }

    /**
     * Completa los arrays de progreso y errores con ceros
     */
    fillProgressArrays() {
        while (this.userProgress.length < this.sentences.length) {
            this.userProgress.push(0);
        }
        while (this.userErrors.length < this.sentences.length) {
            this.userErrors.push(0);
        }
    }

    /**
     * Inicia el cronómetro
     */
    startTimer() {
        if (!this.startTime) {
            this.startTime = Date.now();
        }
    }

    /**
     * Calcula el tiempo transcurrido en segundos
     * @returns {number}
     */
    calculateElapsedTime() {
        if (this.startTime) {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        }
        return this.elapsedTime;
    }

    /**
     * Obtiene el tiempo formateado (MM:SS)
     * @returns {string}
     */
    getFormattedTime() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Obtiene los datos de la sesión
     * @returns {Object}
     */
    getData() {
        return {
            paragraph: this.paragraph,
            sentences: this.sentences,
            currentSentenceIndex: this.currentSentenceIndex,
            userProgress: this.userProgress,
            userErrors: this.userErrors,
            totalAttempts: this.totalAttempts,
            elapsedTime: this.elapsedTime
        };
    }
}

