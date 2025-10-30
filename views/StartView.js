import { NotificationManager } from './NotificationManager.js';

/**
 * Vista de la pantalla de inicio
 */
export class StartView {
    constructor(modalManager) {
        this.paragraphInput = document.getElementById('paragraph-input');
        this.addParagraphBtn = document.getElementById('add-paragraph-btn');
        this.savedParagraphsContainer = document.getElementById('saved-paragraphs');
        this.modalManager = modalManager;
    }

    /**
     * Configura los event listeners
     * @param {Object} callbacks - Objeto con callbacks
     */
    setupEventListeners(callbacks) {
        this.addParagraphBtn.addEventListener('click', callbacks.onAddParagraph);
        
        this.paragraphInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                callbacks.onAddParagraph();
            }
        });

        // Delegación de eventos para párrafos guardados
        this.savedParagraphsContainer.addEventListener('click', (e) => {
            const paragraphId = e.target.dataset.paragraphId;
            
            if (e.target.matches('.start-quiz-btn')) {
                callbacks.onStartQuiz(paragraphId);
            } else if (e.target.matches('.delete-paragraph-btn')) {
                callbacks.onDeleteParagraph(paragraphId);
            } else if (e.target.matches('.view-history-btn')) {
                callbacks.onViewHistory(paragraphId);
            }
        });

        // Atajos de teclado para la pantalla de inicio
        this.keydownHandler = (e) => {
            // Solo activar si estamos en la pantalla de inicio
            const startScreen = document.getElementById('start-screen');
            if (!startScreen || !startScreen.classList.contains('active')) {
                return;
            }

            // Ignorar si el usuario está escribiendo en el textarea
            if (document.activeElement === this.paragraphInput) {
                return;
            }

            const key = e.key.toLowerCase();

            // A = Agregar Párrafo
            if (key === 'a' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                callbacks.onAddParagraph();
            }
        };

        document.addEventListener('keydown', this.keydownHandler);
    }

    /**
     * Obtiene el texto del párrafo ingresado
     * @returns {string}
     */
    getParagraphText() {
        return this.paragraphInput.value.trim();
    }

    /**
     * Limpia el input de párrafo
     */
    clearInput() {
        this.paragraphInput.value = '';
    }

    /**
     * Renderiza la lista de párrafos guardados
     * @param {Paragraph[]} paragraphs - Array de párrafos
     * @param {Function} getResultsForParagraph - Función para obtener resultados
     */
    renderSavedParagraphs(paragraphs, getResultsForParagraph) {
        this.savedParagraphsContainer.innerHTML = '';

        if (paragraphs.length === 0) {
            this.savedParagraphsContainer.innerHTML = 
                '<p class="no-paragraphs">No hay párrafos guardados. Agrega uno arriba para comenzar.</p>';
            return;
        }

        paragraphs.toReversed().forEach(paragraph => {
            const paragraphElement = document.createElement('div');
            paragraphElement.className = 'saved-paragraph';

            const preview = paragraph.getPreview(100);
            const results = getResultsForParagraph(paragraph.id);

            paragraphElement.innerHTML = `
                <div class="saved-paragraph-title">
                    Párrafo con ${paragraph.getSentenceCount()} frases
                    ${results.length > 0 ? `<span class="best-rank"> - Mejor: ${results[0].rank}</span>` : ''}
                </div>
                <div class="saved-paragraph-preview">${preview}</div>
                <div class="saved-paragraph-actions">
                    <button class="btn btn-primary btn-small start-quiz-btn" data-paragraph-id="${paragraph.id}">
                        Comenzar Quiz
                    </button>
                    ${results.length > 0 ? `
                        <button class="btn btn-secondary btn-small view-history-btn" data-paragraph-id="${paragraph.id}">
                            Ver Historial (${results.length})
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary btn-small delete-paragraph-btn" data-paragraph-id="${paragraph.id}">
                        Eliminar
                    </button>
                </div>
            `;

            this.savedParagraphsContainer.appendChild(paragraphElement);
        });
    }

    /**
     * Muestra una notificación
     * @param {string} message - Mensaje
     * @param {string} type - Tipo (success, error, warning, info)
     */
    showNotification(message, type) {
        NotificationManager.show(message, type);
    }

    /**
     * Limpia los event listeners
     */
    cleanup() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
    }
}

