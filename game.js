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

const backgroundColor = "#f0f8ff";

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
let backgroundSpeed = 6;
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
let trampolines = [];
let platforms = [];

let gameStarted = false;
let spawnTimer = 0;
let trampolineTimer = 0;
let platformTimer = 0;
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
        y: Math.random() * (height - 250) + 200,
        width: 80 + Math.random() * 20,
        height: 80 + Math.random() * 20,
        speed: 6
    };
    gameObjects.push(obs);
}

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

function spawnPowerUp() {
    const pow = {
        type: "powerup",
        img: powerups[0],
        x: width,
        y: Math.random() * (height - 250) + 200,
        width: 60,
        height: 60,
        speed: 5
    };
    gameObjects.push(pow);
}

function spawnTrampoline() {
    trampolines.push({
        x: width,
        y: height - 100,
        width: 100,
        height: 30
    });
}

function spawnPlatform() {
    platforms.push({
        x: width,
        baseY: Math.random() * (height * 0.7),
        y: 0,
        width: 80 + Math.random() * 100,
        height: 20 + Math.random() * 20,
        amplitude: 30 + Math.random() * 20,
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
    platformTimer = 0;
    comboCount = 0;
    rainbowMode = false;
    rainbowTimer = 0;
    magnetMode = false;
    magnetTimer = 0;
    speedBoostMode = false;
    speedBoostTimer = 0;
    gameObjects = [];
    trampolines = [];
    platforms = [];
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

function checkTrampolineCollision() {
    trampolines.forEach(tramp => {
        if (detectCollision(player, tramp) && player.vy >= 0) {
            player.vy = player.jumpPower * 1.5;
            player.jumpCount = 0;
        }
    });
}

function checkPlatformCollision() {
    platforms.forEach(plat => {
        if (detectCollision(player, plat) && player.vy >= 0) {
            player.vy = 0;
            player.y = plat.y - player.height;
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
    checkPlatformCollision();

    gameObjects.forEach(obj => {
        obj.x -= obj.speed;
    });

    trampolines.forEach(tramp => {
        tramp.x -= backgroundSpeed;
    });

    let now = Date.now() / 1000;
    platforms.forEach(plat => {
        plat.x -= backgroundSpeed;
        plat.y = plat.baseY + Math.sin(now * plat.waveSpeed + plat.waveOffset) * plat.amplitude;
    });

    // ➡️ Correct collision detection block:
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        if (detectCollision(player, obj)) {
            if (obj.type === "collectible") {
                gameObjects.splice(i, 1);
                comboCount++;
                if (comboCount % 5 === 0) {
                    score += 50;
                }
                if (comboCount >= 10 && !rainbowMode) {
                    rainbowMode = true;
                    rainbowTimer = 600;
                }
                let points = rainbowMode ? 20 : 10;
                if (speedBoostMode) points *= 2;
                score += points;
                motivationalText = quotes[Math.floor(Math.random() * quotes.length)];
                motivationalTimer = 120;
                backgroundSpeed += 0.5;
                playerSpeed += 0.3;
            } else if (obj.type === "obstacle") {
                gameObjects.splice(i, 1);
                comboCount = 0;
                rainbowMode = false;
                rainbowTimer = 0;
                magnetMode = false;
                magnetTimer = 0;
                speedBoostMode = false;
                speedBoostTimer = 0;
                score = Math.max(0, score - 5);
                backgroundSpeed -= 1;
                playerSpeed -= 0.5;
                if (backgroundSpeed < minSpeed) {
                    triggerGameOver();
                }
            } else if (obj.type === "powerup") {
                gameObjects.splice(i, 1);
                if (Math.random() < 0.5) {
                    magnetMode = true;
                    magnetTimer = 600;
                } else {
                    speedBoostMode = true;
                    speedBoostTimer = 300;
                }
            }
        }
    }

    gameObjects = gameObjects.filter(obj => obj.x + obj.width > 0);
    trampolines = trampolines.filter(tramp => tramp.x + tramp.width > 0);
    platforms = platforms.filter(plat => plat.x + plat.width > 0);

    spawnTimer++;
    if (spawnTimer % 50 === 0) {
        if (Math.random() < 0.7) {
            spawnCollectible();
        } else if (Math.random() < 0.2) {
            spawnPowerUp();
        } else {
            spawnObstacle();
        }
    }

    trampolineTimer++;
    if (trampolineTimer % 300 === 0) {
        spawnTrampoline();
    }

    platformTimer++;
    if (platformTimer % 200 === 0) {
        spawnPlatform();
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

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText("v1.4.2", width - 80, height - 20);

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

    platforms.forEach(plat => {
        ctx.fillStyle = 'gray';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
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
