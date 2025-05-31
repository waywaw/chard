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

const backgroundImage = loadImage('assets/background.svg');

let backgroundX = 0;

const player = {
    x: 100,
    y: height - 250, // Adjust for larger size
    width: 150,      // Increased from 80
    height: 150,
    vy: 0,
    gravity: 1.5,
    jumpPower: -20,
    jumpCount: 0,
    maxJumps: 3,
    frameIndex: 0,
    frameSpeed: 5,
    frameCounter: 0,
};

const gameObjects = [];

let gameStarted = false;
let spawnTimer = 0;
let score = 0;
let scoreTimer = 0;

function spawnObstacle() {
    const obs = {
        img: obstacles[Math.floor(Math.random() * obstacles.length)],
        x: width,
        y: height - 100,
        width: 60,
        height: 60,
        speed: 6
    };
    gameObjects.push(obs);
}

function spawnCollectible() {
    const col = {
        img: collectibles[Math.floor(Math.random() * collectibles.length)],
        x: width,
        y: height - 200,
        width: 50,
        height: 50,
        speed: 6
    };
    gameObjects.push(col);
}

function jump() {
    if (gameStarted && player.jumpCount < player.maxJumps) {
        player.vy = player.jumpPower;
        player.jumpCount++;
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
    } else {
        jump();
    }
}

// Input
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

function update() {
    if (!gameStarted) return;

    backgroundX -= 2;
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
        if (gameObjects[i].x + gameObjects[i].width < 0) {
            gameObjects.splice(i, 1);
        }
    }

    spawnTimer++;
    if (spawnTimer % 120 === 0) {
        if (Math.random() < 0.6) {
            spawnObstacle();
        } else {
            spawnCollectible();
        }
    }

    // Increase score over time
    scoreTimer++;
    if (scoreTimer % 60 === 0) { // 60 frames ~ 1 second
        score++;
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(backgroundImage, backgroundX, 0, width, height);
    ctx.drawImage(backgroundImage, backgroundX + width, 0, width, height);

    if (!gameStarted) {
        // 📝 Storyline Text
        ctx.fillStyle = 'black';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Run for your health.', width / 2, height / 2 - 60);
        ctx.fillText('Lower blood pressure.', width / 2, height / 2 - 20);
        ctx.fillText('Lower cholesterol.', width / 2, height / 2 + 20);
        ctx.fillText('Stay alive. The run never ends.', width / 2, height / 2 + 60);

        // Static Chard
        ctx.drawImage(playerIdle, width / 2 - 75, height - 250, 150, 150);

        // Start Message
        ctx.fillStyle = 'darkgreen';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('Tap to Start', width / 2, height / 2 + 150);
        return;
    }

    // Player Animation
    let playerImage;
    if (player.vy < 0) {
        playerImage = playerJumpMid;
    } else if (player.vy > 0 && player.jumpCount > 0) {
        playerImage = playerJumpFall;
    } else {
        player.frameCounter++;
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

    // 📝 Score Counter
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Health Score: ' + score, width / 2, 40);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
