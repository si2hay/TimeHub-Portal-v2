/**
 * @file src/features/streak.logic.js
 * @description Логика подсчета стрика (огонька) с учетом 36-часового сброса.
 */

const HOURS_TO_RESET = 36;
const MS_IN_HOUR = 60 * 60 * 1000;

/**
 * Обновляет стрик на основе времени последнего визита.
 * @param {number} currentStreak - текущее значение стрика
 * @param {number|null} lastVisitTimestamp - timestamp последнего визита (в мс)
 * @returns {{ newStreak: number, isUpdated: boolean }}
 */
export function updateStreak(currentStreak, lastVisitTimestamp) {
    const now = Date.now();
    
    // Если это первый заход (нет timestamp)
    if (!lastVisitTimestamp) {
        return { newStreak: 1, isUpdated: true };
    }

    const diffHours = (now - lastVisitTimestamp) / MS_IN_HOUR;

    // Если прошло больше 36 часов — сбрасываем
    if (diffHours > HOURS_TO_RESET) {
        return { newStreak: 1, isUpdated: true };
    }

    // Если прошло от 12 до 36 часов — это новый день, увеличиваем
    if (diffHours >= 12 && diffHours <= HOURS_TO_RESET) {
        return { newStreak: currentStreak + 1, isUpdated: true };
    }

    // Если меньше 12 часов — ничего не меняем (защита от накрутки)
    return { newStreak: currentStreak, isUpdated: false };
}