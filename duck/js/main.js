import { MAP_LENGTH, TOP_MARGIN, START_LINE, FINISH_LINE, TRACK_LENGTH, HATS, playSound, getRandomY } from './utils.js';
import { RaceLogic } from './raceLogic.js';
import { UIManager } from './uiManager.js';

// --- GAME VARIABLES ---
let ducks = [];
let rocks = []; let bananas = []; let logs = []; // jellyfish = []; whirlpools = []; REMOVED
let isRacing = false;
// let isStormMode = false; // REMOVED

// time-based progress variables
let raceStartTime = 0;
let raceDuration = 0;
let winnerId = -1;

// PRIZE SYSTEM
let prizes = [];
let currentPrizeIndex = -1;

let cameraX = 0;
let waterOffset = 0;
let globalTimer = 0;
let flashOpacity = 0;
let windForce = 0;

let raceLogic = null;
let uiManager = null;

let width = window.innerWidth;
let height = window.innerHeight;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    uiManager = new UIManager(canvas, width, height);

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        uiManager.resize(width, height);
    });

    loadCurrentPrize();

    // Attach global functions for button clicks
    window.startGame = startGame;
    window.resetGame = resetGame;

    requestAnimationFrame(loop);
});

function loadCurrentPrize() {
    const storedPrizes = localStorage.getItem('lucky_draw_prizes');
    if (storedPrizes) {
        prizes = JSON.parse(storedPrizes);
        currentPrizeIndex = prizes.findIndex(p => p.quantity > 0);
        uiManager.updatePrizeUI(prizes, currentPrizeIndex);
    }
}

// --- SPAWNERS ---
function spawnStaticObstacles() {
    bananas = []; logs = []; // whirlpools = []; jellyfish = []; REMOVED
    let qty = ducks.length;
    let mapType = Math.random() < 0.5 ? 'TUNNEL' : 'BRIDGE';

    // Reduce density: Use fixed base + very small scaling with qty
    let logCount = 5 + Math.floor(qty * 0.05);
    logCount = Math.min(logCount, 15);

    for (let i = 0; i < logCount; i++) {
        let lx = START_LINE + 600 + Math.random() * (MAP_LENGTH - 1000);
        let ly;
        if (mapType === 'TUNNEL') { if (Math.random() < 0.7) ly = (i % 2 === 0) ? TOP_MARGIN + 40 : height - 40; else ly = getRandomY(height); }
        else { if (Math.random() < 0.7) ly = (TOP_MARGIN + height) / 2 + (Math.random() - 0.5) * 100; else ly = getRandomY(height); }

        // Simple Log Object
        logs.push({
            x: lx,
            y: ly,
            width: 40,
            height: 140,
            angle: (Math.random() - 0.5) * 0.5
        });
    }

    let bananaCount = 8 + Math.floor(qty * 0.1);
    bananaCount = Math.min(bananaCount, 25);

    for (let i = 0; i < bananaCount; i++) bananas.push({ x: START_LINE + 300 + Math.random() * (MAP_LENGTH - 800), y: getRandomY(height), active: true });

    // console.log(`Spawned: ${logCount} Logs, ${bananaCount} Bananas`); // REMOVED
}

// function spawnWave() { ... } // REMOVED
// function triggerLightning() { ... } // REMOVED

// --- CORE LOOP ---
function loop() {
    if (!uiManager) {
        requestAnimationFrame(loop);
        return;
    }

    if (!isRacing && ducks.length === 0) {
        uiManager.drawWater(0, waterOffset);
        uiManager.drawEnvironment(0);
        requestAnimationFrame(loop);
        return;
    }

    waterOffset += 0.8;
    globalTimer += 0.05;
    if (flashOpacity > 0) flashOpacity -= 0.02;

    if (isRacing && raceLogic) {
        let now = performance.now() / 1000; // seconds
        let isFinished = raceLogic.update(now, logs, bananas);

        // Update Camera
        let maxX = 0;
        ducks.forEach(d => { if (d.x > maxX) maxX = d.x; });

        let targetCam = maxX - width / 3;
        targetCam = Math.max(0, Math.min(targetCam, FINISH_LINE - width + 500));
        cameraX = targetCam;

        // Update UI
        let elapsedMS = (now - raceLogic.startTime) * 1000;
        uiManager.updateTimerUI(elapsedMS);
        uiManager.updateRankUI(ducks);

        if (isFinished) finishGame();
    }

    // Render
    uiManager.clear();
    uiManager.drawWater(cameraX, waterOffset);
    uiManager.drawEnvironment(cameraX);
    uiManager.drawLogs(logs, cameraX);
    // uiManager.drawWhirlpools(whirlpools, cameraX, globalTimer); // REMOVED
    uiManager.drawBananas(bananas, cameraX);
    // uiManager.drawJellyfish(jellyfish, cameraX, globalTimer); // REMOVED
    uiManager.drawRocks(rocks, cameraX);
    uiManager.drawDucks(ducks, cameraX);

    // if (isStormMode) { ... } // REMOVED
    uiManager.drawFlash(flashOpacity, cameraX);

    requestAnimationFrame(loop);
}

// --- GAME FUNCTIONS ---
function startGame() {
    // console.log("Starting game..."); // REMOVED
    loadCurrentPrize(); // Reload to be safe
    if (currentPrizeIndex === -1) { alert("Đã hết giải thưởng!"); return; }
    if (prizes[currentPrizeIndex].quantity <= 0) { alert("Giải này đã hết!"); uiManager.updatePrizeUI(prizes, currentPrizeIndex); return; }

    if (isRacing) return;
    playSound('whistle');

    ducks = []; rocks = []; // waves = []; lightnings = []; windLines = []; // REMOVED
    // isStormMode = Math.random() < 0.3; // REMOVED

    const uiLayer = document.getElementById('ui-layer');
    const alertBox = document.getElementById('scenario-alert');
    // Always Sunny
    uiLayer.style.background = "linear-gradient(to bottom, #0288d1, #01579b)";
    alertBox.innerHTML = `☀️ SUNNY RACE<span>Watch out for Logs, Bananas & Jellyfish!</span>`;
    alertBox.style.background = "rgba(1, 87, 155, 0.9)";
    alertBox.style.border = "3px solid #4fc3f7";
    alertBox.style.transform = "translateX(-50%) scale(1)";
    setTimeout(() => { alertBox.style.transform = "translateX(-50%) scale(0)"; }, 3000);

    let qty = parseInt(document.getElementById('inp-qty').value);
    // console.log("Quantity:", qty); // REMOVED

    let timeSec = parseInt(document.getElementById('inp-time').value) || 30;
    raceDuration = timeSec;

    winnerId = Math.floor(Math.random() * qty) + 1;
    // console.log("Winner: #" + winnerId); // REMOVED

    let availableHeight = height - TOP_MARGIN - 100;
    let laneHeight = availableHeight / qty;

    let ranks = Array.from({ length: qty }, (_, i) => i + 1);
    for (let i = ranks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
    }

    let rank1Idx = ranks.indexOf(1);
    let winnerIdx = winnerId - 1;

    if (rank1Idx !== -1) {
        ranks[rank1Idx] = ranks[winnerIdx];
        ranks[winnerIdx] = 1;
    }

    for (let i = 0; i < qty; i++) {
        let x = START_LINE;
        let y = TOP_MARGIN + 50 + (i * laneHeight);

        ducks.push({
            id: i + 1,
            initY: y,
            rank: ranks[i],
            randomSeed: Math.floor(Math.random() * 10000),
            hat: HATS[Math.floor(Math.random() * HATS.length)],
            status: 'NORMAL',
            statusTimer: 0,
            visualAngle: 0,
            x: x,
            y: y,
            penaltyX: 0
        });
    }

    raceLogic = new RaceLogic(raceDuration, TRACK_LENGTH, ducks);
    raceLogic.start();

    spawnStaticObstacles();
    isRacing = true;
    document.getElementById('winner-screen').style.display = 'none';
    // console.log("Game started successfully with " + ducks.length + " ducks."); // REMOVED
}

function finishGame() {
    isRacing = false;
    playSound('win');
    let winner = ducks.find(d => d.id === winnerId);
    if (winner) {
        document.getElementById('win-name').innerText = "Vịt #" + winner.id;
        document.getElementById('winner-screen').style.display = 'flex';
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        uiManager.drawWinnerAvatar(winner);

        let prizeName = "Vô Địch";
        let prizeItem = "";

        if (currentPrizeIndex !== -1) {
            const p = prizes[currentPrizeIndex];
            prizeName = p.name;
            prizeItem = p.item;

            prizes[currentPrizeIndex].quantity--;
            localStorage.setItem('lucky_draw_prizes', JSON.stringify(prizes));
            uiManager.updatePrizeUI(prizes, currentPrizeIndex);
        }

        saveWinnerToSystem({
            name: "Vịt #" + winner.id,
            id: "",
            prize: prizeName,
            prizeItem: prizeItem,
            timestamp: Date.now(),
            gameType: "Đua Vịt"
        });
    }
}

function saveWinnerToSystem(winnerData) {
    let winners = JSON.parse(localStorage.getItem('lucky_draw_winners') || '[]');
    winners.push(winnerData);
    localStorage.setItem('lucky_draw_winners', JSON.stringify(winners));
    // console.log("Saved winner:", winnerData); // REMOVED
}

function resetGame() {
    isRacing = false;
    ducks = []; rocks = []; bananas = []; logs = []; // jellyfish = []; whirlpools = []; REMOVED
    document.getElementById('timer').innerText = "00:00.0";
    document.getElementById('winner-screen').style.display = 'none';
    document.getElementById('scenario-alert').style.transform = "translateX(-50%) scale(0)";
    document.getElementById('rank-list').innerHTML = "---";
    document.getElementById('ui-layer').style.background = "linear-gradient(to bottom, #0288d1, #01579b)";
    cameraX = 0;

    uiManager.clear();
    uiManager.drawWater(0, 0);
    uiManager.drawEnvironment(0);
}
