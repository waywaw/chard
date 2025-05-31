// Setup canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

// Load Images
const loadImage = (src) => {
    const img = new Image();
    img.src = src;
    return img;
};

const playerRunFrames = [
    loadImage('assets/run1.svg'),
    loadImage('assets/run2.svg'),
    loadImage('assets/run3.svg'),
    loadImage('assets/run4.svg'),
    loadImage('assets/run5.svg'),
];

const playerJumpStart = loadImage('assets/jump_start.svg');
const playerJumpMid = loadImage('assets/jump_mid.svg');
const playerJumpFall = loadImage('assets/jump_fall.svg');

const playerIdle = loadImage('assets/chard2.svg');

const collectibles = [
    loadImage('assets/carrot.svg'),
    loadImage('assets/broccoli.svg')
];

const bossFoods = [
    loadImage('assets/burger.svg'),
    loadImage('assets/pizza.svg'),
    loadImage('assets/donut.svg')
];

const backgroundStartImage = loadImage('assets/background.svg');

// Sounds
const startSound = new Audio('assets/start.mp3');

// Motivational Quotes
function generateMotivationalQuote() {
    const verbs = ["Run", "Push", "Jump", "Reach", "Stretch", "Lift", "Dream", "Hustle", "Move", "Shine", "Grow", "Thrive"];
    const goals = ["health", "greatness", "tomorrow", "today", "happiness", "strength", "balance", "clarity"];
    const endings = [
        "every step counts.",
        "you're unstoppable.",
        "one breath at a time.",
        "small victories build empires.",
        "your best is yet to come.",
        "fuel your fire.",
        "make it happen.",
        "believe and achieve.",
        "no limits, only milestones."
    ];

    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const goal = goals[Math.floor(Math.random() * goals.length)];
    const ending = endings[Math.floor(Math.random() * endings.length)];

    return `${verb} toward ${goal}, ${ending}`;
}

// Static Location List (trimmed for demo)
const inspirations = [
    "Hollywood Hills", "Manhattan Skyline", "Golden Gate Bridge", "Eiffel Tower", 
    "Mount Fuji", "Grand Canyon", "Sahara Desert", "Santorini", "Bora Bora",
    "Great Wall of China", "Sydney Opera House", "Pyramids of Giza"
];

function pickRandomInspiration() {
    return inspirations[Math.floor(Math.random() * inspirations.length)];
}

// Random HEX Color Generator
function randomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

let levelColors = {};
let floorColor = '#000000'; // new
let floorWaveOffset = 0;     // new
let currentLocation = "";

function generateLevelBackground() {
    levelColors = {
        sky: randomHexColor(),
        hill1: randomHexColor(),
        hill2: randomHexColor(),
        hill3: randomHexColor()
    };
    floorColor = randomHexColor(); // set random floor color
    floorWaveOffset = 0;           // reset floor wave
    currentLocation = pickRandomInspiration();
}

// Floor wave function
function floorWaveY(x) {
    return height - 100 + Math.sin((x + floorWaveOffset) * 0.01) * 30;
}

// Draw Wavy Floor
function drawWavyFloor() {
    ctx.fillStyle = floorColor;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, floorWaveY(0));
    for (let x = 0; x <= width; x++) {
        ctx.lineTo(x, floorWaveY(x));
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
}

// Blobby Background
function drawBlobyLayer(color, scale) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height);

    const hillHeight = height / (3 * scale);
    const segments = 6 + Math.floor(Math.random() * 5);

    for (let i = 0; i <= segments; i++) {
        let x = (i / segments) * width;
        let variance = Math.random() * 100 - 50;
        let y = height - hillHeight + variance;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
}

function drawBackgroundBlobs() {
    ctx.fillStyle = levelColors.sky;
    ctx.fillRect(0, 0, width, height);

    drawBlobyLayer(levelColors.hill1, 1.5);
    drawBlobyLayer(levelColors.hill2, 1);
    drawBlobyLayer(levelColors.hill3, 0.5);
}

// Game State and Mechanics
let backgroundX = 0;
let backgroundSpeed = 6;
let playerSpeed = 2.5;

const player = {
    x: 50,
    y: height - 300,
    width: 200,
    height: 200,
    vy: 0,
    gravity: 1.2,
    jumpPower: -18,
    jumpCount: 0,
    maxJumps: 4, 
    frameIndex: 0,
    frameSpeed: 12, 
    frameCounter: 0,
};

let gameObjects = [];
let trampolines = [];
let bossFood = null;

let gameStarted = false;
let spawnTimer = 0;
let trampolineTimer = 0;
let score = 0;
let scoreTimer = 0;
let currentLevel = 1;

let motivationalText = "";
let motivationalTimer = 0;
let startText = "";

let comboCount = 0;
let gameOver = false;
let highScore = localStorage.getItem('highScore') || 0;

function randomStartText() {
    const starts = [
        "Run for your health.",
        "Lower cholesterol.",
        "Stay alive. The run never ends.",
        "Each step is a win.",
        "Healthy life, happy life.",
        "Run toward your best self."
    ];
    startText = starts[Math.floor(Math.random() * starts.length)];
}

randomStartText();

function spawnCollectible() {
    const col = {
        type: "collectible",
        img: collectibles[Math.floor(Math.random() * collectibles.length)],
        x: width,
        y: Math.random() * (height - 250) + 200,
        width: 80 + Math.random() * 20,
        height: 80 + Math.random() * 20,
        speed: 5
    };
    gameObjects.push(col);
}

function spawnTrampoline() {
    trampolines.push({
        x: width,
        baseY: height - 100,
        width: 100,
        height: 30,
        amplitude: 20 + Math.random() * 40,
        waveSpeed: 0.5 + Math.random(),
        waveOffset: Math.random() * Math.PI * 2
    });
}

function spawnBossFood() {
    bossFood = {
        img: bossFoods[Math.floor(Math.random() * bossFoods.length)],
        x: width,
        y: height - 300,
        width: 300,
        height: 300,
        speed: 6
    };
}

function jump() {
    if (gameStarted && !gameOver && player.jumpCount < player.maxJumps) {
        const jumpBoost = 1 + (player.jumpCount * 0.2);
        player.vy = player.jumpPower * jumpBoost;
        player.jumpCount++;
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        startSound.play();
    } else if (gameOver) {
        restartGame();
    } else {
        jump();
    }
}

function restartGame() {
    backgroundSpeed = 6;
    playerSpeed = 2.5;
    player.frameSpeed = 12;
    score = 0;
    scoreTimer = 0;
    spawnTimer = 0;
    trampolineTimer = 0;
    comboCount = 0;
    currentLevel = 1;
    bossFood = null;
    gameObjects = [];
    trampolines = [];
    gameOver = false;
    randomStartText();
    gameStarted = false;
    generateLevelBackground();
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        startGame();
    }
});

document.addEventListener('touchstart', () => {
    startGame();
});

document.addEventListener('mousedown', () => {
    startGame();
});

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// --- 🆕 Update Floor Movement + Player Floor Tracking
function update() {
    if (!gameStarted || gameOver) return;

    backgroundX -= backgroundSpeed;
    if (backgroundX <= -width) {
        backgroundX = 0;
    }

    floorWaveOffset += backgroundSpeed;

    player.vy += player.gravity;
    player.y += player.vy;

    let floorYAtPlayer = floorWaveY(player.x);
    if (player.y + player.height > floorYAtPlayer) {
        player.y = floorYAtPlayer - player.height;
        player.vy = 0;
        player.jumpCount = 0;
    }

    // Other updates: collectibles, trampolines, etc...
}

// --- 🆕 Draw Floor
function draw() {
    ctx.clearRect(0, 0, width, height);

    if (!gameStarted) {
        ctx.drawImage(backgroundStartImage, 0, 0, width, height);
    } else {
        drawBackgroundBlobs();
        drawWavyFloor(); // 🆕 Add wavy floor here
    }

    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`v1.5.8 — ${currentLocation}`, 20, height - 20);

    // Player Drawing
    let playerImage;
    if (player.vy < 0) {
        playerImage = playerJumpMid;
    } else if (player.vy > 0 && player.jumpCount > 0) {
        playerImage = playerJumpFall;
    } else {
        player.frameCounter += playerSpeed;
        if (player.frameCounter >= player.frameSpeed) {
            player.frameIndex = (player.frameIndex + 1) % playerRunFrames.length;
            player.frameCounter = 0;
        }
        playerImage = playerRunFrames[player.frameIndex];
    }

    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    
    // Other objects...
}

generateLevelBackground(); 
gameLoop();
