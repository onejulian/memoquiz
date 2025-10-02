/**
 * Clase que representa un párrafo memorizable
 */
export class Paragraph {
    /**
     * @param {string} text - Texto del párrafo
     * @param {string[]} sentences - Array de frases
     * @param {string} id - ID único del párrafo
     * @param {string} createdAt - Fecha de creación
     */
    constructor(text, sentences, id = null, createdAt = null) {
        this.id = id || Date.now().toString();
        this.text = text;
        this.sentences = sentences;
        this.createdAt = createdAt || new Date().toISOString();
    }

    /**
     * Crea un Paragraph desde un objeto JSON
     * @param {Object} data - Datos del párrafo
     * @returns {Paragraph}
     */
    static fromJSON(data) {
        return new Paragraph(
            data.text,
            data.sentences,
            data.id,
            data.createdAt
        );
    }

    /**
     * Convierte el párrafo a objeto JSON serializable
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            text: this.text,
            sentences: this.sentences,
            createdAt: this.createdAt
        };
    }

    /**
     * Obtiene una vista previa del párrafo
     * @param {number} maxLength - Longitud máxima de la vista previa
     * @returns {string}
     */
    getPreview(maxLength = 100) {
        if (this.sentences.length === 0) {
            return 'Sin frases detectadas';
        }
        const firstSentence = this.sentences[0];
        return firstSentence.length > maxLength
            ? firstSentence.substring(0, maxLength) + '...'
            : firstSentence;
    }

    /**
     * Obtiene el número de frases en el párrafo
     * @returns {number}
     */
    getSentenceCount() {
        return this.sentences.length;
    }
}

