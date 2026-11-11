/**
 * @file src/features/bells.logic.js
 * @description Логика выбора расписания звонков в зависимости от курса.
 * Группы, начинающиеся с "26", — первый курс. Всё остальное (25, 24, 23) — 2+.
 * @exports getBellsForGroup
 */
import { BELLS } from '../constants/bells.js';

export function getBellsForGroup(groupName) {
    const name = (groupName || '').trim();
    if (name.startsWith('26')) {
        return BELLS.course1;
    }
    return BELLS.course2plus;
}