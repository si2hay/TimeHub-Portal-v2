/**
 * @file src/ui/custom-datepicker.ui.js
 * @description Кастомный календарь с номерами учебных недель.
 * Использует глобальный обработчик клика для предотвращения утечек памяти.
 */
import { getWeekForDate } from '../features/date.logic.js';

// Глобальный слушатель для закрытия календарей
document.addEventListener('click', (e) => {
    document.querySelectorAll('.datepicker-dropdown.open').forEach(dropdown => {
        const wrapper = dropdown.closest('.custom-datepicker-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            dropdown.classList.remove('open');
            // Снимаем allow-overflow
            let p = wrapper.parentElement;
            while (p) {
                if (p.classList.contains('settings-group') || p.classList.contains('settings-inner') || p.classList.contains('settings-content')) {
                    p.classList.remove('allow-overflow');
                }
                p = p.parentElement;
            }
        }
    });
});

export function createDatepicker(initialDate, onChange, inputId = 'custom-date-input', align = 'left') {
    const container = document.createElement('div');
    container.className = 'custom-datepicker-wrapper';

    let currentDate = initialDate ? new Date(initialDate) : new Date();
    let selectedDate = initialDate ? new Date(initialDate) : new Date();
    
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.value = selectedDate.toISOString().split('T')[0];
    hiddenInput.id = inputId;
    container.appendChild(hiddenInput);

    const uiDiv = document.createElement('div');
    uiDiv.innerHTML = `
        <div class="datepicker-capsule">
            <span class="date-text">${formatDate(selectedDate)}</span>
            <span class="calendar-icon">📅</span>
        </div>
        <div class="datepicker-dropdown">
            <div class="dp-header">
                <button class="dp-nav-btn prev">◀</button>
                <span class="dp-month-year"></span>
                <button class="dp-nav-btn next">▶</button>
            </div>
            <div class="dp-weekdays">
                <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
            </div>
            <div class="dp-days"></div>
        </div>
    `;
    container.appendChild(uiDiv);

    const capsule = uiDiv.querySelector('.datepicker-capsule');
    const textEl = uiDiv.querySelector('.date-text');
    const dropdown = uiDiv.querySelector('.datepicker-dropdown');
    
    if (align === 'right') dropdown.classList.add('align-right');

    const toggleParentStyles = (isOpen) => {
        let el = container.parentElement;
        while (el) {
            if (el.classList.contains('settings-group')) el.classList.toggle('allow-overflow', isOpen);
            if (el.classList.contains('settings-inner') || el.classList.contains('settings-content')) el.classList.toggle('allow-overflow', isOpen);
            el = el.parentElement;
        }
    };

    const monthYearText = uiDiv.querySelector('.dp-month-year');
    const daysContainer = uiDiv.querySelector('.dp-days');

    function formatDate(date) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }

    function getLocalDateStr(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        monthYearText.textContent = `${months[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
        
        let daysHTML = '';
        for (let i = 0; i < startDayOfWeek; i++) {
            daysHTML += `<div class="dp-day empty"></div>`;
        }

        const todayStr = getLocalDateStr(new Date());

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dateObj = new Date(year, month, i);
            const dateStr = getLocalDateStr(dateObj);
            
            const dayOfWeek = dateObj.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

            const isSelected = hiddenInput.value === dateStr;
            const isToday = todayStr === dateStr;
            
            const weekNum = getWeekForDate(dateStr);
            
            let classes = 'dp-day';
            if (isSelected) classes += ' selected';
            if (isToday) classes += ' today';
            if (isWeekend) classes += ' disabled';
            
            daysHTML += `
                <div class="${classes}" data-date="${dateStr}" ${isWeekend ? '' : `data-clickable="true"`}>
                    ${i}
                    <span class="dp-week-num">${weekNum} нед.</span>
                </div>
            `;
        }
        daysContainer.innerHTML = daysHTML;

        daysContainer.querySelectorAll('.dp-day[data-clickable="true"]').forEach(el => {
            el.addEventListener('click', (e) => {
                const target = e.target.closest('.dp-day');
                const dateStr = target.dataset.date;
                selectedDate = new Date(dateStr);
                hiddenInput.value = dateStr;
                
                textEl.textContent = formatDate(selectedDate);
                
                closeDropdown();
                if (onChange) onChange(dateStr);
                renderCalendar();
            });
        });
    }

    const openDropdown = () => {
        document.querySelectorAll('.datepicker-dropdown.open').forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('open');
                let p = d.parentElement;
                while (p) {
                    if (p.classList.contains('settings-group') || p.classList.contains('settings-inner') || p.classList.contains('settings-content')) {
                        p.classList.remove('allow-overflow');
                    }
                    p = p.parentElement;
                }
            }
        });
        
        dropdown.classList.add('open');
        toggleParentStyles(true);
        renderCalendar();
    };

    const closeDropdown = () => {
        dropdown.classList.remove('open');
        toggleParentStyles(false);
    };

    capsule.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown.classList.contains('open')) closeDropdown();
        else openDropdown();
    });

    uiDiv.querySelector('.prev').addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    uiDiv.querySelector('.next').addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    container.updateDate = (newDateStr) => {
        if (!newDateStr) return;
        selectedDate = new Date(newDateStr);
        currentDate = new Date(newDateStr);
        hiddenInput.value = newDateStr;
        textEl.textContent = formatDate(selectedDate);
        renderCalendar();
    };

    return container;
}