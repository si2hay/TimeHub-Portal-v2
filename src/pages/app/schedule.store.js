/**
 * @file src/pages/app/schedule.store.js
 * @description Кеш и загрузка расписания на неделю.
 */
import { getScheduleForDay } from '../../api/schedule.api.js';
import { getSubstitutions } from '../../api/substitution.api.js';
import { getDateForDayAndWeek } from '../../features/date.logic.js';
import { applySubstitutions } from '../../features/substitution.logic.js';

export function createScheduleStore(userGroup) {
    const cache = {};

    return {
        get(weekNum, dayNum) {
            return cache[weekNum]?.[dayNum] || null;
        },
        hasWeek(weekNum) {
            return !!cache[weekNum];
        },
        async loadWeek(weekNum, weekOffset) {
            if (cache[weekNum]) return cache[weekNum];

            const promises = [];
            for (let d = 1; d <= 5; d++) {
                const targetDate = getDateForDayAndWeek(d, weekOffset);
                promises.push(
                    Promise.all([
                        getScheduleForDay(userGroup, weekNum, d),
                        getSubstitutions(targetDate, userGroup)
                    ]).then(([lessons, subs]) => {
                        return { day: d, data: applySubstitutions(lessons, subs) };
                    })
                );
            }

            const results = await Promise.all(promises);
            cache[weekNum] = {};
            results.forEach(res => {
                cache[weekNum][res.day] = res.data;
            });
            return cache[weekNum];
        }
    };
}