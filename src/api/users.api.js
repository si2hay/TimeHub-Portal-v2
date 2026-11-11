/**
 * @file src/api/users.api.js
 * @description Запросы для управления пользователями (только для админов).
 */
import { supabase } from './supabase-client.js';

// Получить всех пользователей
export async function getAllUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('group_name');
    
    if (error) {
        console.error('Ошибка получения юзеров:', error);
        return [];
    }
    return data;
}

// Обновить роль или группу пользователя
export async function updateUserProfile(userId, updates) {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
    return !error;
}