/**
 * @file src/api/substitution.api.js
 * @description Запросы к БД для работы с заменами.
 * @exports getSubstitutions, saveSubstitutions, cleanOldSubstitutions
 */
import { supabase } from './supabase-client.js';

export async function getSubstitutions(dateStr, groupName) {
    // Добавляем фильтр по дате: не грузим замены старше 15 дней (на всякий случай)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 15);
    const minDateStr = pastDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('substitutions')
        .select('*')
        .eq('date_str', dateStr)
        .eq('group_name', groupName)
        .gte('date_str', minDateStr); // Фильтр (больше или равно)

    if (error) {
        console.error('Ошибка загрузки замен:', error);
        return [];
    }
    return data || [];
}

export async function saveSubstitutions(dateStr, groupName, subsArray) {
    const { error: delError } = await supabase
        .from('substitutions')
        .delete()
        .match({ date_str: dateStr, group_name: groupName });

    if (delError) return { success: false, error: delError };
    if (subsArray.length === 0) return { success: true };

    const dataToInsert = subsArray.map(sub => ({
        date_str: dateStr,
        group_name: groupName,
        pair_num: sub.pair_num,
        subject: sub.subject,
        room: sub.room,
        teacher: sub.teacher,
        custom_start: sub.custom_start || null,
        custom_end: sub.custom_end || null
    }));

    const { error: insError } = await supabase.from('substitutions').insert(dataToInsert);
    if (insError) return { success: false, error: insError };

    return { success: true };
}

// НОВАЯ ФУНКЦИЯ: Удаляет замены старше 15 дней
export async function cleanOldSubstitutions() {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 15);
    const minDateStr = pastDate.toISOString().split('T')[0];

    const { error } = await supabase
        .from('substitutions')
        .delete()
        .lt('date_str', minDateStr); // Удаляем всё, что меньше (старше) этой даты

    if (error) {
        console.error('Ошибка очистки старых замен:', error);
        return false;
    }
    
    console.log(`[Автоочистка] Удалены замены старше ${minDateStr}`);
    return true;
}