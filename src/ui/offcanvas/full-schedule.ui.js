/**
 * @file src/ui/offcanvas/full-schedule.ui.js
 * @description Модалка полного расписания на 2 недели.
 * Оптимизация: все 10 запросов к БД выполняются параллельно.
 */
import { getScheduleForDay } from '../../api/schedule.api.js';
import { getSubstitutions } from '../../api/substitution.api.js';
import { applySubstitutions } from '../../features/substitution.logic.js';
import { getWeekByOffset, getDateForDayAndWeek } from '../../features/date.logic.js';
import { renderFullSchedule, renderSkeleton } from '../schedule.ui.js';

export function renderFullScheduleSkeleton() {
    const container = document.createElement('div');
    container.className = 'full-schedule-container';

    const w1 = document.createElement('h3');
    w1.className = 'full-schedule-week-title skeleton-block';
    w1.style.width = '100px';
    w1.style.height = '24px';
    w1.style.marginBottom = '15px';
    w1.style.borderBottom = 'none';
    container.appendChild(w1);

    const d1 = document.createElement('h4');
    d1.className = 'full-schedule-day-title skeleton-block';
    d1.style.width = '80px';
    d1.style.height = '16px';
    d1.style.marginBottom = '10px';
    container.appendChild(d1);
    
    container.appendChild(renderSkeleton());

    const d2 = document.createElement('h4');
    d2.className = 'full-schedule-day-title skeleton-block';
    d2.style.width = '90px';
    d2.style.height = '16px';
    d2.style.marginTop = '20px';
    d2.style.marginBottom = '10px';
    container.appendChild(d2);
    
    container.appendChild(renderSkeleton());
    return container;
}

export async function loadFullScheduleData(userGroup) {
    const promises = [];
    
    for (let w = 0; w < 2; w++) {
        const weekNum = getWeekByOffset(w);
        const daysPromises = [];
        
        for (let d = 1; d <= 5; d++) {
            const targetDate = getDateForDayAndWeek(d, w);
            daysPromises.push(
                Promise.all([
                    getScheduleForDay(userGroup, weekNum, d),
                    getSubstitutions(targetDate, userGroup)
                ]).then(([lessons, subs]) => {
                    return { dayNum: d, lessons: applySubstitutions(lessons, subs) };
                })
            );
        }
        
        promises.push(
            Promise.all(daysPromises).then(days => ({ weekNum, days }))
        );
    }
    
    return await Promise.all(promises);
}

export function renderFullScheduleContent(userGroup, weeksData) {
    const content = renderFullSchedule(userGroup, weeksData);
    content.classList.add('fade-in');
    return content;
}