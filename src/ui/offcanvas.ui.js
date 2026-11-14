/**
 * @file src/ui/offcanvas.ui.js
 * @description Off-canvas меню (дирижер). Связывает профиль, калькулятор, консультации, настройки и свайпы.
 */
import { renderSettingsView } from './offcanvas-settings.ui.js';
import { renderCalculator } from './offcanvas/calculator.ui.js';
import { setupHoldLogout } from './offcanvas/logout.ui.js';
import { setupSwipeToClose } from './offcanvas/swipe.ui.js';
import { loadConsults, preloadConsults, applyConsultsToContainer, showConsultsSkeleton } from './offcanvas/consults.ui.js';
import { renderFullScheduleSkeleton, loadFullScheduleData, renderFullScheduleContent } from './offcanvas/full-schedule.ui.js';
import { escapeHTML } from '../features/sanitize.utils.js';

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
                    <div class="sidebar-avatar">${escapeHTML(avatarLetter)}</div>
                    <div class="sidebar-email">${escapeHTML(email)}</div>
                    <div class="sidebar-group">Группа: ${escapeHTML(userGroup)}</div>
                    <div class="sidebar-role">${escapeHTML(userRole.toUpperCase())}</div>
                </div>
                ${(userRole === 'admin' || userRole === 'sap' || userRole === 'starosta') ? `
                    <a href="${base}pages/admin.html" class="btn btn-primary btn-full btn-admin">Перейти в Админ-панель</a>
                ` : ''}
                
                <button class="btn btn-primary btn-full" id="btn-full-schedule" style="margin-bottom: 15px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; flex-shrink: 0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Расписание на 2 недели
                </button>

                <div class="sidebar-section-title">СПРАВОЧНИК</div>
                <div class="settings-group glass-panel" id="ref-group-calc">
                    <div class="settings-header"><span>Калькулятор оценок</span><span class="arrow">▼</span></div>
                    <div class="settings-content"><div class="settings-inner" id="calc-container"></div></div>
                </div>

                <div class="settings-group glass-panel" id="ref-group-libs">
                    <div class="settings-header"><span>Электронные библиотеки</span><span class="arrow">▼</span></div>
                    <div class="settings-content"><div class="settings-inner">
                        <a href="https://e.lanbook.com/" target="_blank" class="lib-card">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            <div>
                                <h4>ЭБС Лань</h4>
                                <p>Учебники и пособия</p>
                            </div>
                        </a>
                        <a href="https://academia-moscow.ru/" target="_blank" class="lib-card">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            <div>
                                <h4>Академия-Москва</h4>
                                <p>Издательский центр</p>
                            </div>
                        </a>
                    </div></div>
                </div>

                <div class="settings-group glass-panel" id="ref-group-consults">
                    <div class="settings-header"><span>Расписание консультаций</span><span class="arrow">▼</span></div>
                    <div class="settings-content"><div class="settings-inner" id="consults-container">
                        <div class="admin-placeholder">Открой, чтобы загрузить...</div>
                    </div></div>
                </div>

                <div class="sidebar-section-title" style="margin-top: 20px;">КАСТОМИЗАЦИЯ</div>
                <button class="btn btn-ghost btn-full btn-settings" id="btn-open-settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 10px; flex-shrink: 0;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Настройки
                </button>
            </div>
            <div class="offcanvas-footer">
                <a href="https://t.me/+sq9RDqa2I2A3M2Iy" target="_blank" rel="noopener noreferrer" class="college-link" style="border-color: #0088cc; color: #0088cc;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Наш Telegram-чат
                </a>
                <a href="https://volgograd-college.gazprom.ru/" target="_blank" rel="noopener noreferrer" class="college-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                        <path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v3"></path><path d="M12 14v3"></path><path d="M16 14v3"></path>
                    </svg>
                    Газпром колледж Волгоград
                </a>
                <div class="app-version">v2.0 | Сборка: ${__BUILD_DATE__}</div>
                <button id="btn-sidebar-logout" class="btn btn-danger btn-full btn-hold-action btn-hold-long">Выйти</button>
            </div>
        </div>

        <div class="offcanvas-view" id="view-settings">
            <div class="offcanvas-header">
                <button class="btn-back-settings" id="btn-back-to-main" title="Назад">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h3 style="margin: 0; flex: 1; text-align: center;">Кастомизация</h3>
                <div style="width: 40px; flex-shrink: 0;"></div>
            </div>
            <div class="offcanvas-content" id="settings-view-content"></div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(offcanvas);

    const viewSettings = offcanvas.querySelector('#view-settings');

    offcanvas.querySelector('#calc-container').appendChild(renderCalculator());

    const refGroups = offcanvas.querySelectorAll('.settings-group');
    refGroups.forEach(group => {
        const header = group.querySelector('.settings-header');
        header.addEventListener('click', () => {
            const isActive = group.classList.contains('active');
            const isOpening = !isActive;

            refGroups.forEach(g => { if (g !== group) g.classList.remove('active'); });
            group.classList.toggle('active');

            if (group.id === 'ref-group-consults' && isOpening) {
                const container = group.querySelector('#consults-container');
                if (!container) return;

                let skeletonShown = false;
                const skeletonTimer = setTimeout(() => {
                    skeletonShown = true;
                    showConsultsSkeleton(container);
                }, 150);

                loadConsults().then(data => {
                    clearTimeout(skeletonTimer);
                    applyConsultsToContainer(container, data);
                }).catch(() => {
                    clearTimeout(skeletonTimer);
                    if (container.isConnected) container.innerHTML = '<div class="admin-placeholder">Не удалось загрузить консультации</div>';
                });
            }
        });
    });

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
        preloadConsults();
    };

    const close = () => {
        if (history.state?.menuOpen) history.back();
        else closeVisuals();
    };

    window.addEventListener('popstate', () => {
        if (offcanvas.classList.contains('open')) {
            if (viewSettings.classList.contains('active')) {
                viewSettings.classList.remove('active');
            } else {
                closeVisuals();
            }
        }
    });

    offcanvas.querySelector('#btn-open-settings').addEventListener('click', () => {
        viewSettings.classList.add('active');
        history.pushState({ settingsOpen: true }, '');
    });

    offcanvas.querySelector('#btn-back-to-main').addEventListener('click', () => {
        history.back();
    });

    const showModal = (title, contentHTML) => {
        let modal = document.getElementById('global-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'global-modal';
            modal.className = 'global-modal';
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }
        modal.innerHTML = `
            <div class="global-modal-content glass-panel">
                <div class="modal-header">
                    <h3>${escapeHTML(title)}</h3>
                    <button class="icon-btn" onclick="document.getElementById('global-modal').classList.remove('active')">✖</button>
                </div>
                <div class="modal-body">${contentHTML}</div>
            </div>
        `;
        modal.classList.add('active');
    };

    offcanvas.querySelector('#btn-full-schedule').addEventListener('click', async () => {
        showModal('Расписание на 2 недели', '');
        const modalBody = document.querySelector('#global-modal .modal-body');
        modalBody.appendChild(renderFullScheduleSkeleton());

        try {
            const weeksData = await loadFullScheduleData(userGroup);
            modalBody.innerHTML = '';
            modalBody.appendChild(renderFullScheduleContent(userGroup, weeksData));
        } catch (err) {
            modalBody.innerHTML = '<div style="color: #ef4444; text-align: center;">Ошибка загрузки расписания.</div>';
        }
    });

    setupSwipeToClose(offcanvas, overlay, close);
    setupHoldLogout(offcanvas.querySelector('#btn-sidebar-logout'), base);

    overlay.addEventListener('click', close);
    offcanvas.querySelector('#btn-close-sidebar').addEventListener('click', close);

    renderSettingsView(offcanvas.querySelector('#settings-view-content'), profile);

    return { element: offcanvas, open, close };
}