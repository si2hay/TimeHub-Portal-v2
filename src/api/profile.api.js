/**
 * @file src/api/profile.api.js
 * @description Запросы к БД, связанные с профилем пользователя.
 * @exports getUserProfile
 */
import { supabase } from './supabase-client.js';

export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Ошибка загрузки профиля:', error);
        return null;
    }
    return data;
}