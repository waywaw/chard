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

// Start Sound
const startSound = new Audio('assets/start.mp3');

// Motivational Quotes Generator
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

// Random HEX Color
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
const levelLength = 10000; // Length of level in pixels

function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateParallaxLayers() {
    parallaxLayers.length = 0;

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
    backgroundColor = "#f0f8ff";
    generateParallaxLayers();
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

function checkTrampolineCollision() {
    trampolines.forEach(tramp => {
        if (detectCollision(player, tramp) && player.vy >= 0) {
            player.vy = player.jumpPower * 1.5;
            player.jumpCount = 0;
        }
    });
}

function update() {
    if (!gameStarted || gameOver) return;

    backgroundX += backgroundSpeed; // now scrolling right for effect

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
            bossFood = null;
            generateParallaxLayers();
            if (player.frameSpeed > 4) {
                player.frameSpeed -= 0.2;
            }
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

function draw() {
    ctx.clearRect(0, 0, width, height);

    if (!gameStarted) {
        ctx.drawImage(backgroundStartImage, 0, 0, width, height);
    } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        drawParallaxLayers(backgroundX);
    }

    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText("v1.6.3", width - 80, height - 20);

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
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Health Score: ' + score, width / 2, 40);
    ctx.fillText('High Score: ' + highScore, width / 2, 70);
    ctx.fillText('Level: ' + currentLevel, width / 2, 100);

    if (motivationalTimer > 0) {
        ctx.fillStyle = 'blue';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(motivationalText, width / 2, height / 2 - 100);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

generateParallaxLayers();
gameLoop();
