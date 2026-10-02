// Constants
export const MAP_LENGTH = 8000;
export const TOP_MARGIN = 100;
export const START_LINE = 200;
export const FINISH_LINE = MAP_LENGTH - 400;
export const TRACK_LENGTH = FINISH_LINE - START_LINE;

export const HATS = ['#e53935', '#8e24aa', '#1e88e5', '#43a047', '#333', '#fbc02d', null, null, null];

// Helper Functions
export function playSound(type) {
    // Audio removed as per user request
}

export function easeOutCubic(t) { 
    return 1 - Math.pow(1 - t, 3); 
}

export function clamp(val, min, max) { 
    return Math.min(Math.max(val, min), max); 
}

export function getRandomY(height) {
    let seed = Math.random();
    if (seed < 0.3) return TOP_MARGIN + 10 + Math.random() * 50;
    else if (seed > 0.7) return height - 10 - Math.random() * 50;
    else return TOP_MARGIN + 60 + Math.random() * (height - TOP_MARGIN - 120);
}
