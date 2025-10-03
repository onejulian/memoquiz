/**
 * Vista de la pantalla de resultados
 */
export class ResultsView {
    constructor() {
        this.finalRank = document.getElementById('final-rank');
        this.rankDescription = document.getElementById('rank-description');
        this.sentenceResults = document.getElementById('sentence-results');
        this.tryAgainBtn = document.getElementById('try-again-btn');
        this.backToStartBtn = document.getElementById('back-to-start-btn');
    }

    /**
     * Configura los event listeners
     * @param {Object} callbacks - Objeto con callbacks
     */
    setupEventListeners(callbacks) {
        this.tryAgainBtn.addEventListener('click', callbacks.onTryAgain);
        this.backToStartBtn.addEventListener('click', callbacks.onBackToStart);
    }

    /**
     * Muestra los resultados del quiz
     * @param {Object} results - Objeto con los resultados calculados
     * @param {number} elapsedTime - Tiempo transcurrido en segundos
     */
    showResults(results, elapsedTime = 0) {
        // Mostrar rango
        this.finalRank.textContent = `Rango ${results.rank}`;
        this.finalRank.className = `rank-display rank-${results.rank}`;
        this.rankDescription.textContent = results.description;

        // Formatear tiempo
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Mostrar estadísticas totales
        const totalStatsHTML = `
            <div class="total-stats">
                <div class="stat-item">
                    <span class="stat-label">⏱️ Tiempo:</span>
                    <span class="stat-value">${formattedTime}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Revisiones totales:</span>
                    <span class="stat-value">${results.totalAttempts}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Errores totales:</span>
                    <span class="stat-value">${results.totalErrors}</span>
                </div>
            </div>
        `;

        // Actualizar el contenedor de estadísticas totales
        const totalAttemptsElement = document.querySelector('.total-attempts');
        if (totalAttemptsElement) {
            totalAttemptsElement.innerHTML = totalStatsHTML;
        }

        // Mostrar resultados por frase
        this.sentenceResults.innerHTML = '';
        results.sentenceProgress.forEach((item) => {
            const resultElement = document.createElement('div');
            resultElement.className = 'sentence-result';

            resultElement.innerHTML = `
                <div class="sentence-text">${item.sentence}</div>
                <div class="sentence-stats">
                    <div class="stat-item">
                        <span class="stat-label">Revisiones:</span>
                        <span class="stat-value">${item.attempts}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Errores:</span>
                        <span class="stat-value">${item.errors}</span>
                    </div>
                </div>
            `;

            this.sentenceResults.appendChild(resultElement);
        });
    }
}

