import { START_LINE, playSound } from './utils.js';

export class RaceLogic {
    constructor(duration, distance, ducks) {
        this.duration = duration; // seconds
        this.distance = distance; // pixels
        this.ducks = ducks;
        this.startTime = 0;
        this.lastTime = 0;
    }

    start() {
        this.startTime = performance.now() / 1000; // seconds
        this.lastTime = this.startTime;
    }

    update(currentTime, logs, bananas) {
        // currentTime is in seconds
        let dt = currentTime - this.lastTime;
        this.lastTime = currentTime;

        let elapsed = currentTime - this.startTime;
        let t = elapsed / this.duration;

        // Clamp t to [0, 1] for position calculation, but allow it to go slightly over for finish check
        let clampedT = Math.min(Math.max(t, 0), 1);

        // 1. Linear Progress (The Anchor)
        let baseX = clampedT * this.distance;
        let raceSpeed = this.distance / this.duration; // pixels per second

        this.ducks.forEach(duck => {
            // Initialize penaltyX if not exists
            if (typeof duck.penaltyX === 'undefined') duck.penaltyX = 0;

            // --- COLLISION CHECK ---
            if (duck.status === 'NORMAL') {
                // Check Logs
                for (let log of logs) {
                    let dx = Math.abs(duck.x - log.x);
                    let dy = Math.abs(duck.y - log.y);
                    if (dx < 35 && dy < 75) {
                        duck.status = 'HIT_LOG';
                        duck.stunTimer = 1.0; // 1 second stun
                        duck.lastLogY = log.y;
                        duck.visualAngle = -0.3;
                        playSound('hit');
                    }
                }
                // Check Bananas
                for (let b of bananas) {
                    if (b.active && Math.hypot(duck.x - b.x, duck.y - b.y) < 25) {
                        duck.status = 'SLIPPING';
                        duck.stunTimer = 0.6;
                        duck.visualAngle = 0.5;
                        playSound('slip');
                        b.active = false;
                        break;
                    }
                }
                // Check Jellyfish - REMOVED
                // Check Whirlpools - REMOVED
            }

            // --- PENALTY & STATUS LOGIC ---
            if (duck.status !== 'NORMAL') {
                duck.stunTimer -= dt;

                // While stunned, fall back relative to the race
                // We apply a negative penalty that grows
                duck.penaltyX -= raceSpeed * dt * 0.9;

                // Visual rotation updates
                if (duck.status === 'SLIPPING') duck.visualAngle += 15 * dt;
                // else if (duck.status === 'SPINNING') duck.visualAngle += 20 * dt; // REMOVED

                if (duck.stunTimer <= 0) {
                    duck.status = 'NORMAL';
                    duck.visualAngle = 0;
                    // Escape maneuver for logs
                    if (duck.lastLogY) {
                        let escapeDir = (duck.y > duck.lastLogY) ? 1 : -1;
                        duck.separationOffsetY = (duck.separationOffsetY || 0) + escapeDir * 50;
                        duck.lastLogY = null;
                    }
                }
            } else {
                // Recovery: Rubber band back to position
                // Winner recovers faster to ensure they win
                let recoveryRate = raceSpeed * dt * 0.5; // Base recovery
                if (duck.rank === 1) recoveryRate *= 4.0; // Winner super recovery
                else if (duck.rank <= 5) recoveryRate *= 2.0; // Top 5 recover well

                if (duck.penaltyX < 0) {
                    duck.penaltyX += recoveryRate;
                    if (duck.penaltyX > 0) duck.penaltyX = 0;
                }

                // Decay visual angle
                duck.visualAngle *= 0.9;
            }

            // 2. X-Axis Noise (Speed Variation)
            // Lower Frequency: 0.5 to 1.5 (Smoother acceleration)
            // Lower Amplitude: 0.5% to 1.5% of distance (Less rubber-banding)
            let frequency = 0.5 + (duck.randomSeed % 10) / 10;
            let amplitude = this.distance * (0.005 + (duck.randomSeed % 10) / 1000);

            // Use Cosine for variety or keep Sine. 
            // Adding a secondary low-freq wave for "stamina" variation
            let staminaFreq = 0.1 + (duck.randomSeed % 5) / 20;
            let staminaAmp = this.distance * 0.02; // Larger but very slow variation

            let noiseX = Math.sin(elapsed * frequency + duck.randomSeed) * amplitude;
            let staminaX = Math.sin(elapsed * staminaFreq) * staminaAmp;

            // Combine noises
            let totalNoise = noiseX + staminaX;

            // Damping: Reduce noise as t approaches 1 to ensure they finish near their rank
            totalNoise *= (1 - Math.pow(clampedT, 2)); // Quadratic damping for smoother finish

            // 3. Rank Bias (The Rigging)
            // Bonus for winner (Rank 1), penalty for loser (Rank N)
            // Bias increases quadratically with t
            let biasX = 0;
            let rankFactor = (this.ducks.length - duck.rank) / this.ducks.length; // 1 (best) to 0 (worst)

            // Reduce bias impact slightly to keep them closer
            if (duck.rank === 1) {
                biasX = (this.distance * 0.03) * (clampedT * clampedT);
            } else if (duck.rank === this.ducks.length) {
                biasX = -(this.distance * 0.03) * (clampedT * clampedT);
            } else {
                biasX = (this.distance * 0.015) * (rankFactor - 0.5) * (clampedT * clampedT);
            }

            // 4. Final Position Calculation
            // Include penaltyX
            let finalX = baseX + totalNoise + biasX + duck.penaltyX;

            if (clampedT >= 1) {
                finalX = Math.min(finalX, this.distance);
            }

            finalX = Math.max(0, finalX);

            // Y-Axis Bobbing (Pure Visual)
            // Slower bobbing for "swimming" feel
            let bobSpeed = 2 + (duck.randomSeed % 3);
            let bobHeight = 3; // Reduced height
            let bobY = Math.sin(elapsed * bobSpeed) * bobHeight;

            // Apply separation offset (decaying)
            if (duck.separationOffsetY) {
                bobY += duck.separationOffsetY;
                duck.separationOffsetY *= 0.95;
            }

            duck.x = START_LINE + finalX;
            duck.y = duck.initY + bobY;
        });

        return t >= 1; // Return true if race finished
    }
}
