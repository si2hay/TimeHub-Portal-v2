/**
 * @file src/ui/offcanvas.ui.js
 * @description Off-canvas меню профиля. Содержит два экрана: профиль и настройки.
 * HTML настроек рендерится отдельно в offcanvas-settings.ui.js.
 */
import { supabase } from '../api/supabase-client.js';
import { renderSettingsView } from './offcanvas-settings.ui.js';

export function createOffcanvas(profile) {
    const tg = window.Telegram?.WebApp;
    const base = import.meta.env.BASE_URL;
    const userRole = profile?.role || 'student';
    const userGroup = profile?.group_name || 'Нет группы';
    const email = profile?.email || 'user@mail.ru';
    const avatarLetter = email.charAt(0).toUpperCase();

    const overlay = document.createElement('div');
    overlay.className = 'offcanvas-overlay';
    overlay.id = 'offcanvas-overlay';

    const offcanvas = document.createElement('div');
    offcanvas.className = 'offcanvas';
    offcanvas.id = 'offcanvas-menu';
    offcanvas.innerHTML = `
        <div class="offcanvas-view" id="view-main">
            <div class="offcanvas-header">
                <div style="width: 24px; flex-shrink: 0;"></div>
                <h3>Профиль</h3>
                <button class="icon-btn" id="btn-close-sidebar" style="flex-shrink: 0;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="offcanvas-content">
                <div class="sidebar-user-card">
                    <div class="sidebar-avatar">${avatarLetter}</div>
                    <div class="sidebar-email">${email}</div>
                    <div class="sidebar-group">Группа: ${userGroup}</div>
                    <div class="sidebar-role">${userRole.toUpperCase()}</div>
                </div>
                ${(userRole === 'admin' || userRole === 'sap' || userRole === 'starosta') ? `
                    <a href="${base}pages/admin.html" class="btn btn-primary btn-full btn-admin">Перейти в Админ-панель</a>
                ` : ''}
                <div class="sidebar-section-title">КАСТОМИЗАЦИЯ</div>
                <button class="btn btn-ghost btn-full btn-settings" id="btn-open-settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 10px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Настройки
                </button>
            </div>
            <div class="offcanvas-footer">
                <div class="app-version">v2.0 | Сборка: ${__BUILD_DATE__}</div>
                <button id="btn-sidebar-logout" class="btn btn-danger btn-full" style="justify-content: center;">Выйти</button>
            </div>
        </div>

        <div class="offcanvas-view" id="view-settings">
            <div class="offcanvas-header">
                <button class="icon-btn" id="btn-back-to-main" style="display: flex; align-items: center; gap: 5px; font-size: 14px; flex-shrink: 0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Назад
                </button>
                <h3 style="margin: 0; flex: 1; text-align: center;">Кастомизация</h3>
                <div style="width: 70px; flex-shrink: 0;"></div>
            </div>
            <div class="offcanvas-content" id="settings-view-content"></div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(offcanvas);

    const viewSettings = offcanvas.querySelector('#view-settings');

    const handleTelegramBack = () => {
        if (viewSettings.classList.contains('active')) {
            viewSettings.classList.remove('active');
        } else {
            close();
        }
    };

    const open = () => {
        offcanvas.classList.add('open');
        overlay.classList.add('open');
        viewSettings.classList.remove('active');
        
        // Показываем системную кнопку "Назад" в Telegram
        if (tg) {
            tg.BackButton.show();
            tg.BackButton.onClick(handleTelegramBack);
        }
    };

    const close = () => {
        offcanvas.classList.remove('open');
        overlay.classList.remove('open');
        
        // Скрываем кнопку "Назад" в Telegram
        if (tg) {
            tg.BackButton.hide();
        }
    };

    overlay.addEventListener('click', close);
    offcanvas.querySelector('#btn-close-sidebar').addEventListener('click', close);
    offcanvas.querySelector('#btn-open-settings').addEventListener('click', () => viewSettings.classList.add('active'));
    offcanvas.querySelector('#btn-back-to-main').addEventListener('click', () => viewSettings.classList.remove('active'));

    offcanvas.querySelector('#btn-sidebar-logout').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = `${base}index.html`;
    });

    renderSettingsView(offcanvas.querySelector('#settings-view-content'), profile);

    return { element: offcanvas, open, close };
}