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

// Static 500 Location List (trimmed)
const inspirations = [ 
    "Hollywood Hills", "Manhattan Skyline", "Golden Gate Bridge", "Eiffel Tower", 
    "Mount Fuji", "Grand Canyon", "Sahara Desert", "Santorini", "Bora Bora",
    "Great Wall of China", "Sydney Opera House", "Pyramids of Giza"
    // ... Fill with the 500 list
];

// Map Location -> Profile
const locationProfiles = {
    "Hollywood Hills": "rollingHills",
    "Manhattan Skyline": "skyline",
    "Golden Gate Bridge": "bridge",
    "Eiffel Tower": "tallTriangle",
    "Mount Fuji": "tallTriangle",
    "Grand Canyon": "canyon",
    "Sahara Desert": "dunes",
    "Santorini": "domesAndCubes",
    "Bora Bora": "sharpPeaks",
    "Great Wall of China": "rollingHills",
    "Sydney Opera House": "domesAndCubes",
    "Pyramids of Giza": "tallTriangle"
    // Rest default to "rollingHills"
};

function pickRandomInspiration() {
    return inspirations[Math.floor(Math.random() * inspirations.length)];
}

// Random HEX Color Generator
function randomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

let levelColors = {};
let currentLocation = "";
let shapeProfile = "";

function generateLevelBackground() {
    levelColors = {
        sky: randomHexColor(),
        shape1: randomHexColor(),
        shape2: randomHexColor(),
        shape3: randomHexColor()
    };
    currentLocation = pickRandomInspiration();
    shapeProfile = locationProfiles[currentLocation] || "rollingHills";
}

// Draw based on profile
function drawBackground(ctx) {
    ctx.fillStyle = levelColors.sky;
    ctx.fillRect(0, 0, width, height);

    switch (shapeProfile) {
        case "rollingHills":
            drawRollingHills(ctx);
            break;
        case "skyline":
            drawSkyline(ctx);
            break;
        case "tallTriangle":
            drawTallTriangle(ctx);
            break;
        case "canyon":
            drawCanyon(ctx);
            break;
        case "dunes":
            drawDunes(ctx);
            break;
        case "bridge":
            drawBridge(ctx);
            break;
        case "domesAndCubes":
            drawDomesAndCubes(ctx);
            break;
        case "sharpPeaks":
            drawSharpPeaks(ctx);
            break;
        default:
            drawRollingHills(ctx);
    }
}

function drawRollingHills(ctx) {
    ctx.fillStyle = levelColors.shape1;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i <= width; i += width / 5) {
        ctx.lineTo(i, height - 100 - Math.sin(i * 0.01) * 50);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
}

function drawSkyline(ctx) {
    ctx.fillStyle = levelColors.shape2;
    const numBuildings = Math.floor(width / 50);
    for (let i = 0; i < numBuildings; i++) {
        let buildingWidth = 30 + Math.random() * 20;
        let buildingHeight = height / 4 + Math.random() * (height / 3);
        let x = i * 50;
        let y = height - buildingHeight;
        ctx.fillRect(x, y, buildingWidth, buildingHeight);
    }
}

function drawTallTriangle(ctx) {
    ctx.fillStyle = levelColors.shape2;
    ctx.beginPath();
    ctx.moveTo(width / 2, height - 400);
    ctx.lineTo(width / 2 - 100, height);
    ctx.lineTo(width / 2 + 100, height);
    ctx.closePath();
    ctx.fill();
}

function drawCanyon(ctx) {
    ctx.fillStyle = levelColors.shape1;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i < width; i += width / 10) {
        let heightVariation = Math.random() * 150;
        ctx.lineTo(i, height - 100 - heightVariation);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
}

function drawDunes(ctx) {
    ctx.fillStyle = levelColors.shape3;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i < width; i += width / 20) {
        ctx.lineTo(i, height - 80 - Math.sin(i * 0.01) * 60);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
}

function drawBridge(ctx) {
    ctx.strokeStyle = levelColors.shape1;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.6);
    ctx.lineTo(width * 0.2, height * 0.3);
    ctx.moveTo(width * 0.8, height * 0.6);
    ctx.lineTo(width * 0.8, height * 0.3);
    ctx.moveTo(width * 0.2, height * 0.3);
    ctx.bezierCurveTo(width * 0.5, height * 0.1, width * 0.5, height * 0.1, width * 0.8, height * 0.3);
    ctx.stroke();
}

function drawDomesAndCubes(ctx) {
    ctx.fillStyle = levelColors.shape2;
    const numBuildings = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numBuildings; i++) {
        let x = i * 150 + 50;
        let y = height - 200;
        ctx.fillRect(x, y, 60, 60);
        ctx.beginPath();
        ctx.arc(x + 30, y, 30, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
    }
}

function drawSharpPeaks(ctx) {
    ctx.fillStyle = levelColors.shape1;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i <= width; i += width / 5) {
        ctx.lineTo(i + width / 10, height - 300 - Math.random() * 100);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
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

// Other update/draw/gameLoop functions would follow...
// (Trimming here for message length)

generateLevelBackground(); 
gameLoop();
