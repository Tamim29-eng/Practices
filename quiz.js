// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const loadingScreen = document.getElementById('loading-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const optionBtns = document.querySelectorAll('.option-btn');
const feedbackContainer = document.getElementById('feedback');
const feedbackText = document.getElementById('feedback-text');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const maxScoreDisplay = document.getElementById('max-score');
const timerDisplay = document.getElementById('timer');
const currentQuestionDisplay = document.getElementById('current-question');
const totalQuestionsDisplay = document.getElementById('total-questions');
const difficultySelect = document.getElementById('difficulty');
const quizInfoList = document.getElementById('quiz-info');

// Game variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft;
const questionsPerDifficulty = 10; // 10 questions per difficulty level

// Event Listeners
startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', showNextQuestion);
restartBtn.addEventListener('click', resetGame);
optionBtns.forEach(button => {
    button.addEventListener('click', selectAnswer);
});

// Event listener for difficulty selection change
difficultySelect.addEventListener('change', updateQuizInfo);

// Function to update quiz info based on selected difficulty
function updateQuizInfo() {
    const selectedDifficulty = difficultySelect.value;
    let infoHTML = '';
    
    switch(selectedDifficulty) {
        case 'all':
            infoHTML = '<li>All Difficulties: 30 questions (10 Easy, 10 Medium, 10 Hard)</li>';
            break;
        case 'easy':
            infoHTML = '<li>Easy: 10 questions</li>';
            break;
        case 'medium':
            infoHTML = '<li>Medium: 10 questions</li>';
            break;
        case 'hard':
            infoHTML = '<li>Hard: 10 questions</li>';
            break;
    }
    
    quizInfoList.innerHTML = infoHTML;
}

// Function to start the game
function startGame() {
    // Show loading screen while fetching questions
    startScreen.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    
    // Get selected category from dropdown
    const categoryId = document.getElementById('category').value;
    
    // Get selected difficulty
    const selectedDifficulty = difficultySelect.value;
    
    // Determine number of questions based on difficulty selection
    let totalQuestions;
    
    if (selectedDifficulty === 'all') {
        totalQuestions = questionsPerDifficulty * 3; // 3 difficulty levels
    } else {
        totalQuestions = questionsPerDifficulty; // Single difficulty level
    }
    
    // Update total questions display
    totalQuestionsDisplay.textContent = totalQuestions;
    maxScoreDisplay.textContent = totalQuestions;
    
    // Fetch questions from the API based on selected difficulty
    if (selectedDifficulty === 'all') {
        fetchQuestionsForAllDifficulties(categoryId);
    } else {
        fetchQuestionsForSingleDifficulty(categoryId, selectedDifficulty);
    }
}

// Function to fetch questions for all difficulty levels
async function fetchQuestionsForAllDifficulties(categoryId) {
    try {
        // Array of difficulty levels
        const difficulties = ['easy', 'medium', 'hard'];
        
        // Create array of promises for all API calls
        const fetchPromises = difficulties.map(difficulty => 
            fetch(`https://opentdb.com/api.php?amount=${questionsPerDifficulty}&category=${categoryId}&difficulty=${difficulty}&type=multiple`)
                .then(response => response.json())
        );
        
        // Wait for all API calls to complete
        const results = await Promise.all(fetchPromises);
        
        // Process and combine all questions
        let allQuestions = [];
        let errorOccurred = false;
        
        results.forEach((data, index) => {
            if (data.response_code === 0) {
                // Process questions for this difficulty level
                const questionsForDifficulty = data.results.map(questionData => {
                    const question = {
                        text: decodeHTML(questionData.question),
                        correctAnswer: decodeHTML(questionData.correct_answer),
                        options: [],
                        difficulty: difficulties[index] // Store the difficulty level
                    };
                    
                    // Mix correct answer with incorrect answers and shuffle
                    const options = [...questionData.incorrect_answers.map(answer => decodeHTML(answer)), question.correctAnswer];
                    question.options = shuffleArray(options);
                    
                    return question;
                });
                
                // Add questions to the combined array
                allQuestions = [...allQuestions, ...questionsForDifficulty];
            } else {
                // Handle API error
                errorOccurred = true;
            }
        });
        
        if (errorOccurred) {
            alert('Error fetching some questions. Please try again.');
            resetGame();
            return;
        }
        
        // Check if we have enough questions
        if (allQuestions.length < questionsPerDifficulty * 3) {
            alert('Not enough questions available. Please try a different category.');
            resetGame();
            return;
        }
        
        // Sort questions by difficulty (easy -> medium -> hard)
        allQuestions.sort((a, b) => {
            const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
        
        // Store all questions
        questions = allQuestions;
        
        // Hide loading screen and show game screen
        loadingScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Reset game state
        currentQuestionIndex = 0;
        score = 0;
        scoreDisplay.textContent = '0';
        
        // Show the first question
        showQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Error fetching questions. Please try again.');
        resetGame();
    }
}

// Function to fetch questions for a single difficulty level
async function fetchQuestionsForSingleDifficulty(categoryId, difficulty) {
    try {
        // Fetch questions from the API
        const response = await fetch(`https://opentdb.com/api.php?amount=${questionsPerDifficulty}&category=${categoryId}&difficulty=${difficulty}&type=multiple`);
        const data = await response.json();
        
        if (data.response_code === 0) {
            // Process questions
            const processedQuestions = data.results.map(questionData => {
                const question = {
                    text: decodeHTML(questionData.question),
                    correctAnswer: decodeHTML(questionData.correct_answer),
                    options: [],
                    difficulty: difficulty // Store the difficulty level
                };
                
                // Mix correct answer with incorrect answers and shuffle
                const options = [...questionData.incorrect_answers.map(answer => decodeHTML(answer)), question.correctAnswer];
                question.options = shuffleArray(options);
                
                return question;
            });
            
            // Store questions
            questions = processedQuestions;
            
            // Check if we have enough questions
            if (questions.length < questionsPerDifficulty) {
                alert('Not enough questions available. Please try a different category.');
                resetGame();
                return;
            }
            
            // Hide loading screen and show game screen
            loadingScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            
            // Reset game state
            currentQuestionIndex = 0;
            score = 0;
            scoreDisplay.textContent = '0';
            
            // Show the first question
            showQuestion();
        } else {
            // Handle API error
            alert('Error fetching questions. Please try again.');
            resetGame();
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Error fetching questions. Please try again.');
        resetGame();
    }
}

// Function to show the current question
function showQuestion() {
    // Reset the UI
    resetQuestionUI();
    
    // Get the current question
    const question = questions[currentQuestionIndex];
    
    // Update question text and options
    questionText.textContent = `[${question.difficulty.toUpperCase()}] ${question.text}`;
    optionBtns.forEach((button, index) => {
        button.textContent = `${String.fromCharCode(65 + index)}: ${question.options[index]}`;
        button.disabled = false;
    });
    
    // Update the current question number display
    currentQuestionDisplay.textContent = currentQuestionIndex + 1;
    
    // Start the timer
    startTimer();
}

// Function to reset the question UI
function resetQuestionUI() {
    // Reset options styling
    optionBtns.forEach(button => {
        button.classList.remove('correct-answer', 'wrong-answer');
        button.disabled = false;
    });
    
    // Hide feedback
    feedbackContainer.classList.add('hidden');
}

// Function to start the question timer
function startTimer() {
    // Reset timer
    clearInterval(timer);
    timeLeft = 15;
    timerDisplay.textContent = timeLeft;
    
    // Start countdown
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            // Time's up
            clearInterval(timer);
            handleTimeUp();
        }
    }, 1000);
}

// Function to handle time up
function handleTimeUp() {
    // Disable all option buttons
    optionBtns.forEach(button => {
        button.disabled = true;
    });
    
    // Find and highlight the correct answer
    highlightCorrectAnswer();
    
    // Show feedback
    showFeedback(false);
}

// Function to highlight the correct answer
function highlightCorrectAnswer() {
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    
    optionBtns.forEach(button => {
        const buttonText = button.textContent.slice(3); // Remove "A: ", "B: ", etc.
        
        if (buttonText === correctAnswer) {
            button.classList.add('correct-answer');
        }
    });
}

// Function to handle answer selection
function selectAnswer(event) {
    // Stop the timer
    clearInterval(timer);
    
    // Disable all option buttons
    optionBtns.forEach(button => {
        button.disabled = true;
    });
    
    // Get the selected answer
    const selectedButton = event.target;
    const selectedAnswerIndex = parseInt(selectedButton.dataset.index);
    const selectedAnswer = questions[currentQuestionIndex].options[selectedAnswerIndex];
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    
    // Check if the answer is correct
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Update UI based on correct/incorrect answer
    if (isCorrect) {
        selectedButton.classList.add('correct-answer');
        score++;
        scoreDisplay.textContent = score;
    } else {
        selectedButton.classList.add('wrong-answer');
        highlightCorrectAnswer();
    }
    
    // Show feedback
    showFeedback(isCorrect);
}

// Function to show feedback
function showFeedback(isCorrect) {
    feedbackContainer.classList.remove('hidden');
    
    if (isCorrect) {
        feedbackText.textContent = 'Correct! Great job!';
    } else {
        feedbackText.textContent = `Incorrect. The correct answer is: ${questions[currentQuestionIndex].correctAnswer}`;
    }
}

// Function to show the next question
function showNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        // Show the next question
        showQuestion();
    } else {
        // End the game
        endGame();
    }
}

// Function to end the game
function endGame() {
    // Hide game screen and show end screen
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    // Update final score
    finalScoreDisplay.textContent = score;
}

// Function to reset the game
function resetGame() {
    // Hide all screens except start screen
    endScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    loadingScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    // Reset game variables
    questions = [];
    currentQuestionIndex = 0;
    score = 0;
    
    // Clear the timer
    clearInterval(timer);
}

// Utility function to shuffle an array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Utility function to decode HTML entities
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Initialize quiz info on page load
updateQuizInfo();

// Function to apply difficulty-specific styling
function applyDifficultyStyle(difficulty) {
    // Remove any existing difficulty classes
    document.body.classList.remove('bg-easy', 'bg-medium', 'bg-hard', 'bg-all');
    
    // Add the appropriate class based on difficulty
    document.body.classList.add(`bg-${difficulty}`);
    
    // Apply difficulty class to question container
    const questionContainer = document.querySelector('.question-container');
    if (questionContainer) {
        questionContainer.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
        if (difficulty !== 'all') {
            questionContainer.classList.add(`difficulty-${difficulty}`);
        } else {
            // For 'all' difficulty, use the current question's difficulty
            if (questions.length > 0 && currentQuestionIndex < questions.length) {
                const currentDifficulty = questions[currentQuestionIndex].difficulty;
                questionContainer.classList.add(`difficulty-${currentDifficulty}`);
            }
        }
    }
}

// Modify the showQuestion function to update styling based on question difficulty
const originalShowQuestion = showQuestion;
showQuestion = function() {
    // Call the original function first
    originalShowQuestion();
    
    // Get the current question's difficulty
    const question = questions[currentQuestionIndex];
    
    // Apply styling based on difficulty
    if (difficultySelect.value === 'all') {
        // When using all difficulties, update background on each question
        applyDifficultyStyle(question.difficulty);
    }
    
    // Add difficulty class to question container
    const questionContainer = document.querySelector('.question-container');
    if (questionContainer) {
        questionContainer.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
        questionContainer.classList.add(`difficulty-${question.difficulty}`);
    }
}

// Modify the startGame function to set initial background
const originalStartGame = startGame;
startGame = function() {
    // Call the original function first
    originalStartGame();
    
    // Set background based on selected difficulty
    const selectedDifficulty = difficultySelect.value;
    applyDifficultyStyle(selectedDifficulty);
}

// Add event listener for difficulty selection to update background preview
difficultySelect.addEventListener('change', function() {
    const selectedDifficulty = difficultySelect.value;
    applyDifficultyStyle(selectedDifficulty);
});

// Initialize with default background
applyDifficultyStyle('all');