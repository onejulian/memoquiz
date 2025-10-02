/**
 * Gestor de modales
 */
export class ModalManager {
    constructor() {
        this.errorModal = document.getElementById('error-modal');
        this.historyModal = document.getElementById('history-modal');
        this.historyContent = document.getElementById('history-content');
        
        this.escapeHandlers = new Map();
    }

    /**
     * Muestra el modal de error
     * @param {Function} onReview - Callback al revisar la frase
     * @param {Function} onTryAgain - Callback al intentar de nuevo
     */
    showErrorModal(onReview, onTryAgain) {
        this.errorModal.classList.remove('hidden');

        // Configurar botones
        const reviewBtn = document.getElementById('review-sentence-btn');
        const tryAgainBtn = document.getElementById('try-again-modal-btn');

        const handleReview = () => {
            this.hideErrorModal();
            onReview();
        };

        const handleTryAgain = () => {
            this.hideErrorModal();
            onTryAgain();
        };

        reviewBtn.onclick = handleReview;
        tryAgainBtn.onclick = handleTryAgain;

        // Event listener para tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideErrorModal();
            }
        };
        
        this.escapeHandlers.set('error', handleEscape);
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Oculta el modal de error
     */
    hideErrorModal() {
        this.errorModal.classList.add('hidden');
        
        // Remover event listener de Escape
        const handler = this.escapeHandlers.get('error');
        if (handler) {
            document.removeEventListener('keydown', handler);
            this.escapeHandlers.delete('error');
        }
    }

    /**
     * Muestra el modal de historial
     * @param {Result[]} results - Array de resultados
     * @param {Paragraph} paragraph - Párrafo relacionado
     */
    showHistoryModal(results, paragraph) {
        if (!paragraph || results.length === 0) {
            return;
        }

        // Generar HTML del historial
        let historyHTML = `
            <div class="history-header">
                <h4>Párrafo: ${paragraph.getSentenceCount()} frases</h4>
                <p class="history-subtitle">Total de intentos: ${results.length}</p>
            </div>
        `;

        results.forEach((result) => {
            historyHTML += `
                <div class="history-item">
                    <div class="history-item-header">
                        <span class="history-rank rank-${result.rank}">Rango ${result.rank}</span>
                        <span class="history-date">${result.getFormattedDate()}</span>
                    </div>
                    <div class="history-stats">
                        <div class="history-stat">
                            <span class="stat-label">Revisiones:</span>
                            <span class="stat-value">${result.totalAttempts}</span>
                        </div>
                        <div class="history-stat">
                            <span class="stat-label">Errores:</span>
                            <span class="stat-value">${result.totalErrors}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        this.historyContent.innerHTML = historyHTML;
        this.historyModal.classList.remove('hidden');

        // Event listener para tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideHistoryModal();
            }
        };
        
        this.escapeHandlers.set('history', handleEscape);
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Oculta el modal de historial
     */
    hideHistoryModal() {
        this.historyModal.classList.add('hidden');
        
        // Remover event listener de Escape
        const handler = this.escapeHandlers.get('history');
        if (handler) {
            document.removeEventListener('keydown', handler);
            this.escapeHandlers.delete('history');
        }
    }
}

