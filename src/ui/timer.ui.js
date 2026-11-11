/**
 * @file src/ui/timer.ui.js
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
    return timerDiv;
}

export function updateTimerUI(state) {
    const statusEl = document.getElementById('t-status');
    if (!statusEl) return; // Если таймера нет (мы на другой неделе/дне), просто выходим

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
}