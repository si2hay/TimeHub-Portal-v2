/**
 * @file src/ui/schedule.ui.js
 * @description Отрисовка карточек расписания, скелетонов и полного расписания.
 */
import { getBellsForGroup } from '../features/bells.logic.js';
import { getDayNameRus } from '../features/date.logic.js';

export function renderSkeleton() {
    const container = document.createElement('div');
    container.className = 'schedule-slide-content';
    
    for (let i = 0; i < 4; i++) {
        const card = document.createElement('div');
        card.className = 'schedule-card glass-panel skeleton-card';
        card.innerHTML = `
            <div class="lesson-time skeleton-block" style="width: 90px; border-right: none;"></div>
            <div class="lesson-info">
                <div class="skeleton-block" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                <div class="skeleton-block" style="width: 40%; height: 14px;"></div>
            </div>
        `;
        container.appendChild(card);
    }
    return container;
}

export function renderSchedule(lessons, userGroup) {
    const container = document.createElement('div');
    container.className = 'schedule-slide-content';

    if (!lessons || lessons.length === 0) {
        // КРАСИВОЕ ПУСТОЕ СОСТОЯНИЕ С КОФЕ
        container.innerHTML = `
            <div class="glass-panel empty-schedule">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px; opacity: 0.6;">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
                <div>На этот день пар нет 🎉</div>
            </div>
        `;
        return container;
    }

    const bells = getBellsForGroup(userGroup);

    lessons.forEach((lesson, index) => {
        const bell = bells.find(b => b.pair === lesson.pair_num);
        const timeStart = lesson.custom_start || (bell ? bell.start : '');
        const timeEnd = lesson.custom_end || (bell ? bell.end : '');

        const isSub = lesson.is_substitution;
        const cardClass = isSub ? 'schedule-card glass-panel is-substitution' : 'schedule-card glass-panel';
        const badge = isSub ? '<div class="badge-substitution">Замена</div>' : '';

        const card = document.createElement('div');
        card.className = cardClass;
        card.style.animationDelay = `0s`;

        card.innerHTML = `
            ${badge}
            <div class="lesson-time">
                <div class="lesson-num">${lesson.pair_num}</div>
                <div class="lesson-clock">${timeStart} - ${timeEnd}</div>
            </div>
            <div class="lesson-info">
                <div class="lesson-subject">${lesson.subject}</div>
                <div class="lesson-details">
                    <span class="lesson-room">📍 ${lesson.room}</span>
                    ${lesson.teacher ? `<span class="lesson-teacher">👤 ${lesson.teacher}</span>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    return container;
}

export function renderFullSchedule(groupName, weeksData) {
    const container = document.createElement('div');
    container.className = 'full-schedule-container';

    weeksData.forEach(week => {
        const weekHeader = document.createElement('h3');
        weekHeader.className = 'full-schedule-week-title';
        weekHeader.textContent = `${week.weekNum} неделя`;
        container.appendChild(weekHeader);

        week.days.forEach(day => {
            const dayHeader = document.createElement('h4');
            dayHeader.className = 'full-schedule-day-title';
            dayHeader.textContent = getDayNameRus(day.dayNum);
            container.appendChild(dayHeader);

            const scheduleContent = renderSchedule(day.lessons, groupName);
            container.appendChild(scheduleContent);
        });
    });

    return container;
}