/**
 * @file src/pages/auth.page.js
 * @description Логика авторизации с валидацией, показом пароля и свайпами.
 */
import { supabase } from '../api/supabase-client.js';
import { GROUPS } from '../constants/groups.js';
import { initParticles } from '../ui/particles.ui.js';
import { smartSearch } from '../features/search.logic.js';
import { initTransitions } from '../ui/transitions.ui.js';
import { escapeHTML } from '../features/sanitize.utils.js';

async function initAuth() {
    initTransitions();

    const appDiv = document.getElementById('app');
    const appUrl = `${import.meta.env.BASE_URL}pages/app.html`;

    document.body.classList.add('theme-glass');
    
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    initParticles(isMobile ? 10 : 20);

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = appUrl;
        return;
    }

    const eyeOpen = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeClosed = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    appDiv.innerHTML = `
        <div class="auth-wrapper">
            <!-- Живой фон (Лава-лампа) -->
            <div class="auth-bg">
                <div class="lava-blob blob-1"></div>
                <div class="lava-blob blob-2"></div>
                <div class="lava-blob blob-3"></div>
                <div class="lava-blob blob-4"></div>
                <div class="lava-blob blob-5"></div>
            </div>

            <div class="auth-split-container" id="auth-container">
                
                <div class="auth-forms-track" id="auth-track">
                    
                    <!-- ВХОД -->
                    <div class="auth-form-panel login-panel">
                        <h2 class="auth-title">Вход в TimeHub</h2>
                        <form id="form-login" class="auth-form" novalidate>
                            <div class="input-wrapper">
                                <input type="email" id="login-email" placeholder="Email" required>
                            </div>
                            <div class="input-wrapper">
                                <input type="password" id="login-password" placeholder="Пароль" required minlength="6">
                                <button type="button" class="toggle-password" data-target="login-password">${eyeClosed}</button>
                            </div>
                            <button type="submit" class="btn btn-primary btn-full auth-submit-btn">Войти</button>
                        </form>
                        <div id="login-message" class="auth-message"></div>
                        
                        <div class="mobile-switch">
                            Нет аккаунта? <a href="#" id="goto-register-link">Создать</a>
                        </div>
                    </div>

                    <!-- РЕГИСТРАЦИЯ -->
                    <div class="auth-form-panel register-panel">
                        <h2 class="auth-title">Создать аккаунт</h2>
                        <form id="form-register" class="auth-form" novalidate>
                            <div class="input-wrapper">
                                <input type="email" id="reg-email" placeholder="Email" required>
                            </div>
                            <div class="input-wrapper">
                                <input type="password" id="reg-password" placeholder="Пароль (мин. 6 символов)" required minlength="6">
                                <button type="button" class="toggle-password" data-target="reg-password">${eyeClosed}</button>
                            </div>
                            <div class="input-wrapper">
                                <input type="password" id="reg-password-confirm" placeholder="Повторите пароль" required minlength="6">
                                <button type="button" class="toggle-password" data-target="reg-password-confirm">${eyeClosed}</button>
                            </div>
                            
                            <div class="input-wrapper custom-select-wrapper" id="group-select-wrapper">
                                <div class="custom-capsule placeholder" id="group-capsule">
                                    <span id="selected-group-text">Выберите свою группу</span>
                                    <span class="arrow">▼</span>
                                </div>
                                <div class="custom-dropdown" id="group-dropdown">
                                    <div class="dropdown-search-wrapper">
                                        <input type="text" id="group-search" placeholder="🔍 Умный поиск..." autocomplete="off">
                                    </div>
                                    <div class="custom-options" id="group-options"></div>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-success btn-full auth-submit-btn">Зарегистрироваться</button>
                        </form>
                        <div id="register-message" class="auth-message"></div>

                        <div class="mobile-switch">
                            Уже есть аккаунт? <a href="#" id="goto-login-link">Войти</a>
                        </div>
                    </div>
                </div>

                <!-- Шторка для ПК -->
                <div class="auth-overlay-panel" id="auth-overlay">
                    <div class="overlay-content" id="overlay-content-right">
                        <h2>Привет, друг!</h2>
                        <p>Ты у нас впервые? Создай аккаунт, чтобы видеть расписание своей группы.</p>
                        <button type="button" class="btn-glass-cta" id="btn-switch-register">
                            <span class="arrow-icon">←</span> Создать аккаунт
                        </button>
                    </div>

                    <div class="overlay-content" id="overlay-content-left">
                        <h2>С возвращением!</h2>
                        <p>Уже есть аккаунт? Войди, чтобы оставаться на связи с расписанием.</p>
                        <button type="button" class="btn-glass-cta" id="btn-switch-login">
                            Войти <span class="arrow-icon">→</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `;

    // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ---
    const authContainer = document.getElementById('auth-container');
    const authTrack = document.getElementById('auth-track');
    const contentRight = document.getElementById('overlay-content-right');
    const contentLeft = document.getElementById('overlay-content-left');
    
    contentLeft.style.opacity = '0';
    contentLeft.style.pointerEvents = 'none';
    contentRight.style.opacity = '1';
    contentRight.style.pointerEvents = 'all';

    let isRegisterMode = false;

    const switchToRegister = (e) => {
        if (e) e.preventDefault();
        isRegisterMode = true;
        authContainer.classList.add('is-register');
        contentRight.style.opacity = '0';
        contentRight.style.pointerEvents = 'none';
        contentLeft.style.opacity = '1';
        contentLeft.style.pointerEvents = 'all';
    };

    const switchToLogin = (e) => {
        if (e) e.preventDefault();
        isRegisterMode = false;
        authContainer.classList.remove('is-register');
        contentLeft.style.opacity = '0';
        contentLeft.style.pointerEvents = 'none';
        contentRight.style.opacity = '1';
        contentRight.style.pointerEvents = 'all';
    };

    document.getElementById('btn-switch-register').addEventListener('click', switchToRegister);
    document.getElementById('btn-switch-login').addEventListener('click', switchToLogin);
    document.getElementById('goto-register-link').addEventListener('click', switchToRegister);
    document.getElementById('goto-login-link').addEventListener('click', switchToLogin);

    // --- СВАЙПЫ (МЫШЬ И ТАЧ) ---
    let startX = 0, currentX = 0, isDragging = false, hasDragged = false;

    const onDragStart = (e) => {
        if (e.target.closest('input') || e.target.closest('.custom-select-wrapper') || e.target.closest('button')) return;
        
        isDragging = true;
        hasDragged = false;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        
        authTrack.style.transition = 'none';
        authContainer.classList.add('is-swiping');
    };

    const onDragMove = (e) => {
        if (!isDragging) return;
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;

        if (Math.abs(diff) > 10) hasDragged = true;

        if (isMobile) {
            const basePercent = isRegisterMode ? -50 : 0;
            const offsetPercent = (diff / window.innerWidth) * 100;
            authTrack.style.transform = `translateX(${basePercent + offsetPercent}%)`;
        } else {
            const overlay = document.getElementById('auth-overlay');
            const baseTransform = isRegisterMode ? -100 : 0;
            const offsetPx = diff * 0.2;
            overlay.style.transform = `translateX(calc(${baseTransform}% + ${offsetPx}px))`;
        }
    };

    const onDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentX - startX;
        authTrack.style.transition = '';
        authContainer.classList.remove('is-swiping');
        authTrack.style.transform = '';
        document.getElementById('auth-overlay').style.transform = '';

        if (diff < -50 && !isRegisterMode) switchToRegister();
        else if (diff > 50 && isRegisterMode) switchToLogin();

        if (hasDragged) {
            const preventClick = (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                document.removeEventListener('click', preventClick, true);
            };
            document.addEventListener('click', preventClick, true);
            setTimeout(() => document.removeEventListener('click', preventClick, true), 100);
        }
    };

    authContainer.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    authContainer.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    // --- ПОКАЗ ПАРОЛЯ ---
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = eyeOpen;
                btn.classList.add('active');
            } else {
                input.type = 'password';
                btn.innerHTML = eyeClosed;
                btn.classList.remove('active');
            }
        });
    });

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('input-error');
            const msgDiv = input.closest('.auth-form-panel').querySelector('.auth-message');
            if (msgDiv) {
                msgDiv.textContent = '';
                msgDiv.className = 'auth-message';
            }
        });
    });

    // --- ГРУППА ---
    const groupCapsule = document.getElementById('group-capsule');
    const groupDropdown = document.getElementById('group-dropdown');
    const groupSearch = document.getElementById('group-search');
    const groupOptions = document.getElementById('group-options');
    const selectedGroupText = document.getElementById('selected-group-text');
    let selectedGroup = '';

    const renderOptions = (query = '') => {
        const filtered = smartSearch(GROUPS, query);
        if (filtered.length === 0) {
            groupOptions.innerHTML = '<div class="no-results">Ничего не найдено</div>';
            return;
        }
        groupOptions.innerHTML = filtered.map(g => `<div class="custom-option" data-value="${escapeHTML(g)}">${escapeHTML(g)}</div>`).join('');

        groupOptions.querySelectorAll('.custom-option').forEach(opt => {
            opt.addEventListener('click', () => {
                selectedGroup = opt.dataset.value;
                selectedGroupText.textContent = selectedGroup;
                groupCapsule.classList.remove('placeholder', 'input-error');
                groupDropdown.classList.remove('open');
                groupSearch.value = ''; 
                renderOptions(); 
            });
        });
    };

    renderOptions(); 

    groupCapsule.addEventListener('click', (e) => {
        e.stopPropagation();
        groupDropdown.classList.toggle('open');
        if (groupDropdown.classList.contains('open')) groupSearch.focus();
    });

    document.addEventListener('click', (e) => {
        if (!groupCapsule.contains(e.target) && !groupDropdown.contains(e.target)) {
            groupDropdown.classList.remove('open');
        }
    });

    groupSearch.addEventListener('input', (e) => renderOptions(e.target.value));

    // --- ОТПРАВКА ---
    const translateError = (msg) => {
        if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль';
        if (msg.includes('User already registered')) return 'Этот email уже зарегистрирован';
        if (msg.includes('Password should be at least')) return 'Пароль слишком короткий';
        if (msg.includes('Unable to validate email')) return 'Некорректный формат email';
        return 'Ошибка: ' + msg;
    };

    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const msgDiv = document.getElementById('login-message');
        
        if (!emailInput.value || !passwordInput.value) {
            if (!emailInput.value) emailInput.classList.add('input-error');
            if (!passwordInput.value) passwordInput.classList.add('input-error');
            msgDiv.className = 'auth-message error';
            msgDiv.textContent = 'Заполните все поля!';
            return;
        }

        msgDiv.className = 'auth-message loading';
        msgDiv.textContent = 'Загрузка...';
        
        const { error } = await supabase.auth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value
        });

        if (error) {
            msgDiv.className = 'auth-message error';
            msgDiv.textContent = translateError(error.message);
            emailInput.classList.add('input-error');
            passwordInput.classList.add('input-error');
        } else {
            msgDiv.className = 'auth-message success';
            msgDiv.textContent = 'Успешный вход!';
            setTimeout(() => { window.location.href = appUrl; }, 800);
        }
    });

    document.getElementById('form-register').addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('reg-email');
        const passwordInput = document.getElementById('reg-password');
        const confirmInput = document.getElementById('reg-password-confirm');
        const msgDiv = document.getElementById('register-message');
        
        let hasError = false;

        if (!emailInput.value) { emailInput.classList.add('input-error'); hasError = true; }
        if (!passwordInput.value || passwordInput.value.length < 6) { passwordInput.classList.add('input-error'); hasError = true; }
        if (!confirmInput.value) { confirmInput.classList.add('input-error'); hasError = true; }
        if (!selectedGroup) { groupCapsule.classList.add('input-error'); hasError = true; }

        if (hasError) {
            msgDiv.className = 'auth-message error';
            msgDiv.textContent = 'Заполните выделенные поля!';
            return;
        }

        if (passwordInput.value !== confirmInput.value) {
            passwordInput.classList.add('input-error');
            confirmInput.classList.add('input-error');
            msgDiv.className = 'auth-message error';
            msgDiv.textContent = 'Пароли не совпадают!';
            return;
        }

        msgDiv.className = 'auth-message loading';
        msgDiv.textContent = 'Создание аккаунта...';

        const { error } = await supabase.auth.signUp({
            email: emailInput.value,
            password: passwordInput.value,
            options: { data: { group_name: selectedGroup } }
        });

        if (error) {
            msgDiv.className = 'auth-message error';
            msgDiv.textContent = translateError(error.message);
            emailInput.classList.add('input-error');
        } else {
            msgDiv.className = 'auth-message success';
            msgDiv.textContent = 'Аккаунт создан! Входим...';
            
            const { error: loginError } = await supabase.auth.signInWithPassword({ 
                email: emailInput.value, 
                password: passwordInput.value 
            });

            if (loginError) {
                msgDiv.className = 'auth-message success';
                msgDiv.textContent = 'Аккаунт создан! Проверьте почту для входа.';
            } else {
                setTimeout(() => { window.location.href = appUrl; }, 800);
            }
        }
    });
}

initAuth();