/**
 * @file src/pages/admin/substitution.admin.js
 * @description Логика вкладки "Замены" в админке.
 */
import { getScheduleForDay } from '../../api/schedule.api.js';
import { getSubstitutions, saveSubstitutions } from '../../api/substitution.api.js';
import { getWeekForDate, getDayOfWeekFromDate } from '../../features/date.logic.js';
import { applySubstitutions } from '../../features/substitution.logic.js';
import { renderSubstitutionEditor, renderSubList } from '../../ui/admin-substitution.ui.js';

export function initSubstitutionTab(contentArea) {
    contentArea.innerHTML = '';
    const editor = renderSubstitutionEditor();
    contentArea.appendChild(editor);

    const btnLoad = editor.querySelector('#btn-load-subs');
    const btnSave = editor.querySelector('#btn-save-subs');
    let currentLessons = [];
    let baseLessons = [];

    btnLoad.addEventListener('click', async () => {
        const dateVal = document.getElementById('custom-date-input').value;
        const groupVal = document.getElementById('sub-group').value;
        if (!dateVal) return alert('Выбери дату!');

        const listContainer = document.getElementById('subs-edit-list');
        listContainer.innerHTML = '<div class="admin-placeholder">Загрузка расписания...</div>';

        const weekNum = getWeekForDate(dateVal);
        const dayNum = getDayOfWeekFromDate(dateVal);

        // 1. Загружаем базовое расписание из БД
        const fetchedBase = await getScheduleForDay(groupVal, weekNum, dayNum);
        
        // 2. ВАЖНЕЙШИЙ ФИКС: Делаем глубокую копию базы (оригинала).
        // Если этого не сделать, при изменении текста будут меняться оба массива сразу,
        // и проверка "изменилось ли что-то" всегда будет выдавать false.
        baseLessons = JSON.parse(JSON.stringify(fetchedBase));

        // 3. Накладываем сохраненные замены на базовое расписание
        const existingSubs = await getSubstitutions(dateVal, groupVal);
        currentLessons = applySubstitutions(fetchedBase, existingSubs);
        
        // 4. Передаем в UI измененные данные (currentLessons) и чистый оригинал (baseLessons)
        renderSubList(currentLessons, baseLessons, () => { btnSave.style.display = 'block'; });
        btnSave.style.display = 'block';
    });

    btnSave.addEventListener('click', async () => {
        const dateVal = document.getElementById('custom-date-input').value;
        const groupVal = document.getElementById('sub-group').value;
        
        btnSave.textContent = 'Сохранение...';
        btnSave.disabled = true;

        let subsToSave = [];
        
        // Ищем всё, что изменилось
        currentLessons.forEach(l => { if (l.is_changed) subsToSave.push(l); });
        
        // Ищем то, что удалили (отменили пары)
        baseLessons.forEach(base => {
            const stillExists = currentLessons.find(l => l.pair_num === base.pair_num);
            if (!stillExists) subsToSave.push({ pair_num: base.pair_num, subject: "", room: "", teacher: "", custom_start: "", custom_end: "" });
        });

        const res = await saveSubstitutions(dateVal, groupVal, subsToSave);
        
        if (res.success) {
            btnSave.textContent = '✅ Сохранено!';
            btnSave.style.background = '#10b981';
            setTimeout(() => {
                btnSave.textContent = '💾 Сохранить замены';
                btnSave.style.background = '';
                btnSave.disabled = false;
                initSubstitutionTab(contentArea);
            }, 1500);
        } else {
            alert('Ошибка! Проверь консоль.');
            btnSave.textContent = '💾 Сохранить замены';
            btnSave.disabled = false;
        }
    });
}