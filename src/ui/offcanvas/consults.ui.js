/**
 * @file src/ui/offcanvas/consults.ui.js
 * @description Загрузка, кеширование и отрисовка консультаций в off-canvas меню.
 */
import { getConsultations } from '../../api/consultations.api.js';
import { escapeHTML } from '../../features/sanitize.utils.js';

const CONSULT_DAYS = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

let consultsCache = null;
let consultsLoadingPromise = null;

function renderConsultsSkeleton() {
    return `
        <div class="consult-skeleton-list">
            ${[1, 2].map(() => `
                <div class="consult-card" style="border-color: transparent;">
                    <div class="skeleton-block" style="width: 40px; height: 40px; border-radius: 8px;"></div>
                    <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
                        <div class="skeleton-block" style="width: 60%; height: 16px;"></div>
                        <div class="skeleton-block" style="width: 40%; height: 12px;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderConsultsList(consults) {
    if (!consults || consults.length === 0) {
        return '<div class="admin-placeholder">Пока нет консультаций</div>';
    }
    let html = '<div class="consults-list">';
    consults.forEach(c => {
        html += `
            <div class="consult-card">
                <div class="consult-day">${CONSULT_DAYS[c.day_num] || '?'}</div>
                <div class="consult-info">
                    <div class="consult-subject">${escapeHTML(c.subject)}</div>
                    <div class="consult-details">
                        <span>⏰ ${escapeHTML(c.time_start)} - ${escapeHTML(c.time_end)}</span>
                        ${c.room ? `<span>📍 ${escapeHTML(c.room)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

export const loadConsults = () => {
    if (consultsCache !== null) return Promise.resolve(consultsCache);
    if (consultsLoadingPromise) return consultsLoadingPromise;
    
    consultsLoadingPromise = getConsultations().then(data => {
        consultsCache = data || [];
        consultsLoadingPromise = null;
        return consultsCache;
    }).catch(err => {
        consultsLoadingPromise = null;
        throw err;
    });
    
    return consultsLoadingPromise;
};

export const preloadConsults = () => {
    if (consultsCache === null && !consultsLoadingPromise) {
        loadConsults().catch(() => {});
    }
};

export const applyConsultsToContainer = (container, consults) => {
    if (container.isConnected) container.innerHTML = renderConsultsList(consults);
};

export const showConsultsSkeleton = (container) => {
    if (container.isConnected) container.innerHTML = renderConsultsSkeleton();
};