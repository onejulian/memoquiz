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
     * Ordena resultados por párrafo (mejor rango primero, luego por fecha)
     * @param {Result[]} results - Array de resultados
     * @param {string} paragraphId - ID del párrafo
     * @returns {Result[]} - Resultados ordenados
     */
    static getResultsForParagraph(results, paragraphId) {
        return results
            .filter(result => result.paragraphId === paragraphId)
            .sort((a, b) => {
                // Ordenar por rango (S mejor que A, etc.) y luego por fecha
                if (a.getRankOrder() !== b.getRankOrder()) {
                    return a.getRankOrder() - b.getRankOrder();
                }
                return new Date(b.completedAt) - new Date(a.completedAt);
            });
    }
}

