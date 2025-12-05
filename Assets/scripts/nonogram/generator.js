/**
 * Random puzzle generator with unique solution validation
 */

const Generator = {
    /**
     * Generate a random puzzle with a unique solution
     * @param {number} size - Grid size (10 or 15)
     * @param {number} maxAttempts - Maximum generation attempts
     * @returns {Object} Puzzle object or null if failed
     */
    generate(size, maxAttempts = 50) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Generate random grid with moderate fill percentage
            const fillPercentage = 0.4 + Math.random() * 0.3; // 40-70%
            const grid = this.generateRandomGrid(size, fillPercentage);

            // Calculate clues
            const { rowClues, colClues } = Clues.calculateAll(grid);

            // Verify unique solution
            const result = Solver.solve(rowClues, colClues, 2);

            if (result.unique) {
                return {
                    size: size,
                    solution: grid,
                    name: `Random ${size}×${size}`,
                    created: Utils.getDateString()
                };
            }
        }

        return null;
    },

    /**
     * Generate a random grid
     * @param {number} size - Grid size
     * @param {number} fillPercentage - Percentage of cells to fill (0-1)
     * @returns {Array<Array<number>>} Random grid
     */
    generateRandomGrid(size, fillPercentage) {
        const grid = Utils.create2DArray(size, size, 0);

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                grid[row][col] = Math.random() < fillPercentage ? 1 : 0;
            }
        }

        return grid;
    }
};

let randomGrid = null;
let randomPuzzle = null;

/**
 * Initialize random generator mode
 */
function initGenerator() {
    const generateBtn = document.getElementById('generate-btn');
    const sizeSelect = document.getElementById('random-size');
    const container = document.getElementById('random-container');
    const messageDiv = document.getElementById('random-message');

    generateBtn.addEventListener('click', async () => {
        const size = parseInt(sizeSelect.value);

        // Show generating message
        showRandomMessage('Generating puzzle... This may take a moment.', 'info');
        generateBtn.disabled = true;

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            try {
                const puzzle = Generator.generate(size);

                if (puzzle) {
                    randomPuzzle = puzzle;
                    loadRandomPuzzle(puzzle);
                    showRandomMessage('Puzzle generated! Start solving.', 'success');
                } else {
                    showRandomMessage('Failed to generate a unique puzzle. Try again.', 'error');
                }
            } catch (error) {
                showRandomMessage('Error generating puzzle: ' + error.message, 'error');
            } finally {
                generateBtn.disabled = false;
            }
        }, 100);
    });
}

/**
 * Load a random puzzle into the random mode
 * @param {Object} puzzle - Puzzle object
 */
function loadRandomPuzzle(puzzle) {
    const { rowClues, colClues } = Clues.calculateAll(puzzle.solution);

    const container = document.getElementById('random-container');
    randomGrid = new Grid(puzzle.size, container, {
        editable: true,
        rowClues: rowClues,
        colClues: colClues,
        onCellChange: () => {
            updateRandomClueIndicators();
            checkRandomSolution();
        }
    });
}

/**
 * Update clue indicators for random mode
 */
function updateRandomClueIndicators() {
    if (!randomGrid || !randomPuzzle) return;

    const playerData = randomGrid.getData();
    const size = randomPuzzle.size;

    // Check each row
    for (let row = 0; row < size; row++) {
        const rowData = playerData[row].map(cell => cell === 1 ? 1 : 0);
        const playerClues = Clues.calculateLine(rowData);
        const expectedClues = randomGrid.rowClues[row];
        const isSatisfied = checkCluesMatchForRandom(playerClues, expectedClues);
        randomGrid.setRowClueSatisfied(row, isSatisfied);
    }

    // Check each column
    for (let col = 0; col < size; col++) {
        const colData = [];
        for (let row = 0; row < size; row++) {
            colData.push(playerData[row][col] === 1 ? 1 : 0);
        }
        const playerClues = Clues.calculateLine(colData);
        const expectedClues = randomGrid.colClues[col];
        const isSatisfied = checkCluesMatchForRandom(playerClues, expectedClues);
        randomGrid.setColClueSatisfied(col, isSatisfied);
    }
}

/**
 * Check if clues match
 * @param {Array<number>} playerClues - Player's clues
 * @param {Array<number>} expectedClues - Expected clues
 * @returns {boolean} Whether they match
 */
function checkCluesMatchForRandom(playerClues, expectedClues) {
    if (playerClues.length !== expectedClues.length) {
        return false;
    }

    for (let i = 0; i < playerClues.length; i++) {
        if (playerClues[i] !== expectedClues[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Check if random puzzle is solved
 */
function checkRandomSolution() {
    if (!randomGrid || !randomPuzzle) return;

    const playerData = randomGrid.getData();
    const solution = randomPuzzle.solution;

    // Convert player data: treat marked cells (2) as empty (0)
    const playerSolution = playerData.map(row =>
        row.map(cell => cell === 1 ? 1 : 0)
    );

    // Compare with solution
    let isCorrect = true;
    for (let row = 0; row < solution.length; row++) {
        for (let col = 0; col < solution[row].length; col++) {
            if (playerSolution[row][col] !== solution[row][col]) {
                isCorrect = false;
                break;
            }
        }
        if (!isCorrect) break;
    }

    if (isCorrect) {
        showRandomMessage('🎉 Congratulations! You solved the puzzle! 🎉', 'success');
    }
}

/**
 * Show message in random mode
 * @param {string} text - Message text
 * @param {string} type - Message type
 */
function showRandomMessage(text, type) {
    const messageDiv = document.getElementById('random-message');
    messageDiv.textContent = text;
    messageDiv.className = 'message';
    if (type) {
        messageDiv.classList.add(type);
    }
}
