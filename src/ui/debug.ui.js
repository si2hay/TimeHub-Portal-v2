/**
 * @file src/ui/debug.ui.js
 * @description Панель DANGER ZONE (машина времени). Только для admin/sap.
 */
import { getDebugState, setDebugState, clearDebugState } from '../features/debug.logic.js';
import { getTodayDateString } from '../features/date.logic.js';
import { createDatepicker } from './custom-datepicker.ui.js';

export function createDebugZone(profile) {
    const userRole = profile?.role || 'student';
    if (userRole !== 'admin' && userRole !== 'sap') return null;

    const debug = getDebugState();
    let currentDate = debug.date || getTodayDateString();

    const zone = document.createElement('div');
    zone.className = 'settings-group glass-panel';
    zone.style.borderColor = '#ef4444';
    zone.innerHTML = `
        <div class="settings-header" style="color: #ef4444;"><span>🛠 DANGER ZONE</span><span class="arrow">▼</span></div>
        <div class="settings-content"><div class="settings-inner">
            <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                <span class="label">Включить отладку</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="toggle-debug" ${debug.enabled ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div id="debug-controls" style="display: ${debug.enabled ? 'flex' : 'none'}; flex-direction: column; gap: 10px; margin-top: 10px;">
                
                <div class="setting-row" style="align-items: center;">
                    <span class="label">Дата</span> 
                    <div id="debug-date-container"></div>
                </div>
                
                <div class="setting-row" style="align-items: center;">
                    <span class="label">Время</span> 
                    <input type="text" id="debug-time" class="admin-select" style="width: 120px; text-align: center; flex-shrink: 0;" value="${debug.time || ''}" placeholder="ЧЧ:ММ" maxlength="5">
                </div>

                <button id="btn-save-debug" class="btn btn-danger btn-full" style="margin-top: 10px;">Применить</button>
                <button id="btn-clear-debug" class="btn btn-ghost btn-full">Сброс</button>
            </div>
        </div></div>
    `;

    // Кастомный календарь
    const datepicker = createDatepicker(currentDate, (val) => {
        currentDate = val;
    }, 'debug-date-input', 'right');
    zone.querySelector('#debug-date-container').appendChild(datepicker);

    // Маска для ввода времени
    const timeInput = zone.querySelector('#debug-time');
    timeInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 3) val = val.slice(0, 2) + ':' + val.slice(2);
        e.target.value = val;
    });

    // Включение/выключение отладки
    const toggleDebug = zone.querySelector('#toggle-debug');
    const debugControls = zone.querySelector('#debug-controls');
    toggleDebug?.addEventListener('change', (e) => {
        debugControls.style.display = e.target.checked ? 'flex' : 'none';
        if (!e.target.checked) clearDebugState();
    });

    // Применить
    zone.querySelector('#btn-save-debug')?.addEventListener('click', () => {
        const time = zone.querySelector('#debug-time').value;
        setDebugState({ enabled: true, date: currentDate, time });
    });

    // Сброс
    zone.querySelector('#btn-clear-debug')?.addEventListener('click', () => clearDebugState());

    return zone;
}