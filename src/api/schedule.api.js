import { supabase } from './supabase-client.js';

export async function getScheduleForDay(groupName, weekNum, dayNum) {
    const gName = groupName.trim();
    const wNum = Number(weekNum);
    const dNum = Number(dayNum);
    
    console.log(`[DEBUG] Запрос расписания: Группа="${gName}", Неделя=${wNum}, День=${dNum}`);

    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('group_name', gName)
        .eq('week_num', wNum)
        .eq('day_num', dNum)
        .order('pair_num', { ascending: true });

    if (error) {
        console.error('[DEBUG] Ошибка загрузки расписания:', error);
        return [];
    }
    
    console.log(`[DEBUG] Получено пар: ${data ? data.length : 0}`, data);
    return data || [];
}

export async function saveDaySchedule(groupName, weekNum, dayNum, lessons) {
    const gName = groupName.trim();
    const wNum = Number(weekNum);
    const dNum = Number(dayNum);

    const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .match({ group_name: gName, week_num: wNum, day_num: dNum });

    if (deleteError) {
        console.error('[DEBUG] Ошибка при удалении:', deleteError);
        return { success: false, error: deleteError };
    }

    if (lessons.length === 0) return { success: true };

    const lessonsToInsert = lessons.map(l => ({
        group_name: gName,
        week_num: wNum,
        day_num: dNum,
        pair_num: l.pair_num,
        subject: l.subject,
        room: l.room,
        teacher: l.teacher,
        custom_start: l.custom_start || null,
        custom_end: l.custom_end || null
    }));

    const { error: insertError } = await supabase.from('schedules').insert(lessonsToInsert);
    if (insertError) {
        console.error('[DEBUG] Ошибка при сохранении:', insertError);
        return { success: false, error: insertError };
    }
    return { success: true };
}