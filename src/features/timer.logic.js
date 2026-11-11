/**
 * @file src/features/timer.logic.js
 * @description Чистая логика расчета времени пар.
 */

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function formatTimeLeft(mins) {
    if (mins < 0) return "00:00";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h} ч ${m} мин`;
    return `${m} мин`;
}

export function getTimerState(now, lessons, bells) {
    const currentMins = now.getHours() * 60 + now.getMinutes();

    if (!lessons || lessons.length === 0) {
        return { status: 'empty', text: 'На сегодня пар нет 🎉', progress: 0 };
    }

    const todaySchedule = lessons.map(lesson => {
        const bell = bells.find(b => b.pair === lesson.pair_num);
        return {
            ...lesson,
            startTime: lesson.custom_start || (bell ? bell.start : null),
            endTime: lesson.custom_end || (bell ? bell.end : null)
        };
    }).filter(l => l.startTime && l.endTime);

    if (todaySchedule.length === 0) {
         return { status: 'empty', text: 'Время пар не задано', progress: 0 };
    }

    const firstPairStart = timeToMinutes(todaySchedule[0].startTime);

    if (currentMins < firstPairStart) {
        return {
            status: 'waiting',
            text: `До первой пары:`,
            subject: todaySchedule[0].subject,
            room: todaySchedule[0].room,
            timeLeft: formatTimeLeft(firstPairStart - currentMins),
            progress: 0 // Или можно считать от начала дня, но пока 0
        };
    }

    for (let i = 0; i < todaySchedule.length; i++) {
        const pair = todaySchedule[i];
        const start = timeToMinutes(pair.startTime);
        const end = timeToMinutes(pair.endTime);
        const duration = end - start;
        
        // Если мы на паре
        if (currentMins >= start && currentMins < end) {
            const progress = (currentMins - start) / duration; // От 0 до 1
            
            if (duration < 90) {
                return { status: 'lesson', text: `Идет ${pair.pair_num}-я пара:`, subject: pair.subject, room: pair.room, timeLeft: formatTimeLeft(end - currentMins), progress };
            } else {
                const halfEnd = start + 45;
                if (currentMins >= start && currentMins < halfEnd) {
                    return { status: 'lesson', text: `Идет 1-я часть ${pair.pair_num}-й пары:`, subject: pair.subject, room: pair.room, timeLeft: formatTimeLeft(halfEnd - currentMins), progress: (currentMins - start) / 45 };
                } else {
                    return { status: 'break', text: `Перемена:`, subject: pair.subject, room: pair.room, timeLeft: formatTimeLeft(end - currentMins), progress: (currentMins - halfEnd) / 45 };
                }
            }
        }

        // Если перемена перед следующей парой
        if (currentMins >= end && i < todaySchedule.length - 1) {
            const nextPair = todaySchedule[i + 1];
            const nextStart = timeToMinutes(nextPair.startTime);
            if (currentMins < nextStart) {
                return { 
                    status: 'waiting', 
                    text: `Перемена перед ${nextPair.pair_num}-й парой:`, 
                    subject: nextPair.subject, 
                    room: nextPair.room,
                    timeLeft: formatTimeLeft(nextStart - currentMins),
                    progress: 1 // Полоска заполнена, т.к. пара прошла
                };
            }
        }
    }

    return { status: 'finished', text: 'Пары на сегодня закончились 🎉', progress: 1 };
}