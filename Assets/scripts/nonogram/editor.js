/**
 * Editor mode functionality
 */

let editorGrid = null;
let editorSize = 10;

/**
 * Initialize editor mode
 */
function initEditor() {
    const sizeSelect = document.getElementById('editor-size');
    const clearBtn = document.getElementById('clear-grid-btn');
    const exportBtn = document.getElementById('export-btn');
    const container = document.getElementById('editor-container');

    // Create initial grid
    createEditorGrid(editorSize);

    // Size change handler
    sizeSelect.addEventListener('change', (e) => {
        editorSize = parseInt(e.target.value);
        createEditorGrid(editorSize);
    });

    // Clear button handler
    clearBtn.addEventListener('click', () => {
        if (confirm('Clear the entire grid?')) {
            editorGrid.clear();
        }
    });

    // Export button handler
    exportBtn.addEventListener('click', exportPuzzle);
}

/**
 * Create editor grid
 * @param {number} size - Grid size
 */
function createEditorGrid(size) {
    const container = document.getElementById('editor-container');

    // Calculate initial clues (all zeros for empty grid)
    const emptyClues = Array(size).fill(null).map(() => [0]);

    editorGrid = new Grid(size, container, {
        editable: true,
        rowClues: emptyClues,
        colClues: emptyClues,
        onCellChange: updateEditorClues
    });
}

/**
 * Update clues based on current grid state
 */
function updateEditorClues() {
    const gridData = editorGrid.getData();
    const { rowClues, colClues } = Clues.calculateAll(gridData);
    editorGrid.updateClues(rowClues, colClues);
}

/**
 * Export current puzzle
 */
function exportPuzzle() {
    const gridData = editorGrid.getData();

    // Check if grid is empty
    const isEmpty = gridData.every(row => row.every(cell => cell === 0));
    if (isEmpty) {
        alert('Cannot export an empty puzzle!');
        return;
    }

    // Create puzzle object
    const puzzle = {
        size: editorSize,
        solution: gridData,
        name: `Puzzle ${editorSize}x${editorSize}`,
        created: Utils.getDateString()
    };

    // Download as JSON
    const filename = `nonogram_${editorSize}x${editorSize}_${Date.now()}.json`;
    Utils.downloadJSON(puzzle, filename);

    alert('Puzzle exported successfully!');
}
