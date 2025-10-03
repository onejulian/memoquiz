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
            this.getResultsForParagraph.bind(this)
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
            onViewHistory: this.handleViewHistory.bind(this)
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
        this.results = resultsData.map(r => Result.fromJSON(r));
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
            this.getResultsForParagraph.bind(this)
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
        this.loadCurrentSentence();
        this.screenManager.showScreen('quiz');
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

        const correctText = this.currentSession.getCurrentSentence();
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

        // Debug info
        console.log('Texto usuario:', TextProcessor.repr(userText));
        console.log('Texto correcto:', TextProcessor.repr(correctText));
        console.log('Normalizado usuario:', TextProcessor.repr(TextProcessor.normalizeText(userText)));
        console.log('Normalizado correcto:', TextProcessor.repr(TextProcessor.normalizeText(correctText)));

        // Limpiar el campo de entrada siempre que haya un error
        this.quizView.clearUserInput();

        this.modalManager.showErrorModal(
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
        const calculatedResults = RankCalculator.calculateResults(this.currentSession);
        
        const result = new Result(
            this.currentSession.paragraph.id,
            this.currentSession.paragraph.text,
            calculatedResults.rank,
            calculatedResults.totalAttempts,
            calculatedResults.totalErrors,
            calculatedResults.sentenceProgress
        );

        this.results.push(result);
        this.saveData();

        this.resultsView.showResults(calculatedResults);
        this.screenManager.showScreen('results');
    }

    /**
     * Maneja el abandono del quiz
     */
    handleQuitQuiz() {
        if (confirm('¿Estás seguro de que quieres abandonar el quiz? Se perderá todo el progreso.')) {
            this.currentSession = null;
            this.screenManager.showScreen('start');
        }
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
            this.getResultsForParagraph.bind(this)
        );
    }

    /**
     * Maneja la eliminación de un párrafo
     * @param {string} paragraphId - ID del párrafo
     */
    handleDeleteParagraph(paragraphId) {
        if (confirm('¿Estás seguro de que quieres eliminar este párrafo? También se eliminarán todos sus resultados.')) {
            this.paragraphs = this.paragraphs.filter(p => p.id !== paragraphId);
            this.results = this.results.filter(r => r.paragraphId !== paragraphId);
            this.saveData();
            
            this.startView.renderSavedParagraphs(
                this.paragraphs,
                this.getResultsForParagraph.bind(this)
            );
            
            NotificationManager.show('Párrafo eliminado', 'info');
        }
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
     * Obtiene los resultados de un párrafo específico
     * @param {string} paragraphId - ID del párrafo
     * @returns {Result[]} - Array de resultados ordenados
     */
    getResultsForParagraph(paragraphId) {
        return RankCalculator.getResultsForParagraph(this.results, paragraphId);
    }
}

