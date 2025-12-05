/**
 * Nonogram solver using constraint propagation and backtracking
 */

const Solver = {
    /**
     * Solve a nonogram puzzle
     * @param {Array<Array<number>>} rowClues - Row clues
     * @param {Array<Array<number>>} colClues - Column clues
     * @param {number} maxSolutions - Maximum solutions to find (default 2)
     * @returns {Object} Object with solutions array and whether unique
     */
    solve(rowClues, colClues, maxSolutions = 2) {
        const size = rowClues.length;
        const grid = Utils.create2DArray(size, size, -1); // -1 = unknown, 0 = empty, 1 = filled
        const solutions = [];

        // Try to solve with backtracking
        this.backtrack(grid, rowClues, colClues, 0, solutions, maxSolutions);

        return {
            solutions: solutions,
            unique: solutions.length === 1,
            solvable: solutions.length > 0
        };
    },

    /**
     * Backtracking solver
     * @param {Array<Array<number>>} grid - Current grid state
     * @param {Array<Array<number>>} rowClues - Row clues
     * @param {Array<Array<number>>} colClues - Column clues
     * @param {number} pos - Current position (row * size + col)
     * @param {Array} solutions - Array to store solutions
     * @param {number} maxSolutions - Maximum solutions to find
     * @returns {boolean} Whether to continue searching
     */
    backtrack(grid, rowClues, colClues, pos, solutions, maxSolutions) {
        const size = grid.length;

        // If we found enough solutions, stop
        if (solutions.length >= maxSolutions) {
            return false;
        }

        // If we've filled all positions, check if it's valid
        if (pos >= size * size) {
            if (this.isValidSolution(grid, rowClues, colClues)) {
                solutions.push(Utils.copy2DArray(grid));
            }
            return solutions.length < maxSolutions;
        }

        const row = Math.floor(pos / size);
        const col = pos % size;

        // Try both filled and empty
        for (const value of [1, 0]) {
            grid[row][col] = value;

            // Check if this is still valid
            if (this.isValidPartial(grid, rowClues, colClues, row, col)) {
                if (!this.backtrack(grid, rowClues, colClues, pos + 1, solutions, maxSolutions)) {
                    grid[row][col] = -1;
                    return false;
                }
            }
        }

        grid[row][col] = -1;
        return true;
    },

    /**
     * Check if partial solution is still valid
     * @param {Array<Array<number>>} grid - Current grid state
     * @param {Array<Array<number>>} rowClues - Row clues
     * @param {Array<Array<number>>} colClues - Column clues
     * @param {number} row - Current row
     * @param {number} col - Current column
     * @returns {boolean} Whether partial solution is valid
     */
    isValidPartial(grid, rowClues, colClues, row, col) {
        const size = grid.length;

        // Check if row is complete
        const rowComplete = grid[row].every(cell => cell !== -1);
        if (rowComplete) {
            const actualClues = Clues.calculateLine(grid[row]);
            if (!this.cluesMatch(actualClues, rowClues[row])) {
                return false;
            }
        } else {
            // Check if partial row can still match clues
            if (!this.canMatchClues(grid[row], rowClues[row])) {
                return false;
            }
        }

        // Check column
        const column = [];
        let colComplete = true;
        for (let r = 0; r < size; r++) {
            column.push(grid[r][col]);
            if (grid[r][col] === -1) {
                colComplete = false;
            }
        }

        if (colComplete) {
            const actualClues = Clues.calculateLine(column);
            if (!this.cluesMatch(actualClues, colClues[col])) {
                return false;
            }
        } else {
            if (!this.canMatchClues(column, colClues[col])) {
                return false;
            }
        }

        return true;
    },

    /**
     * Check if partial line can still match clues
     * @param {Array<number>} line - Partial line (may contain -1)
     * @param {Array<number>} clues - Expected clues
     * @returns {boolean} Whether line can still match
     */
    canMatchClues(line, clues) {
        // Extract known filled segments
        const segments = [];
        let currentSegment = 0;
        let inSegment = false;

        for (let i = 0; i < line.length; i++) {
            if (line[i] === 1) {
                if (!inSegment) {
                    segments.push(0);
                    inSegment = true;
                }
                segments[segments.length - 1]++;
            } else if (line[i] === 0) {
                inSegment = false;
            }
            // -1 (unknown) doesn't break or confirm segments
        }

        // If we have more segments than clues, invalid
        if (segments.length > clues.length) {
            return false;
        }

        // Check if any confirmed segment exceeds its clue
        for (let i = 0; i < segments.length; i++) {
            if (segments[i] > clues[i]) {
                return false;
            }
        }

        return true;
    },

    /**
     * Check if two clue arrays match
     * @param {Array<number>} clues1 - First clue array
     * @param {Array<number>} clues2 - Second clue array
     * @returns {boolean} Whether they match
     */
    cluesMatch(clues1, clues2) {
        if (clues1.length !== clues2.length) {
            return false;
        }
        for (let i = 0; i < clues1.length; i++) {
            if (clues1[i] !== clues2[i]) {
                return false;
            }
        }
        return true;
    },

    /**
     * Check if grid is a valid complete solution
     * @param {Array<Array<number>>} grid - Complete grid
     * @param {Array<Array<number>>} rowClues - Row clues
     * @param {Array<Array<number>>} colClues - Column clues
     * @returns {boolean} Whether solution is valid
     */
    isValidSolution(grid, rowClues, colClues) {
        const size = grid.length;

        // Check all rows
        for (let row = 0; row < size; row++) {
            const actualClues = Clues.calculateLine(grid[row]);
            if (!this.cluesMatch(actualClues, rowClues[row])) {
                return false;
            }
        }

        // Check all columns
        for (let col = 0; col < size; col++) {
            const column = [];
            for (let row = 0; row < size; row++) {
                column.push(grid[row][col]);
            }
            const actualClues = Clues.calculateLine(column);
            if (!this.cluesMatch(actualClues, colClues[col])) {
                return false;
            }
        }

        return true;
    }
};
