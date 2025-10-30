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

    /**
     * Exporta todos los datos del localStorage como un objeto JSON
     * @returns {Object} - Objeto con todos los datos
     */
    exportData() {
        try {
            const data = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                paragraphs: this.loadParagraphs(),
                results: this.loadResults()
            };
            return data;
        } catch (e) {
            console.error('Error exporting data:', e);
            throw new Error('No se pudo exportar los datos');
        }
    }

    /**
     * Valida la estructura de los datos a importar
     * @param {Object} data - Datos a validar
     * @returns {Object} - { valid: boolean, error: string|null }
     */
    validateImportData(data) {
        try {
            // Verificar que sea un objeto
            if (!data || typeof data !== 'object') {
                return { valid: false, error: 'Los datos no tienen el formato correcto' };
            }

            // Verificar que tenga las propiedades necesarias
            if (!data.hasOwnProperty('paragraphs') || !data.hasOwnProperty('results')) {
                return { valid: false, error: 'Los datos no contienen las propiedades requeridas (paragraphs, results)' };
            }

            // Verificar que paragraphs sea un array
            if (!Array.isArray(data.paragraphs)) {
                return { valid: false, error: 'La propiedad "paragraphs" debe ser un array' };
            }

            // Verificar que results sea un array
            if (!Array.isArray(data.results)) {
                return { valid: false, error: 'La propiedad "results" debe ser un array' };
            }

            // Validar estructura de cada párrafo
            for (let i = 0; i < data.paragraphs.length; i++) {
                const p = data.paragraphs[i];
                if (!p.id || !p.text || !Array.isArray(p.sentences) || !p.createdAt) {
                    return { 
                        valid: false, 
                        error: `Párrafo ${i + 1} no tiene la estructura correcta (id, text, sentences, createdAt)` 
                    };
                }
            }

            // Validar estructura de cada resultado
            for (let i = 0; i < data.results.length; i++) {
                const r = data.results[i];
                if (!r.id || !r.paragraphId || !r.rank || 
                    typeof r.totalAttempts !== 'number' || 
                    typeof r.totalErrors !== 'number' || 
                    !Array.isArray(r.sentenceProgress) || 
                    !r.completedAt) {
                    return { 
                        valid: false, 
                        error: `Resultado ${i + 1} no tiene la estructura correcta` 
                    };
                }
            }

            return { valid: true, error: null };
        } catch (e) {
            console.error('Error validating import data:', e);
            return { valid: false, error: 'Error al validar los datos: ' + e.message };
        }
    }

    /**
     * Importa datos validados, reemplazando los datos actuales
     * @param {Object} data - Datos validados a importar
     */
    importData(data) {
        try {
            localStorage.setItem(this.PARAGRAPHS_KEY, JSON.stringify(data.paragraphs));
            localStorage.setItem(this.RESULTS_KEY, JSON.stringify(data.results));
        } catch (e) {
            console.error('Error importing data:', e);
            throw new Error('No se pudo importar los datos');
        }
    }
}

