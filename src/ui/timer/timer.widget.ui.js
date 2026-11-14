/**
 * @file src/ui/timer/timer.widget.ui.js
 * @description Обычный виджет таймера на главной странице.
 * Добавлена защита от XSS для названий предметов.
 */
import { formatCompactTime } from './timer.utils.js';
import { escapeHTML } from '../../features/sanitize.utils.js';

// Кешируем DOM-ссылки для виджета
const els = {
    status: null,
    subject: null,
    timeLabel: null,
    timeValue: null,
    progress: null,
};

function getEl(key, id) {
    const cached = els[key];
    if (cached && cached.isConnected) return cached;
    const el = document.getElementById(id);
    if (el) els[key] = el;
    return el;
}

export function createTimerWidget(dayShort = '', onOpenFullscreen) {
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer-widget glass-panel';
    timerDiv.id = 'timer-widget';

    timerDiv.innerHTML = `
        <div class="timer-header">
            <div class="timer-status" id="t-status">Загрузка...</div>
            <div class="timer-subject" id="t-subject"></div>
        </div>
        <div class="timer-body">
            <span class="time-label" id="t-time-label">Осталось:</span>
            <span class="time-value" id="t-time-value">00:00</span>
        </div>
        <div class="timer-progress-track">
            <div class="timer-progress-fill" id="t-progress" style="width: 0%;"></div>
        </div>
        <div class="timer-footer">
            <span>Нажми, чтобы раскрыть</span>
            <div class="timer-footer-right">
                <button class="btn-today-hint" id="btn-today">Ближайший</button>
                <div class="timer-btn-hint">${dayShort}</div>
            </div>
        </div>
    `;

    timerDiv.addEventListener('click', (e) => {
        if (e.target.closest('#btn-today')) return;
        if (onOpenFullscreen) onOpenFullscreen();
    });

    return timerDiv;
}

export function updateTimerWidget(state) {
    const statusEl = getEl('status', 't-status');
    if (!statusEl) return; 

    statusEl.textContent = state.text;
    
    const subjectEl = getEl('subject', 't-subject');
    if (subjectEl) {
        if (state.subject) {
            // ФИКС XSS: Экранируем предмет и кабинет
            subjectEl.innerHTML = `${escapeHTML(state.subject)} ${state.room ? `<span class="timer-room">• ${escapeHTML(state.room)}</span>` : ''}`;
        } else {
            subjectEl.textContent = '';
        }
    }
    
    const timeLabel = getEl('timeLabel', 't-time-label');
    const timeValueEl = getEl('timeValue', 't-time-value');
    if (timeLabel && timeValueEl) {
        if (state.timeLeft) {
            timeLabel.style.visibility = 'visible';
            timeValueEl.style.visibility = 'visible';
            timeLabel.textContent = state.status === 'waiting' ? 'До начала:' : 'Осталось:';
            timeValueEl.innerHTML = formatCompactTime(state.timeLeft); 
        } else {
            timeLabel.style.visibility = 'hidden';
            timeValueEl.style.visibility = 'hidden';
        }
    }
    
    const progressBar = getEl('progress', 't-progress');
    if (progressBar && state.progress !== undefined) {
        const p = Math.max(0, Math.min(1, state.progress));
        progressBar.style.width = `${p * 100}%`;
    }
}