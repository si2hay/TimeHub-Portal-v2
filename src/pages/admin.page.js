/**
 * @file src/pages/admin.page.js
 */
import { supabase } from '../api/supabase-client.js';
import { getUserProfile } from '../api/profile.api.js';
import { applyUserSettings } from '../features/settings.logic.js';
import { renderAdminLayout } from '../ui/admin.ui.js';
import { initScheduleTab } from './admin/schedule.admin.js';
import { initSubstitutionTab } from './admin/substitution.admin.js';
import { initUsersTab } from './admin/users.admin.js';

async function initAdminPanel() {
    const appDiv = document.getElementById('admin-app');
    appDiv.innerHTML = '<div style="text-align:center; padding: 50px;">Проверка прав...</div>';

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = `${import.meta.env.BASE_URL}pages/index.html`; return; }

    const profile = await getUserProfile(session.user.id);
    
    // Разрешаем вход админу, SAP и старосте
    const allowedRoles = ['admin', 'sap', 'starosta'];
    if (!profile || !allowedRoles.includes(profile.role)) {
        alert('У тебя нет прав для входа в админку!');
        window.location.href = `${import.meta.env.BASE_URL}pages/app.html`;
        return;
    }

    applyUserSettings(profile.settings);

    appDiv.innerHTML = '';
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = `${import.meta.env.BASE_URL}pages/index.html`;
    };

    // Передаем роль в макет, чтобы скрыть вкладку "Пользователи"
    const layout = renderAdminLayout(session.user.email, profile.role, handleLogout);
    appDiv.appendChild(layout);

    const contentArea = document.getElementById('admin-content');
    const tabs = document.querySelectorAll('.admin-tab');

    const switchTab = (clickedTab) => {
        tabs.forEach(t => t.classList.remove('active'));
        clickedTab.classList.add('active');

        const target = clickedTab.dataset.target;
        
        contentArea.style.animation = 'none';
        contentArea.offsetHeight;
        contentArea.style.animation = 'fadeInUp 0.3s ease forwards';

        if (target === 'schedule') initScheduleTab(contentArea);
        if (target === 'substitutions') initSubstitutionTab(contentArea);
        if (target === 'users' && allowedRoles.includes(profile.role) && profile.role !== 'starosta') {
            initUsersTab(contentArea);
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab));
    });
}

initAdminPanel();