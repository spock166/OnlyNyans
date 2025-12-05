/**
 * Utility functions for the Nonogram game
 */

const Utils = {
    /**
     * Create a 2D array filled with a default value
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @param {*} defaultValue - Default value for cells
     * @returns {Array<Array>} 2D array
     */
    create2DArray(rows, cols, defaultValue = 0) {
        return Array(rows).fill(null).map(() => Array(cols).fill(defaultValue));
    },

    /**
     * Deep copy a 2D array
     * @param {Array<Array>} array - Array to copy
     * @returns {Array<Array>} Copied array
     */
    copy2DArray(array) {
        return array.map(row => [...row]);
    },

    /**
     * Download data as a JSON file
     * @param {Object} data - Data to download
     * @param {string} filename - Name of the file
     */
    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Read a JSON file
     * @param {File} file - File to read
     * @returns {Promise<Object>} Parsed JSON data
     */
    readJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    },

    /**
     * Get current date string
     * @returns {string} Date in YYYY-MM-DD format
     */
    getDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
};
