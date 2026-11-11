/**
 * @file src/api/consultations.api.js
 * @description Запросы к БД для работы с консультациями.
 */
import { supabase } from './supabase-client.js';

export async function getConsultations() {
    const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('day_num', { ascending: true })
        .order('time_start', { ascending: true });

    if (error) {
        console.error('Ошибка загрузки консультаций:', error);
        return [];
    }
    return data || [];
}

export async function saveConsultations(consultations) {
    // Удаляем все старые консультации (только админ может это сделать благодаря RLS)
    const { error: delError } = await supabase.from('consultations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delError) return { success: false, error: delError };

    if (consultations.length === 0) return { success: true };

    const toInsert = consultations.map(c => ({
        subject: c.subject,
        room: c.room,
        day_num: Number(c.day_num),
        time_start: c.time_start,
        time_end: c.time_end
    }));

    const { error: insError } = await supabase.from('consultations').insert(toInsert);
    if (insError) return { success: false, error: insError };

    return { success: true };
}