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

        // Agregar punto final si el texto no termina con punto, ? o ! (o con .", .', ?" o ?')
        const endsWithQuotedPunctuation = normalizedText.trim().endsWith('."') || 
                                          normalizedText.trim().endsWith(".'") ||
                                          normalizedText.trim().endsWith('?"') ||
                                          normalizedText.trim().endsWith("?'");
        if (!/[.!?]$/.test(normalizedText.trim()) && !endsWithQuotedPunctuation) {
            normalizedText = normalizedText.trim() + '.';
        }

        // Dividir por puntos, signos de interrogación o exclamación (incluyendo .", .', ?" y ?') 
        const sentences = normalizedText
            .split(/(?<=[.!?]["']|[.!?])(?=\s|$)/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0 && 
                (/[.!?]$/.test(sentence) || 
                 sentence.endsWith('."') || 
                 sentence.endsWith(".'") ||
                 sentence.endsWith('?"') ||
                 sentence.endsWith("?'"))
            );

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
            .replace(/[\u00AB\u00BB]/g, '"') // Comillas inglesas → rectas
            .replace(/\u200b/g, ''); // Espacio invisible
    }

    /**
     * Compara dos textos de manera estricta
     * @param {string} userText - Texto del usuario
     * @param {string} correctText - Texto correcto
     * @returns {boolean} - true si son iguales
     */
    static compareTexts(userText, correctText) {
        return userText === this.normalizeText(correctText);
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
     * Encuentra todas las posiciones de error en el texto del usuario
     * @param {string} userText - Texto del usuario
     * @param {string} correctText - Texto correcto
     * @returns {Object} - Objeto con información de los errores
     */
    static findErrorPosition(userText, correctText) {
        const normalizedUserText = this.normalizeText(userText);
        const normalizedCorrectText = this.normalizeText(correctText);

        // Si son iguales, no hay errores
        if (normalizedUserText === normalizedCorrectText) {
            return {
                hasError: false,
                segments: [{ text: normalizedUserText, type: 'correct' }]
            };
        }

        // Usar algoritmo de alineación para encontrar diferencias
        const segments = this.findTextSegments(normalizedUserText, normalizedCorrectText);

        return {
            hasError: segments.some(seg => seg.type === 'error' || seg.type === 'missing'),
            segments: segments
        };
    }

    /**
     * Encuentra segmentos de texto (correctos, con errores y faltantes)
     * @param {string} userText - Texto del usuario
     * @param {string} correctText - Texto correcto
     * @returns {Array} - Array de segmentos {text, type} donde type puede ser: 'correct', 'error', 'missing'
     */
    static findTextSegments(userText, correctText) {
        const m = userText.length;
        const n = correctText.length;
        
        // Matriz de programación dinámica para alineación
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        const path = Array(m + 1).fill(null).map(() => Array(n + 1).fill(null));

        // Inicializar
        for (let i = 0; i <= m; i++) {
            dp[i][0] = i;
            if (i > 0) path[i][0] = 'delete';
        }
        for (let j = 0; j <= n; j++) {
            dp[0][j] = j;
            if (j > 0) path[0][j] = 'insert';
        }

        // Llenar la matriz
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (userText[i - 1] === correctText[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                    path[i][j] = 'match';
                } else {
                    const substitute = dp[i - 1][j - 1] + 1;
                    const deleteChar = dp[i - 1][j] + 1;
                    const insertChar = dp[i][j - 1] + 1;
                    
                    dp[i][j] = Math.min(substitute, deleteChar, insertChar);
                    
                    if (dp[i][j] === substitute) {
                        path[i][j] = 'substitute';
                    } else if (dp[i][j] === deleteChar) {
                        path[i][j] = 'delete';
                    } else {
                        path[i][j] = 'insert';
                    }
                }
            }
        }

        // Reconstruir el camino para encontrar segmentos
        const segments = [];
        let i = m;
        let j = n;
        let currentSegment = '';
        let currentType = 'correct';

        while (i > 0 || j > 0) {
            const operation = path[i][j];

            if (operation === 'match') {
                // Carácter correcto
                if (currentType !== 'correct' && currentSegment) {
                    segments.unshift({ text: currentSegment, type: currentType });
                    currentSegment = '';
                }
                currentSegment = userText[i - 1] + currentSegment;
                currentType = 'correct';
                i--;
                j--;
            } else if (operation === 'substitute') {
                // Carácter incorrecto
                if (currentType !== 'error' && currentSegment) {
                    segments.unshift({ text: currentSegment, type: currentType });
                    currentSegment = '';
                }
                currentSegment = userText[i - 1] + currentSegment;
                currentType = 'error';
                i--;
                j--;
            } else if (operation === 'delete') {
                // Carácter extra en texto del usuario
                if (currentType !== 'error' && currentSegment) {
                    segments.unshift({ text: currentSegment, type: currentType });
                    currentSegment = '';
                }
                currentSegment = userText[i - 1] + currentSegment;
                currentType = 'error';
                i--;
            } else if (operation === 'insert') {
                // Carácter faltante - agregar '?' por cada carácter que falta
                if (currentType !== 'missing' && currentSegment) {
                    segments.unshift({ text: currentSegment, type: currentType });
                    currentSegment = '';
                }
                currentSegment = '?' + currentSegment;
                currentType = 'missing';
                j--;
            }

            // Si llegamos al principio, guardar el último segmento
            if (i === 0 && j === 0 && currentSegment) {
                segments.unshift({ text: currentSegment, type: currentType });
            }
        }

        // Consolidar segmentos adyacentes del mismo tipo
        const consolidatedSegments = [];
        for (const segment of segments) {
            if (consolidatedSegments.length > 0) {
                const lastSegment = consolidatedSegments[consolidatedSegments.length - 1];
                if (lastSegment.type === segment.type) {
                    lastSegment.text += segment.text;
                    continue;
                }
            }
            consolidatedSegments.push({ ...segment });
        }

        return consolidatedSegments;
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

