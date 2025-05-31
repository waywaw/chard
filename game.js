// [ All your normal setup code here — player, images, etc. ]

let errorMessage = ""; // 🛑 New error tracker

function update() {
    if (!gameStarted || gameOver || errorMessage) return;

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

    if (errorMessage) {
        ctx.fillStyle = 'red';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("❌ ERROR ❌", width / 2, height / 2 - 40);
        ctx.fillText(errorMessage, width / 2, height / 2);
        return; // 🛑 Stop drawing rest
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
    try {
        update();
        draw();
        if (!errorMessage) {
            requestAnimationFrame(gameLoop);
        }
    } catch (err) {
        console.error(err);
        errorMessage = err.message || "Unknown Error";
    }
}

gameLoop();
