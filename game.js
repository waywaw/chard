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

const bossFoods = [
    loadImage('assets/burger.svg'),
    loadImage('assets/pizza.svg'),
    loadImage('assets/donut.svg')
];

const backgroundStartImage = loadImage('assets/background.svg');

// Start Sound
const startSound = new Audio('assets/start.mp3');

// Motivational Quotes
const realQuotes = [
    "The journey of a thousand miles begins with one step. — Lao Tzu",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "Strength does not come from physical capacity. It comes from an indomitable will. — Mahatma Gandhi",
    "It always seems impossible until it's done. — Nelson Mandela",
    "Dream big and dare to fail. — Norman Vaughan",
    "What you get by achieving your goals is not as important as what you become by achieving your goals. — Zig Ziglar",
    "Perseverance is not a long race; it's many short races one after the other. — Walter Elliot",
    "Wake up with determination. Go to bed with satisfaction.",
    "Small steps every day lead to big changes.",
    "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
    "Success is walking from failure to failure with no loss of enthusiasm. — Winston Churchill",
    "You miss 100% of the shots you don’t take. — Wayne Gretzky",
    "The only limit to our realization of tomorrow is our doubts of today. — Franklin D. Roosevelt",
    "Health is the greatest gift, contentment the greatest wealth. — Buddha",
    "Happiness is not something ready-made. It comes from your own actions. — Dalai Lama"
];

const randomPhrases = {
    verbs: [
        "Run", "Push", "Jump", "Reach", "Stretch", "Lift", "Dream", "Hustle", "Move", "Shine", "Grow", "Thrive", "Glide", "Sprint"
    ],
    goals: [
        "health", "greatness", "happiness", "strength", "balance", "clarity", "peace", "focus", "purpose", "joy", "freedom"
    ],
    endings: [
        "every step counts.", "you're unstoppable.", "one breath at a time.", "small victories build empires.",
        "your best is yet to come.", "fuel your fire.", "make it happen.", "believe and achieve.",
        "no limits, only milestones.", "step by step, day by day."
    ],
    formats: [
        (v, g, e) => `${v} toward ${g}, ${e}`,
        (v, g, e) => `To achieve ${g}, ${v.toLowerCase()} daily — ${e}`,
        (v, g, e) => `${v} higher. Reach for ${g}. Remember: ${e}`,
        (v, g, e) => `Keep ${v.toLowerCase()} — ${g} awaits. ${e}`
    ]
};

function generateMotivationalQuote() {
    if (Math.random() < 0.5) {
        return realQuotes[Math.floor(Math.random() * realQuotes.length)];
    } else {
        const verb = randomPhrases.verbs[Math.floor(Math.random() * randomPhrases.verbs.length)];
        const goal = randomPhrases.goals[Math.floor(Math.random() * randomPhrases.goals.length)];
        const ending = randomPhrases.endings[Math.floor(Math.random() * randomPhrases.endings.length)];
        const format = randomPhrases.formats[Math.floor(Math.random() * randomPhrases.formats.length)];
        return format(verb, goal, ending);
    }
}

function randomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

let backgroundColor = "#f0f8ff";
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
    maxJumps: 4,
    frameIndex: 0,
    frameSpeed: 12,
    frameCounter: 0,
};

let gameObjects = [];
let trampolines = [];
let bossFood = null;

let gameStarted = false;
let spawnTimer = 0;
let trampolineTimer = 0;
let score = 0;
let scoreTimer = 0;
let currentLevel = 1;

let motivationalText = "";
let motivationalTimer = 0;
let startText = "";

let comboCount = 0;
let gameOver = false;
let highScore = localStorage.getItem('highScore') || 0;

// Parallax Layers
const parallaxLayers = [];
const layerSpeeds = [0.2, 0.5, 1.0];
const shapesPerLayer = 30;
const levelLength = 10000;

function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateParallaxLayers() {
    parallaxLayers.length = 0;
    for (let i = 0; i < 3; i++) {
        const layer = [];
        for (let j = 0; j < shapesPerLayer; j++) {
            layer.push({
                type: Math.random() < 0.5 ? 'circle' : (Math.random() < 0.5 ? 'rect' : 'triangle'),
                x: Math.random() * levelLength,
                y: Math.random() * height,
                size: 50 + Math.random() * 100,
                color: randomColor()
            });
        }
        parallaxLayers.push(layer);
    }
}

function drawParallaxLayers(offset) {
    for (let i = 0; i < parallaxLayers.length; i++) {
        const speed = layerSpeeds[i];
        const layer = parallaxLayers[i];
        layer.forEach(shape => {
            ctx.save();
            ctx.translate(shape.x - offset * speed, shape.y);
            ctx.fillStyle = shape.color;
            if (shape.type === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (shape.type === 'rect') {
                ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
            } else if (shape.type === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(0, -shape.size / 2);
                ctx.lineTo(-shape.size / 2, shape.size / 2);
                ctx.lineTo(shape.size / 2, shape.size / 2);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        });
    }
}

function randomStartText() {
    const starts = [
        "Run for your health.",
        "Stay alive. The run never ends.",
        "Each step is a win.",
        "Healthy life, happy life.",
        "Run toward your best self."
    ];
    startText = starts[Math.floor(Math.random() * starts.length)];
}

randomStartText();

// More functions (update, draw, gameLoop) coming next clean in this full package if you want — ready to continue? ⚡  
✅ **Should I paste the second half immediately?** (Game logic + drawing.)
