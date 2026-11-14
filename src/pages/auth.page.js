/**
 * @file src/pages/auth.page.js
 * @description Логика страницы входа и регистрации с русскими ошибками и умным поиском групп.
 */
import { supabase } from '../api/supabase-client.js';
import { GROUPS } from '../constants/groups.js';
import { initParticles } from '../features/particles.logic.js';
import { smartSearch } from '../features/search.logic.js';
import { initTransitions } from '../ui/transitions.ui.js';

async function initAuth() {
    initTransitions(); // Инициализация плавных переходов

    const appDiv = document.getElementById('app');
    const appUrl = `${import.meta.env.BASE_URL}pages/app.html`;

    // Принудительно ставим стеклянную тему и запускаем частицы на фоне
    document.body.classList.add('theme-glass');
    initParticles();

    // --- Проверка сессии, чтобы не было цикла ---
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = appUrl;
        return;
    }
    // --- КОНЕЦ ПРОВЕРКИ ---

    appDiv.innerHTML = `
        <div class="auth-wrapper">
            <!-- Синий размытый логотип на фоне -->
            <div class="auth-bg-logo"></div>

            <div class="auth-container">
                <h2 class="auth-title">Вход в TimeHub</h2>
                
                <form id="auth-form" class="auth-form">
                    <div class="input-group">
                        <input type="email" id="email" placeholder="Email" required>
                    </div>
                    <div class="input-group">
                        <input type="password" id="password" placeholder="Пароль (мин. 6 символов)" required minlength="6">
                    </div>
                    
                    <!-- КАСТОМНЫЙ ВЫБОР ГРУППЫ -->
                    <div class="input-group custom-select-wrapper" id="group-select-wrapper">
                        <div class="custom-capsule placeholder" id="group-capsule">
                            <span id="selected-group-text">Выберите свою группу</span>
                            <span class="arrow">▼</span>
                        </div>
                        <div class="custom-dropdown" id="group-dropdown">
                            <div class="dropdown-search-wrapper">
                                <input type="text" id="group-search" placeholder="🔍 Умный поиск..." autocomplete="off">
                            </div>
                            <div class="custom-options" id="group-options">
                                <!-- Сюда рендерятся группы -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="auth-buttons">
                        <button type="button" id="btn-login" class="btn-primary">Войти</button>
                        <button type="button" id="btn-signup" class="btn-success">Регистрация</button>
                    </div>
                </form>
                
                <div id="auth-message" class="auth-message"></div>
            </div>
        </div>
    `;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('auth-message');

    // --- ЛОГИКА ВЫБОРА ГРУППЫ ---
    const groupCapsule = document.getElementById('group-capsule');
    const groupDropdown = document.getElementById('group-dropdown');
    const groupSearch = document.getElementById('group-search');
    const groupOptions = document.getElementById('group-options');
    const selectedGroupText = document.getElementById('selected-group-text');
    let selectedGroup = '';

    // Функция отрисовки списка групп (с умным поиском)
    const renderOptions = (query = '') => {
        const filtered = smartSearch(GROUPS, query);
        
        if (filtered.length === 0) {
            groupOptions.innerHTML = '<div class="no-results">Ничего не найдено</div>';
            return;
        }

        groupOptions.innerHTML = filtered.map(g => `
            <div class="custom-option" data-value="${g}">${g}</div>
        `).join('');

        groupOptions.querySelectorAll('.custom-option').forEach(opt => {
            opt.addEventListener('click', () => {
                selectedGroup = opt.dataset.value;
                selectedGroupText.textContent = selectedGroup;
                groupCapsule.classList.remove('placeholder');
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
        if (groupDropdown.classList.contains('open')) {
            groupSearch.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (!groupCapsule.contains(e.target) && !groupDropdown.contains(e.target)) {
            groupDropdown.classList.remove('open');
        }
    });

    groupSearch.addEventListener('input', (e) => {
        renderOptions(e.target.value);
    });

    // --- ОШИБКИ ---
    const translateError = (msg) => {
        if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль';
        if (msg.includes('User already registered')) return 'Этот email уже зарегистрирован';
        if (msg.includes('Password should be at least')) return 'Пароль слишком короткий (минимум 6 символов)';
        if (msg.includes('Unable to validate email')) return 'Некорректный формат email';
        return 'Ошибка: ' + msg;
    };

    // --- ВХОД ---
    document.getElementById('btn-login').addEventListener('click', async (e) => {
        e.preventDefault();
        messageDiv.className = 'auth-message loading';
        messageDiv.textContent = 'Загрузка...';
        
        const { error } = await supabase.auth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value,
        });

        if (error) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = translateError(error.message);
        } else {
            messageDiv.className = 'auth-message success';
            messageDiv.textContent = 'Успешный вход!';
            setTimeout(() => { window.location.href = appUrl; }, 800);
        }
    });

    // --- РЕГИСТРАЦИЯ ---
    document.getElementById('btn-signup').addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (!selectedGroup) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = 'Пожалуйста, выберите свою группу из списка!';
            groupCapsule.classList.add('error-shake');
            setTimeout(() => groupCapsule.classList.remove('error-shake'), 500);
            return;
        }

        messageDiv.className = 'auth-message loading';
        messageDiv.textContent = 'Создание аккаунта...';

        const { error } = await supabase.auth.signUp({
            email: emailInput.value,
            password: passwordInput.value,
            options: {
                data: { group_name: selectedGroup }
            }
        });

        if (error) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = translateError(error.message);
        } else {
            messageDiv.className = 'auth-message success';
            messageDiv.textContent = 'Аккаунт создан! Входим...';
            
            await supabase.auth.signInWithPassword({
                email: emailInput.value,
                password: passwordInput.value,
            });
            setTimeout(() => { window.location.href = appUrl; }, 800);
        }
    });
}

initAuth();