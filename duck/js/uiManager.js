import { TOP_MARGIN, START_LINE, FINISH_LINE } from './utils.js';

export class UIManager {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawWater(camX, waterOffset) {
        this.ctx.fillStyle = "#4fc3f7";
        this.ctx.fillRect(0, 0, this.width, this.height);
        // Sparkles removed
    }

    drawEnvironment(camX) {
        this.ctx.save();
        this.ctx.translate(-camX, 0);

        this.ctx.fillStyle = "#689f38";
        // Grass strip removed
        this.ctx.fillStyle = "#5d4037";
        // Trees removed
        for (let y = TOP_MARGIN; y < this.height; y += 20) {
            this.ctx.fillStyle = ((y / 20) % 2 === 0) ? "black" : "white";
            this.ctx.fillRect(START_LINE, y, 20, 20);
            this.ctx.fillStyle = ((y / 20) % 2 === 0) ? "white" : "black";
            this.ctx.fillRect(START_LINE + 20, y, 20, 20);
        }
        for (let y = TOP_MARGIN; y < this.height; y += 40) {
            this.ctx.fillStyle = ((y / 40) % 2 === 0) ? "black" : "white";
            this.ctx.fillRect(FINISH_LINE, y, 40, 40);
            this.ctx.fillStyle = ((y / 40) % 2 === 0) ? "white" : "black";
            this.ctx.fillRect(FINISH_LINE + 40, y, 40, 40);
        }
        this.ctx.fillStyle = "#c62828";
        this.ctx.fillRect(FINISH_LINE - 10, TOP_MARGIN - 20, 10, this.height - TOP_MARGIN);

        this.ctx.restore();
    }

    drawLogs(logs, camX) {
        this.ctx.save();
        this.ctx.translate(-camX, 0);
        this.ctx.fillStyle = "#795548";
        this.ctx.strokeStyle = "#3e2723";
        this.ctx.lineWidth = 2;
        logs.forEach(l => {
            this.ctx.save();
            this.ctx.translate(l.x, l.y);
            this.ctx.rotate(l.angle);
            this.ctx.beginPath();
            this.ctx.roundRect(-20, -70, 40, 140, 10);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(-10, -50);
            this.ctx.lineTo(-10, 50);
            this.ctx.stroke();
            this.ctx.restore();
        });
        this.ctx.restore();
    }

    // drawJellyfish(jellyfish, camX, globalTimer) { ... } // REMOVED
    // drawWhirlpools(whirlpools, camX, globalTimer) { ... } // REMOVED

    drawBananas(bananas, camX) {
        this.ctx.save();
        this.ctx.translate(-camX, 0);
        this.ctx.font = "24px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        bananas.forEach(b => {
            if (b.active) this.ctx.fillText("🍌", b.x, b.y);
        });
        this.ctx.restore();
    }

    drawRocks(rocks, camX) {
        this.ctx.save();
        this.ctx.translate(-camX, 0);
        this.ctx.font = "30px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        rocks.forEach(r => {
            this.ctx.save();
            this.ctx.translate(r.position.x, r.position.y);
            this.ctx.rotate(r.angle);
            this.ctx.fillText("🪨", 0, 0);
            this.ctx.restore();
        });
        this.ctx.restore();
    }

    drawDucks(ducks, camX) {
        this.ctx.save();
        this.ctx.translate(-camX, 0);
        ducks.forEach(d => {
            let x = d.x, y = d.y;
            let angle = (d.status === 'SLIPPING' || d.status === 'SPINNING' || d.status === 'SHOCKED') ? d.visualAngle : 0;
            if (d.status === 'HIT_LOG') angle = -0.5;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            if (d.status === 'SLIPPING') { this.ctx.font = "20px Arial"; this.ctx.fillText("💫", 0, -35); }
            // if (d.status === 'SPINNING') { ... } // REMOVED
            // if (d.status === 'SHOCKED') { ... } // REMOVED
            if (d.status === 'ZAPPED') { this.ctx.font = "20px Arial"; this.ctx.fillText("🔥", 0, -35); }
            if (d.status === 'HIT_LOG') { this.ctx.font = "20px Arial"; this.ctx.fillText("💢", 0, -35); }

            this.ctx.shadowColor = "rgba(0,0,0,0.2)"; this.ctx.shadowBlur = 4; this.ctx.shadowOffsetY = 2;
            this.ctx.fillStyle = (d.status === 'ZAPPED') ? "#212121" : "#ffeb3b";
            // if (d.status === 'SHOCKED') this.ctx.fillStyle = "#fff59d"; // REMOVED
            this.ctx.beginPath(); this.ctx.ellipse(0, 5, 22, 14, 0, 0, Math.PI * 2); this.ctx.arc(10, -10, 15, 0, Math.PI * 2); this.ctx.moveTo(-10, 0); this.ctx.lineTo(-30, -8); this.ctx.lineTo(-20, 8); this.ctx.fill();
            this.ctx.shadowBlur = 0; this.ctx.shadowOffsetY = 0; this.ctx.lineWidth = 1.5; this.ctx.strokeStyle = "#f57f17"; this.ctx.stroke();
            this.ctx.fillStyle = (d.status === 'ZAPPED') ? "#424242" : "#fbc02d";
            this.ctx.beginPath(); this.ctx.ellipse(-5, 5, 12, 7, 0.2, 0, Math.PI * 2); this.ctx.fill(); this.ctx.stroke();
            this.ctx.fillStyle = "#ff6f00"; this.ctx.beginPath(); this.ctx.moveTo(22, -8); this.ctx.quadraticCurveTo(35, -12, 35, -5); this.ctx.quadraticCurveTo(30, -2, 22, -5); this.ctx.fill(); this.ctx.stroke();
            this.ctx.fillStyle = "white"; this.ctx.beginPath(); this.ctx.arc(14, -12, 5, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.fillStyle = "black"; this.ctx.beginPath(); this.ctx.arc(15, -12, 2, 0, Math.PI * 2); this.ctx.fill();
            if (d.hat) { this.ctx.fillStyle = d.hat; this.ctx.lineWidth = 1; this.ctx.strokeStyle = "black"; this.ctx.beginPath(); this.ctx.rect(6, -30, 10, 8); this.ctx.rect(2, -22, 18, 4); this.ctx.fill(); this.ctx.stroke(); }
            this.ctx.fillStyle = "white"; this.ctx.fillRect(-18, 2, 20, 16); this.ctx.strokeRect(-18, 2, 20, 16);
            this.ctx.fillStyle = "black"; this.ctx.font = "bold 11px Arial"; this.ctx.textAlign = "center"; this.ctx.textBaseline = "middle"; this.ctx.fillText(d.id, -8, 10);
            this.ctx.restore();
        });
        this.ctx.restore();
    }

    // drawWaves(waves, camX) { ... } // REMOVED
    // drawRain(camX) { ... } // REMOVED
    // drawWindLines(windLines, camX) { ... } // REMOVED
    // drawLightnings(lightnings, camX) { ... } // REMOVED

    drawFlash(flashOpacity, camX) {
        if (flashOpacity > 0) {
            this.ctx.save();
            this.ctx.translate(-camX, 0);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
            this.ctx.fillRect(camX, 0, this.width, this.height);
            this.ctx.restore();
        }
    }

    updateTimerUI(elapsed) {
        let ms = Math.floor((elapsed % 1000) / 100);
        let s = Math.floor((elapsed / 1000) % 60);
        let m = Math.floor(elapsed / 60000);
        document.getElementById('timer').innerText = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s) + "." + ms;
    }

    updateRankUI(ducks) {
        let sorted = [...ducks].sort((a, b) => b.x - a.x);
        let html = "";
        for (let i = 0; i < Math.min(5, sorted.length); i++) {
            html += `<div class="r-item"><span class="${i === 0 ? 'r-1' : ''}">#${sorted[i].id}</span></div>`;
        }
        document.getElementById('rank-list').innerHTML = html;
    }

    updatePrizeUI(prizes, currentPrizeIndex) {
        const nameEl = document.getElementById('prize-name');
        const countEl = document.getElementById('prize-count');
        const startBtn = document.getElementById('btn-start');

        if (currentPrizeIndex !== -1) {
            const p = prizes[currentPrizeIndex];
            nameEl.innerText = p.name;
            countEl.innerText = `Còn lại: ${p.quantity}`;
            startBtn.style.opacity = "1";
            startBtn.style.pointerEvents = "auto";
        } else {
            nameEl.innerText = "HẾT QUÀ";
            countEl.innerText = "Vui lòng nạp thêm";
            startBtn.style.opacity = "0.5";
            startBtn.style.pointerEvents = "none";
        }
    }

    drawWinnerAvatar(duck) {
        const c = document.getElementById('win-canvas');
        const cx = c.getContext('2d');
        cx.clearRect(0, 0, c.width, c.height);

        cx.save();
        cx.translate(c.width / 2, c.height / 2);
        cx.scale(3, 3); // Scale up 3x

        // Draw Duck (Simplified version of drawDucks)
        cx.shadowColor = "rgba(0,0,0,0.2)"; cx.shadowBlur = 4; cx.shadowOffsetY = 2;
        cx.fillStyle = "#ffeb3b";
        cx.beginPath(); cx.ellipse(0, 5, 22, 14, 0, 0, Math.PI * 2); cx.arc(10, -10, 15, 0, Math.PI * 2); cx.moveTo(-10, 0); cx.lineTo(-30, -8); cx.lineTo(-20, 8); cx.fill();
        cx.shadowBlur = 0; cx.shadowOffsetY = 0; cx.lineWidth = 1.5; cx.strokeStyle = "#f57f17"; cx.stroke();
        cx.fillStyle = "#fbc02d";
        cx.beginPath(); cx.ellipse(-5, 5, 12, 7, 0.2, 0, Math.PI * 2); cx.fill(); cx.stroke();
        cx.fillStyle = "#ff6f00"; cx.beginPath(); cx.moveTo(22, -8); cx.quadraticCurveTo(35, -12, 35, -5); cx.quadraticCurveTo(30, -2, 22, -5); cx.fill(); cx.stroke();
        cx.fillStyle = "white"; cx.beginPath(); cx.arc(14, -12, 5, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = "black"; cx.beginPath(); cx.arc(15, -12, 2, 0, Math.PI * 2); cx.fill();
        if (duck.hat) { cx.fillStyle = duck.hat; cx.lineWidth = 1; cx.strokeStyle = "black"; cx.beginPath(); cx.rect(6, -30, 10, 8); cx.rect(2, -22, 18, 4); cx.fill(); cx.stroke(); }
        cx.fillStyle = "white"; cx.fillRect(-18, 2, 20, 16); cx.strokeRect(-18, 2, 20, 16);
        cx.fillStyle = "black"; cx.font = "bold 11px Arial"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(duck.id, -8, 10);

        cx.restore();
    }
}
