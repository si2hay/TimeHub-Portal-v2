/**
 * @file src/ui/admin.ui.js
 * @description UI-компонент для Админ-панели.
 */

export function renderAdminLayout(adminEmail, role, onLogout) {
    const container = document.createElement('div');
    container.className = 'admin-layout';

    // Показываем вкладку "Пользователи" только Админу и SAP
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
                
                <button id="btn-admin-logout" class="btn btn-danger btn-full">Выйти</button>
            </div>
        </aside>

        <main class="admin-content" id="admin-content">
            <div class="admin-placeholder">
                <h2>Выбери раздел</h2>
            </div>
        </main>
    `;

    container.querySelector('#btn-admin-logout').addEventListener('click', onLogout);

    return container;
}