class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.initialBoard = [];
        this.selectedCell = null;
        this.difficulty = 'easy';
        this.mistakes = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.completedDogs = [];
        this.moveHistory = [];
        this.redoHistory = [];
        this.showErrors = true;
        this.selectedDog = null;
        this.gameJustStarted = true;
        this.isPaused = false;
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;

        // Dynamic dog loading - will be populated by loadAllDogs()
        this.allBreeds = [];
        this.allBreedImages = [];
        this.allSleepImages = [];

        // Current game's selected 9 dogs (will be set when game starts)
        this.breeds = [];
        this.breedImages = [];
        this.sleepImages = [];

        // Favorite dog lock system
        this.favoriteDog = null; // Index in allBreeds array (null = no favorite selected)

        // Dog loading status
        this.dogsLoaded = false;

        // Audio context for sounds
        this.correctSound = this.createSound(800, 0.1, 'sine');
        this.errorSound = this.createSound(200, 0.2, 'sawtooth');

        // Listen for resize events to update mobile state
        window.addEventListener('resize', () => {
            this.isMobile = window.matchMedia('(max-width: 768px)').matches;
        });

        this.init();
    }

    createSound(frequency, duration, type = 'sine') {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }

    async init() {
        this.loadTheme();

        // Load all available dogs from photos folder
        await this.loadAllDogs();

        this.loadFavoriteDog();
        this.setupEventListeners();

        // Initialize timer display visibility based on checkbox state
        const showTimerCheckbox = document.getElementById('show-timer');
        const timeDisplay = document.querySelector('.time-display');
        if (showTimerCheckbox && !showTimerCheckbox.checked) {
            timeDisplay.classList.add('hidden');
        }

        this.generateNewGame();
    }

    async loadAllDogs() {
        // Get dog names from config file (dogs-config.js)
        // If AVAILABLE_DOGS is not defined, use default list
        const dogNames = typeof AVAILABLE_DOGS !== 'undefined' ? AVAILABLE_DOGS : [
            'Leka', 'Cosmo', 'Maya', 'Rio', 'George', 'Gofret',
            'Ares', 'Tony', 'Hera', 'Aria', 'Cookie', 'Lolo',
            'Roxy', 'Skipper'
        ];

        // Try to load each dog, filter out ones that don't exist
        const loadedDogs = [];

        for (const dogName of dogNames) {
            const regularImage = `photos/${dogName}.png`;
            const sleepImage = `photos/sleep/${dogName}-sleep.png`;

            // Check if images exist by attempting to load them
            try {
                const imgTest = new Image();
                const loadPromise = new Promise((resolve) => {
                    imgTest.onload = () => resolve(true);
                    imgTest.onerror = () => resolve(false);
                });
                imgTest.src = regularImage;
                const exists = await loadPromise;

                if (exists) {
                    loadedDogs.push({
                        name: dogName,
                        image: regularImage,
                        sleepImage: sleepImage
                    });
                } else {
                    console.warn(`⚠️ Dog "${dogName}" listed in config but image not found at ${regularImage}`);
                }
            } catch (e) {
                console.log(`Skipping ${dogName} - image not found`);
            }
        }

        // Populate the arrays
        this.allBreeds = loadedDogs.map(d => d.name);
        this.allBreedImages = loadedDogs.map(d => d.image);
        this.allSleepImages = loadedDogs.map(d => d.sleepImage);

        this.dogsLoaded = true;

        console.log(`✅ Loaded ${this.allBreeds.length} dogs:`, this.allBreeds.join(', '));

        // Update favorite dog dropdown
        this.updateFavoriteDogDropdown();
    }

    updateFavoriteDogDropdown() {
        const favoriteDogSelect = document.getElementById('favorite-dog-select');
        if (!favoriteDogSelect) return;

        // Save current selection
        const currentValue = favoriteDogSelect.value;

        // Clear existing options except "No Favorite"
        favoriteDogSelect.innerHTML = '<option value="none">No Favorite (Random)</option>';

        // Add all loaded dogs
        this.allBreeds.forEach((dogName, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = dogName;
            favoriteDogSelect.appendChild(option);
        });

        // Restore selection if valid
        if (currentValue !== 'none' && parseInt(currentValue) < this.allBreeds.length) {
            favoriteDogSelect.value = currentValue;
        } else {
            favoriteDogSelect.value = 'none';
        }
    }

    loadTheme() {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('sudoku-theme') || 'default';
        this.applyTheme(savedTheme);
    }

    loadFavoriteDog() {
        // Load saved favorite dog from localStorage
        const saved = localStorage.getItem('sudoku-favorite-dog');
        if (saved && saved !== 'none') {
            this.favoriteDog = parseInt(saved);
        } else {
            this.favoriteDog = null;
        }

        // Update UI dropdown
        const favoriteDogSelect = document.getElementById('favorite-dog-select');
        if (favoriteDogSelect) {
            favoriteDogSelect.value = saved || 'none';
        }
    }

    applyTheme(themeName) {
        document.body.setAttribute('data-theme', themeName);
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = themeName;
        }
        localStorage.setItem('sudoku-theme', themeName);
    }

    setupEventListeners() {
        // Hamburger menu
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const sideMenu = document.getElementById('side-menu');
        const closeMenuBtn = document.getElementById('close-menu-btn');
        const menuOverlay = document.getElementById('menu-overlay');

        const openMenu = () => {
            sideMenu?.classList.add('open');
            menuOverlay?.classList.add('show');
        };

        const closeMenu = () => {
            sideMenu?.classList.remove('open');
            menuOverlay?.classList.remove('show');
        };

        hamburgerBtn?.addEventListener('click', openMenu);
        closeMenuBtn?.addEventListener('click', closeMenu);
        menuOverlay?.addEventListener('click', closeMenu);

        // Menu item buttons
        document.querySelector('.new-game-menu-btn')?.addEventListener('click', () => {
            this.generateNewGame();
            closeMenu();
        });

        document.querySelector('.how-to-play-menu-btn')?.addEventListener('click', () => {
            this.showHowToPlay();
            closeMenu();
        });

        document.querySelector('.leaderboard-menu-btn')?.addEventListener('click', () => {
            this.showLeaderboard('easy');
            closeMenu();
        });

        // Theme selector in menu (mobile)
        const themeSelectMenu = document.getElementById('theme-select-menu');
        if (themeSelectMenu) {
            themeSelectMenu.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }

        // Theme selector (desktop)
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }

        // Favorite dog selector
        const favoriteDogSelect = document.getElementById('favorite-dog-select');
        if (favoriteDogSelect) {
            favoriteDogSelect.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'none') {
                    this.favoriteDog = null;
                } else {
                    this.favoriteDog = parseInt(selectedValue);
                }
                // Save to localStorage
                localStorage.setItem('sudoku-favorite-dog', selectedValue);
            });
        }

        // Difficulty dropdown (desktop)
        const difficultySelect = document.getElementById('difficulty-select');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
                this.generateNewGame();
            });
        }

        // Difficulty dropdown (mobile)
        const difficultySelectMobile = document.getElementById('difficulty-select-mobile');
        if (difficultySelectMobile) {
            difficultySelectMobile.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
                this.generateNewGame();
            });
        }

        // Note: New game and How to Play buttons are only in hamburger menu now
        // Event listeners for those are set up in the hamburger menu section above

        // Modal close button and overlay click
        const modal = document.getElementById('how-to-play-modal');
        const closeBtn = modal?.querySelector('.modal-close');

        closeBtn?.addEventListener('click', () => {
            this.closeHowToPlay();
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeHowToPlay();
            }
        });

        // Leaderboard button
        document.querySelector('.leaderboard-btn')?.addEventListener('click', () => {
            this.showLeaderboard('easy');
        });

        // Leaderboard modal close
        const leaderboardModal = document.getElementById('leaderboard-modal');
        const leaderboardCloseBtn = leaderboardModal?.querySelector('.modal-close');

        leaderboardCloseBtn?.addEventListener('click', () => {
            leaderboardModal.classList.remove('show');
        });

        leaderboardModal?.addEventListener('click', (e) => {
            if (e.target === leaderboardModal) {
                leaderboardModal.classList.remove('show');
            }
        });

        // Leaderboard difficulty tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.showLeaderboard(e.target.dataset.difficulty);
            });
        });

        // Win modal close
        const winModal = document.getElementById('win-modal');
        const winCloseBtn = winModal?.querySelector('.modal-close');

        winCloseBtn?.addEventListener('click', () => {
            winModal.classList.remove('show');
        });

        winModal?.addEventListener('click', (e) => {
            if (e.target === winModal) {
                winModal.classList.remove('show');
            }
        });

        // Submit score button
        document.querySelector('.submit-score-btn')?.addEventListener('click', () => {
            const nameInput = document.getElementById('player-name');
            this.submitScore(nameInput.value.trim());
            nameInput.value = '';
        });

        // Skip submit button
        document.querySelector('.skip-submit-btn')?.addEventListener('click', () => {
            winModal.classList.remove('show');
        });

        // Demo buttons
        document.getElementById('demo-correct-btn')?.addEventListener('click', () => {
            this.showCorrectMove();
        });

        document.getElementById('demo-wrong-btn')?.addEventListener('click', () => {
            this.showWrongMove();
        });

        document.getElementById('demo-reset-btn')?.addEventListener('click', () => {
            this.resetDemo();
        });

        // Restart button - attach to all instances (mobile + desktop)
        document.querySelectorAll('.restart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.restartGame();
            });
        });

        // Pause toggle
        document.getElementById('pause-game')?.addEventListener('change', (e) => {
            this.togglePause(e.target.checked);
        });

        // Timer checkbox
        document.getElementById('show-timer').addEventListener('change', (e) => {
            const timeDisplay = document.querySelector('.time-display');
            if (e.target.checked) {
                timeDisplay.classList.remove('hidden');
            } else {
                timeDisplay.classList.add('hidden');
            }
        });

        // Dog item click and drag handlers
        document.querySelectorAll('.dog-item').forEach(item => {
            // Click handler
            item.addEventListener('click', (e) => {
                const dogItem = e.currentTarget;
                if (dogItem.classList.contains('completed')) return;

                // If clicking on already selected dog, deselect it
                if (dogItem.classList.contains('selected')) {
                    dogItem.classList.remove('selected');
                    this.selectedDog = null;
                    return;
                }

                // Remove previous selection and select this dog
                document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
                dogItem.classList.add('selected');

                this.selectedDog = parseInt(dogItem.dataset.num);

                // On mobile: If a cell is already selected, place the dog immediately
                if (this.isMobile && this.selectedCell) {
                    const row = parseInt(this.selectedCell.dataset.row);
                    const col = parseInt(this.selectedCell.dataset.col);
                    this.placeDog(row, col, this.selectedDog);

                    // AUTO-CLEAR: Clear selections after placing
                    this.selectedDog = null;
                    document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
                    document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
                    this.selectedCell = null;
                }
            });

            // Drag start - ONLY on desktop
            if (!this.isMobile) {
                item.addEventListener('dragstart', (e) => {
                    const dogItem = e.currentTarget;
                    if (dogItem.classList.contains('completed')) {
                        e.preventDefault();
                        return;
                    }
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('dogNum', dogItem.dataset.num);

                    // Create custom drag image showing only the dog photo
                    const img = dogItem.querySelector('img');
                    if (img) {
                        const dragImage = img.cloneNode(true);
                        dragImage.style.width = '60px';
                        dragImage.style.height = '60px';
                        dragImage.style.borderRadius = '4px';
                        dragImage.style.position = 'absolute';
                        dragImage.style.top = '-1000px';

                        // Match the cell background color from the theme
                        const cellBg = getComputedStyle(document.documentElement).getPropertyValue('--cell-bg').trim();
                        dragImage.style.background = cellBg;
                        dragImage.style.padding = '2px';

                        document.body.appendChild(dragImage);

                        e.dataTransfer.setDragImage(dragImage, 30, 30);

                        // Remove the temporary image after drag starts
                        setTimeout(() => dragImage.remove(), 0);
                    }
                });
            }
        });

        // Dog panel drop zone - for dragging dogs back to remove them (desktop only)
        if (!this.isMobile) {
            const dogPanel = document.querySelector('.dog-panel');
            dogPanel.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            dogPanel.addEventListener('drop', (e) => {
                e.preventDefault();
                const removeFromBoard = e.dataTransfer.getData('removeFromBoard');
                if (removeFromBoard) {
                    const data = JSON.parse(removeFromBoard);
                    this.removeDog(data.row, data.col);
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                if (this.selectedCell) {
                    this.placeNumber(parseInt(e.key));
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                if (this.selectedCell) {
                    this.placeNumber(0);
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });
    }

    showHowToPlay() {
        const modal = document.getElementById('how-to-play-modal');
        if (modal) {
            modal.classList.add('show');
            this.initDemo();
        }
    }

    closeHowToPlay() {
        const modal = document.getElementById('how-to-play-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    initDemo() {
        // Create a simple 3x3 demo grid
        this.demoBoard = [
            [1, 0, 0],
            [0, 2, 0],
            [0, 0, 3]
        ];

        this.renderDemo();
    }

    renderDemo() {
        const demoGrid = document.getElementById('demo-grid');
        if (!demoGrid) return;

        demoGrid.innerHTML = '';

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = document.createElement('div');
                cell.className = 'demo-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (this.demoBoard[row][col] !== 0) {
                    const img = document.createElement('img');
                    img.src = this.breedImages[this.demoBoard[row][col] - 1];
                    img.alt = this.breeds[this.demoBoard[row][col] - 1];
                    img.className = 'demo-cell-img';
                    cell.appendChild(img);
                }

                demoGrid.appendChild(cell);
            }
        }
    }

    showCorrectMove() {
        // Place Leka (dog #1) in position [0,1] - this is correct
        this.demoBoard[0][1] = 1;
        this.renderDemo();

        // Highlight the cell as correct
        const cells = document.querySelectorAll('.demo-cell');
        const targetCell = cells[1]; // row 0, col 1
        targetCell.classList.add('demo-correct');

        // Update explanation
        const explanation = document.getElementById('demo-explanation');
        if (explanation) {
            explanation.textContent = '✓ Correct! This dog can be placed here because it doesn\'t repeat in the same row, column, or 3×3 box.';
            explanation.className = 'demo-explanation correct';
        }

        // Remove highlight after 2 seconds
        setTimeout(() => {
            targetCell.classList.remove('demo-correct');
        }, 2000);
    }

    showWrongMove() {
        // Try to place Leka (dog #1) in position [1,0] - this is wrong (same column as [0,0])
        const row = 1;
        const col = 0;

        this.demoBoard[row][col] = 1;
        this.renderDemo();

        // Highlight the cell as wrong
        const cells = document.querySelectorAll('.demo-cell');
        const targetCell = cells[row * 3 + col];
        targetCell.classList.add('demo-wrong');

        // Update explanation
        const explanation = document.getElementById('demo-explanation');
        if (explanation) {
            explanation.textContent = '✗ Wrong! This dog already exists in the same column. Each dog can only appear once per row, column, and 3×3 box.';
            explanation.className = 'demo-explanation wrong';
        }

        // Remove the wrong placement after 2 seconds
        setTimeout(() => {
            targetCell.classList.remove('demo-wrong');
            this.demoBoard[row][col] = 0;
            this.renderDemo();
        }, 2000);
    }

    resetDemo() {
        this.demoBoard = [
            [1, 0, 0],
            [0, 2, 0],
            [0, 0, 3]
        ];
        this.renderDemo();

        const explanation = document.getElementById('demo-explanation');
        if (explanation) {
            explanation.textContent = '';
            explanation.className = 'demo-explanation';
        }
    }

    togglePause(isPaused) {
        this.isPaused = isPaused;

        const pauseLabel = document.querySelector('.pause-label');

        if (this.isPaused) {
            // Pause the timer
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }

            // Update label to show "Resume"
            if (pauseLabel) pauseLabel.textContent = 'Resume';

            // Show sleeping dogs
            this.showSleepingDogs();
        } else {
            // Resume the timer
            this.startTimer();

            // Update label to show "Pause"
            if (pauseLabel) pauseLabel.textContent = 'Pause';

            // Restore the board
            this.renderBoard();
        }
    }

    showSleepingDogs() {
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell sleep-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if ((Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 0) {
                    cell.classList.add('alt-block');
                }

                // Use sleeping dog image based on row (one dog per row)
                const img = document.createElement('img');
                img.src = this.sleepImages[row];
                img.alt = 'Sleeping dog';
                img.className = 'cell-img';
                cell.appendChild(img);

                boardElement.appendChild(cell);
            }
        }
    }

    generateSolvedBoard() {
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillBoard(this.solution);
        return this.solution;
    }

    fillBoard(board) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const shuffled = this.shuffle([...numbers]);

                    for (let num of shuffled) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;

                            if (this.fillBoard(board)) {
                                return true;
                            }

                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(board, row, col, num) {
        // Check row - skip the target cell
        for (let x = 0; x < 9; x++) {
            if (x !== col && board[row][x] === num) {
                return false;
            }
        }

        // Check column - skip the target cell
        for (let x = 0; x < 9; x++) {
            if (x !== row && board[x][col] === num) {
                return false;
            }
        }

        // Check 3x3 box - skip the target cell
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = startRow + i;
                const currentCol = startCol + j;
                if ((currentRow !== row || currentCol !== col) && board[currentRow][currentCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    generatePuzzle() {
        this.generateSolvedBoard();
        this.board = this.solution.map(row => [...row]);

        const cellsToRemove = {
            'easy': 35,
            'medium': 45,
            'hard': 55
        };

        const toRemove = cellsToRemove[this.difficulty];
        const cells = [];

        // Create list of all cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                cells.push({row, col});
            }
        }

        this.shuffle(cells);

        let removed = 0;
        let attempts = 0;
        const maxAttempts = 200;

        for (let cell of cells) {
            if (removed >= toRemove || attempts >= maxAttempts) break;
            attempts++;

            const {row, col} = cell;
            const backup = this.board[row][col];
            this.board[row][col] = 0;

            // Check if puzzle still has unique solution
            const boardCopy = this.board.map(r => [...r]);
            const solutionCount = this.countSolutions(boardCopy, 2);

            if (solutionCount === 1) {
                removed++;
            } else {
                this.board[row][col] = backup;
            }
        }

        // If we couldn't remove enough cells, try again
        if (removed < toRemove * 0.8) {
            this.generatePuzzle();
            return;
        }

        // Validate: Check if any dog number is fully completed (all 9 placed)
        if (this.hasCompleteDogType()) {
            this.generatePuzzle();
            return;
        }

        // Validate: Check if any 3x3 section is fully filled
        if (this.hasFullyFilled3x3Section()) {
            this.generatePuzzle();
            return;
        }
    }

    hasCompleteDogType() {
        // Count how many of each dog number (1-9) are placed
        for (let num = 1; num <= 9; num++) {
            let count = 0;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.board[row][col] === num) {
                        count++;
                    }
                }
            }
            // If all 9 instances of a dog are placed, reject this puzzle
            if (count === 9) {
                return true;
            }
        }
        return false;
    }

    hasFullyFilled3x3Section() {
        // Check each of the 9 3x3 sections
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const startRow = boxRow * 3;
                const startCol = boxCol * 3;
                let filledCount = 0;

                // Count filled cells in this 3x3 section
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (this.board[startRow + i][startCol + j] !== 0) {
                            filledCount++;
                        }
                    }
                }

                // If all 9 cells in this section are filled, reject this puzzle
                if (filledCount === 9) {
                    return true;
                }
            }
        }
        return false;
    }

    countSolutions(board, limit = 2) {
        let count = 0;

        const findEmpty = () => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        return {row, col};
                    }
                }
            }
            return null;
        };

        const solve = () => {
            if (count >= limit) return;

            const empty = findEmpty();
            if (!empty) {
                count++;
                return;
            }

            const {row, col} = empty;

            for (let num = 1; num <= 9; num++) {
                if (this.isValid(board, row, col, num)) {
                    board[row][col] = num;
                    solve();
                    board[row][col] = 0;

                    if (count >= limit) return;
                }
            }
        };

        solve();
        return count;
    }

    selectDogsForGame() {
        // Select 9 dogs for this game
        const selectedIndices = [];

        // If a favorite dog is selected, include it first
        if (this.favoriteDog !== null) {
            selectedIndices.push(this.favoriteDog);
        }

        // Randomly select remaining dogs to reach 9 total
        const availableIndices = [];
        for (let i = 0; i < this.allBreeds.length; i++) {
            if (this.favoriteDog === null || i !== this.favoriteDog) {
                availableIndices.push(i);
            }
        }

        // Shuffle available indices
        for (let i = availableIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }

        // Take the first 8 (or 9 if no favorite) from shuffled array
        const needed = 9 - selectedIndices.length;
        selectedIndices.push(...availableIndices.slice(0, needed));

        // Map to breeds, images, and sleep images
        this.breeds = selectedIndices.map(i => this.allBreeds[i]);
        this.breedImages = selectedIndices.map(i => this.allBreedImages[i]);
        this.sleepImages = selectedIndices.map(i => this.allSleepImages[i]);
    }

    renderDogPanel() {
        const dogItems = document.querySelectorAll('.dog-item');

        for (let i = 0; i < 9; i++) {
            const dogItem = dogItems[i];
            if (!dogItem) continue;

            // Update data-num attribute (1-indexed for game logic)
            dogItem.dataset.num = i + 1;

            // Update dog name
            const nameSpan = dogItem.querySelector('.dog-name');
            if (nameSpan) {
                nameSpan.textContent = this.breeds[i];
            }

            // Update dog image
            const img = dogItem.querySelector('img');
            if (img) {
                img.src = this.breedImages[i];
                img.alt = this.breeds[i];
            }
        }
    }

    generateNewGame() {
        this.mistakes = 0;
        this.timer = 0;
        this.selectedCell = null;
        this.selectedDog = null;
        this.completedDogs = [];
        this.moveHistory = [];
        this.gameJustStarted = true;
        this.isPaused = false;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Reset pause toggle
        const pauseToggle = document.getElementById('pause-game');
        const pauseLabel = document.querySelector('.pause-label');
        if (pauseToggle) pauseToggle.checked = false;
        if (pauseLabel) pauseLabel.textContent = 'Pause';

        // Re-enable undo and redo buttons - all instances
        document.querySelectorAll('.undo-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
        document.querySelectorAll('.redo-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });

        // Select 9 dogs for this game (including favorite if set)
        this.selectDogsForGame();
        this.renderDogPanel();

        this.generatePuzzle();
        this.initialBoard = this.board.map(row => [...row]);
        this.renderBoard();
        this.updateMistakes();
        this.startTimer();
        this.showMessage('');
        this.updateCompletedDogs();
    }

    restartGame() {
        // Ensure dog panel shows the correct dogs for this game
        this.renderDogPanel();

        this.mistakes = 0;
        this.timer = 0;
        this.selectedCell = null;
        this.selectedDog = null;
        this.completedDogs = [];
        this.moveHistory = [];
        this.gameJustStarted = true;
        this.isPaused = false;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Reset pause toggle
        const pauseToggle = document.getElementById('pause-game');
        const pauseLabel = document.querySelector('.pause-label');
        if (pauseToggle) pauseToggle.checked = false;
        if (pauseLabel) pauseLabel.textContent = 'Pause';

        this.board = this.initialBoard.map(row => [...row]);
        this.renderBoard();
        this.updateMistakes();
        this.startTimer();
        this.showMessage('');
        this.updateCompletedDogs();
    }

    undo() {
        if (this.moveHistory.length === 0) return;

        // Pop the move from history
        const lastMove = this.moveHistory.pop();

        // Save to redo history before undoing
        this.redoHistory.push({
            row: lastMove.row,
            col: lastMove.col,
            previousValue: this.board[lastMove.row][lastMove.col],
            newValue: lastMove.previousValue
        });

        // Undo the move (restore previous value)
        this.board[lastMove.row][lastMove.col] = lastMove.previousValue;

        this.renderBoard();
        this.updateCompletedDogs(false); // Don't show achievements when undoing

        // Note: Mistake counter remains unchanged - mistakes are permanent
    }

    redo() {
        if (this.redoHistory.length === 0) return;

        const redoMove = this.redoHistory.pop();

        // Add back to move history
        this.moveHistory.push({
            row: redoMove.row,
            col: redoMove.col,
            previousValue: redoMove.newValue  // The value before redo (after undo)
        });

        // Apply the redo move - restore the value before undo
        this.board[redoMove.row][redoMove.col] = redoMove.previousValue;

        this.renderBoard();
        this.updateCompletedDogs(false); // Don't show achievements when redoing
    }

    renderBoard() {
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if ((Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 0) {
                    cell.classList.add('alt-block');
                }

                const isGiven = this.initialBoard[row][col] !== 0;

                if (this.board[row][col] !== 0) {
                    const img = document.createElement('img');
                    img.src = this.breedImages[this.board[row][col] - 1];
                    img.alt = this.breeds[this.board[row][col] - 1];
                    img.className = 'cell-img';
                    cell.appendChild(img);

                    if (isGiven) {
                        cell.classList.add('given');
                    } else {
                        // Check if the placement matches the solution
                        const isCorrectAnswer = this.solution[row][col] === this.board[row][col];
                        if (!isCorrectAnswer) {
                            cell.classList.add('error');
                        } else {
                            // Mark as correctly placed (locked)
                            cell.classList.add('locked');
                        }
                    }
                } else {
                    cell.innerHTML = '';
                }

                if (!isGiven) {
                    // Check if this cell has the correct answer
                    const cellRow = parseInt(row);
                    const cellCol = parseInt(col);
                    const isCorrectlyPlaced = this.board[cellRow][cellCol] !== 0 &&
                                             this.solution[cellRow][cellCol] === this.board[cellRow][cellCol];

                    // Only allow interactions if the dog is not correctly placed
                    if (!isCorrectlyPlaced) {
                        cell.addEventListener('click', () => {
                            if (this.isMobile) {
                                // Mobile: Click to select or remove
                                this.handleMobileCellClick(cell);
                            } else {
                                // Desktop: Select for drag-and-drop
                                this.selectCell(cell);
                            }
                        });

                        // Desktop only: Double-click to remove
                        if (!this.isMobile) {
                            cell.addEventListener('dblclick', () => {
                                const row = parseInt(cell.dataset.row);
                                const col = parseInt(cell.dataset.col);
                                if (this.board[row][col] !== 0) {
                                    this.removeDog(row, col);
                                }
                            });
                        }
                    }

                    // Drag and drop handlers for placing dogs - DESKTOP ONLY
                    if (!this.isMobile && !isCorrectlyPlaced) {
                        cell.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            cell.classList.add('drag-over');
                        });

                        cell.addEventListener('dragleave', () => {
                            cell.classList.remove('drag-over');
                        });

                        cell.addEventListener('drop', (e) => {
                            e.preventDefault();
                            cell.classList.remove('drag-over');

                            // Check if dragging from dog panel
                            const dogNum = e.dataTransfer.getData('dogNum');
                            if (dogNum && dogNum !== '') {
                                const row = parseInt(cell.dataset.row);
                                const col = parseInt(cell.dataset.col);
                                this.placeDog(row, col, parseInt(dogNum));
                                return;
                            }

                            // Check if dragging from another cell
                            const fromCellData = e.dataTransfer.getData('fromCell');
                            if (fromCellData) {
                                const fromCell = JSON.parse(fromCellData);
                                const fromRow = fromCell.row;
                                const fromCol = fromCell.col;
                                const dogNumber = this.board[fromRow][fromCol];

                                if (dogNumber !== 0) {
                                    const targetRow = parseInt(cell.dataset.row);
                                    const targetCol = parseInt(cell.dataset.col);

                                    // Remove from source cell
                                    this.board[fromRow][fromCol] = 0;

                                    // Place in target cell
                                    this.placeDog(targetRow, targetCol, dogNumber);
                                }
                            }
                        });
                    }

                    // Make placed dogs draggable to other cells or back to panel - DESKTOP ONLY
                    if (!this.isMobile && this.board[row][col] !== 0) {
                        const isCorrectAnswer = this.solution[row][col] === this.board[row][col];

                        // Only make draggable if it's NOT the correct answer
                        if (!isCorrectAnswer) {
                            cell.setAttribute('draggable', 'true');

                            cell.addEventListener('dragstart', (e) => {
                                const cellRow = parseInt(e.currentTarget.dataset.row);
                                const cellCol = parseInt(e.currentTarget.dataset.col);

                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('fromCell', JSON.stringify({ row: cellRow, col: cellCol }));

                                // Also set removeFromBoard data for dragging back to panel
                                e.dataTransfer.setData('removeFromBoard', JSON.stringify({ row: cellRow, col: cellCol }));

                                // Create custom drag image
                                const img = e.currentTarget.querySelector('img');
                                if (img) {
                                    const dragImage = img.cloneNode(true);
                                    dragImage.style.width = '60px';
                                    dragImage.style.height = '60px';
                                    dragImage.style.borderRadius = '4px';
                                    dragImage.style.position = 'absolute';
                                    dragImage.style.top = '-1000px';

                                    const cellBg = getComputedStyle(document.documentElement).getPropertyValue('--cell-bg').trim();
                                    dragImage.style.background = cellBg;
                                    dragImage.style.padding = '2px';

                                    document.body.appendChild(dragImage);
                                    e.dataTransfer.setDragImage(dragImage, 30, 30);

                                    setTimeout(() => dragImage.remove(), 0);
                                }
                            });
                        } else {
                            // If it's correct, make it non-draggable and add a visual indicator
                            cell.setAttribute('draggable', 'false');
                            cell.style.cursor = 'default';
                        }
                    }
                }

                boardElement.appendChild(cell);
            }
        }
    }

    selectCell(cell) {
        // Don't allow selection of given cells
        if (cell.classList.contains('given')) {
            return;
        }

        // Get cell position and current value
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const currentValue = this.board[row][col];

        // If cell has an error dog, remove it immediately (matching mobile behavior)
        if (currentValue !== 0 && this.solution[row][col] !== currentValue) {
            this.removeDog(row, col);
            return;
        }

        // Don't allow selection of correctly placed cells
        const isCorrectlyPlaced = currentValue !== 0 &&
                                 this.solution[row][col] === currentValue;

        if (isCorrectlyPlaced) {
            return;
        }

        // If a dog is selected, place it and clear selection immediately
        if (this.selectedDog !== null) {
            this.placeDog(row, col, this.selectedDog);
            // placeDog already clears selections, don't select the cell
            return;
        }

        // Only select cell if no dog is currently selected
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        this.selectedCell = cell;
    }

    handleMobileCellClick(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const currentValue = this.board[row][col];

        // If cell has an error dog, remove it IMMEDIATELY (user preference)
        if (currentValue !== 0 && this.solution[row][col] !== currentValue) {
            this.removeDog(row, col);
            return;
        }

        // If cell is empty, select it
        if (currentValue === 0) {
            this.selectCell(cell);
            return;
        }

        // If cell has correct dog, do nothing (protected)
    }

    placeDog(row, col, num) {
        const previousValue = this.board[row][col];

        // Mark that the game is no longer in its initial state
        this.gameJustStarted = false;

        // Clear redo history when a new move is made
        this.redoHistory = [];

        // Add to history
        this.moveHistory.push({row, col, previousValue});

        if (num === 0) {
            this.board[row][col] = 0;
        } else {
            this.board[row][col] = num;

            // Check if the placement matches the solution (correct answer)
            const isCorrectAnswer = this.solution[row][col] === num;

            if (!isCorrectAnswer) {
                // Check if previous value was also incorrect
                const previousWasIncorrect = previousValue !== 0 &&
                                            this.solution[row][col] !== previousValue;

                // Only increment mistakes if:
                // 1. Cell was empty (new mistake), OR
                // 2. Cell had correct value (replacing correct with incorrect)
                if (previousValue === 0 || !previousWasIncorrect) {
                    this.mistakes++;
                    this.updateMistakes();
                }

                this.errorSound();

                // Show error animation immediately
                this.renderBoard();
                this.showErrorShake(row, col);
                this.updateCompletedDogs();

                // Clear dog and cell selections after placing (even on error)
                this.selectedDog = null;
                document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
                document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
                this.selectedCell = null;

                return; // Exit early to avoid re-rendering
            } else {
                // Correct answer
                this.correctSound();
                this.showStars(row, col);
            }
        }

        this.renderBoard();
        this.updateCompletedDogs();

        // Clear dog and cell selections after placing
        this.selectedDog = null;
        document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
        this.selectedCell = null;

        if (this.isBoardComplete() && this.isBoardFullyValid()) {
            this.endGame(true);
        }
    }

    removeDog(row, col) {
        // Only remove if cell is not a given (initial) cell
        if (this.initialBoard[row][col] === 0 && this.board[row][col] !== 0) {
            const previousValue = this.board[row][col];

            // Add to history
            this.moveHistory.push({row, col, previousValue});

            // Clear the cell
            this.board[row][col] = 0;

            this.renderBoard();
            this.updateCompletedDogs();

            // Clear dog and cell selections after removing
            this.selectedDog = null;
            document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
            document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
            this.selectedCell = null;
        }
    }

    showStars(row, col) {
        const cells = document.querySelectorAll('.cell');
        const cellIndex = row * 9 + col;
        const cell = cells[cellIndex];

        if (!cell) return;

        // Create 5 stars
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.textContent = '⭐';

            // Random direction
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = 20 + Math.random() * 20;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            star.style.setProperty('--tx', `${tx}px`);
            star.style.setProperty('--ty', `${ty}px`);
            star.style.left = '50%';
            star.style.top = '50%';
            star.style.transform = 'translate(-50%, -50%)';

            cell.appendChild(star);

            // Remove after animation
            setTimeout(() => star.remove(), 1000);
        }

        // Add correct pulse animation to cell
        cell.classList.add('correct');
        setTimeout(() => cell.classList.remove('correct'), 500);
    }

    showErrorShake(row, col) {
        const cells = document.querySelectorAll('.cell');
        const cellIndex = row * 9 + col;
        const cell = cells[cellIndex];

        if (!cell) return;

        // Add error class for red background and shake animation
        cell.classList.add('error');

        // Add a temporary shake class for animation only
        cell.classList.add('error-shake');

        // Remove only the shake animation after it completes, keep the red background
        setTimeout(() => {
            cell.classList.remove('error-shake');
        }, 300);
    }

    placeNumber(num) {
        if (!this.selectedCell || this.selectedCell.classList.contains('given')) {
            return;
        }

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        this.placeDog(row, col, num);
    }

    updateCompletedDogs(showAchievements = true) {
        const completed = [];
        const previouslyCompleted = this.completedDogs || [];

        for (let num = 1; num <= 9; num++) {
            let count = 0;
            let allValid = true;

            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.board[row][col] === num) {
                        count++;
                        // Check if this placement is valid
                        const tempValue = this.board[row][col];
                        this.board[row][col] = 0;
                        if (!this.isValid(this.board, row, col, tempValue)) {
                            allValid = false;
                        }
                        this.board[row][col] = tempValue;
                    }
                }
            }

            // Only mark as completed if all 9 are placed AND all are valid
            if (count === 9 && allValid) {
                completed.push(num);
            }
        }

        document.querySelectorAll('.dog-item').forEach(item => {
            const dogNum = parseInt(item.dataset.num);
            if (completed.includes(dogNum)) {
                item.classList.add('completed');
            } else {
                item.classList.remove('completed');
            }
        });

        // Only show achievement if the game has started (user has made at least one move) and showAchievements is true
        if (!this.gameJustStarted && showAchievements) {
            const newlyCompleted = completed.filter(num => !previouslyCompleted.includes(num));
            if (newlyCompleted.length > 0) {
                newlyCompleted.forEach(num => {
                    const dogName = this.breeds[num - 1];
                    // Use plural form
                    const pluralName = dogName.endsWith('s') ? `${dogName}es` : `${dogName}s`;
                    this.showAchievement(`All ${pluralName} are placed!`);
                });
            }
        }

        this.completedDogs = completed;
    }

    showAchievement(message) {
        const overlay = document.getElementById('achievement-overlay');
        const text = overlay.querySelector('.achievement-text');
        const iconElement = overlay.querySelector('.achievement-icon');

        text.textContent = message;

        // Extract dog name from message
        const dogName = message.match(/All (.+?)s? are/)?.[1] || message.match(/All (.+?) placed/)?.[1];
        const dogIndex = this.breeds.findIndex(breed => dogName?.includes(breed));
        const dogImage = dogIndex >= 0 ? this.breedImages[dogIndex] : this.breedImages[0];

        // Replace the emoji with the dog's image
        iconElement.innerHTML = `<img src="${dogImage}" alt="${this.breeds[dogIndex]}" style="width: 150px; height: 150px; object-fit: contain; border-radius: 10px;">`;

        overlay.classList.add('show');

        setTimeout(() => {
            overlay.classList.remove('show');
            // Reset icon to emoji after hiding
            iconElement.innerHTML = '🎉';
        }, 3000);
    }

    isBoardComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    isBoardFullyValid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = this.board[row][col];
                if (num === 0) continue;

                this.board[row][col] = 0;
                if (!this.isValid(this.board, row, col, num)) {
                    this.board[row][col] = num;
                    return false;
                }
                this.board[row][col] = num;
            }
        }
        return true;
    }

    updateMistakes() {
        // Update both desktop and mobile mistake counters
        document.querySelectorAll('.mistakes-count').forEach(el => {
            el.textContent = this.mistakes;
        });
    }

    startTimer() {
        document.querySelector('.time-display').textContent = '00:00';

        this.timerInterval = setInterval(() => {
            this.timer++;
            const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
            const seconds = (this.timer % 60).toString().padStart(2, '0');
            document.querySelector('.time-display').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    endGame(won) {
        clearInterval(this.timerInterval);

        if (won) {
            // Disable undo and redo buttons - all instances
            document.querySelectorAll('.undo-btn').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
            document.querySelectorAll('.redo-btn').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });

            // Determine performance rating based on mistakes
            let performance;
            let performanceIcon;

            if (this.mistakes === 0) {
                performance = 'Perfect';
                performanceIcon = '🐶';
            } else if (this.mistakes <= 2) {
                performance = 'Good';
                performanceIcon = '🐾';
            } else {
                performance = 'Needs Practice';
                performanceIcon = '😴';
            }

            // Check if timer is enabled (checkbox is checked)
            const showTimerCheckbox = document.getElementById('show-timer');
            const timerVisible = showTimerCheckbox && showTimerCheckbox.checked;

            let message = `${performanceIcon} ${performance}! `;

            if (timerVisible) {
                const minutes = Math.floor(this.timer / 60);
                const seconds = this.timer % 60;
                message += `You solved it in ${minutes}m ${seconds}s`;
            } else {
                message += 'You solved it';
            }

            message += ` with ${this.mistakes} mistake${this.mistakes !== 1 ? 's' : ''}.`;

            this.showMessage(message, 'success');
            this.showFinalCelebration();

            // Show win modal with stats
            this.showWinModal();
        }
    }

    showFinalCelebration() {
        // Start bouncing dogs animation (like Solitaire)
        this.createBouncingDogs();

        // Play initial victory bark
        this.playVictoryBark();

        // Show overlay after a short delay
        setTimeout(() => {
            const overlay = document.getElementById('achievement-overlay');
            const text = overlay.querySelector('.achievement-text');
            const confettiContainer = overlay.querySelector('.confetti-container');

            text.textContent = '🎉 You Won! 🎉';
            overlay.classList.add('show');

            // More frequent confetti and fireworks with sounds
            this.celebrationInterval = setInterval(() => {
                // More confetti
                for (let i = 0; i < 2; i++) {
                    this.createDogConfetti(confettiContainer);
                }
                this.createFirework(confettiContainer);
                this.playFireworkSound();
            }, 400);

            // Happy barking sounds periodically
            this.barkInterval = setInterval(() => {
                this.playHappyBark();
            }, 1500);

            // Click anywhere to stop
            const stopCelebration = (e) => {
                e.stopPropagation();
                clearInterval(this.celebrationInterval);
                clearInterval(this.barkInterval);
                if (this.bouncingInterval) {
                    clearInterval(this.bouncingInterval);
                }
                overlay.classList.remove('show');
                confettiContainer.innerHTML = '';
                // Remove bouncing dogs
                document.querySelectorAll('.bouncing-dog').forEach(dog => dog.remove());
                overlay.removeEventListener('click', stopCelebration);
                document.removeEventListener('click', stopCelebration);
            };

            // Listen on both overlay and document
            overlay.addEventListener('click', stopCelebration);
            setTimeout(() => {
                document.addEventListener('click', stopCelebration, { once: true });
            }, 100);
        }, 500);
    }

    createBouncingDogs() {
        const container = document.body;
        const dogImages = [...this.breedImages];

        // Create bouncing dogs continuously
        this.bouncingInterval = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const dog = document.createElement('div');
                    dog.className = 'bouncing-dog';

                    const img = document.createElement('img');
                    img.src = dogImages[Math.floor(Math.random() * dogImages.length)];
                    img.style.width = '60px';
                    img.style.height = '60px';
                    img.style.borderRadius = '50%';

                    dog.appendChild(img);

                    // Random starting position at top
                    const startX = Math.random() * (window.innerWidth - 60);
                    dog.style.left = startX + 'px';

                    // Random horizontal velocity
                    const velocityX = (Math.random() - 0.5) * 4;
                    dog.style.setProperty('--vx', velocityX);

                    // Random rotation
                    const rotation = Math.random() * 360;
                    dog.style.setProperty('--rotation', rotation + 'deg');

                    container.appendChild(dog);

                    // Remove after animation
                    setTimeout(() => dog.remove(), 4000);
                }, i * 200);
            }
        }, 600);
    }

    playFireworkSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create sparkly firework sound with multiple tones
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.type = 'sine';
                    const startFreq = 1200 + Math.random() * 400;
                    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);

                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.4);
                }, i * 50);
            }
        } catch (e) {
            // Silently fail if audio context not available
        }
    }

    playHappyBark() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a happy bark sound (two quick barks)
            for (let bark = 0; bark < 2; bark++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    // Bark sound characteristics
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);

                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.15);
                }, bark * 150);
            }
        } catch (e) {
            // Silently fail if audio context not available
        }
    }

    playVictoryBark() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Excited victory barks (3 quick barks)
            for (let bark = 0; bark < 3; bark++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.type = 'sawtooth';
                    const startFreq = 180 + bark * 20;
                    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(90, audioContext.currentTime + 0.12);

                    gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.15);
                }, bark * 120);
            }
        } catch (e) {
            // Silently fail if audio context not available
        }
    }

    createDogConfetti(container) {
        // Create 5-8 dog confetti pieces for more celebration!
        const count = 5 + Math.floor(Math.random() * 4);

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            // Random dog image
            const randomDog = Math.floor(Math.random() * this.breedImages.length);
            confetti.style.backgroundImage = `url('${this.breedImages[randomDog]}')`;

            // Random horizontal position
            confetti.style.left = Math.random() * 100 + '%';

            // Random size - bigger for more impact
            const size = 35 + Math.random() * 50;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';

            // Random animation duration
            const duration = 3 + Math.random() * 2;
            confetti.style.animationDuration = duration + 's';

            // Random delay
            confetti.style.animationDelay = Math.random() * 0.3 + 's';

            container.appendChild(confetti);

            // Remove after animation
            setTimeout(() => confetti.remove(), (duration + 0.5) * 1000);
        }
    }

    createFirework(container) {
        const firework = document.createElement('div');
        firework.className = 'firework';

        // Random position
        firework.style.left = (20 + Math.random() * 60) + '%';
        firework.style.top = (20 + Math.random() * 60) + '%';

        // Create particles
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';

            const angle = (360 / particleCount) * i;
            particle.style.setProperty('--angle', angle + 'deg');

            // Random colors
            const colors = ['#9f7aea', '#764ba2', '#f56565', '#48bb78', '#4299e1', '#ed8936'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            firework.appendChild(particle);
        }

        container.appendChild(firework);

        // Remove after animation
        setTimeout(() => firework.remove(), 1500);
    }

    showMessage(text, type = '') {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = 'message';

        if (type) {
            messageEl.classList.add(type);
        }

        if (text) {
            messageEl.classList.add('show');
        } else {
            messageEl.classList.remove('show');
        }
    }

    showWinModal() {
        const modal = document.getElementById('win-modal');
        const statsText = modal.querySelector('.win-stats');

        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timeStr = `${minutes}m ${seconds}s`;

        statsText.textContent = `You completed the ${this.difficulty} puzzle in ${timeStr} with ${this.mistakes} mistake${this.mistakes !== 1 ? 's' : ''}!`;

        modal.classList.add('show');
    }

    async submitScore(playerName) {
        const score = {
            name: playerName || 'Anonymous',
            difficulty: this.difficulty,
            time: this.timer,
            mistakes: this.mistakes,
            timestamp: Date.now()
        };

        // Show loading message
        this.showMessage('Submitting score...', 'info');

        try {
            // Submit to global leaderboard (Google Sheets backend)
            const response = await fetch('https://script.google.com/macros/s/AKfycbykqOIZW3C_2WS0ehEbiQpkCkdpEFsQe8PqQbIiFvAzOv9vS57BNfJW69jLWU_fORm7/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(score)
            });

            // Also save to localStorage as backup
            const localLeaderboard = this.getLocalLeaderboard();
            localLeaderboard.push(score);
            localStorage.setItem('sudoku-leaderboard', JSON.stringify(localLeaderboard));

            // Close win modal
            document.getElementById('win-modal').classList.remove('show');

            // Show success message
            this.showMessage('Score submitted successfully!', 'success');

            // Refresh leaderboard to show new score
            setTimeout(() => this.showLeaderboard(this.difficulty), 500);
        } catch (error) {
            console.error('Error submitting score:', error);

            // Fallback to localStorage only
            const localLeaderboard = this.getLocalLeaderboard();
            localLeaderboard.push(score);
            localStorage.setItem('sudoku-leaderboard', JSON.stringify(localLeaderboard));

            document.getElementById('win-modal').classList.remove('show');
            this.showMessage('Score saved locally!', 'success');
        }
    }

    getLocalLeaderboard() {
        const stored = localStorage.getItem('sudoku-leaderboard');
        return stored ? JSON.parse(stored) : [];
    }

    async getLeaderboard() {
        try {
            // Fetch from global leaderboard
            const response = await fetch('https://script.google.com/macros/s/AKfycbykqOIZW3C_2WS0ehEbiQpkCkdpEFsQe8PqQbIiFvAzOv9vS57BNfJW69jLWU_fORm7/exec?action=getScores');

            if (response.ok) {
                const data = await response.json();
                return data.scores || [];
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }

        // Fallback to localStorage
        return this.getLocalLeaderboard();
    }

    // Calculate score: Lower is better
    // Formula: time (seconds) + (mistakes * 30 seconds penalty per mistake)
    // This means each mistake costs you 30 seconds on your total score
    calculateScore(time, mistakes) {
        return time + (mistakes * 30);
    }

    async showLeaderboard(difficulty = 'easy') {
        const modal = document.getElementById('leaderboard-modal');
        const listElement = document.getElementById('leaderboard-list');

        // Show loading state
        listElement.innerHTML = '<p class="no-scores">Loading scores...</p>';
        modal.classList.add('show');

        const allScores = await this.getLeaderboard();
        const filteredScores = allScores.filter(score => score.difficulty === difficulty);

        // Calculate total score for each entry
        filteredScores.forEach(score => {
            score.totalScore = this.calculateScore(score.time, score.mistakes);
        });

        // Sort by total score (lower is better)
        filteredScores.sort((a, b) => a.totalScore - b.totalScore);

        // Take top 10
        const topScores = filteredScores.slice(0, 10);

        if (topScores.length === 0) {
            listElement.innerHTML = '<p class="no-scores">No scores yet. Be the first!</p>';
        } else {
            listElement.innerHTML = topScores.map((score, index) => {
                const minutes = Math.floor(score.time / 60);
                const seconds = score.time % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                // Calculate total score for display
                const totalMinutes = Math.floor(score.totalScore / 60);
                const totalSeconds = Math.floor(score.totalScore % 60);
                const totalScoreStr = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;

                const rank = index + 1;

                return `
                    <div class="leaderboard-item ${rank <= 3 ? 'top-' + rank : ''}">
                        <span class="rank">${rank}</span>
                        <span class="player-name">${score.name}</span>
                        <span class="score-time">${timeStr}</span>
                        <span class="score-mistakes">${score.mistakes} ❌</span>
                        <span class="total-score">${totalScoreStr}</span>
                    </div>
                `;
            }).join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
