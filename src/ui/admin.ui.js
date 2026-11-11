/**
 * @file src/ui/admin.ui.js
 * @description UI-компонент для Админ-панели.
 */

export function renderAdminLayout(adminEmail, role, onLogout) {
    const container = document.createElement('div');
    container.className = 'admin-layout';

    const showUsersTab = (role === 'admin' || role === 'sap');

    container.innerHTML = `
        <aside class="admin-sidebar">
            <div class="admin-logo">
                <h2>TimeHub</h2>
                <span>Admin Panel</span>
            </div>
            
            <nav class="admin-nav">
                <button class="admin-tab active" data-target="schedule">📅 Расписание</button>
                <button class="admin-tab" data-target="substitutions">⚡ Замены</button>
                ${showUsersTab ? `<button class="admin-tab" data-target="users">👥 Пользователи</button>` : ''}
            </nav>

            <div class="admin-footer">
                <div class="admin-user">${adminEmail}</div>
                
                <a href="${import.meta.env.BASE_URL}pages/app.html" class="btn btn-primary btn-full">
                    ← На главную
                </a>
                
                <button id="btn-admin-logout" class="btn btn-danger btn-full btn-hold-action">Выйти</button>
            </div>
        </aside>

        <main class="admin-content" id="admin-content">
            <div class="admin-placeholder">
                <h2>Выбери раздел</h2>
            </div>
        </main>
    `;

    const logoutBtn = container.querySelector('#btn-admin-logout');
    const originalText = 'Выйти';
    let logoutTimer = null;

    const startLogoutHold = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return; 
        e.preventDefault(); 
        
        logoutBtn.classList.add('is-holding');
        logoutBtn.textContent = 'Удерживайте...'; // Меняем текст
        
        logoutTimer = setTimeout(() => {
            onLogout();
        }, 800); 
    };

    const cancelLogoutHold = () => {
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            logoutTimer = null;
        }
        logoutBtn.classList.remove('is-holding');
        logoutBtn.textContent = originalText; // Возвращаем текст
    };

    logoutBtn.addEventListener('mousedown', startLogoutHold);
    logoutBtn.addEventListener('mouseup', cancelLogoutHold);
    logoutBtn.addEventListener('mouseleave', cancelLogoutHold);

    logoutBtn.addEventListener('touchstart', startLogoutHold, { passive: false });
    logoutBtn.addEventListener('touchend', cancelLogoutHold);
    logoutBtn.addEventListener('touchcancel', cancelLogoutHold);
    logoutBtn.addEventListener('contextmenu', (e) => e.preventDefault());

    return container;
}