/**
 * @file src/ui/admin-substitution.ui.js
 * @description Отрисовка интерфейса редактирования замен.
 */
import { GROUPS } from '../constants/groups.js';
import { DICTIONARY, ALL_SUBJECTS, ALL_TEACHERS, ALL_ROOMS } from '../constants/dictionary.js';
import { createSearchableSelect } from './custom-select.ui.js';
import { createDatepicker } from './custom-datepicker.ui.js';
import { getTodayDateString } from '../features/date.logic.js';
import { escapeHTML } from '../features/sanitize.utils.js';

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

export function renderSubstitutionEditor(profile) {
    const container = document.createElement('div');
    container.className = 'admin-editor';

    const availableGroups = (profile?.role === 'starosta' && profile?.group_name) 
        ? [profile.group_name] 
        : GROUPS;

    container.innerHTML = `
        <datalist id="dl-sub-subjects">${ALL_SUBJECTS.map(s => `<option value="${s}">`).join('')}</datalist>
        <datalist id="dl-sub-teachers">${ALL_TEACHERS.map(t => `<option value="${t}">`).join('')}</datalist>
        <datalist id="dl-sub-rooms">${ALL_ROOMS.map(r => `<option value="${r}">`).join('')}</datalist>

        <div class="editor-controls">
            <div id="sub-date-container"></div>
            <div id="sub-group-container"></div>
            <button id="btn-load-subs" class="btn btn-primary">Загрузить расписание</button>
        </div>
        
        <div id="subs-edit-list" class="schedule-edit-list">
            <div class="admin-placeholder">Выбери дату и группу, затем нажми "Загрузить"</div>
        </div>
        
        <button id="btn-save-subs" class="btn btn-success btn-full" style="display:none; margin-top: 20px;">💾 Сохранить замены</button>
    `;

    const dateContainer = container.querySelector('#sub-date-container');
    const datePicker = createDatepicker(getTodayDateString());
    dateContainer.appendChild(datePicker);

    const groupContainer = container.querySelector('#sub-group-container');
    const customSelect = createSearchableSelect(availableGroups, availableGroups[0], 'Группа', 'sub-group');
    groupContainer.appendChild(customSelect);

    return container;
}

export function renderSubList(lessons, baseLessons, onChange) {
    const list = document.getElementById('subs-edit-list');
    
    if (lessons.length === 0) {
        list.innerHTML = '<div class="admin-placeholder">На этот день в базе нет пар. Нажми кнопку ниже, чтобы добавить.</div>';
    } else {
        list.innerHTML = '';
        
        const header = document.createElement('div');
        header.className = 'sub-list-header';
        header.innerHTML = `<div>№</div><div>Предмет (очисти для отмены)</div><div>Кабинет</div><div>Преподаватель</div><div>Начало</div><div>Конец</div><div></div>`;
        list.appendChild(header);

        lessons.sort((a, b) => a.pair_num - b.pair_num);

        lessons.forEach((lesson, index) => {
            const row = document.createElement('div');
            row.className = 'sub-edit-row';
            
            row.innerHTML = `
                <input type="number" class="admin-input pair-input" value="${escapeHTML(lesson.pair_num)}" min="1" max="7" title="Измени номер для сдвига">
                <input type="text" class="admin-input sub-subject" list="dl-sub-subjects" value="${escapeHTML(lesson.subject || '')}" placeholder="Предмет">
                <input type="text" class="admin-input sub-room" list="dl-sub-rooms" value="${escapeHTML(lesson.room || '')}" placeholder="Кабинет">
                <input type="text" class="admin-input sub-teacher" list="dl-sub-teachers" value="${escapeHTML(lesson.teacher || '')}" placeholder="Преподаватель">
                <input type="text" class="admin-input sub-time-start" value="${escapeHTML(lesson.custom_start || '')}" title="Свое время (начало)">
                <input type="text" class="admin-input sub-time-end" value="${escapeHTML(lesson.custom_end || '')}" title="Свое время (конец)">
                <button class="btn btn-danger btn-icon btn-del-sub" title="Удалить/Отменить">✖</button>
            `;

            const timeStart = row.querySelector('.sub-time-start');
            const timeEnd = row.querySelector('.sub-time-end');
            setupTimeInput(timeStart, timeEnd);
            setupTimeInput(timeEnd);

            const checkChanges = () => {
                const b = baseLessons.find(x => Number(x.pair_num) === Number(lesson.pair_num));
                
                const s1 = String(lesson.subject || '').trim(), s2 = String(b?.subject || '').trim();
                const r1 = String(lesson.room || '').trim(), r2 = String(b?.room || '').trim();
                const t1 = String(lesson.teacher || '').trim(), t2 = String(b?.teacher || '').trim();
                const cs1 = String(lesson.custom_start || '').trim(), cs2 = String(b?.custom_start || '').trim();
                const ce1 = String(lesson.custom_end || '').trim(), ce2 = String(b?.custom_end || '').trim();

                let changed = false;
                if (!b) { 
                    changed = (s1 !== "" || r1 !== "" || t1 !== "" || cs1 !== "" || ce1 !== ""); 
                } else { 
                    changed = (s1 !== s2 || r1 !== r2 || t1 !== t2 || cs1 !== cs2 || ce1 !== ce2); 
                }
                
                lesson.is_changed = changed;
                
                if (changed) {
                    row.classList.add('is-changed');
                } else {
                    row.classList.remove('is-changed');
                }
                onChange();
            };

            row.querySelector('.sub-subject').addEventListener('input', (e) => { lesson.subject = e.target.value; checkChanges(); });
            row.querySelector('.sub-room').addEventListener('input', (e) => { lesson.room = e.target.value; checkChanges(); });
            row.querySelector('.sub-teacher').addEventListener('input', (e) => { lesson.teacher = e.target.value; checkChanges(); });
            timeStart.addEventListener('input', (e) => { lesson.custom_start = e.target.value; checkChanges(); });
            timeEnd.addEventListener('input', (e) => { lesson.custom_end = e.target.value; checkChanges(); });

            row.querySelector('.pair-input').addEventListener('change', (e) => {
                const newNum = parseInt(e.target.value), oldNum = lesson.pair_num;
                if (isNaN(newNum) || newNum < 1 || newNum > 7 || newNum === oldNum) { e.target.value = oldNum; return; }
                lessons.splice(index, 1);
                lessons.forEach(l => {
                    if (newNum > oldNum) { if (l.pair_num >= newNum) l.pair_num++; }
                    else { if (l.pair_num >= newNum && l.pair_num < oldNum) l.pair_num++; }
                });
                lesson.pair_num = newNum; lessons.push(lesson);
                onChange(); renderSubList(lessons, baseLessons, onChange);
            });

            row.querySelector('.sub-subject').addEventListener('change', (e) => {
                const val = e.target.value, roomInput = row.querySelector('.sub-room'), teacherInput = row.querySelector('.sub-teacher');
                if (DICTIONARY[val]) {
                    if (!roomInput.value && DICTIONARY[val].rooms.length > 0) {
                        roomInput.value = DICTIONARY[val].rooms[0]; lesson.room = roomInput.value;
                        roomInput.classList.add('autofilled'); setTimeout(() => roomInput.classList.remove('autofilled'), 1000);
                    }
                    if (!teacherInput.value && DICTIONARY[val].teachers.length > 0) {
                        teacherInput.value = DICTIONARY[val].teachers[0]; lesson.teacher = teacherInput.value;
                        teacherInput.classList.add('autofilled'); setTimeout(() => teacherInput.classList.remove('autofilled'), 1000);
                    }
                    checkChanges();
                }
            });

            row.querySelector('.btn-del-sub').addEventListener('click', () => {
                lessons.splice(index, 1); onChange(); renderSubList(lessons, baseLessons, onChange);
            });

            checkChanges();
            
            list.appendChild(row);
        });
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-dashed';
    addBtn.style.marginTop = '10px';
    addBtn.textContent = '+ Добавить новую пару';
    addBtn.onclick = () => {
        let nextNum = 1;
        if (lessons.length > 0) nextNum = Math.max(...lessons.map(l => l.pair_num)) + 1;
        lessons.push({ pair_num: nextNum, subject: '', room: '', teacher: '', custom_start: '', custom_end: '', is_changed: true });
        renderSubList(lessons, baseLessons, onChange);
        onChange();
    };
    list.appendChild(addBtn);
}