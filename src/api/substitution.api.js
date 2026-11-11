/**
 * @file src/api/substitution.api.js
 * @description Запросы к БД для работы с заменами.
 * @exports getSubstitutions, saveSubstitutions
 */
import { supabase } from './supabase-client.js';

export async function getSubstitutions(dateStr, groupName) {
    const { data, error } = await supabase
        .from('substitutions')
        .select('*')
        .eq('date_str', dateStr)
        .eq('group_name', groupName);

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