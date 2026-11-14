/**
 * @file src/ui/timer.ui.js
 * @description Таймер (дирижер). Связывает виджет и полноэкранный режим.
 */
import { createTimerWidget, updateTimerWidget } from './timer/timer.widget.ui.js';
import { initFullscreenTimer, openFullscreenTimer, updateTimerFullscreen } from './timer/timer.fullscreen.ui.js';

export function renderTimer(dayShort = '') {
    initFullscreenTimer();
    return createTimerWidget(dayShort, openFullscreenTimer);
}

export function updateTimerUI(state) {
    updateTimerWidget(state);
    updateTimerFullscreen(state);
}