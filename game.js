// ... [everything from v1.6.1 before stays the same] ...

// 🎨 Saul Bass Style Color Palettes
const saulBassPalettes = [
  ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'],
  ['#ff6f61', '#6b4226', '#ffe156', '#6a0572', '#ab83a1'],
  ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
  ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#f4f1de'],
  ['#d62828', '#f77f00', '#fcbf49', '#eae2b7', '#003049']
];

let backgroundShapes = [];
let currentPalette = [];

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateSaulBassShapes() {
    backgroundShapes = [];
    currentPalette = randomFromArray(saulBassPalettes);

    for (let i = 0; i < 15; i++) {
        const shape = {
            type: Math.random() > 0.5 ? 'triangle' : 'circle', // Could expand to rectangles, lines
            color: randomFromArray(currentPalette),
            x: Math.random() * width,
            y: Math.random() * height,
            size: 50 + Math.random() * 100,
            rotation: Math.random() * Math.PI * 2
        };
        backgroundShapes.push(shape);
    }
}

function drawSaulBassBackground() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    backgroundShapes.forEach(shape => {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        ctx.fillStyle = shape.color;

        if (shape.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -shape.size / 2);
            ctx.lineTo(-shape.size / 2, shape.size / 2);
            ctx.lineTo(shape.size / 2, shape.size / 2);
            ctx.closePath();
            ctx.fill();
        } else if (shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    });
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
    generateSaulBassShapes(); // Generate first set of shapes
}

// 🚀 When you level up (eat boss food)
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
            generateSaulBassShapes(); // 🆕 New background each level
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
        drawSaulBassBackground(); // 🆕 Saul Bass background
    }

    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText("v1.6.2", width - 80, height - 20);

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

generateSaulBassShapes(); // 🆕 Generate initial Saul Bass shapes
gameLoop();
