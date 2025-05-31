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

const backgroundImage = loadImage('assets/background.svg');

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

let backgroundX = 0;
let backgroundSpeed = 2;
let playerSpeed = 1;
const minSpeed = 2;

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
        speed: 6
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
    backgroundSpeed = 2;
    playerSpeed = 1;
    score = 0;
    scoreTimer = 0;
    spawnTimer = 0;
    comboCount = 0;
    rainbowMode = false;
    rainbowTimer = 0;
    gameObjects = [];
    gameOver = false;
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

    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];

        if (obj.x + obj.width < 0) {
            gameObjects.splice(i, 1);
            continue;
        }

        if (detectCollision(player, obj)) {
            if (obj.type === "collectible") {
                gameObjects.splice(i, 1);
                comboCount++;
                if (comboCount % 5 === 0) {
                    score += 50; // Bonus points!
                }
                if (comboCount >= 10 && !rainbowMode) {
                    rainbowMode = true;
                    rainbowTimer = 600; // ~10 seconds at 60FPS
                }
                let points = rainbowMode ? 20 : 10;
                score += points;
                motivationalText = quotes[Math.floor(Math.random() * quotes.length)];
                motivationalTimer = 120;
                backgroundSpeed += 0.5;
                playerSpeed += 0.2;
                playSound(collectSound);
            } else if (obj.type === "obstacle") {
                gameObjects.splice(i, 1);
                comboCount = 0; // Reset combo
                rainbowMode = false; // Cancel rainbow mode
                rainbowTimer = 0;
                score = Math.max(0, score - 5);
                backgroundSpeed -= 1;
                playerSpeed -= 0.5;
                if (backgroundSpeed < minSpeed) {
                    triggerGameOver();
                }
                playSound(splatSound);
            }
        }
    }

    spawnTimer++;
    if (spawnTimer % 100 === 0) {
        if (Math.random() < 0.6) {
            spawnObstacle();
        } else {
            spawnCollectible();
        }
    }

    scoreTimer++;
    if (scoreTimer % 60 === 0) {
        score++;
    }

    if (motivationalTimer > 0) {
        motivationalTimer--;
    }

    if (rainbowMode) {
        rainbowTimer--;
        if (rainbowTimer <= 0) {
            rainbowMode = false;
        }
    }
}

function triggerGameOver() {
    gameOver = true;
    playSound(gameOverSound);
}

function drawRainbowBackground() {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.2, 'orange');
    gradient.addColorStop(0.4, 'yellow');
    gradient.addColorStop(0.6, 'green');
    gradient.addColorStop(0.8, 'blue');
    gradient.addColorStop(1, 'violet');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    if (rainbowMode) {
        drawRainbowBackground();
    } else {
        ctx.drawImage(backgroundImage, backgroundX, 0, width, height);
        ctx.drawImage(backgroundImage, backgroundX + width, 0, width, height);
    }

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

    if (motivationalTimer > 0) {
        ctx.fillStyle = 'blue';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(motivationalText, width / 2, height / 2 - 100);
    }

    if (comboCount > 1) {
        ctx.fillStyle = 'purple';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Combo: ' + comboCount, width / 2, 80);
    }

    if (rainbowMode) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('RAINBOW MODE!', width / 2, 120);
    }

    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText('Game Over!', width / 2, height / 2);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Tap to Restart', width / 2, height / 2 + 60);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
