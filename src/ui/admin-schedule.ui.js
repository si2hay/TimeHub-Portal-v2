/**
 * @file src/ui/admin-schedule.ui.js
 * @description UI-компонент для редактирования расписания.
 */
import { GROUPS } from '../constants/groups.js';
import { DICTIONARY, ALL_SUBJECTS, ALL_TEACHERS, ALL_ROOMS } from '../constants/dictionary.js';
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

export function renderScheduleEditor() {
    const container = document.createElement('div');
    container.className = 'admin-editor';

    const weeks = ['1 неделя', '2 неделя'];
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

    container.innerHTML = `
        <datalist id="dl-subjects">${ALL_SUBJECTS.map(s => `<option value="${s}">`).join('')}</datalist>
        <datalist id="dl-teachers">${ALL_TEACHERS.map(t => `<option value="${t}">`).join('')}</datalist>
        <datalist id="dl-rooms">${ALL_ROOMS.map(r => `<option value="${r}">`).join('')}</datalist>

        <div class="editor-controls">
            <div id="schedule-group-container"></div>
            <div id="schedule-week-container"></div>
            <div id="schedule-day-container"></div>
            <button id="btn-load-schedule" class="btn btn-primary">Загрузить</button>
        </div>

        <div id="schedule-edit-list" class="schedule-edit-list">
            <div class="admin-placeholder">Выбери группу, неделю и день, затем нажми "Загрузить"</div>
        </div>

        <button id="btn-save-schedule" class="btn btn-success btn-full" style="display:none; margin-top: 20px;">💾 Сохранить изменения</button>
    `;

    const groupContainer = container.querySelector('#schedule-group-container');
    const groupSelect = createSearchableSelect(GROUPS, GROUPS[0], 'Группа', 'edit-group');
    groupContainer.appendChild(groupSelect);

    const weekContainer = container.querySelector('#schedule-week-container');
    const weekSelect = createSearchableSelect(weeks, weeks[0], 'Неделя', 'edit-week');
    const hiddenWeek = weekSelect.querySelector('#edit-week');
    hiddenWeek.innerHTML = `<option value="1">1 неделя</option><option value="2">2 неделя</option>`;
    hiddenWeek.value = "1"; 
    weekContainer.appendChild(weekSelect);

    const dayContainer = container.querySelector('#schedule-day-container');
    const daySelect = createSearchableSelect(days, days[0], 'День', 'edit-day');
    const hiddenDay = daySelect.querySelector('#edit-day');
    hiddenDay.innerHTML = `
        <option value="1">Понедельник</option>
        <option value="2">Вторник</option>
        <option value="3">Среда</option>
        <option value="4">Четверг</option>
        <option value="5">Пятница</option>
    `;
    hiddenDay.value = "1"; 
    dayContainer.appendChild(daySelect);

    return container;
}

export function renderLessonsList(lessons, onChange) {
    const listContainer = document.getElementById('schedule-edit-list');
    
    if (lessons.length === 0) {
        listContainer.innerHTML = '<div class="admin-placeholder">На этот день пар нет. Нажми кнопку ниже, чтобы добавить.</div>';
    } else {
        listContainer.innerHTML = '';
        lessons.sort((a, b) => a.pair_num - b.pair_num);

        // ДОБАВЛЯЕМ ШАПКУ КАК В ЗАМЕНАХ
        const header = document.createElement('div');
        header.className = 'sub-list-header';
        header.innerHTML = `<div>№</div><div>Предмет</div><div>Кабинет</div><div>Преподаватель</div><div>Начало</div><div>Конец</div><div></div>`;
        listContainer.appendChild(header);

        lessons.forEach((lesson, index) => {
            const row = document.createElement('div');
            // МЕНЯЕМ КЛАСС НА sub-edit-row ДЛЯ ЕДИНОГО СТИЛЯ
            row.className = 'sub-edit-row';
            
            // МЕНЯЕМ КЛАССЫ ИНПУТОВ НА sub-*
            row.innerHTML = `
                <input type="number" class="admin-input pair-input" value="${lesson.pair_num}" min="1" max="7" title="Измени номер для сдвига">
                <input type="text" class="admin-input sub-subject" list="dl-subjects" value="${lesson.subject || ''}" placeholder="Предмет">
                <input type="text" class="admin-input sub-room" list="dl-rooms" value="${lesson.room || ''}" placeholder="Кабинет">
                <input type="text" class="admin-input sub-teacher" list="dl-teachers" value="${lesson.teacher || ''}" placeholder="Преподаватель">
                <input type="text" class="admin-input sub-time-start" value="${lesson.custom_start || ''}" title="Свое время (начало)">
                <input type="text" class="admin-input sub-time-end" value="${lesson.custom_end || ''}" title="Свое время (конец)">
                <button class="btn btn-danger btn-icon btn-del-sub" title="Удалить">✖</button>
            `;

            const timeStart = row.querySelector('.sub-time-start');
            const timeEnd = row.querySelector('.sub-time-end');
            setupTimeInput(timeStart, timeEnd);
            setupTimeInput(timeEnd);

            // ОБНОВЛЯЕМ СЕЛЕКТОРЫ, ТАК КАК КЛАССЫ ПОМЕНЯЛИСЬ
            row.querySelector('.sub-subject').addEventListener('input', (e) => { lesson.subject = e.target.value; onChange(); });
            row.querySelector('.sub-room').addEventListener('input', (e) => { lesson.room = e.target.value; onChange(); });
            row.querySelector('.sub-teacher').addEventListener('input', (e) => { lesson.teacher = e.target.value; onChange(); });
            timeStart.addEventListener('input', (e) => { lesson.custom_start = e.target.value; onChange(); });
            timeEnd.addEventListener('input', (e) => { lesson.custom_end = e.target.value; onChange(); });
            
            row.querySelector('.pair-input').addEventListener('change', (e) => {
                const newNum = parseInt(e.target.value);
                const oldNum = lesson.pair_num;
                if (isNaN(newNum) || newNum < 1 || newNum > 7 || newNum === oldNum) { e.target.value = oldNum; return; }
                lessons.splice(index, 1);
                lessons.forEach(l => {
                    if (newNum > oldNum) { if (l.pair_num >= newNum) l.pair_num++; }
                    else { if (l.pair_num >= newNum && l.pair_num < oldNum) l.pair_num++; }
                });
                lesson.pair_num = newNum;
                lessons.push(lesson);
                onChange();
                renderLessonsList(lessons, onChange);
            });

            row.querySelector('.sub-subject').addEventListener('change', (e) => {
                const val = e.target.value;
                const roomInput = row.querySelector('.sub-room');
                const teacherInput = row.querySelector('.sub-teacher');
                if (DICTIONARY[val]) {
                    if (!roomInput.value && DICTIONARY[val].rooms.length > 0) {
                        roomInput.value = DICTIONARY[val].rooms[0]; lesson.room = roomInput.value;
                        roomInput.classList.add('autofilled'); setTimeout(() => roomInput.classList.remove('autofilled'), 1000);
                    }
                    if (!teacherInput.value && DICTIONARY[val].teachers.length > 0) {
                        teacherInput.value = DICTIONARY[val].teachers[0]; lesson.teacher = teacherInput.value;
                        teacherInput.classList.add('autofilled'); setTimeout(() => teacherInput.classList.remove('autofilled'), 1000);
                    }
                    onChange();
                }
            });

            row.querySelector('.btn-del-sub').addEventListener('click', () => {
                lessons.splice(index, 1); onChange(); renderLessonsList(lessons, onChange);
            });

            listContainer.appendChild(row);
        });
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-dashed';
    addBtn.style.marginTop = '10px';
    addBtn.textContent = '+ Добавить пару';
    addBtn.onclick = () => {
        let nextNum = 1;
        if (lessons.length > 0) nextNum = Math.max(...lessons.map(l => l.pair_num)) + 1;
        lessons.push({ pair_num: nextNum, subject: '', room: '', teacher: '', custom_start: '', custom_end: '' });
        onChange();
        renderLessonsList(lessons, onChange);
    };
    listContainer.appendChild(addBtn);
}