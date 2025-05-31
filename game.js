function drawDynamicBackground(offset) {
    ctx.save();

    // Sky Background
    ctx.fillStyle = '#FFE4B5'; // Light Saul Bass background base
    ctx.fillRect(0, 0, width, height);

    // Sky Color Bands
    const skyColors = ['#FF7F50', '#FFD700', '#FF6347', '#CD5C5C'];
    const bandHeight = height / 8;
    for (let i = 0; i < skyColors.length; i++) {
        ctx.fillStyle = skyColors[i];
        ctx.fillRect(0, i * bandHeight, width, bandHeight);
    }

    // Mountains (farther, slower parallax)
    ctx.fillStyle = '#2E2E2E'; // Dark gray
    let mountainWidth = 300;
    let mountainHeight = 200;
    let mountainOffset = offset * 0.5; // Move slower for parallax
    for (let x = -mountainWidth + (mountainOffset % mountainWidth); x < width + mountainWidth; x += mountainWidth) {
        ctx.beginPath();
        ctx.moveTo(x, height - 400);
        ctx.lineTo(x + mountainWidth / 2, height - 400 - mountainHeight);
        ctx.lineTo(x + mountainWidth, height - 400);
        ctx.closePath();
        ctx.fill();
    }

    // Ground Layer (closer, faster parallax)
    ctx.fillStyle = '#000000'; // Bold black ground
    let groundWidth = 100;
    let groundHeight = 50;
    let groundOffset = offset % groundWidth;
    for (let x = -groundWidth + groundOffset; x < width + groundWidth; x += groundWidth) {
        ctx.beginPath();
        ctx.moveTo(x, height - 50);
        ctx.lineTo(x + groundWidth / 2, height - 50 - groundHeight);
        ctx.lineTo(x + groundWidth, height - 50);
        ctx.closePath();
        ctx.fill();
    }

    // Abstract Trees or Poles
    ctx.fillStyle = '#333333'; // Dark abstract shapes
    let treeSpacing = 200;
    let treeOffset = offset % treeSpacing;
    for (let x = -treeSpacing + treeOffset; x < width + treeSpacing; x += treeSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + 20, height - 100);
        ctx.lineTo(x + 30, height - 200);
        ctx.lineTo(x + 40, height - 100);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}
