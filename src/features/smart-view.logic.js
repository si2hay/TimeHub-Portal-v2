/**
 * @file src/features/smart-view.logic.js
 * @description Логика умного выбора дня для стартового экрана.
 * Если сегодня выходной или пары уже прошли — открывает следующий учебный день.
 */
import { getCurrentDay, getNow } from './date.logic.js';
import { getBellsForGroup } from './bells.logic.js';

/**
 * Возвращает стартовый день и смещение недели.
 * @param {string} userGroup - Название группы для выбора звонков.
 * @returns {{ day: number, offset: number }}
 */
export function getSmartViewState(userGroup) {
    const day = getCurrentDay();
    const now = getNow();
    const mins = now.getHours() * 60 + now.getMinutes();
    
    // Если суббота или воскресенье — открываем следующий понедельник
    if (day === 6 || day === 7) return { day: 1, offset: 1 };
    
    const bells = getBellsForGroup(userGroup);
    const lastBell = bells[bells.length - 1];
    
    // Если пары на сегодня уже закончились
    if (lastBell) {
        const [h, m] = lastBell.end.split(':').map(Number);
        if (mins >= h * 60 + m) {
            if (day === 5) return { day: 1, offset: 1 }; // Если пятница — на понедельник
            return { day: day + 1, offset: 0 }; // Иначе — на завтра
        }
    }
    
    // Иначе — сегодня
    return { day: day, offset: 0 };
}