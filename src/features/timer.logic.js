/**
 * @file src/features/timer.logic.js
 * @description Чистая логика расчета времени пар с учетом перемен.
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
        return { status: 'empty', text: 'На этот день пар нет 🎉', progress: 0 };
    }

    const todaySchedule = lessons.map(lesson => {
        const bell = bells.find(b => b.pair === lesson.pair_num);
        const hasCustom = lesson.custom_start && lesson.custom_end;

        const startStr = hasCustom ? lesson.custom_start : (bell ? bell.start : null);
        const endStr = hasCustom ? lesson.custom_end : (bell ? bell.end : null);
        
        if (!startStr || !endStr) return null;

        const startMins = timeToMinutes(startStr);
        const endMins = timeToMinutes(endStr);
        
        let breakStartMins = null;
        let breakEndMins = null;
        let hasBreak = false;

        if (hasCustom) {
            hasBreak = false;
        } else if (bell) {
            breakStartMins = timeToMinutes(bell.breakStart);
            breakEndMins = timeToMinutes(bell.breakEnd);
            hasBreak = breakStartMins < breakEndMins;
        }

        return {
            ...lesson,
            startMins,
            endMins,
            breakStartMins,
            breakEndMins,
            hasBreak
        };
    }).filter(l => l !== null).sort((a, b) => a.startMins - b.startMins);

    if (todaySchedule.length === 0) {
        return { status: 'empty', text: 'Время пар не задано', progress: 0 };
    }

    const firstPair = todaySchedule[0];
    if (currentMins < firstPair.startMins) {
        return {
            status: 'waiting',
            text: `До первой пары:`,
            subject: firstPair.subject,
            room: firstPair.room,
            timeLeft: formatTimeLeft(firstPair.startMins - currentMins),
            progress: 0
        };
    }

    for (let i = 0; i < todaySchedule.length; i++) {
        const pair = todaySchedule[i];
        
        if (currentMins >= pair.startMins && currentMins < pair.endMins) {
            
            if (!pair.hasBreak) {
                const progress = (currentMins - pair.startMins) / (pair.endMins - pair.startMins);
                return { 
                    status: 'lesson', 
                    text: `Идет ${pair.pair_num}-я пара:`, 
                    subject: pair.subject, 
                    room: pair.room, 
                    timeLeft: formatTimeLeft(pair.endMins - currentMins), 
                    progress 
                };
            }

            if (currentMins < pair.breakStartMins) {
                const duration = pair.breakStartMins - pair.startMins;
                const progress = duration > 0 ? (currentMins - pair.startMins) / duration : 0;
                return { 
                    status: 'lesson', 
                    text: `Идет 1-я часть ${pair.pair_num}-й пары:`, 
                    subject: pair.subject, 
                    room: pair.room, 
                    timeLeft: formatTimeLeft(pair.breakStartMins - currentMins), 
                    progress 
                };
            }
            else if (currentMins >= pair.breakStartMins && currentMins < pair.breakEndMins) {
                const duration = pair.breakEndMins - pair.breakStartMins;
                const progress = duration > 0 ? (currentMins - pair.breakStartMins) / duration : 1;
                return { 
                    status: 'break', 
                    text: `Перемена:`, 
                    subject: pair.subject, 
                    room: pair.room, 
                    timeLeft: formatTimeLeft(pair.breakEndMins - currentMins), 
                    progress 
                };
            }
            else {
                const duration = pair.endMins - pair.breakEndMins;
                const progress = duration > 0 ? (currentMins - pair.breakEndMins) / duration : 1;
                return { 
                    status: 'lesson', 
                    text: `Идет 2-я часть ${pair.pair_num}-й пары:`, 
                    subject: pair.subject, 
                    room: pair.room, 
                    timeLeft: formatTimeLeft(pair.endMins - currentMins), 
                    progress 
                };
            }
        }

        if (currentMins >= pair.endMins && i < todaySchedule.length - 1) {
            const nextPair = todaySchedule[i + 1];
            if (currentMins < nextPair.startMins) {
                return { 
                    status: 'waiting', 
                    text: `Перерыв перед ${nextPair.pair_num}-й парой:`, 
                    subject: nextPair.subject, 
                    room: nextPair.room,
                    timeLeft: formatTimeLeft(nextPair.startMins - currentMins),
                    progress: 1 
                };
            }
        }
    }

    return { status: 'finished', text: 'Пары на сегодня закончились 🎉', progress: 1 };
}