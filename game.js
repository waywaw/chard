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

// 🔊 Start Sound
const startSound = new Audio('assets/start.mp3');

// 📚 Quotes — dynamically loaded
let motivationalQuotes = [];

fetch('quotes.json')
    .then(response => response.json())
    .then(data => {
        motivationalQuotes = data;
    })
    .catch(error => console.error('Failed to load quotes:', error));

function generateMotivationalQuote() {
    if (motivationalQuotes.length === 0) {
        return "Keep going!";
    }
    const index = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[index];
}

// Responsive font size helper
function getResponsiveFontSize(baseSize) {
    if (width < 600) {
        return baseSize * 0.6;
    } else if (width < 900) {
        return baseSize * 0.8;
    }
    return baseSize;
}

// Random HEX Color Generator
function randomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

let backgroundColor = "#f0f8ff";
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

// Parallax Layers
const parallaxLayers = [];
const layerSpeeds = [0.2, 0.5, 1.0];
const shapesPerLayer = 30;
let levelLength = 10000;

function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function calculateLevelLength() {
    return (currentLevel * 100) * backgroundSpeed * 60;
}

function generateParallaxLayers() {
    parallaxLayers.length = 0;
    levelLength = calculateLevelLength();
    for (let i = 0; i < 3; i++) {
        const layer = [];
        for (let j = 0; j < shapesPerLayer; j++) {
            layer.push({
                type: Math.random() < 0.5 ? 'circle' : (Math.random() < 0.5 ? 'rect' : 'triangle'),
                x: Math.random() * levelLength,
                y: Math.random() * height,
                size: 50 + Math.random() * 100,
                color: randomColor()
            });
        }
        parallaxLayers.push(layer);
    }
}

function drawParallaxLayers(offset) {
    for (let i = 0; i < parallaxLayers.length; i++) {
        const speed = layerSpeeds[i];
        const layer = parallaxLayers[i];
        layer.forEach(shape => {
            ctx.save();
            ctx.translate(shape.x - offset * speed, shape.y);
            ctx.fillStyle = shape.color;
            if (shape.type === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (shape.type === 'rect') {
                ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
            } else if (shape.type === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(0, -shape.size / 2);
                ctx.lineTo(-shape.size / 2, shape.size / 2);
                ctx.lineTo(shape.size / 2, shape.size / 2);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        });
    }
}

function randomStartText() {
    const starts = [
        "Run for your health.",
        "Stay alive. The run never ends.",
        "Each step is a win.",
        "Healthy life, happy life.",
        "Run toward your best self."
    ];
    startText = starts[Math.floor(Math.random() * starts.length)];
}

randomStartText();

// Start the Game
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        startSound.play();
        generateParallaxLayers();
    } else if (gameOver) {
        restartGame();
    } else {
        jump();
    }
}

// Jump Logic
function jump() {
    if (gameStarted && !gameOver && player.jumpCount < player.maxJumps) {
        const jumpBoost = 1 + (player.jumpCount * 0.2);
        player.vy = player.jumpPower * jumpBoost;
        player.jumpCount++;
    }
}

// Restart Game
function restartGame() {
    backgroundSpeed = 6;
    playerSpeed = 2.5;
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
    backgroundColor = "#f0f8ff";
}

// Keyboard / Touch Controls
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

// Collision Detection
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Trampoline Collision
function checkTrampolineCollision() {
    trampolines.forEach(tramp => {
        if (detectCollision(player, tramp) && player.vy >= 0) {
            player.vy = player.jumpPower * 1.5;
            player.jumpCount = 0;
        }
    });
}

// Spawn Elements
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

// Update Game State
function update() {
    if (!gameStarted || gameOver) return;

    backgroundX += backgroundSpeed;

    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y + player.height > height - 50) {
        player.y = height - 50 - player.height;
        player.vy = 0;
        player.jumpCount = 0;
    }

    checkTrampolineCollision();

    gameObjects.forEach(obj => {
        obj.x -= obj.speed + (backgroundSpeed * 0.3);
    });

    trampolines.forEach(tramp => {
        tramp.x -= backgroundSpeed;
        const now = Date.now() / 1000;
        tramp.y = tramp.baseY + Math.sin(now * tramp.waveSpeed + tramp.waveOffset) * tramp.amplitude;
    });

    if (bossFood) {
        bossFood.x -= backgroundSpeed;
        if (detectCollision(player, bossFood)) {
            currentLevel++;
            backgroundColor = randomHexColor();
            generateParallaxLayers();
            bossFood = null;
        }
        if (bossFood && bossFood.x + bossFood.width < 0) {
            bossFood = null;
        }
    }

    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        if (detectCollision(player, obj)) {
            if (obj.type === "collectible") {
                gameObjects.splice(i, 1);
                comboCount++;
                score += 10;
                motivationalText = generateMotivationalQuote();
                motivationalTimer = 120;
                backgroundSpeed += 0.05;
                playerSpeed += 0.05;
            }
        }
    }

    gameObjects = gameObjects.filter(obj => obj.x + obj.width > 0);
    trampolines = trampolines.filter(tramp => tramp.x + tramp.width > 0);

    spawnTimer++;
    if (spawnTimer % 50 === 0) {
        spawnCollectible();
    }

    trampolineTimer++;
    if (trampolineTimer % 200 === 0) {
        spawnTrampoline();
    }

    if (score >= currentLevel * 100 && !bossFood) {
        spawnBossFood();
    }

    scoreTimer++;
    if (scoreTimer % 60 === 0) {
        score++;
    }

    if (motivationalTimer > 0) {
        motivationalTimer--;
    }
}

// Draw the Game
function draw() {
    ctx.clearRect(0, 0, width, height);

    if (!gameStarted) {
        ctx.drawImage(backgroundStartImage, 0, 0, width, height);
    } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }

    drawParallaxLayers(backgroundX);

    if (!gameStarted) {
        ctx.fillStyle = 'black';
        ctx.font = `bold ${getResponsiveFontSize(28)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(startText, width / 2, height / 2);

        ctx.drawImage(playerIdle, width / 2 - 100, height - 300, 200, 200);

        ctx.fillStyle = 'darkgreen';
        ctx.font = `bold ${getResponsiveFontSize(32)}px sans-serif`;
        ctx.fillText('Tap to Start', width / 2, height / 2 + 150);

        ctx.fillStyle = 'black';
        ctx.font = `bold ${getResponsiveFontSize(16)}px sans-serif`;
        ctx.fillText('v1.6.6', width - 60, height - 20); // VERSION NUMBER
        return;
    }

    trampolines.forEach(tramp => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(tramp.x, tramp.y, tramp.width, tramp.height);
    });

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

    if (bossFood && bossFood.img) {
        ctx.drawImage(bossFood.img, bossFood.x, bossFood.y, bossFood.width, bossFood.height);
    }

    ctx.fillStyle = 'black';
    ctx.font = `bold ${getResponsiveFontSize(24)}px sans-serif`;
    ctx.fillText('Health Score: ' + score, width / 2, 40);
    ctx.fillText('High Score: ' + highScore, width / 2, 70);
    ctx.fillText('Level: ' + currentLevel, width / 2, 100);

    if (motivationalTimer > 0) {
        ctx.fillStyle = 'blue';
        ctx.font = `bold ${getResponsiveFontSize(28)}px sans-serif`;
        ctx.fillText(motivationalText, width / 2, height / 2 - 100);
    }
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
