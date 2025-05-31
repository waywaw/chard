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

// 🌄 Scene management for backgrounds
let scenes = [];
let currentScene = null;

function createScenes() {
    scenes = [
        {
            name: "Desert Highway",
            palette: ["#ffcc00", "#cc6600", "#663300"],
            layers: generateDesertLayers()
        },
        {
            name: "City Skyline",
            palette: ["#0c1445", "#1b1f77", "#3c67c7"],
            layers: generateCityLayers()
        },
        {
            name: "Beach Horizon",
            palette: ["#00aaff", "#005577", "#ffddaa"],
            layers: generateBeachLayers()
        },
        {
            name: "Mountain Plains",
            palette: ["#88bb88", "#446644", "#224422"],
            layers: generateMountainLayers()
        },
        {
            name: "Wasteland",
            palette: ["#777777", "#999999", "#333333"],
            layers: generateWastelandLayers()
        }
    ];
    pickRandomScene();
}

function pickRandomScene() {
    currentScene = scenes[Math.floor(Math.random() * scenes.length)];
}

function getRandom(min, max) {
    return min + Math.random() * (max - min);
}

function generateDesertLayers() {
    return [
        { speed: 0.2, elements: generateRectangles(5, 50, 300) },
        { speed: 0.5, elements: generateTriangles(8, 100, 150) },
        { speed: 1, elements: generateCacti(10) }
    ];
}

function generateCityLayers() {
    return [
        { speed: 0.2, elements: generateRectangles(7, 150, 400) },
        { speed: 0.5, elements: generateRectangles(10, 100, 300) },
        { speed: 1, elements: generatePalmTrees(12) }
    ];
}

function generateBeachLayers() {
    return [
        { speed: 0.2, elements: generateHorizon() },
        { speed: 0.5, elements: generateWaves(10) }
    ];
}

function generateMountainLayers() {
    return [
        { speed: 0.2, elements: generateTriangles(6, 200, 400) },
        { speed: 0.5, elements: generateTriangles(10, 150, 250) }
    ];
}

function generateWastelandLayers() {
    return [
        { speed: 0.2, elements: generateRectangles(3, 50, 200) },
        { speed: 0.5, elements: generateBrokenRoad(8) }
    ];
}

function generateRectangles(count, minHeight, maxHeight) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push({
            type: "rect",
            x: getRandom(0, width),
            y: height - getRandom(minHeight, maxHeight),
            width: 20 + Math.random() * 30,
            height: getRandom(minHeight, maxHeight)
        });
    }
    return arr;
}

function generateTriangles(count, minHeight, maxHeight) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push({
            type: "tri",
            x: getRandom(0, width),
            y: height,
            width: 40 + Math.random() * 60,
            height: getRandom(minHeight, maxHeight)
        });
    }
    return arr;
}

function generateCacti(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push({
            type: "rect",
            x: getRandom(0, width),
            y: height - 100,
            width: 10,
            height: 50
        });
    }
    return arr;
}

function generatePalmTrees(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push({
            type: "rect",
            x: getRandom(0, width),
            y: height - 150,
            width: 8,
            height: 100
        });
    }
    return arr;
}

function generateHorizon() {
    return [{
        type: "horizon",
        x: 0,
        y: height - 100,
        width: width,
        height: 10
    }];
}

function generateWaves(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push({
            type: "wave",
            x: getRandom(0, width),
            y: height - 90 + Math.sin(i) * 10,
            width: 100,
            height: 20
        });
    }
    return arr;
}

function generateBrokenRoad(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push({
            type: "rect",
            x: getRandom(0, width),
            y: height - 50,
            width: 100,
            height: 10
        });
    }
    return arr;
}

function drawSceneBackground(ctx) {
    if (!currentScene) return;

    ctx.fillStyle = currentScene.palette[0];
    ctx.fillRect(0, 0, width, height);

    currentScene.layers.forEach((layer, idx) => {
        ctx.fillStyle = currentScene.palette[idx % currentScene.palette.length];
        layer.elements.forEach(element => {
            ctx.beginPath();
            if (element.type === "rect") {
                ctx.fillRect(element.x, element.y, element.width, element.height);
            } else if (element.type === "tri") {
                ctx.moveTo(element.x, element.y);
                ctx.lineTo(element.x + element.width / 2, element.y - element.height);
                ctx.lineTo(element.x + element.width, element.y);
                ctx.closePath();
                ctx.fill();
            } else if (element.type === "horizon") {
                ctx.fillRect(element.x, element.y, element.width, element.height);
            } else if (element.type === "wave") {
                ctx.arc(element.x, element.y, 20, 0, Math.PI * 2);
                ctx.fill();
            }
            element.x -= layer.speed * backgroundSpeed;
            if (element.x + element.width < 0) {
                element.x = width + Math.random() * 300;
            }
        });
    });
}

// --- Game Core Variables (coming next)
