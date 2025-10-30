/**
 * Servicio para cálculo de rangos y resultados
 */
export class RankCalculator {
    /**
     * Calcula el resultado del quiz
     * @param {QuizSession} session - Sesión del quiz
     * @returns {Object} - Objeto con el resultado calculado
     */
    static calculateResults(session) {
        // Completar los arrays con 0 para frases que no necesitaron revisiones ni errores
        session.fillProgressArrays();

        const totalAttempts = session.userProgress.reduce((sum, attempts) => sum + attempts, 0);
        const totalErrors = session.userErrors.reduce((sum, errors) => sum + errors, 0);

        const { rank, description } = this.calculateRank(totalAttempts, totalErrors);

        return {
            rank,
            description,
            totalAttempts,
            totalErrors,
            sentenceProgress: session.sentences.map((sentence, index) => ({
                sentence: sentence,
                attempts: session.userProgress[index] || 0,
                errors: session.userErrors[index] || 0
            }))
        };
    }

    /**
     * Calcula el rango basado en revisiones y errores
     * @param {number} totalAttempts - Total de revisiones
     * @param {number} totalErrors - Total de errores
     * @returns {Object} - Objeto con rank y description
     */
    static calculateRank(totalAttempts, totalErrors) {
        let rank = 'S';
        let description = '';

        // Lógica de rangos:
        // S: 0 revisiones Y 0 errores (perfecto)
        // A: 0 revisiones pero con errores (acertaste eventualmente)
        // B: 1-3 revisiones
        // C: 4+ revisiones
        if (totalAttempts === 0 && totalErrors === 0) {
            rank = 'S';
            description = '¡Perfecto! Acertaste todas las frases a la primera sin revisiones.';
        } else if (totalAttempts === 0 && totalErrors > 0) {
            rank = 'A';
            description = '¡Excelente! Acertaste eventualmente, pero cometiste algunos errores.';
        } else if (totalAttempts <= 3) {
            rank = 'B';
            description = 'Buen trabajo, pero puedes mejorar.';
        } else {
            rank = 'C';
            description = 'Necesitas practicar más esta técnica.';
        }

        return { rank, description };
    }

    /**
     * Obtiene resultados de un párrafo (ordenados por fecha, más reciente primero)
     * @param {Result[]} results - Array de resultados
     * @param {string} paragraphId - ID del párrafo
     * @param {number} limit - Límite de resultados (por defecto 10)
     * @returns {Result[]} - Resultados ordenados y limitados
     */
    static getResultsForParagraph(results, paragraphId, limit = 10) {
        return results
            .filter(result => result.paragraphId === paragraphId)
            .sort((a, b) => {
                // Ordenar por fecha (más reciente primero)
                return new Date(b.completedAt) - new Date(a.completedAt);
            })
            .slice(0, limit); // Limitar a los últimos N resultados
    }

    /**
     * Obtiene el mejor resultado de un párrafo
     * @param {Result[]} results - Array de resultados
     * @param {string} paragraphId - ID del párrafo
     * @returns {Result|null} - Mejor resultado o null
     */
    static getBestResultForParagraph(results, paragraphId) {
        const paragraphResults = results.filter(result => result.paragraphId === paragraphId);
        
        if (paragraphResults.length === 0) {
            return null;
        }

        // Ordenar por mejor rango primero, luego por fecha más reciente
        return paragraphResults.sort((a, b) => {
            if (a.getRankOrder() !== b.getRankOrder()) {
                return a.getRankOrder() - b.getRankOrder();
            }
            return new Date(b.completedAt) - new Date(a.completedAt);
        })[0];
    }

    /**
     * Limpia resultados antiguos manteniendo solo los últimos N por párrafo
     * @param {Result[]} results - Array de todos los resultados
     * @param {number} maxPerParagraph - Máximo de resultados por párrafo (por defecto 10)
     * @returns {Result[]} - Array de resultados limpiado
     */
    static cleanOldResults(results, maxPerParagraph = 10) {
        // Agrupar resultados por párrafo
        const resultsByParagraph = {};
        
        results.forEach(result => {
            if (!resultsByParagraph[result.paragraphId]) {
                resultsByParagraph[result.paragraphId] = [];
            }
            resultsByParagraph[result.paragraphId].push(result);
        });

        // Mantener solo los últimos N por párrafo
        const cleanedResults = [];
        
        for (const paragraphId in resultsByParagraph) {
            const paragraphResults = resultsByParagraph[paragraphId]
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                .slice(0, maxPerParagraph);
            
            cleanedResults.push(...paragraphResults);
        }

        return cleanedResults;
    }
}

