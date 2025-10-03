/**
 * Clase que representa el resultado de un quiz completado
 */
export class Result {
    /**
     * @param {string} paragraphId - ID del párrafo
     * @param {string} paragraphText - Texto del párrafo
     * @param {string} rank - Rango obtenido (S, A, B, C)
     * @param {number} totalAttempts - Total de revisiones
     * @param {number} totalErrors - Total de errores
     * @param {Array} sentenceProgress - Progreso por frase
     * @param {string} id - ID del resultado
     * @param {string} completedAt - Fecha de completado
     * @param {number} elapsedTime - Tiempo en segundos
     */
    constructor(paragraphId, paragraphText, rank, totalAttempts, totalErrors, sentenceProgress, id = null, completedAt = null, elapsedTime = 0) {
        this.id = id || Date.now().toString();
        this.paragraphId = paragraphId;
        this.paragraphText = paragraphText;
        this.rank = rank;
        this.totalAttempts = totalAttempts;
        this.totalErrors = totalErrors;
        this.sentenceProgress = sentenceProgress;
        this.completedAt = completedAt || new Date().toISOString();
        this.elapsedTime = elapsedTime || 0;
    }

    /**
     * Crea un Result desde un objeto JSON
     * @param {Object} data - Datos del resultado
     * @returns {Result}
     */
    static fromJSON(data) {
        return new Result(
            data.paragraphId,
            data.paragraphText,
            data.rank,
            data.totalAttempts,
            data.totalErrors,
            data.sentenceProgress,
            data.id,
            data.completedAt,
            data.elapsedTime || 0
        );
    }

    /**
     * Convierte el resultado a objeto JSON serializable
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            paragraphId: this.paragraphId,
            paragraphText: this.paragraphText,
            rank: this.rank,
            totalAttempts: this.totalAttempts,
            totalErrors: this.totalErrors,
            sentenceProgress: this.sentenceProgress,
            completedAt: this.completedAt,
            elapsedTime: this.elapsedTime
        };
    }

    /**
     * Obtiene la fecha formateada
     * @returns {string}
     */
    getFormattedDate() {
        const date = new Date(this.completedAt);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Obtiene el orden numérico del rango (menor es mejor)
     * @returns {number}
     */
    getRankOrder() {
        const rankOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
        return rankOrder[this.rank] ?? 4;
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
}

