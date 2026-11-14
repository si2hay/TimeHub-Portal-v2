/**
 * @file src/ui/timer/timer.fullscreen.ui.js
 * @description Полноэкранный режим таймера.
 */
import { formatFullscreenTime } from './timer.utils.js';

const fsEls = {
    status: null,
    subject: null,
    room: null,
    timeLabel: null,
    timeValue: null,
    progress: null,
};

function getFsEl(key, id) {
    const cached = fsEls[key];
    if (cached && cached.isConnected) return cached;
    const el = document.getElementById(id);
    if (el) fsEls[key] = el;
    return el;
}

export function initFullscreenTimer() {
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
    return fullscreen;
}

export function openFullscreenTimer() {
    const fs = document.getElementById('fullscreen-timer');
    if (fs) fs.classList.add('active');
}

export function updateTimerFullscreen(state) {
    const fsStatus = getFsEl('status', 'fs-status');
    if (!fsStatus) return;

    fsStatus.textContent = state.text;
    getFsEl('subject', 'fs-subject').textContent = state.subject || '';
    
    const fsRoom = getFsEl('room', 'fs-room');
    fsRoom.textContent = state.room ? `📍 ${state.room}` : '';
    fsRoom.style.display = state.room ? 'inline-block' : 'none';
    
    const fsTimeLabel = getFsEl('timeLabel', 'fs-time-label');
    const fsTimeValue = getFsEl('timeValue', 'fs-time-value');
    
    if (state.timeLeft) {
        fsTimeLabel.style.visibility = 'visible';
        fsTimeValue.style.visibility = 'visible';
        fsTimeLabel.textContent = state.status === 'waiting' ? 'До начала:' : 'Осталось:';
        fsTimeValue.innerHTML = formatFullscreenTime(state.timeLeft);
    } else {
        fsTimeLabel.style.visibility = 'hidden';
        fsTimeValue.style.visibility = 'hidden';
    }

    const fsProgress = getFsEl('progress', 'fs-progress');
    if (fsProgress && state.progress !== undefined) {
        const p = Math.max(0, Math.min(1, state.progress));
        fsProgress.style.width = `${p * 100}%`;
    }
}