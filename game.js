// [All your initial setup code stays the same] ...

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
        speed: 5
    };
    gameObjects.push(col);
}

function spawnPowerUp() {
    const pow = {
        type: "powerup",
        img: powerups[0],
        x: width,
        y: Math.random() * (height - 200) + 200,
        width: 60,
        height: 60,
        speed: 5
    };
    gameObjects.push(pow);
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

    // 🚨 Safely remove offscreen objects
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        if (obj.x + obj.width < 0) {
            gameObjects.splice(i, 1); // Remove offscreen
            continue;
        }
    }

    // 🚨 Spawn New Objects — but limit total number
    spawnTimer++;
    if (gameObjects.length < 50 && spawnTimer % 60 === 0) { 
        if (Math.random() < 0.7) {
            spawnCollectible();
        } else if (Math.random() < 0.2) {
            spawnPowerUp();
        } else {
            spawnObstacle();
        }
    }

    // 🚨 Rainbow Mode Timer
    if (rainbowMode && --rainbowTimer <= 0) rainbowMode = false;
    if (magnetMode && --magnetTimer <= 0) magnetMode = false;
    if (speedBoostMode && --speedBoostTimer <= 0) speedBoostMode = false;

    if (++scoreTimer % 60 === 0) score++;
    if (motivationalTimer > 0) motivationalTimer--;
}

// [rest of your code stays unchanged]
