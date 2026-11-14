/**
 * @file src/ui/timer.ui.js
 * @description Компонент таймера (обычный виджет + полноэкранный режим).
 * DOM-ссылки кешируются в модуле.
 * Время в обычном виджете выводится без лишних пробелов, чтобы не ломаться.
 */

const els = {
    status: null,
    subject: null,
    timeLabel: null,
    timeValue: null,
    progress: null,
    fsStatus: null,
    fsSubject: null,
    fsRoom: null,
    fsTimeLabel: null,
    fsTimeValue: null,
    fsProgress: null,
};

function getEl(key, id) {
    const cached = els[key];
    if (cached && cached.isConnected) return cached;
    const el = document.getElementById(id);
    if (el) els[key] = el;
    return el;
}

// Форматирование для фуллскрина (блоки)
function formatFullscreenTime(timeStr) {
    if (!timeStr) return '';
    
    if (timeStr === '00:00') {
        return `<div class="fs-time-group"><span class="fs-time-num">00</span><span class="fs-time-unit">мин</span></div>`;
    }

    let html = '';
    const dMatch = timeStr.match(/(\d+)\s*д/);
    const hMatch = timeStr.match(/(\d+)\s*ч/);
    const mMatch = timeStr.match(/(\d+)\s*мин/);

    if (dMatch) {
        html += `<div class="fs-time-group"><span class="fs-time-num">${dMatch[1]}</span><span class="fs-time-unit">д</span></div>`;
    }
    if (hMatch) {
        html += `<div class="fs-time-group"><span class="fs-time-num">${hMatch[1]}</span><span class="fs-time-unit">ч</span></div>`;
    }
    if (mMatch) {
        html += `<div class="fs-time-group"><span class="fs-time-num">${mMatch[1]}</span><span class="fs-time-unit">мин</span></div>`;
    }

    if (html === '') {
        html = `<div class="fs-time-group"><span class="fs-time-num" style="font-size: 40px;">${timeStr}</span></div>`;
    }

    return html;
}

// Форматирование для обычного виджета (чтобы не было лишних пробелов, ломающих строку)
function formatCompactTime(timeStr) {
    if (!timeStr) return '';
    // Заменяем неразрывными пробелами, чтобы "1 д 11 ч" не переносилось по кускам
    return timeStr.replace(/ /g, '&nbsp;');
}

export function renderTimer(dayShort = '') {
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

    let fullscreen = document.getElementById('fullscreen-timer');
    if (!fullscreen) {
        fullscreen = document.createElement('div');
        fullscreen.id = 'fullscreen-timer';
        fullscreen.className = 'fullscreen-timer';
        fullscreen.innerHTML = `
            <div class="fs-content">
                <div class="fs-status" id="fs-status"></div>
                <div class="fs-subject" id="fs-subject"></div>
                <div class="fs-room" id="fs-room"></div>
                <div class="fs-time-label" id="fs-time-label">Осталось:</div>
                
                <div class="fs-time-value" id="fs-time-value"></div>
                
                <div class="fs-progress-track">
                    <div class="fs-progress-fill" id="fs-progress"></div>
                </div>
                
                <div class="fs-hint">Нажми в любом месте, чтобы закрыть</div>
            </div>
        `;
        document.body.appendChild(fullscreen);

        fullscreen.addEventListener('click', () => {
            fullscreen.classList.remove('active');
        });
    }

    timerDiv.addEventListener('click', (e) => {
        if (e.target.closest('#btn-today')) return;
        fullscreen.classList.add('active');
    });

    return timerDiv;
}

export function updateTimerUI(state) {
    const statusEl = getEl('status', 't-status');
    if (!statusEl) return; 

    statusEl.textContent = state.text;
    
    const subjectEl = getEl('subject', 't-subject');
    if (subjectEl) {
        if (state.subject) {
            subjectEl.innerHTML = `${state.subject} ${state.room ? `<span class="timer-room">• ${state.room}</span>` : ''}`;
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
            // ФИКС: Используем неразрывные пробелы, чтобы время не ломалось без надобности
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

    const fsStatus = getEl('fsStatus', 'fs-status');
    if (fsStatus) {
        fsStatus.textContent = state.text;
        getEl('fsSubject', 'fs-subject').textContent = state.subject || '';
        
        const fsRoom = getEl('fsRoom', 'fs-room');
        fsRoom.textContent = state.room ? `📍 ${state.room}` : '';
        fsRoom.style.display = state.room ? 'inline-block' : 'none';
        
        const fsTimeLabel = getEl('fsTimeLabel', 'fs-time-label');
        const fsTimeValue = getEl('fsTimeValue', 'fs-time-value');
        if (state.timeLeft) {
            fsTimeLabel.style.visibility = 'visible';
            fsTimeValue.style.visibility = 'visible';
            fsTimeLabel.textContent = state.status === 'waiting' ? 'До начала:' : 'Осталось:';
            fsTimeValue.innerHTML = formatFullscreenTime(state.timeLeft);
        } else {
            fsTimeLabel.style.visibility = 'hidden';
            fsTimeValue.style.visibility = 'hidden';
        }

        const fsProgress = getEl('fsProgress', 'fs-progress');
        if (fsProgress && state.progress !== undefined) {
            const p = Math.max(0, Math.min(1, state.progress));
            fsProgress.style.width = `${p * 100}%`;
        }
    }
}