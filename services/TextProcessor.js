/**
 * Servicio para procesamiento de texto
 */
export class TextProcessor {
    /**
     * Divide un texto en frases
     * @param {string} text - Texto a dividir
     * @returns {string[]} - Array de frases
     */
    static splitIntoSentences(text) {
        // Normalizar texto: convertir comillas simples y dobles
        let normalizedText = text
            .replace(/[""]/g, '"')  // Normalizar comillas dobles
            .replace(/['']/g, "'"); // Normalizar comillas simples

        // Agregar punto final si el texto no termina con punto, ? o !
        if (!/[.!?]$/.test(normalizedText.trim())) {
            normalizedText = normalizedText.trim() + '.';
        }

        // Dividir por puntos, signos de interrogación o exclamación
        const sentences = normalizedText
            .split(/(?<=[.!?])(?=\s|$)/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0 && /[.!?]$/.test(sentence));

        return sentences;
    }

    /**
     * Normaliza un texto para comparación
     * @param {string} text - Texto a normalizar
     * @returns {string} - Texto normalizado
     */
    static normalizeText(text) {
        return text
            .trim()
            // Solo normalizar comillas curvas a comillas planas
            .replace(/[""]/g, '"')  // Comillas dobles curvas → rectas
            .replace(/['']/g, "'"); // Comillas simples curvas → rectas
    }

    /**
     * Compara dos textos de manera estricta
     * @param {string} userText - Texto del usuario
     * @param {string} correctText - Texto correcto
     * @returns {boolean} - true si son iguales
     */
    static compareTexts(userText, correctText) {
        const normalizedUserText = this.normalizeText(userText);
        const normalizedCorrectText = this.normalizeText(correctText);

        // Comparación exacta (case-sensitive, con tildes, puntuación, etc.)
        // Pero permite que el punto final sea opcional en la respuesta del usuario
        const isExactMatch = normalizedUserText === normalizedCorrectText;
        const userWithoutTrailingPeriod = normalizedUserText.replace(/\.$/, '');
        const correctWithoutTrailingPeriod = normalizedCorrectText.replace(/\.$/, '');
        const isMatchWithoutTrailingPeriod = userWithoutTrailingPeriod === correctWithoutTrailingPeriod;

        return isExactMatch || isMatchWithoutTrailingPeriod;
    }

    /**
     * Convierte un texto a representación JSON para debugging
     * @param {string} text - Texto a representar
     * @returns {string} - Representación JSON
     */
    static repr(text) {
        return JSON.stringify(text);
    }
}

