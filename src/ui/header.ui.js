/**
 * @file src/ui/header.ui.js
 * @description Шапка приложения. Логика меню (off-canvas) — в offcanvas.ui.js.
 */
import { createOffcanvas } from './offcanvas.ui.js';

export function createHeader(dateString, profile) {
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

        <div class="header-date">${dateString}</div>
    `;

    // Создаём offcanvas один раз при рендере шапки
    const offcanvas = createOffcanvas(profile);

    header.querySelector('#logo-trigger').addEventListener('click', offcanvas.open);
    header.querySelector('#streak-btn').addEventListener('click', () => {
        alert(`🔥 Твой огонек: ${streakCount} дней!`);
    });

    return header;
}