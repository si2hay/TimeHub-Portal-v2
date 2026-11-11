/**
 * @file src/ui/offcanvas.ui.js
 * @description Off-canvas меню профиля. Содержит два экрана: профиль и настройки.
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
                <a href="https://volgograd-college.gazprom.ru/" target="_blank" rel="noopener noreferrer" class="college-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18"></path>
                        <path d="M3 10h18"></path>
                        <path d="M5 6l7-3 7 3"></path>
                        <path d="M4 10v11"></path>
                        <path d="M20 10v11"></path>
                        <path d="M8 14v3"></path>
                        <path d="M12 14v3"></path>
                        <path d="M16 14v3"></path>
                    </svg>
                    Газпром колледж Волгоград
                </a>
                <div class="app-version">v2.0 | Сборка: ${__BUILD_DATE__}</div>
                <button id="btn-sidebar-logout" class="btn btn-danger btn-full btn-hold-action">Выйти</button>
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
    const btnLogout = offcanvas.querySelector('#btn-sidebar-logout');
    const originalText = 'Выйти';

    // --- ЛОГИКА НАВИГАЦИИ ---
    const closeVisuals = () => {
        offcanvas.classList.remove('open');
        overlay.classList.remove('open');
        offcanvas.style.transform = '';
        overlay.style.opacity = '';
        offcanvas.style.userSelect = '';
        if (tg) tg.BackButton.hide();
    };

    const open = () => {
        offcanvas.classList.add('open');
        overlay.classList.add('open');
        viewSettings.classList.remove('active');
        history.pushState({ menuOpen: true }, '');
        if (tg) {
            tg.BackButton.show();
            tg.BackButton.onClick(() => history.back());
        }
    };

    const close = () => {
        if (history.state?.menuOpen) {
            history.back();
        } else {
            closeVisuals();
        }
    };

    window.addEventListener('popstate', () => {
        if (offcanvas.classList.contains('open')) closeVisuals();
    });

    offcanvas.querySelector('#btn-open-settings').addEventListener('click', () => {
        viewSettings.classList.add('active');
        history.pushState({ settingsOpen: true }, '');
    });

    offcanvas.querySelector('#btn-back-to-main').addEventListener('click', () => {
        viewSettings.classList.remove('active');
        if (history.state?.settingsOpen) history.back();
    });

    // --- LONG PRESS (ВОЛНА) ---
    let logoutTimer = null;

    const startLogoutHold = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return; 
        e.preventDefault(); 
        
        btnLogout.classList.add('is-holding');
        btnLogout.textContent = 'Удерживайте...'; // Меняем текст
        
        logoutTimer = setTimeout(async () => {
            await supabase.auth.signOut();
            window.location.href = `${base}index.html`;
        }, 800);
    };

    const cancelLogoutHold = () => {
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            logoutTimer = null;
        }
        btnLogout.classList.remove('is-holding');
        btnLogout.textContent = originalText; // Возвращаем текст
    };

    btnLogout.addEventListener('mousedown', startLogoutHold);
    btnLogout.addEventListener('mouseup', cancelLogoutHold);
    btnLogout.addEventListener('mouseleave', cancelLogoutHold);

    btnLogout.addEventListener('touchstart', startLogoutHold, { passive: false });
    btnLogout.addEventListener('touchend', cancelLogoutHold);
    btnLogout.addEventListener('touchcancel', cancelLogoutHold);
    btnLogout.addEventListener('contextmenu', (e) => e.preventDefault());

    overlay.addEventListener('click', close);
    offcanvas.querySelector('#btn-close-sidebar').addEventListener('click', close);

    renderSettingsView(offcanvas.querySelector('#settings-view-content'), profile);

    return { element: offcanvas, open, close };
}