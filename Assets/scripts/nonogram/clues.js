/**
 * Calculate clues for nonogram puzzles
 */

const Clues = {
    /**
     * Calculate clues for a single line (row or column)
     * @param {Array<number>} line - Array of 0s and 1s
     * @returns {Array<number>} Array of clue numbers
     */
    calculateLine(line) {
        const clues = [];
        let count = 0;

        for (let i = 0; i < line.length; i++) {
            if (line[i] === 1) {
                count++;
            } else if (count > 0) {
                clues.push(count);
                count = 0;
            }
        }

        // Don't forget the last group
        if (count > 0) {
            clues.push(count);
        }

        // If no filled cells, return [0]
        return clues.length > 0 ? clues : [0];
    },

    /**
     * Calculate row clues for entire grid
     * @param {Array<Array<number>>} grid - 2D array representing the puzzle
     * @returns {Array<Array<number>>} Array of row clues
     */
    calculateRows(grid) {
        return grid.map(row => this.calculateLine(row));
    },

    /**
     * Calculate column clues for entire grid
     * @param {Array<Array<number>>} grid - 2D array representing the puzzle
     * @returns {Array<Array<number>>} Array of column clues
     */
    calculateColumns(grid) {
        const size = grid.length;
        const colClues = [];

        for (let col = 0; col < size; col++) {
            const column = [];
            for (let row = 0; row < size; row++) {
                column.push(grid[row][col]);
            }
            colClues.push(this.calculateLine(column));
        }

        return colClues;
    },

    /**
     * Calculate all clues for a grid
     * @param {Array<Array<number>>} grid - 2D array representing the puzzle
     * @returns {Object} Object with rowClues and colClues arrays
     */
    calculateAll(grid) {
        return {
            rowClues: this.calculateRows(grid),
            colClues: this.calculateColumns(grid)
        };
    }
};
