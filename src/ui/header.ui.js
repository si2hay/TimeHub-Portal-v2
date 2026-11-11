/**
 * @file src/ui/header.ui.js
 * @description Шапка приложения с кликабельной датой.
 */
import { createOffcanvas } from './offcanvas.ui.js';
import { createDatepicker } from './custom-datepicker.ui.js';
import { getTodayDateString } from '../features/date.logic.js';

export function createHeader(dateString, profile, onDateChange) {
    const header = document.createElement('header');
    header.className = 'app-header glass-panel';

    const base = import.meta.env.BASE_URL;
    const email = profile?.email || 'user@mail.ru';
    const settings = profile?.settings || {};
    const streakCount = settings.streak || 0;

    header.innerHTML = `
        <div class="header-left">
            <div class="header-logo" id="logo-trigger">
                <img src="${base}logo.png" alt="TH" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" style="display: none;">TH</div>
                <div class="logo-text">
                    <h1>TimeHub</h1>
                    <span>Portal</span>
                </div>
            </div>
            
            <div class="streak-badge" id="streak-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff6400" stroke="none"><path d="M12 2c0 0-4 4-4 9 0 2 1 4 4 4s4-2 4-4c0-5-4-9-4-9z"/></svg>
                ${streakCount}
            </div>
        </div>

        <div class="header-date-wrapper" id="header-date-wrapper"></div>
    `;

    // Создаём offcanvas один раз при рендере шапки
    const offcanvas = createOffcanvas(profile);

    header.querySelector('#logo-trigger').addEventListener('click', offcanvas.open);
    header.querySelector('#streak-btn').addEventListener('click', () => {
        alert(`🔥 Твой огонек: ${streakCount} дней!`);
    });

    // Добавляем календарь в шапку
    const dateWrapper = header.querySelector('#header-date-wrapper');
    const dp = createDatepicker(getTodayDateString(), (newDate) => {
        if (onDateChange) onDateChange(newDate);
    }, 'header-date-picker', 'right');
    
    // Стилизуем капсулу под обычный текст
    const capsule = dp.querySelector('.datepicker-capsule');
    capsule.classList.add('header-date-btn');
    
    // Убираем дефолтный текст и ставим наш красивый
    capsule.querySelector('.date-text').textContent = dateString;
    // Прячем иконку календаря
    capsule.querySelector('.calendar-icon').style.display = 'none';
    
    dateWrapper.appendChild(dp);

    return header;
}