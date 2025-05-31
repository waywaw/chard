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

const backgroundColor = "#f0f8ff";

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
    maxJumps: 3,
    frameIndex: 0,
    frameSpeed: 5,
    frameCounter: 0,
};

let gameObjects = [];
let trampolines = [];

let gameStarted = false;
let spawnTimer = 0;
let trampolineTimer = 0;
let score = 0;
let scoreTimer = 0;

let motivationalText = "";
let motivationalTimer = 0;
let startText = "";

let comboCount = 0;
let gameOver = false;
let highScore = localStorage.getItem('highScore') || 0;

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

function jump() {
    if (gameStarted && !gameOver && player.jumpCount < player.maxJumps) {
        player.vy = player.jumpPower;
        player.jumpCount++;
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
    } else if (gameOver) {
        restartGame();
    } else {
        jump();
    }
}

function restartGame() {
    backgroundSpeed = 6;
    playerSpeed = 2.5;
    score = 0;
    scoreTimer = 0;
    spawnTimer = 0;
    trampolineTimer = 0;
    comboCount = 0;
    gameObjects = [];
    trampolines = [];
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

    checkTrampolineCollision();

    gameObjects.forEach(obj => {
        obj.x -= obj.speed;
    });

    trampolines.forEach(tramp => {
        tramp.x -= backgroundSpeed;
        const now = Date.now() / 1000;
        tramp.y = tramp.baseY + Math.sin(now * tramp.waveSpeed + tramp.waveOffset) * tramp.amplitude;
    });

    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        if (detectCollision(player, obj)) {
            if (obj.type === "collectible") {
                gameObjects.splice(i, 1);
                comboCount++;
                score += 10;
                motivationalText = quotes[Math.floor(Math.random() * quotes.length)];
                motivationalTimer = 120;
                backgroundSpeed += 0.5;
                playerSpeed += 0.3;
            }
        }
    }

    // Clean up off-screen objects
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

    scoreTimer++;
    if (scoreTimer % 60 === 0) {
        score++;
    }

    if (motivationalTimer > 0) {
        motivationalTimer--;
    }
}

function triggerGameOver() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText("v1.4.4", width - 80, height - 20);

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
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
