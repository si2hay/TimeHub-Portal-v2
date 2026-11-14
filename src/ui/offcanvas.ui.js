/**
 * @file src/ui/offcanvas.ui.js
 * @description Off-canvas меню с аккордеонами для справочника и кастомным калькулятором.
 * Оптимизации:
 *  - mouse-listeners только на ПК;
 *  - анимация калькулятора через WAAPI (без reflow);
 *  - аккордеон консультаций открывается мгновенно (toggle до await),
 *    данные грузятся в фоне + кеш в модуле + предзагрузка при открытии меню.
 */
import { supabase } from '../api/supabase-client.js';
import { renderSettingsView } from './offcanvas-settings.ui.js';
import { getConsultations } from '../api/consultations.api.js';
import { getScheduleForDay } from '../api/schedule.api.js';
import { getSubstitutions } from '../api/substitution.api.js';
import { applySubstitutions } from '../features/substitution.logic.js';
import { getWeekByOffset, getDateForDayAndWeek } from '../features/date.logic.js';
import { renderFullSchedule } from './schedule.ui.js';

const CONSULT_DAYS = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

// HTML скелетона консультаций (2 карточки-заглушки)
function renderConsultsSkeleton() {
    return `
        <div class="consult-skeleton-list">
            ${[1, 2].map(() => `
                <div class="consult-card" style="border-color: transparent;">
                    <div class="skeleton-block" style="width: 40px; height: 40px; border-radius: 8px;"></div>
                    <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
                        <div class="skeleton-block" style="width: 60%; height: 16px;"></div>
                        <div class="skeleton-block" style="width: 40%; height: 12px;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// HTML списка консультаций или пустого состояния
function renderConsultsList(consults) {
    if (!consults || consults.length === 0) {
        return '<div class="admin-placeholder">Пока нет консультаций</div>';
    }
    let html = '<div class="consults-list">';
    consults.forEach(c => {
        html += `
            <div class="consult-card">
                <div class="consult-day">${CONSULT_DAYS[c.day_num] || '?'}</div>
                <div class="consult-info">
                    <div class="consult-subject">${c.subject}</div>
                    <div class="consult-details">
                        <span>⏰ ${c.time_start} - ${c.time_end}</span>
                        ${c.room ? `<span>📍 ${c.room}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

export function createOffcanvas(profile) {
    const tg = window.Telegram?.WebApp;
    const base = import.meta.env.BASE_URL;
    const userRole = profile?.role || 'student';
    const userGroup = profile?.group_name || 'Нет группы';
    const email = profile?.email || 'user@mail.ru';
    const avatarLetter = email.charAt(0).toUpperCase();

    // Кеш консультаций на уровне экземпляра меню.
    // null = ещё не грузили, [] = пусто, [{...}] = данные.
    let consultsCache = null;
    // Промис загрузки — чтобы не дублировать запросы, если пользователь
    // быстро открывает/закрывает меню.
    let consultsLoadingPromise = null;

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
                
                <button class="btn btn-primary btn-full" id="btn-full-schedule" style="margin-bottom: 15px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Расписание на 2 недели
                </button>

                <!-- СПРАВОЧНИК (АККОРДЕОН) -->
                <div class="sidebar-section-title">СПРАВОЧНИК</div>
                <div class="settings-group glass-panel" id="ref-group-calc">
                    <div class="settings-header"><span>Калькулятор оценок</span><span class="arrow">▼</span></div>
                    <div class="settings-content"><div class="settings-inner" id="calc-container"></div></div>
                </div>

                <div class="settings-group glass-panel" id="ref-group-libs">
                    <div class="settings-header"><span>Электронные библиотеки</span><span class="arrow">▼</span></div>
                    <div class="settings-content"><div class="settings-inner">
                        <a href="https://e.lanbook.com/" target="_blank" class="lib-card">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            <div>
                                <h4>ЭБС Лань</h4>
                                <p>Учебники и пособия</p>
                            </div>
                        </a>
                        <a href="https://academia-moscow.ru/" target="_blank" class="lib-card">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 10px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Настройки
                </button>
            </div>
            <div class="offcanvas-footer">
                <a href="https://t.me/+sq9RDqa2I2A3M2Iy" target="_blank" rel="noopener noreferrer" class="college-link" style="border-color: #0088cc; color: #0088cc;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Наш Telegram-чат
                </a>
                <a href="https://volgograd-college.gazprom.ru/" target="_blank" rel="noopener noreferrer" class="college-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

    // --- ИНИЦИАЛИЗАЦИЯ КАЛЬКУЛЯТОРА ---
    const calcContainer = offcanvas.querySelector('#calc-container');
    calcContainer.innerHTML = `
        <div class="calc-display" id="calc-display"><span class="calc-placeholder">Введи оценки</span></div>
        <div class="calc-result" id="calc-result">Средний балл: -</div>
        <div class="calc-keyboard">
            <button class="calc-btn" data-val="5">5</button>
            <button class="calc-btn" data-val="4">4</button>
            <button class="calc-btn" data-val="3">3</button>
            <button class="calc-btn" data-val="2">2</button>
            <button class="calc-btn" data-val="1">1</button>
            <button class="calc-btn calc-btn-action" id="calc-back">⌫</button>
            <button class="calc-btn calc-btn-bad" data-val="22222">22222</button>
            <button class="calc-btn calc-btn-action calc-btn-wide" id="calc-clear" style="grid-column: span 2;">Сброс</button>
        </div>
    `;

    let calcValue = '';
    let popAnim = null;
    const display = calcContainer.querySelector('#calc-display');
    const result = calcContainer.querySelector('#calc-result');

    const updateCalc = () => {
        if (calcValue) {
            display.innerHTML = `<span class="calc-numbers">${calcValue}</span>`;
            display.classList.remove('empty');
        } else {
            display.innerHTML = `<span class="calc-placeholder">Введи оценки</span>`;
            display.classList.add('empty');
        }

        // WAAPI вместо classList.remove + void offsetWidth + classList.add.
        // Без синхронного reflow — не дёргает layout при каждом клике.
        if (popAnim) popAnim.cancel();
        popAnim = display.animate(
            [
                { transform: 'scale(1)' },
                { transform: 'scale(1.02)' },
                { transform: 'scale(1)' }
            ],
            { duration: 200, easing: 'ease-out' }
        );
        
        const matches = calcValue.match(/[1-5]/g);
        if (!matches || matches.length === 0) { 
            result.textContent = 'Средний балл: -'; 
            result.classList.remove('has-value');
            return; 
        }
        
        const grades = matches.map(Number);
        const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
        result.textContent = `Средний балл: ${avg.toFixed(2)}`;
        result.classList.add('has-value');
    };

    calcContainer.querySelectorAll('.calc-btn[data-val]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (calcValue.length < 40) { calcValue += btn.dataset.val; updateCalc(); }
        });
    });
    calcContainer.querySelector('#calc-back').addEventListener('click', () => { calcValue = calcValue.slice(0, -1); updateCalc(); });
    calcContainer.querySelector('#calc-clear').addEventListener('click', () => { calcValue = ''; updateCalc(); });

    // --- КОНСУЛЬТАЦИИ: КЕШ + ПРЕДЗАГРУЗКА ---
    // Функция грузит консультации один раз. Повторные вызовы возвращают
    // тот же промис (пока загрузка идёт) или уже готовые данные из кеша.
    const loadConsults = () => {
        if (consultsCache !== null) return Promise.resolve(consultsCache);
        if (consultsLoadingPromise) return consultsLoadingPromise;
        consultsLoadingPromise = getConsultations().then(data => {
            consultsCache = data || [];
            consultsLoadingPromise = null;
            return consultsCache;
        }).catch(err => {
            consultsLoadingPromise = null;
            throw err;
        });
        return consultsLoadingPromise;
    };

    // Сюда рендерим результат, если аккордеон открыт к моменту прихода данных.
    // Если уже закрыт — ничего не делаем, данные полежат в кеше.
    const applyConsultsToContainer = (container, consults) => {
        if (!container.isConnected) return;
        container.innerHTML = renderConsultsList(consults);
    };

    // --- АККОРДЕОНЫ В ГЛАВНОМ МЕНЮ ---
    const refGroups = offcanvas.querySelectorAll('.settings-group');
    refGroups.forEach(group => {
        const header = group.querySelector('.settings-header');
        header.addEventListener('click', () => {
            const isActive = group.classList.contains('active');
            const isOpening = !isActive;

            // 1) СРАЗУ переключаем остальные и текущую группу — анимация стартует немедленно.
            refGroups.forEach(g => { if (g !== group) g.classList.remove('active'); });
            group.classList.toggle('active');

            // 2) И только ПОСЛЕ этого занимаемся данными (если группа консультаций).
            if (group.id === 'ref-group-consults' && isOpening) {
                const container = group.querySelector('#consults-container');
                if (!container) return;

                // Если кеш уже есть — рендерим мгновенно, никаких скелетонов.
                if (consultsCache !== null) {
                    applyConsultsToContainer(container, consultsCache);
                    return;
                }

                // Кеша нет. Показываем скелетон с задержкой 150 мс —
                // если ответ придёт быстрее, пользователь его не увидит.
                let skeletonShown = false;
                const skeletonTimer = setTimeout(() => {
                    skeletonShown = true;
                    if (container.isConnected) container.innerHTML = renderConsultsSkeleton();
                }, 150);

                // Данные грузим в фоне. UI уже открыт, анимация уже идёт.
                loadConsults()
                    .then(data => {
                        clearTimeout(skeletonTimer);
                        // Если пользователь уже закрыл меню/аккордеон — не трогаем DOM.
                        if (!container.isConnected) return;
                        applyConsultsToContainer(container, data);
                    })
                    .catch(() => {
                        clearTimeout(skeletonTimer);
                        if (!container.isConnected) return;
                        container.innerHTML = '<div class="admin-placeholder">Не удалось загрузить консультации</div>';
                    });
            }
        });
    });

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
        // Предзагрузка консультаций в фоне, пока пользователь смотрит профиль.
        // К моменту клика на аккордеон данные, скорее всего, уже придут.
        if (consultsCache === null && !consultsLoadingPromise) {
            loadConsults().catch(() => { /* ошибку покажем при открытии аккордеона */ });
        }
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

    // --- МОДАЛЬНЫЕ ОКНА ---
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
                    <h3>${title}</h3>
                    <button class="icon-btn" onclick="document.getElementById('global-modal').classList.remove('active')">✖</button>
                </div>
                <div class="modal-body">${contentHTML}</div>
            </div>
        `;
        modal.classList.add('active');
    };

    offcanvas.querySelector('#btn-full-schedule').addEventListener('click', async () => {
        showModal('Расписание на 2 недели', '<div style="text-align:center; padding:20px;">Загрузка всех дней...</div>');
        try {
            const weeksData = [];
            for (let w = 0; w < 2; w++) {
                const weekNum = getWeekByOffset(w);
                const days = [];
                for (let d = 1; d <= 5; d++) {
                    const targetDate = getDateForDayAndWeek(d, w);
                    const [lessons, subs] = await Promise.all([
                        getScheduleForDay(userGroup, weekNum, d),
                        getSubstitutions(targetDate, userGroup)
                    ]);
                    days.push({ dayNum: d, lessons: applySubstitutions(lessons, subs) });
                }
                weeksData.push({ weekNum, days });
            }
            document.querySelector('#global-modal .modal-body').innerHTML = '';
            document.querySelector('#global-modal .modal-body').appendChild(renderFullSchedule(userGroup, weeksData));
        } catch (err) {
            document.querySelector('#global-modal .modal-body').innerHTML = '<div style="color: #ef4444; text-align: center;">Ошибка загрузки расписания.</div>';
        }
    });

    // --- ЛОГИКА СВАЙПА ---
    let startX = 0, currentX = 0, startTime = 0, isSwiping = false;

    const onDragStart = (e) => {
        if (!offcanvas.classList.contains('open') || document.querySelector('.global-modal.active')) return;
        if (e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea')) return;
        
        isSwiping = true;
        startTime = Date.now();
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        offcanvas.style.transition = 'none';
        overlay.style.transition = 'none';
        offcanvas.style.userSelect = 'none';
    };

    const onDragMove = (e) => {
        if (!isSwiping) return;
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        if (diff < 0) {
            offcanvas.style.transform = `translateX(${diff}px)`;
            const opacity = 1 - (Math.abs(diff) / offcanvas.offsetWidth);
            overlay.style.opacity = Math.max(0, opacity);
        }
    };

    const onDragEnd = () => {
        if (!isSwiping) return;
        isSwiping = false;
        const diff = currentX - startX;
        const time = Date.now() - startTime;
        offcanvas.style.transition = ''; 
        overlay.style.transition = '';
        offcanvas.style.userSelect = '';
        if ((time < 250 && diff < -30) || diff < -(offcanvas.offsetWidth * 0.15)) {
            close(); 
        } else {
            offcanvas.style.transform = '';
            overlay.style.opacity = '';
        }
    };

    // На тач-устройствах mousemove/mouseup не срабатывают, но слушатели висят.
    // Вешаем их только если основное устройство ввода — мышь (ПК).
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;

    offcanvas.addEventListener('touchstart', onDragStart, { passive: true });
    offcanvas.addEventListener('touchmove', onDragMove, { passive: true });
    offcanvas.addEventListener('touchend', onDragEnd);

    if (isPointerFine) {
        offcanvas.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
    }

    // --- LONG PRESS (ВОЛНА) ---
    let logoutTimer = null;
    const startLogoutHold = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return; 
        e.preventDefault(); 
        btnLogout.classList.add('is-holding');
        btnLogout.textContent = 'Удерживайте...';
        logoutTimer = setTimeout(async () => {
            await supabase.auth.signOut();
            window.location.href = `${base}index.html`;
        }, 3000);
    };

    const cancelLogoutHold = () => {
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            logoutTimer = null;
        }
        btnLogout.classList.remove('is-holding');
        btnLogout.textContent = originalText;
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