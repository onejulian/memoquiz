/**
 * Gestor de pantallas de la aplicación
 */
export class ScreenManager {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            quiz: document.getElementById('quiz-screen'),
            results: document.getElementById('results-screen')
        };
        this.currentScreen = 'start';
    }

    /**
     * Muestra una pantalla específica
     * @param {string} screenName - Nombre de la pantalla (start, quiz, results)
     */
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
        this.currentScreen = screenName;
    }

    /**
     * Obtiene la pantalla actual
     * @returns {string}
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Oculta un elemento del DOM
     * @param {HTMLElement} element
     */
    hideElement(element) {
        element.classList.add('hidden');
    }

    /**
     * Muestra un elemento del DOM
     * @param {HTMLElement} element
     */
    showElement(element) {
        element.classList.remove('hidden');
    }
}

