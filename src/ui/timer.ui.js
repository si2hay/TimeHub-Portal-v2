/**
 * @file src/ui/timer.ui.js
 * @description Компонент таймера (обычный виджет + полноэкранный режим).
 */

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
            <div class="timer-btn-hint">${dayShort}</div>
        </div>
    `;

    // Создаем полноэкранный оверлей, если его еще нет
    let fullscreen = document.getElementById('fullscreen-timer');
    if (!fullscreen) {
        fullscreen = document.createElement('div');
        fullscreen.id = 'fullscreen-timer';
        fullscreen.className = 'fullscreen-timer';
        fullscreen.innerHTML = `
            <button class="fullscreen-close" id="fs-close">✖</button>
            <div class="fs-status" id="fs-status"></div>
            <div class="fs-subject" id="fs-subject"></div>
            <div class="fs-room" id="fs-room"></div>
            <div class="fs-time-label" id="fs-time-label">Осталось:</div>
            <div class="fs-time-value" id="fs-time-value">00:00</div>
            <div class="fs-progress-track">
                <div class="fs-progress-fill" id="fs-progress"></div>
            </div>
        `;
        document.body.appendChild(fullscreen);

        // Обработчик закрытия
        fullscreen.querySelector('#fs-close').addEventListener('click', (e) => {
            e.stopPropagation();
            fullscreen.classList.remove('active');
        });
    }

    // Открытие по клику на виджет
    timerDiv.addEventListener('click', () => {
        fullscreen.classList.add('active');
    });

    return timerDiv;
}

export function updateTimerUI(state) {
    // 1. Обновляем обычный виджет
    const statusEl = document.getElementById('t-status');
    if (!statusEl) return; 

    statusEl.textContent = state.text;
    
    const subjectEl = document.getElementById('t-subject');
    if (subjectEl) {
        if (state.subject) {
            subjectEl.innerHTML = `${state.subject} ${state.room ? `<span class="timer-room">• ${state.room}</span>` : ''}`;
        } else {
            subjectEl.textContent = '';
        }
    }
    
    const timeLabel = document.getElementById('t-time-label');
    const timeValueEl = document.getElementById('t-time-value');
    if (timeLabel && timeValueEl) {
        if (state.timeLeft) {
            timeLabel.style.display = 'inline';
            timeValueEl.style.display = 'inline';
            timeLabel.textContent = state.status === 'waiting' ? 'До начала:' : 'Осталось:';
            timeValueEl.textContent = state.timeLeft;
        } else {
            timeLabel.style.display = 'none';
            timeValueEl.style.display = 'none';
        }
    }
    
    const progressBar = document.getElementById('t-progress');
    if (progressBar && state.progress !== undefined) {
        const p = Math.max(0, Math.min(1, state.progress));
        progressBar.style.width = `${p * 100}%`;
    }

    // 2. Обновляем полноэкранный режим
    const fsStatus = document.getElementById('fs-status');
    if (fsStatus) {
        fsStatus.textContent = state.text;
        document.getElementById('fs-subject').textContent = state.subject || '';
        document.getElementById('fs-room').textContent = state.room ? `📍 ${state.room}` : '';
        
        const fsTimeLabel = document.getElementById('fs-time-label');
        const fsTimeValue = document.getElementById('fs-time-value');
        if (state.timeLeft) {
            fsTimeLabel.style.display = 'block';
            fsTimeValue.style.display = 'block';
            fsTimeLabel.textContent = state.status === 'waiting' ? 'До начала:' : 'Осталось:';
            fsTimeValue.textContent = state.timeLeft;
        } else {
            fsTimeLabel.style.display = 'none';
            fsTimeValue.style.display = 'none';
        }

        const fsProgress = document.getElementById('fs-progress');
        if (fsProgress && state.progress !== undefined) {
            const p = Math.max(0, Math.min(1, state.progress));
            fsProgress.style.width = `${p * 100}%`;
        }
    }
}