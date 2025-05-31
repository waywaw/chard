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

// Load Sounds
const jumpSound = new Audio('assets/jump.mp3');
const collectSound = new Audio('assets/collect.mp3');
const splatSound = new Audio('assets/splat.mp3');
const startSound = new Audio('assets/start.mp3');
const gameOverSound = new Audio('assets/gameover.mp3');

function playSound(sound) {
    const clone = sound.cloneNode();
    clone.play();
}

// Load Player Sprites
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

// Load Obstacles and Collectibles
const obstacles = [
    loadImage('assets/burger.svg'),
    loadImage('assets/pizza.svg'),
    loadImage('assets/donut.svg')
];

const collectibles = [
    loadImage('assets/carrot.svg'),
    loadImage('assets/broccoli.svg')
];

const powerups = [
    loadImage('assets/golden_carrot.svg')
];

// Motivational Quotes
const quotes = [
    "You can do it! – Richard Simmons",
    "Sweat and Smile!",
    "Every step counts!",
    "Eat clean, stay fit!",
    "One more carrot, one less worry!",
    "Fuel your greatness!",
    "Be stronger than your excuses!",
    "Health is wealth!",
    "Vegetables are victory!",
    "Small steps, big change!",
    "Make yourself proud!",
    "Celebrate progress!",
    "More veggies, more victories!",
    "Healthy hustle!",
    "Run like you mean it!",
];

// Dynamic Saul Bass Style Background
function drawDynamicBackground(offset) {
    ctx.save();

    ctx.fillStyle = '#FFE4B5'; // Base background
    ctx.fillRect(0, 0, width, height);

    const skyColors = ['#FF7F50', '#FFD700', '#FF6347', '#CD5C5C'];
    const bandHeight = height / 8;
    for (let i = 0; i < skyColors.length; i++) {
        ctx.fillStyle = skyColors[i];
        ctx.fillRect(0, i * bandHeight, width, bandHeight);
    }

    ctx.fillStyle = '#2E2E2E'; // Mountains
    let mountainWidth = 300;
    let mountainHeight = 200;
    let mountainOffset = offset * 0.5;
    for (let x = -mountainWidth + (mountainOffset % mountainWidth); x < width + mountainWidth; x += mountainWidth) {
        ctx.beginPath();
        ctx.moveTo(x, height - 400);
        ctx.lineTo(x + mountainWidth / 2, height - 400 - mountainHeight);
        ctx.lineTo(x + mountainWidth, height - 400);
        ctx.closePath();
        ctx.fill();
    }

    ctx.fillStyle = '#000000'; // Ground
    let groundWidth = 100;
    let groundHeight = 50;
    let groundOffset = offset % groundWidth;
    for (let x = -groundWidth + groundOffset; x < width + groundWidth; x += groundWidth) {
        ctx.beginPath();
        ctx.moveTo(x, height - 50);
        ctx.lineTo(x + groundWidth / 2, height - 50 - groundHeight);
        ctx.lineTo(x + groundWidth, height - 50);
        ctx.closePath();
        ctx.fill();
    }

    ctx.fillStyle = '#333333'; // Abstract trees/poles
    let treeSpacing = 200;
    let treeOffset = offset % treeSpacing;
    for (let x = -treeSpacing + treeOffset; x < width + treeSpacing; x += treeSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + 20, height - 100);
        ctx.lineTo(x + 30, height - 200);
        ctx.lineTo(x + 40, height - 100);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

let backgroundX = 0;
let baseBackgroundSpeed = 6;
let backgroundSpeed = baseBackgroundSpeed;
let playerSpeed = 2.5;
const minSpeed = 4;

const player = {
    x: 50,
    y: height - 300,
    width: 200,
    height: 200,
    vy: 0,
    gravity: 1.2,
    jumpPower: -18,
    jumpCount: 0,
    maxJumps: 3,
    frameIndex: 0,
    frameSpeed: 5,
    frameCounter: 0,
};

let gameObjects = [];
let gameStarted = false;
let spawnTimer = 0;
let score = 0;
let scoreTimer = 0;
let motivationalText = "";
let motivationalTimer = 0;
let startText = "";

let comboCount = 0;
let rainbowMode = false;
let rainbowTimer = 0;
let magnetMode = false;
let magnetTimer = 0;
let speedBoostMode = false;
let speedBoostTimer = 0;

let gameOver = false;
let highScore = localStorage.getItem('highScore') || 0;
let victoryAchieved = false;

function randomStartText() {
    const starts = [
        "Run for your health.",
        "Lower blood pressure.",
        "Lower cholesterol.",
        "Stay alive. The run never ends.",
        "Each step is a win.",
        "Healthy life, happy life.",
        "Run toward your best self."
    ];
    startText = starts[Math.floor(Math.random() * starts.length)];
}
randomStartText();

function spawnObstacle() {
    const obs = {
        type: "obstacle",
        img: obstacles[Math.floor(Math.random() * obstacles.length)],
        x: width,
        y: Math.random() * (height - 200) + 200,
        width: Math.floor(Math.random() * 20) + 80,
        height: Math.floor(Math.random() * 20) + 80,
        speed: 6
    };
    gameObjects.push(obs);
}

function spawnCollectible() {
    const col = {
        type: "collectible",
        img: collectibles[Math.floor(Math.random() * collectibles.length)],
        x: width,
        y: Math.random() * (height - 200) + 200,
        width: Math.floor(Math.random() * 20) + 80,
        height: Math.floor(Math.random() * 20) + 80,
        speed: 5
    };
    gameObjects.push(col);
}

function spawnPowerUp() {
    const pow = {
        type: "powerup",
        img: powerups[0],
        x: width,
        y: Math.random() * (height - 200) + 200,
        width: 60,
        height: 60,
        speed: 5
    };
    gameObjects.push(pow);
}

function jump() {
    if (gameStarted && !gameOver && player.jumpCount < player.maxJumps) {
        player.vy = player.jumpPower;
        player.jumpCount++;
        playSound(jumpSound);
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        playSound(startSound);
    } else if (gameOver) {
        restartGame();
    } else {
        jump();
    }
}

function restartGame() {
    backgroundSpeed = baseBackgroundSpeed;
    playerSpeed = 2.5;
    score = 0;
    scoreTimer = 0;
    spawnTimer = 0;
    comboCount = 0;
    rainbowMode = false;
    rainbowTimer = 0;
    magnetMode = false;
    magnetTimer = 0;
    speedBoostMode = false;
    speedBoostTimer = 0;
    gameObjects = [];
    gameOver = false;
    victoryAchieved = false;
    randomStartText();
    gameStarted = false;
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

function update() {
    if (!gameStarted || gameOver) return;

    // Slow motion during Rainbow Mode
    if (rainbowMode) {
        backgroundSpeed = baseBackgroundSpeed * 0.5;
        playerSpeed = 1.5;
    } else {
        backgroundSpeed = baseBackgroundSpeed;
        playerSpeed = 2.5;
    }

    backgroundX -= backgroundSpeed;
    if (backgroundX <= -width) {
        backgroundX = 0;
    }

    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y + player.height > height - 50) {
        player.y = height - 50 - player.height;
        player.vy = 0;
        player.jumpCount = 0;
    }

    gameObjects.forEach(obj => {
        obj.x -= obj.speed;
    });

    // Remove offscreen objects
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        if (obj.x + obj.width < 0) {
            gameObjects.splice(i, 1);
            continue;
        }
    }

    spawnTimer++;
    if (gameObjects.length < 50 && spawnTimer % 60 === 0) {
        if (Math.random() < 0.7) {
            spawnCollectible();
        } else if (Math.random() < 0.2) {
            spawnPowerUp();
        } else {
            spawnObstacle();
        }
    }

    if (rainbowMode && --rainbowTimer <= 0) rainbowMode = false;
    if (magnetMode && --magnetTimer <= 0) magnetMode = false;
    if (speedBoostMode && --speedBoostTimer <= 0) speedBoostMode = false;

    if (++scoreTimer % 60 === 0) score++;
    if (motivationalTimer > 0) motivationalTimer--;
}

function triggerGameOver() {
    gameOver = true;
    playSound(gameOverSound);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    if (score >= 1000) {
        victoryAchieved = true;
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    drawDynamicBackground(backgroundX);

    if (!gameStarted) {
        ctx.fillStyle = 'black';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(startText, width / 2, height / 2);
        ctx.drawImage(playerIdle, width / 2 - 100, height - 300, 200, 200);
        ctx.fillStyle = 'darkgreen';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('Tap to Start', width / 2, height / 2 + 150);
        return;
    }

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

    gameObjects.forEach(obj => {
        ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
    });

    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Health Score: ' + score, width / 2, 40);
    ctx.fillText('High Score: ' + highScore, width / 2, 70);

    if (motivationalTimer > 0) {
        ctx.fillStyle = 'blue';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(motivationalText, width / 2, height / 2 - 100);
    }

    if (comboCount > 1) {
        ctx.fillStyle = 'purple';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Combo: ' + comboCount, width / 2, 100);
    }

    if (rainbowMode) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('RAINBOW MODE! (Slow Motion)', width / 2, 140);
    }

    if (magnetMode) {
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('MAGNET MODE!', width / 2, 180);
    }

    if (speedBoostMode) {
        ctx.fillStyle = 'red';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('SPEED BOOST!', width / 2, 220);
    }

    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText('Game Over!', width / 2, height / 2);
        if (victoryAchieved) {
            ctx.fillStyle = 'green';
            ctx.font = 'bold 32px sans-serif';
            ctx.fillText('You lowered your cholesterol by 20%!', width / 2, height / 2 + 60);
        }
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Tap to Restart', width / 2, height / 2 + 120);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
