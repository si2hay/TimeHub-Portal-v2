/**
 * @file src/pages/admin/users.admin.js
 * @description Логика вкладки "Пользователи" в админке с умным поиском.
 */
import { getAllUsers, updateUserProfile } from '../../api/users.api.js';
import { GROUPS } from '../../constants/groups.js';
import { createSearchableSelect } from '../../ui/custom-select.ui.js';
import { smartSearch } from '../../features/search.logic.js';

const ROLES = ['Студент', 'Староста', 'SAP', 'Админ'];
const roleMap = { 'Студент': 'student', 'Староста': 'starosta', 'SAP': 'sap', 'Админ': 'admin' };
const roleWeights = { 'admin': 1, 'sap': 2, 'starosta': 3, 'student': 4 };

export async function initUsersTab(contentArea) {
    contentArea.innerHTML = '<div class="admin-placeholder">Загрузка пользователей...</div>';
    const users = await getAllUsers();
    
    if (users.length === 0) {
        contentArea.innerHTML = '<div class="admin-placeholder">Пользователей пока нет.</div>';
        return;
    }

    contentArea.innerHTML = `
        <div class="admin-header-title" style="margin-bottom: 20px;">
            <h2 style="margin-bottom: 10px;">Пользователи <span style="color: var(--text-muted); font-size: 16px;">(${users.length})</span></h2>
            <input type="text" id="user-search" class="admin-input" placeholder="🔍 Умный поиск по email..." style="max-width: 400px; margin-bottom: 20px;">
        </div>
        <div id="users-list-container" class="users-list"></div>
    `;

    const listContainer = document.getElementById('users-list-container');
    const searchInput = document.getElementById('user-search');

    const renderList = (searchQuery = '') => {
        const filteredUsers = smartSearch(users, searchQuery, u => u.email || '');
        filteredUsers.sort((a, b) => (roleWeights[a.role] || 99) - (roleWeights[b.role] || 99));

        if (filteredUsers.length === 0) {
            listContainer.innerHTML = '<div class="admin-placeholder">Никого не найдено.</div>';
            return;
        }

        listContainer.innerHTML = '';
        
        filteredUsers.forEach(u => {
            const email = u.email || 'Нет почты';
            const initial = email.charAt(0).toUpperCase();
            
            const card = document.createElement('div');
            card.className = 'user-admin-card';
            card.innerHTML = `
                <div class="user-admin-info">
                    <div class="user-admin-avatar">${initial}</div>
                    <div>
                        <div class="user-admin-email">${email}</div>
                        <div class="user-admin-id">ID: ${u.id.substring(0, 8)}...</div>
                    </div>
                </div>
                <div class="user-admin-controls" id="controls-${u.id}"></div>
            `;
            
            const controls = card.querySelector(`#controls-${u.id}`);
            
            const groupSelect = createSearchableSelect(
                GROUPS, u.group_name || GROUPS[0], 'Группа', `hidden-group-${u.id}`,
                async (newGroup) => { await updateUserProfile(u.id, { group_name: newGroup }); }
            );
            controls.appendChild(groupSelect);
            
            const currentRoleRus = Object.keys(roleMap).find(key => roleMap[key] === u.role) || 'Студент';
            const roleSelect = createSearchableSelect(
                ROLES, currentRoleRus, 'Роль', `hidden-role-${u.id}`,
                async (newRoleRus) => { 
                    await updateUserProfile(u.id, { role: roleMap[newRoleRus] }); 
                    renderList(searchInput.value);
                }
            );
            controls.appendChild(roleSelect);
            
            listContainer.appendChild(card);
        });
    };

    searchInput.addEventListener('input', (e) => renderList(e.target.value));
    renderList();
}