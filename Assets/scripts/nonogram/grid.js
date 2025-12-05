/**
 * Grid rendering and management
 */

class Grid {
    /**
     * Create a grid instance
     * @param {number} size - Size of the grid (10 or 15)
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Options for the grid
     */
    constructor(size, container, options = {}) {
        this.size = size;
        this.container = container;
        this.editable = options.editable || false;
        this.rowClues = options.rowClues || [];
        this.colClues = options.colClues || [];

        // Initialize grid data (0 = empty, 1 = filled, 2 = marked with X)
        this.data = Utils.create2DArray(size, size, 0);

        // Callbacks
        this.onCellClick = options.onCellClick || null;
        this.onCellRightClick = options.onCellRightClick || null;
        this.onCellChange = options.onCellChange || null; // Called after any cell state change

        // Store clue cell elements for highlighting
        this.rowClueElements = [];
        this.colClueElements = [];

        // Drag state
        this.isDragging = false;
        this.dragAction = null; // Will store the action to apply (fill, mark, or clear)
        this.dragButton = null; // Track which mouse button started the drag

        this.render();
    }

    /**
     * Render the grid with clues
     */
    render() {
        this.container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'grid-wrapper';

        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';

        // Calculate max clue lengths for sizing
        const maxColClueLength = Math.max(...this.colClues.map(c => c.length), 1);
        const maxRowClueLength = Math.max(...this.rowClues.map(c => c.length), 1);

        // Set grid template
        const colClueWidth = Math.max(maxRowClueLength * 20, 40);
        gridContainer.style.gridTemplateColumns = `${colClueWidth}px repeat(${this.size}, 30px)`;
        gridContainer.style.gridTemplateRows = `${maxColClueLength * 20}px repeat(${this.size}, 30px)`;

        // Corner cell (top-left)
        const corner = document.createElement('div');
        corner.className = 'clue-cell corner';
        gridContainer.appendChild(corner);

        // Column clues (top row)
        this.colClueElements = [];
        for (let col = 0; col < this.size; col++) {
            const clueCell = document.createElement('div');
            clueCell.className = 'clue-cell';
            clueCell.dataset.colIndex = col;

            const clueNumbers = document.createElement('div');
            clueNumbers.className = 'clue-numbers';

            const clues = this.colClues[col] || [0];
            clues.forEach(num => {
                const span = document.createElement('span');
                span.textContent = num;
                clueNumbers.appendChild(span);
            });

            clueCell.appendChild(clueNumbers);
            gridContainer.appendChild(clueCell);
            this.colClueElements.push(clueCell);
        }

        // Grid rows with row clues
        this.rowClueElements = [];
        for (let row = 0; row < this.size; row++) {
            // Row clue
            const rowClueCell = document.createElement('div');
            rowClueCell.className = 'clue-cell horizontal';
            rowClueCell.dataset.rowIndex = row;

            const clueNumbers = document.createElement('div');
            clueNumbers.className = 'clue-numbers';

            const clues = this.rowClues[row] || [0];
            clues.forEach(num => {
                const span = document.createElement('span');
                span.textContent = num;
                clueNumbers.appendChild(span);
            });

            rowClueCell.appendChild(clueNumbers);
            gridContainer.appendChild(rowClueCell);
            this.rowClueElements.push(rowClueCell);

            // Grid cells
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                // Add classes for bold borders every 5 cells
                if ((col + 1) % 5 === 0 && col < this.size - 1) {
                    cell.classList.add('border-right-bold');
                }
                if ((row + 1) % 5 === 0 && row < this.size - 1) {
                    cell.classList.add('border-bottom-bold');
                }

                // Set initial state
                this.updateCellDisplay(cell, this.data[row][col]);

                // Add event listeners
                if (this.editable) {
                    cell.addEventListener('mousedown', (e) => {
                        this.handleMouseDown(row, col, e);
                    });

                    cell.addEventListener('mouseenter', (e) => {
                        this.handleMouseEnter(row, col, e);
                    });

                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                    });
                }

                gridContainer.appendChild(cell);
            }
        }

        // Add global mouse up listener for drag operations
        if (this.editable) {
            document.addEventListener('mouseup', () => {
                this.isDragging = false;
                this.dragAction = null;
                this.dragButton = null;
            });
        }

        wrapper.appendChild(gridContainer);
        this.container.appendChild(wrapper);
    }

    /**
     * Update cell display based on state
     * @param {HTMLElement} cell - Cell element
     * @param {number} state - Cell state (0, 1, or 2)
     */
    updateCellDisplay(cell, state) {
        cell.classList.remove('filled', 'marked');
        if (state === 1) {
            cell.classList.add('filled');
        } else if (state === 2) {
            cell.classList.add('marked');
        }
    }

    /**
     * Handle mouse down on cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {Event} e - Mouse event
     */
    handleMouseDown(row, col, e) {
        e.preventDefault();

        this.isDragging = true;
        this.dragButton = e.button; // 0 = left, 2 = right

        const currentState = this.data[row][col];

        // Determine what action to apply during drag
        if (e.button === 0) { // Left click
            // Determine next state for left click
            if (currentState === 0) {
                this.dragAction = 1; // Fill
            } else if (currentState === 1) {
                this.dragAction = 2; // Mark
            } else {
                this.dragAction = 0; // Clear
            }
        } else if (e.button === 2) { // Right click
            // Determine next state for right click
            if (currentState === 0) {
                this.dragAction = 2; // Mark
            } else if (currentState === 2) {
                this.dragAction = 0; // Clear
            } else {
                this.dragAction = 2; // From filled to marked
            }
        }

        // Apply to first cell
        this.applyCellAction(row, col);
    }

    /**
     * Handle mouse enter on cell (for dragging)
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {Event} e - Mouse event
     */
    handleMouseEnter(row, col, e) {
        if (this.isDragging && this.dragAction !== null) {
            this.applyCellAction(row, col);
        }
    }

    /**
     * Apply the current drag action to a cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    applyCellAction(row, col) {
        const oldState = this.data[row][col];

        // Set the cell to the drag action state
        this.setCellState(row, col, this.dragAction);

        // Trigger change callback if state changed
        if (oldState !== this.dragAction && this.onCellChange) {
            this.onCellChange(row, col);
        }
    }

    /**
     * Handle cell click
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {Event} e - Click event
     */
    handleCellClick(row, col, e) {
        if (this.onCellClick) {
            this.onCellClick(row, col, e);
        }
    }

    /**
     * Handle cell click
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {Event} e - Click event
     */
    handleCellClick(row, col, e) {
        if (this.onCellClick) {
            this.onCellClick(row, col, e);
        }
    }

    /**
     * Handle cell right click
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {Event} e - Click event
     */
    handleCellRightClick(row, col, e) {
        if (this.onCellRightClick) {
            this.onCellRightClick(row, col, e);
        }
    }

    /**
     * Set cell state
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} state - New state
     */
    setCellState(row, col, state) {
        this.data[row][col] = state;
        const cell = this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            this.updateCellDisplay(cell, state);
        }
    }

    /**
     * Get cell state
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {number} Cell state
     */
    getCellState(row, col) {
        return this.data[row][col];
    }

    /**
     * Clear all cells
     */
    clear() {
        this.data = Utils.create2DArray(this.size, this.size, 0);
        this.render();
    }

    /**
     * Load grid data
     * @param {Array<Array<number>>} data - Grid data to load
     */
    loadData(data) {
        this.data = Utils.copy2DArray(data);
        this.render();
    }

    /**
     * Get current grid data
     * @returns {Array<Array<number>>} Current grid data
     */
    getData() {
        return Utils.copy2DArray(this.data);
    }

    /**
     * Update clues
     * @param {Array<Array<number>>} rowClues - Row clues
     * @param {Array<Array<number>>} colClues - Column clues
     */
    updateClues(rowClues, colClues) {
        this.rowClues = rowClues;
        this.colClues = colClues;
        this.render();
    }

    /**
     * Set whether a row's clues are satisfied
     * @param {number} row - Row index
     * @param {boolean} satisfied - Whether clues are satisfied
     */
    setRowClueSatisfied(row, satisfied) {
        if (this.rowClueElements[row]) {
            this.rowClueElements[row].classList.toggle('satisfied', satisfied);
        }
    }

    /**
     * Set whether a column's clues are satisfied
     * @param {number} col - Column index
     * @param {boolean} satisfied - Whether clues are satisfied
     */
    setColClueSatisfied(col, satisfied) {
        if (this.colClueElements[col]) {
            this.colClueElements[col].classList.toggle('satisfied', satisfied);
        }
    }
}
