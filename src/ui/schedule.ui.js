/**
 * @file src/ui/schedule.ui.js
 * @description Отрисовка карточек расписания и скелетонов загрузки.
 */
import { getBellsForGroup } from '../features/bells.logic.js';

export function renderSkeleton() {
    const container = document.createElement('div');
    container.className = 'schedule-slide-content';
    
    // Создаем 4 карточки-заглушки
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
        container.innerHTML = `<div class="glass-panel empty-schedule">На этот день пар нет 🎉</div>`;
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
        card.style.animationDelay = `${index * 0.05}s`;

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