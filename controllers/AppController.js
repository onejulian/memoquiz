import { Paragraph } from '../models/Paragraph.js';
import { QuizSession } from '../models/QuizSession.js';
import { Result } from '../models/Result.js';
import { StorageService } from '../services/StorageService.js';
import { TextProcessor } from '../services/TextProcessor.js';
import { RankCalculator } from '../services/RankCalculator.js';
import { ScreenManager } from '../views/ScreenManager.js';
import { StartView } from '../views/StartView.js';
import { QuizView } from '../views/QuizView.js';
import { ResultsView } from '../views/ResultsView.js';
import { ModalManager } from '../views/ModalManager.js';
import { NotificationManager } from '../views/NotificationManager.js';

/**
 * Controlador principal de la aplicación
 */
export class AppController {
    constructor() {
        // Servicios
        this.storageService = new StorageService();

        // Gestores
        this.screenManager = new ScreenManager();
        this.modalManager = new ModalManager();

        // Vistas
        this.startView = new StartView(this.modalManager);
        this.quizView = new QuizView(this.screenManager);
        this.resultsView = new ResultsView();

        // Estado de la aplicación
        this.paragraphs = [];
        this.results = [];
        this.currentSession = null;
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.loadData();
        this.setupEventListeners();
        this.screenManager.showScreen('start');
        this.startView.renderSavedParagraphs(
            this.paragraphs,
            this.getResultsForParagraph.bind(this),
            this.getBestResultForParagraph.bind(this)
        );
    }

    /**
     * Configura los event listeners de todas las vistas
     */
    setupEventListeners() {
        // Start View
        this.startView.setupEventListeners({
            onAddParagraph: this.handleAddParagraph.bind(this),
            onStartQuiz: this.handleStartQuiz.bind(this),
            onDeleteParagraph: this.handleDeleteParagraph.bind(this),
            onViewHistory: this.handleViewHistory.bind(this),
            onClearHistory: this.handleClearHistory.bind(this)
        });

        // Quiz View
        this.quizView.setupEventListeners({
            onReady: this.handleReady.bind(this),
            onShowSentence: this.handleShowSentence.bind(this),
            onSubmitSentence: this.handleSubmitSentence.bind(this),
            onQuitQuiz: this.handleQuitQuiz.bind(this)
        });

        // Results View
        this.resultsView.setupEventListeners({
            onTryAgain: this.handleTryAgain.bind(this),
            onBackToStart: this.handleBackToStart.bind(this)
        });

        // Data Management - Export
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.handleExportData.bind(this));
        }

        // Data Management - Import
        const importBtn = document.getElementById('import-data-btn');
        const importFileInput = document.getElementById('import-file-input');
        
        if (importBtn && importFileInput) {
            importBtn.addEventListener('click', () => {
                importFileInput.click();
            });

            importFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImportData(file);
                    // Resetear el input para permitir seleccionar el mismo archivo de nuevo
                    e.target.value = '';
                }
            });
        }

        // Modal Manager
        const closeHistoryBtn = document.getElementById('close-history-modal');
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener('click', () => {
                this.modalManager.hideHistoryModal();
            });
        }

        const historyModal = document.getElementById('history-modal');
        if (historyModal) {
            historyModal.addEventListener('click', (e) => {
                if (e.target === historyModal) {
                    this.modalManager.hideHistoryModal();
                }
            });
        }

        const errorModal = document.getElementById('error-modal');
        if (errorModal) {
            errorModal.addEventListener('click', (e) => {
                if (e.target === errorModal) {
                    this.modalManager.hideErrorModal();
                }
            });
        }
    }

    /**
     * Carga datos desde localStorage
     */
    loadData() {
        const paragraphsData = this.storageService.loadParagraphs();
        this.paragraphs = paragraphsData.map(p => Paragraph.fromJSON(p));

        const resultsData = this.storageService.loadResults();
        const allResults = resultsData.map(r => Result.fromJSON(r));
        
        // Limpiar resultados antiguos, mantener solo los últimos 10 por párrafo
        this.results = RankCalculator.cleanOldResults(allResults, 10);
        
        // Si se eliminaron resultados, guardar la versión limpia
        if (this.results.length < allResults.length) {
            this.storageService.saveResults(this.results);
        }
    }

    /**
     * Guarda datos en localStorage
     */
    saveData() {
        this.storageService.saveAll(this.paragraphs, this.results);
    }

    /**
     * Maneja la adición de un nuevo párrafo
     */
    handleAddParagraph() {
        const text = this.startView.getParagraphText();
        
        if (!text) {
            this.startView.showNotification('Por favor ingresa un párrafo', 'error');
            return;
        }

        // Normalizar comillas cursivas a planas antes de procesar
        const normalizedText = TextProcessor.normalizeText(text);
        const sentences = TextProcessor.splitIntoSentences(text);
        
        if (sentences.length === 0) {
            this.startView.showNotification(
                'El párrafo debe contener al menos una frase terminada en punto',
                'error'
            );
            return;
        }

        const paragraph = new Paragraph(normalizedText, sentences);
        this.paragraphs.push(paragraph);
        this.saveData();
        
        this.startView.clearInput();
        this.startView.renderSavedParagraphs(
            this.paragraphs,
            this.getResultsForParagraph.bind(this),
            this.getBestResultForParagraph.bind(this)
        );
        
        this.startView.showNotification(
            `Párrafo agregado con ${sentences.length} frases`,
            'success'
        );
    }

    /**
     * Maneja el inicio de un quiz
     * @param {string} paragraphId - ID del párrafo
     */
    handleStartQuiz(paragraphId) {
        const paragraph = this.paragraphs.find(p => p.id === paragraphId);
        if (!paragraph) return;

        this.currentSession = new QuizSession(paragraph);
        this.currentSession.startTimer();
        this.loadCurrentSentence();
        this.screenManager.showScreen('quiz');
        
        // Iniciar el cronómetro visual
        this.quizView.startTimer(() => {
            this.currentSession.calculateElapsedTime();
            return this.currentSession.getFormattedTime();
        });
    }

    /**
     * Carga la frase actual del quiz
     */
    loadCurrentSentence() {
        const sentence = this.currentSession.getCurrentSentence();
        const sentenceNum = this.currentSession.getCurrentSentenceNumber();
        const totalSentences = this.currentSession.getTotalSentences();

        this.quizView.showStudySection(sentence, sentenceNum, totalSentences);
    }

    /**
     * Maneja cuando el usuario está listo para escribir
     */
    handleReady() {
        this.quizView.showWritingSection();
    }

    /**
     * Maneja cuando el usuario quiere ver la frase de nuevo
     */
    handleShowSentence() {
        this.currentSession.recordReview();
        this.loadCurrentSentence();
    }

    /**
     * Maneja el envío de una frase
     */
    handleSubmitSentence() {
        const userText = this.quizView.getUserInput();
        
        if (!userText) {
            this.quizView.showNotification('Por favor escribe la frase', 'error');
            return;
        }

        const currentSentenceText = document.getElementById('current-sentence-text');
        const correctText = currentSentenceText.textContent;
        const isCorrect = TextProcessor.compareTexts(userText, correctText);

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(userText, correctText);
        }
    }

    /**
     * Maneja una respuesta correcta
     */
    handleCorrectAnswer() {
        this.quizView.showNotification('¡Frase correcta!', 'success');

        const hasMore = this.currentSession.nextSentence();
        
        if (hasMore) {
            setTimeout(() => {
                this.loadCurrentSentence();
            }, 1000);
        } else {
            setTimeout(() => {
                this.completeQuiz();
            }, 1000);
        }
    }

    /**
     * Maneja una respuesta incorrecta
     * @param {string} userText - Texto del usuario
     * @param {string} correctText - Texto correcto
     */
    handleIncorrectAnswer(userText, correctText) {
        this.currentSession.recordError();

        // Calcular porcentaje de similitud
        const similarity = TextProcessor.calculateSimilarity(userText, correctText);
        
        // Encontrar la posición del error
        const errorInfo = TextProcessor.findErrorPosition(userText, correctText);

        // Debug info
        // console.log('Texto usuario:', TextProcessor.repr(userText));
        // console.log('Texto correcto:', TextProcessor.repr(correctText));
        // console.log('Normalizado usuario:', TextProcessor.repr(TextProcessor.normalizeText(userText)));
        // console.log('Normalizado correcto:', TextProcessor.repr(TextProcessor.normalizeText(correctText)));
        // console.log('Similitud:', similarity + '%');
        // console.log('Error info:', errorInfo);

        // Limpiar el campo de entrada siempre que haya un error
        this.quizView.clearUserInput();

        this.modalManager.showErrorModal(
            similarity,
            errorInfo,
            () => this.handleReviewSentence(),
            () => this.handleTryAgainModal()
        );
    }

    /**
     * Maneja la revisión de la frase después de un error
     */
    handleReviewSentence() {
        this.currentSession.recordReview();
        this.loadCurrentSentence();
    }

    /**
     * Maneja el intento de escribir nuevamente después de un error
     */
    handleTryAgainModal() {
        // El campo ya fue limpiado en handleIncorrectAnswer
        // Este método existe para cerrar el modal y mantener al usuario en la sección de escritura
    }

    /**
     * Completa el quiz y muestra resultados
     */
    completeQuiz() {
        // Detener el cronómetro y calcular el tiempo final
        this.quizView.stopTimer();
        this.currentSession.calculateElapsedTime();
        
        const calculatedResults = RankCalculator.calculateResults(this.currentSession);
        
        const result = new Result(
            this.currentSession.paragraph.id,
            this.currentSession.paragraph.text,
            calculatedResults.rank,
            calculatedResults.totalAttempts,
            calculatedResults.totalErrors,
            calculatedResults.sentenceProgress,
            null, // id
            null, // completedAt
            this.currentSession.elapsedTime // tiempo en segundos
        );

        this.results.push(result);
        
        // Limpiar resultados antiguos, mantener solo los últimos 10 por párrafo
        this.results = RankCalculator.cleanOldResults(this.results, 10);
        
        this.saveData();

        this.resultsView.showResults(calculatedResults, this.currentSession.elapsedTime);
        this.screenManager.showScreen('results');
    }

    /**
     * Maneja el abandono del quiz
     */
    handleQuitQuiz() {
        this.modalManager.showQuitConfirmModal(
            () => {
                this.quizView.stopTimer();
                this.currentSession = null;
                this.screenManager.showScreen('start');
            }
        );
    }

    /**
     * Maneja el intento de repetir el quiz
     */
    handleTryAgain() {
        if (this.currentSession) {
            this.handleStartQuiz(this.currentSession.paragraph.id);
        }
    }

    /**
     * Maneja el regreso a la pantalla de inicio
     */
    handleBackToStart() {
        this.currentSession = null;
        this.screenManager.showScreen('start');
        this.startView.renderSavedParagraphs(
            this.paragraphs,
            this.getResultsForParagraph.bind(this),
            this.getBestResultForParagraph.bind(this)
        );
    }

    /**
     * Maneja la eliminación de un párrafo
     * @param {string} paragraphId - ID del párrafo
     */
    handleDeleteParagraph(paragraphId) {
        this.modalManager.showDeleteConfirmModal(
            () => {
                this.paragraphs = this.paragraphs.filter(p => p.id !== paragraphId);
                this.results = this.results.filter(r => r.paragraphId !== paragraphId);
                this.saveData();
                
                this.startView.renderSavedParagraphs(
                    this.paragraphs,
                    this.getResultsForParagraph.bind(this),
                    this.getBestResultForParagraph.bind(this)
                );
                
                NotificationManager.show('Párrafo eliminado', 'info');
            }
        );
    }

    /**
     * Maneja la visualización del historial
     * @param {string} paragraphId - ID del párrafo
     */
    handleViewHistory(paragraphId) {
        const results = this.getResultsForParagraph(paragraphId);
        const paragraph = this.paragraphs.find(p => p.id === paragraphId);

        if (!paragraph || results.length === 0) {
            NotificationManager.show('No hay historial disponible para este párrafo', 'info');
            return;
        }

        this.modalManager.showHistoryModal(results, paragraph);
    }

    /**
     * Maneja la limpieza del historial de un párrafo
     * @param {string} paragraphId - ID del párrafo
     */
    handleClearHistory(paragraphId) {
        this.modalManager.showClearHistoryModal(
            () => {
                // Eliminar todos los resultados de este párrafo
                this.results = this.results.filter(r => r.paragraphId !== paragraphId);
                this.saveData();
                
                // Re-renderizar la lista de párrafos
                this.startView.renderSavedParagraphs(
                    this.paragraphs,
                    this.getResultsForParagraph.bind(this),
                    this.getBestResultForParagraph.bind(this)
                );
                
                NotificationManager.show('Historial limpiado correctamente', 'success');
            }
        );
    }

    /**
     * Obtiene los resultados de un párrafo específico (ordenados por fecha, más reciente primero)
     * @param {string} paragraphId - ID del párrafo
     * @returns {Result[]} - Array de resultados ordenados y limitados a 10
     */
    getResultsForParagraph(paragraphId) {
        return RankCalculator.getResultsForParagraph(this.results, paragraphId, 10);
    }

    /**
     * Obtiene el mejor resultado de un párrafo específico
     * @param {string} paragraphId - ID del párrafo
     * @returns {Result|null} - Mejor resultado o null
     */
    getBestResultForParagraph(paragraphId) {
        return RankCalculator.getBestResultForParagraph(this.results, paragraphId);
    }

    /**
     * Maneja la exportación de datos
     */
    handleExportData() {
        try {
            const data = this.storageService.exportData();
            
            // Crear un blob con los datos JSON
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Crear un enlace temporal para descargar el archivo
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Generar nombre de archivo con fecha
            const date = new Date().toISOString().split('T')[0];
            a.download = `memoquiz-backup-${date}.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            NotificationManager.show('Datos exportados correctamente', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            NotificationManager.show('Error al exportar los datos: ' + error.message, 'error');
        }
    }

    /**
     * Maneja la importación de datos desde un archivo
     * @param {File} file - Archivo a importar
     */
    handleImportData(file) {
        // Verificar que sea un archivo JSON
        if (!file.name.endsWith('.json')) {
            NotificationManager.show('El archivo debe ser de tipo JSON (.json)', 'error');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                // Parsear el contenido del archivo
                const data = JSON.parse(e.target.result);
                
                // Validar la estructura de los datos
                const validation = this.storageService.validateImportData(data);
                
                if (!validation.valid) {
                    NotificationManager.show(
                        'Los datos no tienen la estructura correcta: ' + validation.error,
                        'error'
                    );
                    return;
                }
                
                // Mostrar modal de confirmación
                this.modalManager.showImportConfirmModal(
                    data,
                    () => this.confirmImportData(data),
                    null
                );
                
            } catch (error) {
                console.error('Error parsing import file:', error);
                NotificationManager.show(
                    'Error al leer el archivo: El formato JSON no es válido',
                    'error'
                );
            }
        };
        
        reader.onerror = () => {
            NotificationManager.show('Error al leer el archivo', 'error');
        };
        
        reader.readAsText(file);
    }

    /**
     * Confirma e importa los datos validados
     * @param {Object} data - Datos validados a importar
     */
    confirmImportData(data) {
        try {
            // Importar los datos al localStorage
            this.storageService.importData(data);
            
            // Recargar los datos en la aplicación
            this.loadData();
            
            // Re-renderizar la vista
            this.startView.renderSavedParagraphs(
                this.paragraphs,
                this.getResultsForParagraph.bind(this),
                this.getBestResultForParagraph.bind(this)
            );
            
            NotificationManager.show(
                `Datos importados correctamente: ${data.paragraphs.length} párrafos y ${data.results.length} resultados`,
                'success'
            );
        } catch (error) {
            console.error('Error importing data:', error);
            NotificationManager.show('Error al importar los datos: ' + error.message, 'error');
        }
    }
}

