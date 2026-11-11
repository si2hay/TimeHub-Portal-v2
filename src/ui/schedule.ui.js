/**
 * @file src/ui/schedule.ui.js
 * @description Отрисовка карточек расписания.
 * @exports renderSchedule
 */
import { getBellsForGroup } from '../features/bells.logic.js';

export function renderSchedule(lessons, userGroup) {
    if (!lessons || lessons.length === 0) {
        return `<div class="glass-panel" style="text-align:center; color: var(--text-muted); padding: 30px 20px; font-size: 16px;">На этот день пар нет 🎉</div>`;
    }

    const bells = getBellsForGroup(userGroup);

    let html = '';
    lessons.forEach(lesson => {
        const bell = bells.find(b => b.pair === lesson.pair_num);
        const timeStart = lesson.custom_start || (bell ? bell.start : '');
        const timeEnd = lesson.custom_end || (bell ? bell.end : '');

        const isSub = lesson.is_substitution;
        const cardClass = isSub ? 'schedule-card glass-panel is-substitution' : 'schedule-card glass-panel';
        const badge = isSub ? '<div class="badge-substitution">Замена</div>' : '';

        html += `
            <div class="${cardClass}">
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
            </div>
        `;
    });
    return html;
}