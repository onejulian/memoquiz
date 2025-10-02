/**
 * Servicio para manejo de almacenamiento local
 */
export class StorageService {
    constructor() {
        this.PARAGRAPHS_KEY = 'memoquiz-paragraphs';
        this.RESULTS_KEY = 'memoquiz-results';
    }

    /**
     * Guarda párrafos en localStorage
     * @param {Paragraph[]} paragraphs - Array de párrafos
     */
    saveParagraphs(paragraphs) {
        try {
            const data = paragraphs.map(p => p.toJSON());
            localStorage.setItem(this.PARAGRAPHS_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving paragraphs to localStorage:', e);
        }
    }

    /**
     * Carga párrafos desde localStorage
     * @returns {Object[]} - Array de objetos de párrafos
     */
    loadParagraphs() {
        try {
            const data = localStorage.getItem(this.PARAGRAPHS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading paragraphs from localStorage:', e);
            return [];
        }
    }

    /**
     * Guarda resultados en localStorage
     * @param {Result[]} results - Array de resultados
     */
    saveResults(results) {
        try {
            const data = results.map(r => r.toJSON());
            localStorage.setItem(this.RESULTS_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving results to localStorage:', e);
        }
    }

    /**
     * Carga resultados desde localStorage
     * @returns {Object[]} - Array de objetos de resultados
     */
    loadResults() {
        try {
            const data = localStorage.getItem(this.RESULTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading results from localStorage:', e);
            return [];
        }
    }

    /**
     * Guarda tanto párrafos como resultados
     * @param {Paragraph[]} paragraphs
     * @param {Result[]} results
     */
    saveAll(paragraphs, results) {
        this.saveParagraphs(paragraphs);
        this.saveResults(results);
    }
}

