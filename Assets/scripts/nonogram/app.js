/**
 * Main application controller
 */

// Mode management
const modeButtons = {
    editor: document.getElementById('editor-mode-btn'),
    play: document.getElementById('play-mode-btn'),
    random: document.getElementById('random-mode-btn')
};

const modeContents = {
    editor: document.getElementById('editor-mode'),
    play: document.getElementById('play-mode'),
    random: document.getElementById('random-mode')
};

let currentMode = 'editor';

/**
 * Switch between modes
 * @param {string} mode - Mode to switch to ('editor', 'play', or 'random')
 */
function switchMode(mode) {
    // Update buttons
    Object.keys(modeButtons).forEach(key => {
        modeButtons[key].classList.toggle('active', key === mode);
    });

    // Update content
    Object.keys(modeContents).forEach(key => {
        modeContents[key].classList.toggle('active', key === mode);
    });

    currentMode = mode;
}

// Mode button event listeners
modeButtons.editor.addEventListener('click', () => switchMode('editor'));
modeButtons.play.addEventListener('click', () => switchMode('play'));
modeButtons.random.addEventListener('click', () => switchMode('random'));

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize editor mode (will be implemented in editor.js)
    if (typeof initEditor === 'function') {
        initEditor();
    }

    // Initialize play mode (will be implemented in player.js)
    if (typeof initPlayer === 'function') {
        initPlayer();
    }

    // Initialize random mode (will be implemented in generator.js)
    if (typeof initGenerator === 'function') {
        initGenerator();
    }
});
