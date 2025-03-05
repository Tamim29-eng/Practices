class DiceGame {
    constructor() {
        // Game State
        this.gameStarted = false;
        this.currentPlayer = 1;
        this.players = [
            {
                currentScore: 0,
                savedScore: 0,
                nameElement: document.getElementById('player1-name'),
                currentScoreElement: document.getElementById('player1-current-score'),
                savedScoreElement: document.getElementById('player1-saved-score'),
                sectionElement: document.querySelector('.player-1')
            },
            {
                currentScore: 0,
                savedScore: 0,
                nameElement: document.getElementById('player2-name'),
                currentScoreElement: document.getElementById('player2-current-score'),
                savedScoreElement: document.getElementById('player2-saved-score'),
                sectionElement: document.querySelector('.player-2')
            }
        ];
        
        // UI Elements
        this.dice = document.getElementById('dice');
        this.diceFaces = this.dice.querySelectorAll('.dice-face');
        this.rollDiceBtn = document.getElementById('roll-dice-btn');
        this.saveScoreBtn = document.getElementById('save-score-btn');
        this.resetGameBtn = document.getElementById('reset-game-btn');
        this.winnerAnnouncement = document.getElementById('winner-announcement');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Name Edit Prevention
        this.players.forEach((player, index) => {
            player.nameElement.addEventListener('click', () => {
                this.handleNameEdit(index);
            });
        });

        // Game Control Buttons
        this.rollDiceBtn.addEventListener('click', () => this.rollDice());
        this.saveScoreBtn.addEventListener('click', () => this.saveScore());
        this.resetGameBtn.addEventListener('click', () => this.resetGame());
    }

    handleNameEdit(playerIndex) {
        if (this.gameStarted) {
            alert('Player names cannot be changed after the game starts!');
            return;
        }

        const newName = prompt('Enter player name:', this.players[playerIndex].nameElement.textContent);
        if (newName && newName.trim() !== '') {
            this.players[playerIndex].nameElement.textContent = newName.trim();
        }
    }

    updateDiceFaces(diceRoll) {
        // Define all possible dice face arrangements
        const diceFaceArrangements = [
            ['1', '6', '3', '4', '5', '2'],
            ['2', '5', '4', '3', '1', '6'],
            ['3', '4', '1', '6', '2', '5'],
            ['4', '3', '6', '1', '5', '2'],
            ['5', '2', '1', '5', '6', '3'],
            ['6', '1', '5', '2', '3', '4']
        ];

        // Select a random dice face arrangement
        const selectedArrangement = diceFaceArrangements[Math.floor(Math.random() * diceFaceArrangements.length)];

        // Update dice faces
        const faceClasses = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faceClasses.forEach((faceClass, index) => {
            const face = this.dice.querySelector(`.dice-face.${faceClass}`);
            face.textContent = selectedArrangement[index];
        });
    }

    rollDice() {
        if (!this.gameStarted) this.gameStarted = true;

        // Trigger Dice Roll Animation
        this.dice.classList.add('roll');
        
        // Remove animation class after completion
        setTimeout(() => {
            this.dice.classList.remove('roll');
        }, 1500);

        const diceRoll = Math.floor(Math.random() * 6) + 1;
        
        // Update dice faces dynamically
        this.updateDiceFaces(diceRoll);

        const currentPlayer = this.players[this.currentPlayer - 1];

        if (diceRoll === 1) {
            // Reset current score and switch player
            currentPlayer.currentScore = 0;
            currentPlayer.currentScoreElement.textContent = 0;
            this.switchPlayer();
        } else {
            // Add dice roll to current score
            currentPlayer.currentScore += diceRoll;
            currentPlayer.currentScoreElement.textContent = currentPlayer.currentScore;
        }
    }

    // ... (rest of the code remains the same as in the previous implementation)
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new DiceGame();
});