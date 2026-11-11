/**
 * @file src/pages/admin/schedule.admin.js
 * @description Логика вкладки "Расписание" в админке.
 */
import { getScheduleForDay, saveDaySchedule } from '../../api/schedule.api.js';
import { renderScheduleEditor, renderLessonsList } from '../../ui/admin-schedule.ui.js';

export function initScheduleTab(contentArea) {
    contentArea.innerHTML = '';
    const editor = renderScheduleEditor();
    contentArea.appendChild(editor);

    const btnLoad = editor.querySelector('#btn-load-schedule');
    const btnSave = editor.querySelector('#btn-save-schedule');
    let currentLessons = [];

    btnLoad.addEventListener('click', async () => {
        const group = document.getElementById('edit-group').value;
        const week = parseInt(document.getElementById('edit-week').value);
        const day = parseInt(document.getElementById('edit-day').value);
        
        document.getElementById('schedule-edit-list').innerHTML = '<div class="admin-placeholder">Загрузка...</div>';
        btnSave.style.display = 'none';
        
        currentLessons = await getScheduleForDay(group, week, day);
        renderLessonsList(currentLessons, () => { btnSave.style.display = 'block'; });
        btnSave.style.display = 'block';
    });

    btnSave.addEventListener('click', async () => {
        const group = document.getElementById('edit-group').value;
        const week = parseInt(document.getElementById('edit-week').value);
        const day = parseInt(document.getElementById('edit-day').value);

        btnSave.textContent = 'Сохранение...';
        btnSave.disabled = true;
        const result = await saveDaySchedule(group, week, day, currentLessons);
        if (result.success) {
            btnSave.textContent = '✅ Сохранено!';
            setTimeout(() => { btnSave.textContent = '💾 Сохранить изменения'; btnSave.disabled = false; }, 2000);
        } else {
            alert('Ошибка сохранения!');
            btnSave.textContent = '💾 Сохранить изменения';
            btnSave.disabled = false;
        }
    });
}