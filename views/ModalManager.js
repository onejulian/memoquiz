/**
 * Gestor de modales
 */
export class ModalManager {
    constructor() {
        this.errorModal = document.getElementById('error-modal');
        this.historyModal = document.getElementById('history-modal');
        this.historyContent = document.getElementById('history-content');
        this.quitConfirmModal = document.getElementById('quit-confirm-modal');
        this.deleteConfirmModal = document.getElementById('delete-confirm-modal');
        
        this.escapeHandlers = new Map();
    }

    /**
     * Muestra el modal de error
     * @param {number} similarity - Porcentaje de similitud (0-100)
     * @param {Function} onReview - Callback al revisar la frase
     * @param {Function} onTryAgain - Callback al intentar de nuevo
     */
    showErrorModal(similarity, onReview, onTryAgain) {
        this.errorModal.classList.remove('hidden');

        // Actualizar el mensaje con el porcentaje de similitud
        const modalMessage = this.errorModal.querySelector('.modal-message');
        if (modalMessage) {
            modalMessage.innerHTML = `
                <p>La frase que escribiste no es correcta.</p>
                <div class="similarity-indicator">
                    <span class="similarity-label">Similitud:</span>
                    <span class="similarity-value">${similarity}%</span>
                    <div class="similarity-bar">
                        <div class="similarity-fill" style="width: ${similarity}%"></div>
                    </div>
                </div>
                <p style="margin-top: 15px;">Elige cómo continuar:</p>
            `;
        }

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

        // Cerrar al hacer clic en el overlay (fuera del contenido)
        // Se interpreta como "intentar de nuevo sin ver la frase"
        const handleOverlayClick = (e) => {
            if (e.target === this.errorModal) {
                handleTryAgain();
            }
        };
        this.errorModal.onclick = handleOverlayClick;
    }

    /**
     * Oculta el modal de error
     */
    hideErrorModal() {
        this.errorModal.classList.add('hidden');
        this.errorModal.onclick = null;
        
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
                            <span class="stat-label">⏱️ Tiempo:</span>
                            <span class="stat-value">${result.getFormattedTime()}</span>
                        </div>
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

    /**
     * Muestra el modal de confirmación para abandonar el quiz
     * @param {Function} onConfirm - Callback al confirmar
     * @param {Function} onCancel - Callback al cancelar
     */
    showQuitConfirmModal(onConfirm, onCancel) {
        this.quitConfirmModal.classList.remove('hidden');

        const confirmBtn = document.getElementById('confirm-quit-btn');
        const cancelBtn = document.getElementById('cancel-quit-btn');

        const handleConfirm = () => {
            this.hideQuitConfirmModal();
            onConfirm();
        };

        const handleCancel = () => {
            this.hideQuitConfirmModal();
            if (onCancel) onCancel();
        };

        confirmBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;

        // Event listener para tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };
        
        this.escapeHandlers.set('quit', handleEscape);
        document.addEventListener('keydown', handleEscape);

        // Cerrar al hacer clic en el overlay
        const handleOverlayClick = (e) => {
            if (e.target === this.quitConfirmModal) {
                handleCancel();
            }
        };
        this.quitConfirmModal.onclick = handleOverlayClick;
    }

    /**
     * Oculta el modal de confirmación de abandono
     */
    hideQuitConfirmModal() {
        this.quitConfirmModal.classList.add('hidden');
        this.quitConfirmModal.onclick = null;
        
        // Remover event listener de Escape
        const handler = this.escapeHandlers.get('quit');
        if (handler) {
            document.removeEventListener('keydown', handler);
            this.escapeHandlers.delete('quit');
        }
    }

    /**
     * Muestra el modal de confirmación para eliminar párrafo
     * @param {Function} onConfirm - Callback al confirmar
     * @param {Function} onCancel - Callback al cancelar
     */
    showDeleteConfirmModal(onConfirm, onCancel) {
        this.deleteConfirmModal.classList.remove('hidden');

        const confirmBtn = document.getElementById('confirm-delete-btn');
        const cancelBtn = document.getElementById('cancel-delete-btn');

        const handleConfirm = () => {
            this.hideDeleteConfirmModal();
            onConfirm();
        };

        const handleCancel = () => {
            this.hideDeleteConfirmModal();
            if (onCancel) onCancel();
        };

        confirmBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;

        // Event listener para tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };
        
        this.escapeHandlers.set('delete', handleEscape);
        document.addEventListener('keydown', handleEscape);

        // Cerrar al hacer clic en el overlay
        const handleOverlayClick = (e) => {
            if (e.target === this.deleteConfirmModal) {
                handleCancel();
            }
        };
        this.deleteConfirmModal.onclick = handleOverlayClick;
    }

    /**
     * Oculta el modal de confirmación de eliminación
     */
    hideDeleteConfirmModal() {
        this.deleteConfirmModal.classList.add('hidden');
        this.deleteConfirmModal.onclick = null;
        
        // Remover event listener de Escape
        const handler = this.escapeHandlers.get('delete');
        if (handler) {
            document.removeEventListener('keydown', handler);
            this.escapeHandlers.delete('delete');
        }
    }
}

