/**
 * @file src/ui/admin-consultations.ui.js
 * @description UI-компонент для управления консультациями.
 */
import { DICTIONARY, ALL_SUBJECTS, ALL_ROOMS } from '../constants/dictionary.js';
import { createSearchableSelect } from './custom-select.ui.js';

function setupTimeInput(input, nextInput = null) {
    input.type = 'text';
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('maxlength', '5');
    input.setAttribute('placeholder', 'ЧЧ:ММ');
    
    input.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 3) val = val.slice(0, 2) + ':' + val.slice(2);
        e.target.value = val;
        if (val.length === 5 && nextInput) setTimeout(() => nextInput.focus(), 50);
    });
    input.addEventListener('blur', (e) => {
        if (e.target.value.length > 0 && e.target.value.length < 5) e.target.value = '';
    });
}

export function renderConsultationsEditor() {
    const container = document.createElement('div');
    container.className = 'admin-editor';

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

    container.innerHTML = `
        <datalist id="dl-consult-subjects">${ALL_SUBJECTS.map(s => `<option value="${s}">`).join('')}</datalist>
        <datalist id="dl-consult-rooms">${ALL_ROOMS.map(r => `<option value="${r}">`).join('')}</datalist>

        <div class="glass-panel" style="padding: 20px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 18px;">Добавить консультацию</h3>
            <div class="editor-controls" style="align-items: flex-end;">
                <div style="flex: 2; min-width: 150px;">
                    <span class="label" style="font-size: 12px; margin-bottom: 4px; display: block;">Предмет</span>
                    <input type="text" id="consult-subject" class="admin-input" list="dl-consult-subjects" placeholder="Математика">
                </div>
                <div style="flex: 1; min-width: 100px;">
                    <span class="label" style="font-size: 12px; margin-bottom: 4px; display: block;">Кабинет</span>
                    <input type="text" id="consult-room" class="admin-input" list="dl-consult-rooms" placeholder="2-213">
                </div>
                <div style="width: 120px; flex-shrink: 0;">
                    <span class="label" style="font-size: 12px; margin-bottom: 4px; display: block;">День</span>
                    <div id="consult-day-container"></div>
                </div>
                <div style="width: 80px; flex-shrink: 0;">
                    <span class="label" style="font-size: 12px; margin-bottom: 4px; display: block;">Начало</span>
                    <input type="text" id="consult-time-start" class="admin-input">
                </div>
                <div style="width: 80px; flex-shrink: 0;">
                    <span class="label" style="font-size: 12px; margin-bottom: 4px; display: block;">Конец</span>
                    <input type="text" id="consult-time-end" class="admin-input">
                </div>
                <button id="btn-add-consult" class="btn btn-primary" style="height: 42px;">+ Добавить</button>
            </div>
        </div>

        <div id="consultations-list" class="schedule-edit-list">
            <div class="admin-placeholder">Загрузка консультаций...</div>
        </div>

        <button id="btn-save-consults" class="btn btn-success btn-full" style="display:none; margin-top: 20px;">💾 Сохранить консультации</button>
    `;

    // Настраиваем маску времени
    const timeStart = container.querySelector('#consult-time-start');
    const timeEnd = container.querySelector('#consult-time-end');
    setupTimeInput(timeStart, timeEnd);
    setupTimeInput(timeEnd);

    // Кастомный селект для дня недели
    const dayContainer = container.querySelector('#consult-day-container');
    dayContainer.appendChild(createSearchableSelect(days, 'Пн', 'День', 'consult-day-select'));

    // АВТОПОДСТАНОВКА КАБИНЕТА
    const subjectInput = container.querySelector('#consult-subject');
    const roomInput = container.querySelector('#consult-room');
    
    subjectInput.addEventListener('change', (e) => {
        const val = e.target.value;
        if (DICTIONARY[val] && !roomInput.value) {
            if (DICTIONARY[val].rooms.length > 0) {
                roomInput.value = DICTIONARY[val].rooms[0];
                roomInput.classList.add('autofilled');
                setTimeout(() => roomInput.classList.remove('autofilled'), 1000);
            }
        }
    });

    return container;
}

export function renderConsultationsList(consultations, onRemove) {
    const listContainer = document.getElementById('consultations-list');
    
    if (consultations.length === 0) {
        listContainer.innerHTML = '<div class="admin-placeholder">Консультаций пока нет</div>';
        return;
    }

    listContainer.innerHTML = '';
    const days = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

    consultations.forEach((c, index) => {
        const row = document.createElement('div');
        row.className = 'sub-edit-row';
        row.style.gridTemplateColumns = '60px minmax(0, 2fr) minmax(0, 1fr) 120px 80px 80px 40px';
        
        row.innerHTML = `
            <div style="text-align: center; font-weight: bold; color: var(--accent-color);">${days[c.day_num]}</div>
            <div class="consult-subject-text" style="font-weight: bold;">${c.subject}</div>
            <div>${c.room || '-'}</div>
            <div>⏰ ${c.time_start} - ${c.time_end}</div>
            <div style="grid-column: span 2;"></div>
            <button class="btn btn-danger btn-icon" title="Удалить">✖</button>
        `;

        row.querySelector('.btn-danger').addEventListener('click', () => {
            onRemove(index);
        });

        listContainer.appendChild(row);
    });
}