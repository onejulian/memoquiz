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
        // Normalizar texto usando el mismo método de normalización
        let normalizedText = this.normalizeText(text);

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
            // Normalizar todos los tipos de comillas curvas a comillas planas
            .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')  // Comillas dobles curvas → rectas
            .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // Comillas simples curvas → rectas
            .replace(/[\u00AB\u00BB]/g, '"'); // Comillas angulares « » → rectas
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
     * Calcula la distancia de Levenshtein entre dos textos
     * @param {string} str1 - Primer texto
     * @param {string} str2 - Segundo texto
     * @returns {number} - Distancia de Levenshtein
     */
    static levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) {
            dp[i][0] = i;
        }
        for (let j = 0; j <= n; j++) {
            dp[0][j] = j;
        }

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,    // eliminación
                        dp[i][j - 1] + 1,    // inserción
                        dp[i - 1][j - 1] + 1 // sustitución
                    );
                }
            }
        }

        return dp[m][n];
    }

    /**
     * Calcula el porcentaje de similitud entre dos textos
     * @param {string} userText - Texto del usuario
     * @param {string} correctText - Texto correcto
     * @returns {number} - Porcentaje de similitud (0-100)
     */
    static calculateSimilarity(userText, correctText) {
        const normalizedUserText = this.normalizeText(userText);
        const normalizedCorrectText = this.normalizeText(correctText);

        // Si son iguales, retornar 100%
        if (normalizedUserText === normalizedCorrectText) {
            return 100;
        }

        // Calcular distancia de Levenshtein
        const distance = this.levenshteinDistance(normalizedUserText, normalizedCorrectText);
        const maxLength = Math.max(normalizedUserText.length, normalizedCorrectText.length);
        
        // Calcular porcentaje de similitud
        const similarity = ((maxLength - distance) / maxLength) * 100;
        
        return Math.max(0, Math.round(similarity));
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

