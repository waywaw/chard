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

// Version
const version = "v1.4.0";

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

const backgroundColors = [
    '#FFD700', '#ADFF2F', '#FF69B4', '#87CEEB', '#FF7F50', '#DA70D6', '#98FB98', '#FFA07A'
];

let backgroundColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];

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

// New random Y position for spawns (top 80%)
function getSpawnY() {
    return Math.random() * (height * 0.8 - 100);
}

function spawnObstacle() {
    const obs = {
        type: "obstacle",
        img: obstacles[Math.floor(Math.random() * obstacles.length)],
        x: width,
        y: getSpawnY(),
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
        y: getSpawnY(),
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
        y: getSpawnY(),
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
        height: 20,
        speed: 6
    });
}

function spawnPlatform() {
    platforms.push({
        x: width,
        y: Math.random() * (height * 0.7),
        width: 80 + Math.random() * 100,
        height: 20 + Math.random() * 20,
        speed: 6
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
    backgroundColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
    player.y = height - 300;
    player.vy = 0;
    player.jumpCount = 0;
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
    for (let tramp of trampolines) {
        if (
            player.vy > 0 &&
            player.x + player.width > tramp.x &&
            player.x < tramp.x + tramp.width &&
            player.y + player.height <= tramp.y + 10 &&
            player.y + player.height + player.vy >= tramp.y
        ) {
            player.y = tramp.y - player.height;
            player.vy = player.jumpPower * 2; // Big bounce
            player.jumpCount = 0;
        }
    }
}

function checkPlatformCollision() {
    for (let plat of platforms) {
        if (
            player.vy > 0 &&
            player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height <= plat.y + 10 &&
            player.y + player.height + player.vy >= plat.y
        ) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.jumpCount = 0;
        }
    }
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

    platforms.forEach(plat => {
        plat.x -= backgroundSpeed;
    });

    // Memory Cleanup
    gameObjects = gameObjects.filter(obj => obj.x + obj.width > 0);
    trampolines = trampolines.filter(tramp => tramp.x + tramp.width > 0);
    platforms = platforms.filter(plat => plat.x + plat.width > 0);

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

    if (rainbowMode) {
        rainbowTimer--;
        if (rainbowTimer <= 0) {
            rainbowMode = false;
        }
    }

    if (magnetMode) {
        magnetTimer--;
        if (magnetTimer <= 0) {
            magnetMode = false;
        }
    }

    if (speedBoostMode) {
        speedBoostTimer--;
        if (speedBoostTimer <= 0) {
            speedBoostMode = false;
        }
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
    if (score >= 1000) {
        victoryAchieved = true;
    }
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
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }

    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(version, width - 80, height - 20);

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

    if (comboCount > 1) {
        ctx.fillStyle = 'purple';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Combo: ' + comboCount, width / 2, 100);
    }

    if (rainbowMode) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('RAINBOW MODE!', width / 2, 140);
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
