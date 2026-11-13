/**
 * @file src/features/date.logic.js
 */
import { getDebugState } from './debug.logic.js';

export function getNow() {
    const debug = getDebugState();
    if (debug.enabled) {
        const now = new Date();
        if (debug.date) {
            const [y, m, d] = debug.date.split('-');
            now.setFullYear(parseInt(y), parseInt(m) - 1, parseInt(d));
        }
        if (debug.time) {
            const [h, min] = debug.time.split(':');
            now.setHours(parseInt(h), parseInt(min), 0, 0);
        }
        return now;
    }
    return new Date();
}

export function getCurrentWeek() {
    const debug = getDebugState();
    if (debug.enabled && debug.date) {
        return getWeekForDate(debug.date);
    }
    const startDate = new Date("2026-10-26T00:00:00");
    const now = getNow();
    const diffTime = now - startDate; 
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return (Math.floor(diffDays / 7) % 2) + 1;
}

export function getCurrentDay() {
    const debug = getDebugState();
    if (debug.enabled && debug.date) {
        const d = new Date(debug.date).getDay();
        return d === 0 ? 7 : d; // 0 (вс) -> 7
    }
    const day = getNow().getDay();
    return day === 0 ? 7 : day; // Теперь возвращает реальный день 1-7
}

export function getTodayDateString() {
    const now = getNow();
    const offset = now.getTimezoneOffset() * 60000;
    return (new Date(now - offset)).toISOString().split('T')[0];
}

export function formatDateRus(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
}

export function getDateByWeekOffset(offset) {
    const now = getNow();
    const target = new Date(now);
    target.setDate(target.getDate() + (offset * 7));
    const tzOffset = target.getTimezoneOffset() * 60000;
    return (new Date(target - tzOffset)).toISOString().split('T')[0];
}

export function getDateForDayAndWeek(dayNum, weekOffset) {
    const now = getNow();
    const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDayOfWeek - 1) + (weekOffset * 7));
    const target = new Date(monday);
    target.setDate(monday.getDate() + (dayNum - 1));
    const tzOffset = target.getTimezoneOffset() * 60000;
    return (new Date(target - tzOffset)).toISOString().split('T')[0];
}

export function getWeekForDate(dateStr) {
    const startDate = new Date("2026-10-26T00:00:00");
    const targetDate = new Date(dateStr);
    const diffTime = targetDate - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return (Math.floor(diffDays / 7) % 2) + 1;
}

export function getDayOfWeekFromDate(dateStr) {
    const date = new Date(dateStr);
    let day = date.getDay();
    if (day === 0 || day === 6) return 1;
    return day;
}

export function getWeekByOffset(offset) {
    const baseWeek = getCurrentWeek();
    let w = (baseWeek - 1 + offset) % 2;
    if (w < 0) w += 2;
    return w + 1;
}

export function getDayNameRus(dayNum) {
    const days = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return days[dayNum] || '';
}

export function getDayNameRusAccusative(dayNum) {
    const days = ['', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу', 'в воскресенье'];
    return days[dayNum] || '';
}

export function getDayShortRus(dayNum) {
    const days = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days[dayNum] || '';
}