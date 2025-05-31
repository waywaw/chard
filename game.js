// Chard Runner 2.0.3 - Sound-Free Mobile Fix

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

const loadImage = (src) => {
    const img = new Image();
    img.src = src;
    return img;
};

// Dummy sounds (no-op to avoid mobile browser blocking)
const jumpSound = new Audio();
const collectSound = new Audio();
const splatSound = new Audio();
const startSound = new Audio();
const gameOverSound = new Audio();

function playSound(sound) {
    // intentionally blank — avoids autoplay restrictions
}

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

const obstacles = [
    loadImage('assets/burger.svg'),
    loadImage('assets/pizza.svg'),
    loadImage('assets/donut.svg')
];

const collectibles = [
    loadImage('assets/carrot.svg'),
    loadImage('assets/broccoli.svg')
];

const palettes = [
    ['#FF7F50', '#FFD700', '#FF6347', '#CD5C5C'],
    ['#00CED1', '#4682B4', '#5F9EA0', '#6495ED'],
    ['#ADFF2F', '#7FFF00', '#32CD32', '#006400'],
    ['#9932CC', '#8A2BE2', '#9400D3', '#4B0082'],
    ['#FF69B4', '#FF1493', '#DB7093', '#C71585']
];

let currentPalette = palettes[0];

function randomizePalette() {
    const randomIndex = Math.floor(Math.random() * palettes.length);
    currentPalette = palettes[randomIndex];
}

function drawDynamicBackground(offset) {
    ctx.save();
    ctx.fillStyle = '#FFE4B5';
    ctx.fillRect(0, 0, width, height);

    const bandHeight = height / 8;
    for (let i = 0; i < currentPalette.length; i++) {
        ctx.fillStyle = currentPalette[i];
        ctx.fillRect(0, i * bandHeight, width, bandHeight);
    }

    ctx.fillStyle = '#2E2E2E';
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

    ctx.fillStyle = '#000000';
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

    ctx.fillStyle = '#333333';
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
let baseBackgroundSpeed = 4;
let backgroundSpeed = baseBackgroundSpeed;
let playerSpeed = 1.5;

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
    crouching: false
};

let gameObjects = [];
let gameStarted = false;
let spawnTimer = 0;
let score = 0;
let veggiesCollected = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;

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
    return starts[Math.floor(Math.random() * starts.length)];
}

let startText = randomStartText();

function spawnObstacle() {
    const obs = {
        type: "obstacle",
        img: obstacles[Math.floor(Math.random() * obstacles.length)],
        x: width,
        y: Math.random() * (height - 200) + 200,
        width: 100,
        height: 100,
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
        width: 80,
        height: 80,
        speed: 5
    };
    gameObjects.push(col);
}

function jump() {
    if (gameStarted && !gameOver && player.jumpCount < player.maxJumps) {
        player.vy = player.jumpPower;
        player.jumpCount++;
        playSound(jumpSound);
    }
}

function crouchDown() {
    if (gameStarted && !gameOver) {
        player.crouching = true;
    }
}

function standUp() {
    if (player.crouching) {
        player.crouching = false;
        jump();
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
    playerSpeed = 1.5;
    score = 0;
    veggiesCollected = 0;
    spawnTimer = 0;
    gameObjects = [];
    gameOver = false;
    startText = randomStartText();
    randomizePalette();
    gameStarted = false;
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function update() {
    if (!gameStarted || gameOver) return;

    backgroundX -= backgroundSpeed;
    if (backgroundX <= -width) backgroundX = 0;

    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y + player.height > height - 50) {
        player.y = height - 50 - player.height;
        player.vy = 0;
        player.jumpCount = 0;
    }

    gameObjects.forEach(obj => {
        obj.x -= backgroundSpeed * (obj.type === 'obstacle' ? 1.2 : 1);
    });

    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        if (obj.x + obj.width < 0) {
            gameObjects.splice(i, 1);
        }
        if (detectCollision(player, obj)) {
            if (obj.type === "collectible") {
                gameObjects.splice(i, 1);
                veggiesCollected++;
                score += 10;
                backgroundSpeed += 0.2;
                playerSpeed += 0.1;
                if (veggiesCollected % 5 === 0) randomizePalette();
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('highScore', highScore);
                }
                playSound(collectSound);
            } else if (obj.type === "obstacle") {
                gameObjects.splice(i, 1);
                backgroundSpeed = Math.max(2, backgroundSpeed - 0.5);
                playerSpeed = Math.max(1, playerSpeed - 0.3);
                score = Math.max(0, score - 5);
                playSound(splatSound);
                if (score <= 0) triggerGameOver();
            }
        }
    }

    spawnTimer++;
    if (gameObjects.length < 50 && spawnTimer % 60 === 0) {
        if (Math.random() < 0.7) spawnCollectible();
        else spawnObstacle();
    }
}

function triggerGameOver() {
    gameOver = true;
    playSound(gameOverSound);
    localStorage.setItem('highScore', highScore);
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

    let playerImage = playerRunFrames[player.frameIndex];
    let pWidth = player.width;
    let pHeight = player.height;
    let pX = player.x;
    let pY = player.y;

    if (player.crouching) {
        playerImage = playerJumpStart;
        pWidth = player.width / 2;
        pHeight = player.height / 2;
        pY = player.y + player.height / 2;
    } else if (player.vy < 0) {
        playerImage = playerJumpMid;
    } else if (player.vy > 0 && player.jumpCount > 0) {
        playerImage = playerJumpFall;
    } else {
        player.frameCounter += playerSpeed;
        if (player.frameCounter >= player.frameSpeed) {
            player.frameIndex = (player.frameIndex + 1) % playerRunFrames.length;
            player.frameCounter = 0;
        }
    }

    ctx.drawImage(playerImage, pX, pY, pWidth, pHeight);

    gameObjects.forEach(obj => {
        ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
    });

    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Health Score: ' + score, width / 2, 40);
    ctx.fillText('High Score: ' + highScore, width / 2, 70);
}

// --- Mobile/Desktop Start Events ---
let gameLoopStarted = false;

function startGameLoop() {
    if (!gameLoopStarted) {
        gameLoopStarted = true;
        requestAnimationFrame(gameLoop);
    }
}

window.addEventListener('touchend', startGameLoop, { once: true });
window.addEventListener('click', startGameLoop, { once: true });

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
