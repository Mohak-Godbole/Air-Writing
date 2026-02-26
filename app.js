/**
 * Air Writing - Real-time hand gesture drawing application
 * Uses MediaPipe Hands for gesture detection
 */

// === DOM Elements ===
const video = document.getElementById('video');
const drawingCanvas = document.getElementById('drawingCanvas');
const ctx = drawingCanvas.getContext('2d');
const modeIndicator = document.getElementById('modeIndicator');
const modeText = document.getElementById('modeText');
const eraserCircle = document.getElementById('eraserCircle');
const permissionOverlay = document.getElementById('permissionOverlay');

// Control elements
const toggleControls = document.getElementById('toggleControls');
const controlsContent = document.getElementById('controlsContent');
const colorBtns = document.querySelectorAll('.color-btn');
const customColor = document.getElementById('customColor');
const pencilSizeSlider = document.getElementById('pencilSize');
const pencilSizeValue = document.getElementById('pencilSizeValue');
const eraserSizeSlider = document.getElementById('eraserSize');
const eraserSizeValue = document.getElementById('eraserSizeValue');
const shapeInput = document.getElementById('shapeInput');
const drawShapeBtn = document.getElementById('drawShapeBtn');
const clearCanvasBtn = document.getElementById('clearCanvas');

// === Configuration ===
const CONFIG = {
    lineColor: '#00f5ff',
    lineWidth: 4,
    lineSmoothness: 0.3,
    minDrawDistance: 3,
    eraserRadius: 40,
    detectionConfidence: 0.7,
    trackingConfidence: 0.5,
    fingerThreshold: 0.04
};

// === State ===
let strokes = [];           // All completed strokes [{points: [], color: '', width: number}]
let currentStroke = [];
let currentMode = 'none';
let lastPoint = null;
let isHandDetected = false;

// === Landmark Indices ===
const LANDMARKS = {
    WRIST: 0,
    THUMB_TIP: 4, THUMB_IP: 3, THUMB_MCP: 2,
    INDEX_TIP: 8, INDEX_PIP: 6, INDEX_MCP: 5,
    MIDDLE_TIP: 12, MIDDLE_PIP: 10, MIDDLE_MCP: 9,
    RING_TIP: 16, RING_PIP: 14, RING_MCP: 13,
    PINKY_TIP: 20, PINKY_PIP: 18, PINKY_MCP: 17,
    PALM_CENTER: 9
};

// === Shape Definitions ===
const SHAPES = {
    circle: (cx, cy, size) => {
        const points = [];
        for (let i = 0; i <= 360; i += 5) {
            const rad = (i * Math.PI) / 180;
            points.push({
                x: cx + Math.cos(rad) * size,
                y: cy + Math.sin(rad) * size
            });
        }
        return points;
    },

    square: (cx, cy, size) => {
        return [
            { x: cx - size, y: cy - size },
            { x: cx + size, y: cy - size },
            { x: cx + size, y: cy + size },
            { x: cx - size, y: cy + size },
            { x: cx - size, y: cy - size }
        ];
    },

    rectangle: (cx, cy, size) => {
        const w = size * 1.5;
        const h = size;
        return [
            { x: cx - w, y: cy - h },
            { x: cx + w, y: cy - h },
            { x: cx + w, y: cy + h },
            { x: cx - w, y: cy + h },
            { x: cx - w, y: cy - h }
        ];
    },

    triangle: (cx, cy, size) => {
        return [
            { x: cx, y: cy - size },
            { x: cx + size, y: cy + size * 0.8 },
            { x: cx - size, y: cy + size * 0.8 },
            { x: cx, y: cy - size }
        ];
    },

    star: (cx, cy, size) => {
        const points = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i * 36 - 90) * Math.PI / 180;
            const r = i % 2 === 0 ? size : size * 0.4;
            points.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r
            });
        }
        points.push(points[0]);
        return points;
    },

    heart: (cx, cy, size) => {
        const points = [];
        for (let i = 0; i <= 360; i += 5) {
            const t = (i * Math.PI) / 180;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            points.push({
                x: cx + (x / 16) * size,
                y: cy + (y / 16) * size
            });
        }
        return points;
    },

    diamond: (cx, cy, size) => {
        return [
            { x: cx, y: cy - size },
            { x: cx + size * 0.6, y: cy },
            { x: cx, y: cy + size },
            { x: cx - size * 0.6, y: cy },
            { x: cx, y: cy - size }
        ];
    },

    hexagon: (cx, cy, size) => {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 30) * Math.PI / 180;
            points.push({
                x: cx + Math.cos(angle) * size,
                y: cy + Math.sin(angle) * size
            });
        }
        points.push(points[0]);
        return points;
    },

    arrow: (cx, cy, size) => {
        return [
            { x: cx, y: cy - size },
            { x: cx + size * 0.5, y: cy },
            { x: cx + size * 0.2, y: cy },
            { x: cx + size * 0.2, y: cy + size },
            { x: cx - size * 0.2, y: cy + size },
            { x: cx - size * 0.2, y: cy },
            { x: cx - size * 0.5, y: cy },
            { x: cx, y: cy - size }
        ];
    },

    pentagon: (cx, cy, size) => {
        const points = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72 - 90) * Math.PI / 180;
            points.push({
                x: cx + Math.cos(angle) * size,
                y: cy + Math.sin(angle) * size
            });
        }
        points.push(points[0]);
        return points;
    }
};

// === Initialize Canvas ===
function initCanvas() {
    drawingCanvas.width = window.innerWidth;
    drawingCanvas.height = window.innerHeight;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = CONFIG.lineColor;
    ctx.lineWidth = CONFIG.lineWidth;
}

// === Control Panel Handlers ===
function initControls() {
    // Toggle controls panel
    toggleControls.addEventListener('click', () => {
        controlsContent.classList.toggle('hidden');
    });

    // Color buttons
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            CONFIG.lineColor = btn.dataset.color;
        });
    });

    // Custom color picker
    customColor.addEventListener('input', (e) => {
        colorBtns.forEach(b => b.classList.remove('active'));
        CONFIG.lineColor = e.target.value;
    });

    // Pencil size
    pencilSizeSlider.addEventListener('input', (e) => {
        CONFIG.lineWidth = parseInt(e.target.value);
        pencilSizeValue.textContent = e.target.value;
    });

    // Eraser size
    eraserSizeSlider.addEventListener('input', (e) => {
        CONFIG.eraserRadius = parseInt(e.target.value);
        eraserSizeValue.textContent = e.target.value;
        eraserCircle.style.width = `${CONFIG.eraserRadius * 2}px`;
        eraserCircle.style.height = `${CONFIG.eraserRadius * 2}px`;
    });

    // Draw shape button
    drawShapeBtn.addEventListener('click', drawShape);

    // Enter key for shape input
    shapeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            drawShape();
        }
    });

    // Clear canvas
    clearCanvasBtn.addEventListener('click', () => {
        strokes = [];
        currentStroke = [];
        renderCanvas();
    });
}

// === Draw Shape ===
function drawShape() {
    const shapeName = shapeInput.value.toLowerCase().trim();
    if (!shapeName) return;

    // Find matching shape
    const shapeKeys = Object.keys(SHAPES);
    const match = shapeKeys.find(key =>
        key.includes(shapeName) || shapeName.includes(key)
    );

    if (match) {
        const cx = drawingCanvas.width / 2;
        const cy = drawingCanvas.height / 2;
        const size = Math.min(drawingCanvas.width, drawingCanvas.height) * 0.15;

        const shapePoints = SHAPES[match](cx, cy, size);

        strokes.push({
            points: shapePoints,
            color: CONFIG.lineColor,
            width: CONFIG.lineWidth
        });

        renderCanvas();
        shapeInput.value = '';
    } else {
        // Provide feedback for unknown shape
        shapeInput.value = '';
        shapeInput.placeholder = 'Unknown shape! Try: circle, star, heart...';
        setTimeout(() => {
            shapeInput.placeholder = 'circle, square, triangle, star, heart...';
        }, 2000);
    }
}

// === Gesture Detection ===
function getFingerStates(landmarks) {
    const states = {
        thumb: false,
        index: false,
        middle: false,
        ring: false,
        pinky: false
    };

    const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
    const thumbIP = landmarks[LANDMARKS.THUMB_IP];
    const thumbMCP = landmarks[LANDMARKS.THUMB_MCP];

    const isRightHand = thumbMCP.x < landmarks[LANDMARKS.PINKY_MCP].x;

    if (isRightHand) {
        states.thumb = thumbTip.x < thumbIP.x;
    } else {
        states.thumb = thumbTip.x > thumbIP.x;
    }

    states.index = landmarks[LANDMARKS.INDEX_TIP].y < landmarks[LANDMARKS.INDEX_PIP].y - CONFIG.fingerThreshold;
    states.middle = landmarks[LANDMARKS.MIDDLE_TIP].y < landmarks[LANDMARKS.MIDDLE_PIP].y - CONFIG.fingerThreshold;
    states.ring = landmarks[LANDMARKS.RING_TIP].y < landmarks[LANDMARKS.RING_PIP].y - CONFIG.fingerThreshold;
    states.pinky = landmarks[LANDMARKS.PINKY_TIP].y < landmarks[LANDMARKS.PINKY_PIP].y - CONFIG.fingerThreshold;

    return states;
}

function classifyGesture(fingerStates) {
    const { thumb, index, middle, ring, pinky } = fingerStates;
    const raisedCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;

    if (raisedCount >= 4 && index && middle && ring) {
        return 'erasing';
    }

    if (index && middle && !ring && !pinky) {
        return 'paused';
    }

    if (index && !middle && !ring && !pinky) {
        return 'drawing';
    }

    return 'paused';
}

// === Drawing Functions ===
function addPoint(x, y) {
    const canvasX = x * drawingCanvas.width;
    const canvasY = y * drawingCanvas.height;

    if (lastPoint) {
        const distance = Math.hypot(canvasX - lastPoint.x, canvasY - lastPoint.y);
        if (distance < CONFIG.minDrawDistance) return;
    }

    currentStroke.push({ x: canvasX, y: canvasY });
    lastPoint = { x: canvasX, y: canvasY };
}

function endStroke() {
    if (currentStroke.length > 1) {
        strokes.push({
            points: [...currentStroke],
            color: CONFIG.lineColor,
            width: CONFIG.lineWidth
        });
    }
    currentStroke = [];
    lastPoint = null;
}

function renderCanvas() {
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Draw all completed strokes with their saved styles
    strokes.forEach(stroke => {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.shadowColor = stroke.color;
        ctx.shadowBlur = 10;
        drawStroke(stroke.points);
    });

    // Draw current stroke with current settings
    if (currentStroke.length > 0) {
        ctx.strokeStyle = CONFIG.lineColor;
        ctx.lineWidth = CONFIG.lineWidth;
        ctx.shadowColor = CONFIG.lineColor;
        ctx.shadowBlur = 10;
        drawStroke(currentStroke);
    }
}

function drawStroke(points) {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
}

// === Eraser Functions ===
function eraseAtPosition(x, y) {
    const canvasX = x * drawingCanvas.width;
    const canvasY = y * drawingCanvas.height;
    const radiusSq = CONFIG.eraserRadius * CONFIG.eraserRadius;

    eraserCircle.style.left = `${(1 - x) * 100}%`;
    eraserCircle.style.top = `${y * 100}%`;

    strokes = strokes.map(stroke => {
        const filteredPoints = stroke.points.filter(point => {
            const dx = point.x - canvasX;
            const dy = point.y - canvasY;
            return (dx * dx + dy * dy) > radiusSq;
        });
        return { ...stroke, points: filteredPoints };
    }).filter(stroke => stroke.points.length > 1);

    currentStroke = currentStroke.filter(point => {
        const dx = point.x - canvasX;
        const dy = point.y - canvasY;
        return (dx * dx + dy * dy) > radiusSq;
    });
}

// === UI Updates ===
function updateModeUI(mode) {
    modeIndicator.className = mode;

    const modeLabels = {
        'drawing': 'Drawing',
        'paused': 'Paused',
        'erasing': 'Erasing',
        'none': 'No Hand',
        'no-hand': 'No Hand'
    };

    modeText.textContent = modeLabels[mode] || 'Ready';

    if (mode === 'erasing') {
        eraserCircle.classList.add('active');
    } else {
        eraserCircle.classList.remove('active');
    }
}

// === MediaPipe Handler ===
function onHandResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        if (isHandDetected) {
            isHandDetected = false;
            endStroke();
            updateModeUI('no-hand');
            currentMode = 'none';
        }
        renderCanvas();
        return;
    }

    isHandDetected = true;
    const landmarks = results.multiHandLandmarks[0];

    const fingerStates = getFingerStates(landmarks);
    const gesture = classifyGesture(fingerStates);

    if (gesture !== currentMode) {
        if (currentMode === 'drawing') {
            endStroke();
        }
        currentMode = gesture;
        updateModeUI(gesture);
    }

    const indexTip = landmarks[LANDMARKS.INDEX_TIP];

    switch (currentMode) {
        case 'drawing':
            addPoint(indexTip.x, indexTip.y);
            break;

        case 'erasing':
            const palmCenter = landmarks[LANDMARKS.PALM_CENTER];
            eraseAtPosition(palmCenter.x, palmCenter.y);
            break;

        case 'paused':
            lastPoint = null;
            break;
    }

    renderCanvas();
}

// === Initialize MediaPipe Hands ===
function initMediaPipe() {
    console.log('Initializing MediaPipe Hands...');
    modeText.textContent = 'Loading AI...';

    try {
        const hands = new Hands({
            locateFile: (file) => {
                console.log(`Loading MediaPipe file: ${file}`);
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: CONFIG.detectionConfidence,
            minTrackingConfidence: CONFIG.trackingConfidence
        });

        hands.onResults(onHandResults);

        const camera = new Camera(video, {
            onFrame: async () => {
                try {
                    await hands.send({ image: video });
                } catch (err) {
                    console.error('Error processing hand frame:', err);
                }
            },
            width: 1280,
            height: 720
        });

        camera.start()
            .then(() => {
                console.log('Camera started successfully');
                modeText.textContent = 'Camera Ready';
                setTimeout(() => updateModeUI('no-hand'), 1000);
            })
            .catch((err) => {
                console.error('Camera start error:', err);
                permissionOverlay.classList.remove('hidden');
                document.querySelector('.permission-content p').textContent =
                    `Camera Error: ${err.message || 'Access denied'}`;
            });

    } catch (err) {
        console.error('MediaPipe initialization error:', err);
        modeText.textContent = 'Init Error';
        alert('Failed to initialize hand tracking: ' + err.message);
    }
}

// === Window Resize Handler ===
function handleResize() {
    const oldWidth = drawingCanvas.width;
    const oldHeight = drawingCanvas.height;

    initCanvas();

    const scaleX = drawingCanvas.width / oldWidth;
    const scaleY = drawingCanvas.height / oldHeight;

    strokes = strokes.map(stroke => ({
        ...stroke,
        points: stroke.points.map(point => ({
            x: point.x * scaleX,
            y: point.y * scaleY
        }))
    }));

    currentStroke = currentStroke.map(point => ({
        x: point.x * scaleX,
        y: point.y * scaleY
    }));

    renderCanvas();
}

// === Initialization ===
function init() {
    initCanvas();
    initControls();
    initMediaPipe();

    window.addEventListener('resize', handleResize);

    function animate() {
        requestAnimationFrame(animate);
    }
    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
