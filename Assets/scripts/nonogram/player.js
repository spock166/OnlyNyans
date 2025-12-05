/**
 * Play mode functionality
 */

let playerGrid = null;
let currentPuzzle = null;

/**
 * Initialize play mode
 */
function initPlayer() {
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const resetBtn = document.getElementById('reset-btn');
    const checkBtn = document.getElementById('check-btn');

    // Import button handler
    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    // File input handler
    importFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const puzzle = await Utils.readJSON(file);
                loadPuzzle(puzzle);
                showMessage('Puzzle loaded successfully!', 'success');
            } catch (error) {
                showMessage('Error loading puzzle: ' + error.message, 'error');
            }
        }
        // Reset file input
        e.target.value = '';
    });

    // Reset button handler
    resetBtn.addEventListener('click', () => {
        if (currentPuzzle && confirm('Reset the puzzle to the beginning?')) {
            resetPuzzle();
        }
    });

    // Check button handler
    checkBtn.addEventListener('click', () => {
        if (currentPuzzle) {
            checkSolution();
        }
    });
}

/**
 * Load a puzzle into play mode
 * @param {Object} puzzle - Puzzle object with size, solution, etc.
 */
function loadPuzzle(puzzle) {
    // Validate puzzle
    if (!puzzle.size || !puzzle.solution) {
        throw new Error('Invalid puzzle format');
    }

    if (puzzle.size !== 10 && puzzle.size !== 15) {
        throw new Error('Puzzle size must be 10 or 15');
    }

    if (puzzle.solution.length !== puzzle.size ||
        puzzle.solution[0].length !== puzzle.size) {
        throw new Error('Puzzle dimensions do not match specified size');
    }

    currentPuzzle = puzzle;

    // Calculate clues from solution
    const { rowClues, colClues } = Clues.calculateAll(puzzle.solution);

    // Create grid for playing
    const container = document.getElementById('play-container');
    playerGrid = new Grid(puzzle.size, container, {
        editable: true,
        rowClues: rowClues,
        colClues: colClues,
        onCellChange: updateClueIndicators
    });

    showMessage('', ''); // Clear message
}

/**
 * Reset puzzle to initial state
 */
function resetPuzzle() {
    if (playerGrid) {
        playerGrid.clear();
        showMessage('Puzzle reset!', 'info');
    }
}

/**
 * Check if current solution is correct
 */
function checkSolution() {
    if (!playerGrid || !currentPuzzle) return;

    const playerData = playerGrid.getData();
    const solution = currentPuzzle.solution;

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
        showMessage('🎉 Congratulations! You solved the puzzle! 🎉', 'success');
    } else {
        showMessage('Not quite right. Keep trying!', 'error');
    }
}

/**
 * Update clue indicators to show satisfied rows/columns
 */
function updateClueIndicators() {
    if (!playerGrid || !currentPuzzle) return;

    const playerData = playerGrid.getData();
    const size = currentPuzzle.size;

    // Check each row
    for (let row = 0; row < size; row++) {
        const rowData = playerData[row].map(cell => cell === 1 ? 1 : 0);
        const playerClues = Clues.calculateLine(rowData);
        const expectedClues = playerGrid.rowClues[row];
        const isSatisfied = checkCluesMatch(playerClues, expectedClues);
        playerGrid.setRowClueSatisfied(row, isSatisfied);
    }

    // Check each column
    for (let col = 0; col < size; col++) {
        const colData = [];
        for (let row = 0; row < size; row++) {
            colData.push(playerData[row][col] === 1 ? 1 : 0);
        }
        const playerClues = Clues.calculateLine(colData);
        const expectedClues = playerGrid.colClues[col];
        const isSatisfied = checkCluesMatch(playerClues, expectedClues);
        playerGrid.setColClueSatisfied(col, isSatisfied);
    }
}

/**
 * Check if player clues match expected clues
 * @param {Array<number>} playerClues - Clues from player's current state
 * @param {Array<number>} expectedClues - Expected clues from puzzle
 * @returns {boolean} True if clues match
 */
function checkCluesMatch(playerClues, expectedClues) {
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
 * Show message to user
 * @param {string} text - Message text
 * @param {string} type - Message type ('success', 'error', 'info')
 */
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'message';
    if (type) {
        messageDiv.classList.add(type);
    }
}
