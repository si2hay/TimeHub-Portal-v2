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
        
        // Сбрасываем inline-стили (на случай, если закрыли свайпом)
        offcanvas.style.transform = '';
        overlay.style.opacity = '';
        offcanvas.style.userSelect = '';
        
        // Скрываем кнопку "Назад" в Telegram
        if (tg) {
            tg.BackButton.hide();
        }
    };

    // --- ЛОГИКА СВАЙПА (Мышь + Тач) ---
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    const onDragStart = (e) => {
        if (!offcanvas.classList.contains('open')) return;
        isSwiping = true;
        
        // Определяем тип события (мышь или тач)
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        
        // Отключаем transition для мгновенной реакции
        offcanvas.style.transition = 'none';
        overlay.style.transition = 'none';
        offcanvas.style.userSelect = 'none'; // Чтобы не выделялся текст
    };

    const onDragMove = (e) => {
        if (!isSwiping) return;
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;

        // Двигаем только влево (diff < 0)
        if (diff < 0) {
            offcanvas.style.transform = `translateX(${diff}px)`;
            
            // Плавно уменьшаем прозрачность затемнения
            const maxWidth = offcanvas.offsetWidth;
            const opacity = 1 - (Math.abs(diff) / maxWidth);
            overlay.style.opacity = Math.max(0, opacity);
        }
    };

    const onDragEnd = () => {
        if (!isSwiping) return;
        isSwiping = false;
        
        const diff = currentX - startX;

        // Возвращаем transition и user-select
        offcanvas.style.transition = ''; 
        overlay.style.transition = '';
        offcanvas.style.userSelect = '';

        // Если свайпнули больше чем на 30% ширины меню — закрываем
        if (diff < -(offcanvas.offsetWidth * 0.3)) {
            close(); 
        } else {
            // Иначе возвращаем на место
            offcanvas.style.transform = '';
            overlay.style.opacity = '';
        }
    };

    // Обработчики для тача (телефон)
    offcanvas.addEventListener('touchstart', onDragStart, { passive: true });
    offcanvas.addEventListener('touchmove', onDragMove, { passive: true });
    offcanvas.addEventListener('touchend', onDragEnd);

    // Обработчики для мыши (ПК)
    offcanvas.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    // --- СТАРЫЕ ОБРАБОТЧИКИ ---
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