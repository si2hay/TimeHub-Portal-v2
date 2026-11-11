/**
 * @file src/features/debug.logic.js
 * @description Управление режимом отладки (DANGER ZONE).
 */

const DEBUG_KEY = 'timehub_debug_state';

export function getDebugState() {
    try {
        const data = localStorage.getItem(DEBUG_KEY);
        return data ? JSON.parse(data) : { enabled: false, date: null, time: null, group: null };
    } catch {
        return { enabled: false, date: null, time: null, group: null };
    }
}

export function setDebugState(state) {
    localStorage.setItem(DEBUG_KEY, JSON.stringify(state));
    window.location.reload(); // Перезагружаем, чтобы применить
}

export function clearDebugState() {
    localStorage.removeItem(DEBUG_KEY);
    window.location.reload();
}