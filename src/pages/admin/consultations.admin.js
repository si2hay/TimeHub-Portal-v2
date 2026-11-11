/**
 * @file src/pages/admin/consultations.admin.js
 * @description Логика вкладки "Консультации" в админке.
 */
import { getConsultations, saveConsultations } from '../../api/consultations.api.js';
import { renderConsultationsEditor, renderConsultationsList } from '../../ui/admin-consultations.ui.js';

export async function initConsultationsTab(contentArea) {
    contentArea.innerHTML = '';
    const editor = renderConsultationsEditor();
    contentArea.appendChild(editor);

    let currentConsults = await getConsultations();
    const btnSave = editor.querySelector('#btn-save-consults');

    const updateList = () => {
        renderConsultationsList(currentConsults, (index) => {
            currentConsults.splice(index, 1);
            updateList();
            btnSave.style.display = 'block';
        });
    };

    updateList();

    // Добавление
    editor.querySelector('#btn-add-consult').addEventListener('click', () => {
        const subject = editor.querySelector('#consult-subject').value.trim();
        const room = editor.querySelector('#consult-room').value.trim();
        const dayStr = editor.querySelector('#consult-day-select').value;
        const timeStart = editor.querySelector('#consult-time-start').value;
        const timeEnd = editor.querySelector('#consult-time-end').value;

        if (!subject || !timeStart || !timeEnd) {
            alert('Заполни предмет, начало и конец времени!');
            return;
        }

        const daysMap = { 'Пн': 1, 'Вт': 2, 'Ср': 3, 'Чт': 4, 'Пт': 5 };
        const dayNum = daysMap[dayStr] || 1;

        currentConsults.push({
            subject, room, day_num: dayNum, time_start: timeStart, time_end: timeEnd
        });

        // Очищаем поля
        editor.querySelector('#consult-subject').value = '';
        editor.querySelector('#consult-room').value = '';
        editor.querySelector('#consult-time-start').value = '';
        editor.querySelector('#consult-time-end').value = '';

        updateList();
        btnSave.style.display = 'block';
    });

    // Сохранение
    btnSave.addEventListener('click', async () => {
        btnSave.textContent = 'Сохранение...';
        btnSave.disabled = true;

        const res = await saveConsultations(currentConsults);
        if (res.success) {
            btnSave.textContent = '✅ Сохранено!';
            setTimeout(() => {
                btnSave.textContent = '💾 Сохранить консультации';
                btnSave.disabled = false;
                btnSave.style.display = 'none'; // Прячем, пока не будет изменений
            }, 2000);
        } else {
            alert('Ошибка сохранения! Проверь консоль.');
            btnSave.textContent = '💾 Сохранить консультации';
            btnSave.disabled = false;
        }
    });
}