import { AppController } from './controllers/AppController.js';

/**
 * Punto de entrada de la aplicación MemoQuiz
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.init();
});

