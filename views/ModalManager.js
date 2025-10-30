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
        this.clearHistoryModal = document.getElementById('clear-history-modal');
        this.importConfirmModal = document.getElementById('import-confirm-modal');
        
        this.escapeHandlers = new Map();
    }

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} - Texto escapado
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Muestra el modal de error
     * @param {number} similarity - Porcentaje de similitud (0-100)
     * @param {Object} errorInfo - Información del error (opcional)
     * @param {Function} onReview - Callback al revisar la frase
     * @param {Function} onTryAgain - Callback al intentar de nuevo
     */
    showErrorModal(similarity, errorInfo, onReview, onTryAgain) {
        this.errorModal.classList.remove('hidden');

        // Actualizar el mensaje con el porcentaje de similitud
        const modalMessage = this.errorModal.querySelector('.modal-message');
        if (modalMessage) {
            let errorHintHTML = '';
            
            // Si hay información del error, mostrar la pista con todos los segmentos
            if (errorInfo && errorInfo.hasError && errorInfo.segments) {
                // Generar HTML para cada segmento
                const segmentsHTML = errorInfo.segments.map(segment => {
                    if (segment.type === 'error') {
                        return `<span class="text-error">${this.escapeHtml(segment.text)}</span>`;
                    } else if (segment.type === 'missing') {
                        return `<span class="text-missing">${this.escapeHtml(segment.text)}</span>`;
                    } else {
                        return `<span class="text-correct">${this.escapeHtml(segment.text)}</span>`;
                    }
                }).join('');
                
                errorHintHTML = `
                    <div class="error-hint">
                        <p class="error-hint-label">💡 Pista de los errores en tu texto:</p>
                        <div class="error-hint-text">
                            ${segmentsHTML}
                        </div>
                    </div>
                `;
            }

            modalMessage.innerHTML = `
                <div class="similarity-indicator">
                    <span class="similarity-label">Similitud:</span>
                    <span class="similarity-value">${similarity}%</span>
                    <div class="similarity-bar">
                        <div class="similarity-fill" style="width: ${similarity}%"></div>
                    </div>
                </div>
                ${errorHintHTML}
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

        // Event listener para tecla Escape y atajos
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                this.hideErrorModal();
                return;
            }

            const key = e.key.toLowerCase();
            
            // V = Ver frase y estudiar nuevamente
            if (key === 'v' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleReview();
            }
            // I = Intentar escribir sin ver la frase
            else if (key === 'i' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleTryAgain();
            }
        };
        
        this.escapeHandlers.set('error', handleKeydown);
        document.addEventListener('keydown', handleKeydown);

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

        // Event listener para tecla Escape y atajos
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                return;
            }

            const key = e.key.toLowerCase();
            
            // S = Sí, abandonar
            if (key === 's' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleConfirm();
            }
            // N = No, continuar
            else if (key === 'n' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleCancel();
            }
        };
        
        this.escapeHandlers.set('quit', handleKeydown);
        document.addEventListener('keydown', handleKeydown);

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

        // Event listener para tecla Escape y atajos
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                return;
            }

            const key = e.key.toLowerCase();
            
            // S = Sí, eliminar
            if (key === 's' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleConfirm();
            }
            // N = No, cancelar
            else if (key === 'n' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleCancel();
            }
        };
        
        this.escapeHandlers.set('delete', handleKeydown);
        document.addEventListener('keydown', handleKeydown);

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

    /**
     * Muestra el modal de confirmación para limpiar historial
     * @param {Function} onConfirm - Callback al confirmar
     * @param {Function} onCancel - Callback al cancelar
     */
    showClearHistoryModal(onConfirm, onCancel) {
        this.clearHistoryModal.classList.remove('hidden');

        const confirmBtn = document.getElementById('confirm-clear-history-btn');
        const cancelBtn = document.getElementById('cancel-clear-history-btn');

        const handleConfirm = () => {
            this.hideClearHistoryModal();
            onConfirm();
        };

        const handleCancel = () => {
            this.hideClearHistoryModal();
            if (onCancel) onCancel();
        };

        confirmBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;

        // Event listener para tecla Escape y atajos
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                return;
            }

            const key = e.key.toLowerCase();
            
            // S = Sí, limpiar
            if (key === 's' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleConfirm();
            }
            // N = No, cancelar
            else if (key === 'n' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleCancel();
            }
        };
        
        this.escapeHandlers.set('clearHistory', handleKeydown);
        document.addEventListener('keydown', handleKeydown);

        // Cerrar al hacer clic en el overlay
        const handleOverlayClick = (e) => {
            if (e.target === this.clearHistoryModal) {
                handleCancel();
            }
        };
        this.clearHistoryModal.onclick = handleOverlayClick;
    }

    /**
     * Oculta el modal de confirmación de limpieza de historial
     */
    hideClearHistoryModal() {
        this.clearHistoryModal.classList.add('hidden');
        this.clearHistoryModal.onclick = null;
        
        // Remover event listener de Escape
        const handler = this.escapeHandlers.get('clearHistory');
        if (handler) {
            document.removeEventListener('keydown', handler);
            this.escapeHandlers.delete('clearHistory');
        }
    }

    /**
     * Muestra el modal de confirmación para importar datos
     * @param {Object} data - Datos a importar (con paragraphs y results)
     * @param {Function} onConfirm - Callback al confirmar
     * @param {Function} onCancel - Callback al cancelar
     */
    showImportConfirmModal(data, onConfirm, onCancel) {
        this.importConfirmModal.classList.remove('hidden');

        // Actualizar los contadores
        const paragraphsCount = document.getElementById('import-paragraphs-count');
        const resultsCount = document.getElementById('import-results-count');
        
        if (paragraphsCount) paragraphsCount.textContent = data.paragraphs.length;
        if (resultsCount) resultsCount.textContent = data.results.length;

        const confirmBtn = document.getElementById('confirm-import-btn');
        const cancelBtn = document.getElementById('cancel-import-btn');

        const handleConfirm = () => {
            this.hideImportConfirmModal();
            onConfirm();
        };

        const handleCancel = () => {
            this.hideImportConfirmModal();
            if (onCancel) onCancel();
        };

        confirmBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;

        // Event listener para tecla Escape y atajos
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                return;
            }

            const key = e.key.toLowerCase();
            
            // S = Sí, importar
            if (key === 's' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleConfirm();
            }
            // N = No, cancelar
            else if (key === 'n' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleCancel();
            }
        };
        
        this.escapeHandlers.set('import', handleKeydown);
        document.addEventListener('keydown', handleKeydown);

        // Cerrar al hacer clic en el overlay
        const handleOverlayClick = (e) => {
            if (e.target === this.importConfirmModal) {
                handleCancel();
            }
        };
        this.importConfirmModal.onclick = handleOverlayClick;
    }

    /**
     * Oculta el modal de confirmación de importación
     */
    hideImportConfirmModal() {
        this.importConfirmModal.classList.add('hidden');
        this.importConfirmModal.onclick = null;
        
        // Remover event listener de Escape
        const handler = this.escapeHandlers.get('import');
        if (handler) {
            document.removeEventListener('keydown', handler);
            this.escapeHandlers.delete('import');
        }
    }
}

