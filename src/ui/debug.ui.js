/**
 * @file src/ui/debug.ui.js
 * @description Панель DANGER ZONE (машина времени). Только для admin/sap.
 * Возвращает готовый DOM-элемент или null, если прав нет.
 */
import { getDebugState, setDebugState, clearDebugState } from '../features/debug.logic.js';
import { getTodayDateString } from '../features/date.logic.js';
import { createSearchableSelect } from './custom-select.ui.js';
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

                <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 5px;"><span class="label">Неделя</span> <div id="debug-week-container" style="width: 100%;"></div></div>
                <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 5px;"><span class="label">День</span> <div id="debug-day-container" style="width: 100%;"></div></div>
                <button id="btn-save-debug" class="btn btn-danger btn-full" style="margin-top: 10px;">Применить</button>
                <button id="btn-clear-debug" class="btn btn-ghost btn-full">Сброс</button>
            </div>
        </div></div>
    `;

    // 1. Инициализация кастомного календаря (с выравниванием вправо)
    const datepicker = createDatepicker(currentDate, (val) => {
        currentDate = val;
    }, 'debug-date-input', 'right');
    zone.querySelector('#debug-date-container').appendChild(datepicker);

    // 2. Маска для ввода времени
    const timeInput = zone.querySelector('#debug-time');
    timeInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 3) val = val.slice(0, 2) + ':' + val.slice(2);
        e.target.value = val;
    });

    // 3. Селекты для недели и дня
    zone.querySelector('#debug-week-container').appendChild(
        createSearchableSelect(['1', '2'], (debug.week || 1).toString(), 'Неделя', 'debug-week-select')
    );
    const daysArr = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
    zone.querySelector('#debug-day-container').appendChild(
        createSearchableSelect(daysArr, daysArr[(debug.day || 1) - 1], 'День', 'debug-day-select')
    );

    // 4. Включение/выключение отладки
    const toggleDebug = zone.querySelector('#toggle-debug');
    const debugControls = zone.querySelector('#debug-controls');
    toggleDebug?.addEventListener('change', (e) => {
        debugControls.style.display = e.target.checked ? 'flex' : 'none';
        if (!e.target.checked) clearDebugState();
    });

    // 5. Применить
    zone.querySelector('#btn-save-debug')?.addEventListener('click', () => {
        const time = zone.querySelector('#debug-time').value;
        const week = parseInt(zone.querySelector('#debug-week-select').value);
        const daysMap = { 'Пн': 1, 'Вт': 2, 'Ср': 3, 'Чт': 4, 'Пт': 5 };
        const day = daysMap[zone.querySelector('#debug-day-select').value] || 1;
        
        setDebugState({ enabled: true, date: currentDate, time, week, day });
    });

    // 6. Сброс
    zone.querySelector('#btn-clear-debug')?.addEventListener('click', () => clearDebugState());

    return zone;
}