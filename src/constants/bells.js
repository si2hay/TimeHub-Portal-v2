/**
 * @file src/constants/bells.js
 * @description Расписание звонков для 1-го и 2-го курсов.
 * @exports BELLS
 */

export const BELLS = {
    // 1 КУРС
    course1: [
        { pair: 1, start: "08:30", breakStart: "09:15", breakEnd: "09:20", end: "10:05" },
        { pair: 2, start: "10:15", breakStart: "11:00", breakEnd: "11:30", end: "12:15" }, // Обед 30 мин внутри
        { pair: 3, start: "12:25", breakStart: "13:10", breakEnd: "13:15", end: "14:00" },
        { pair: 4, start: "14:10", breakStart: "14:55", breakEnd: "15:00", end: "15:45" },
        { pair: 5, start: "16:15", breakStart: "17:00", breakEnd: "17:05", end: "17:50" }
    ],
    // 2+ КУРС
    course2plus: [
        { pair: 1, start: "08:30", breakStart: "09:15", breakEnd: "09:20", end: "10:05" },
        { pair: 2, start: "10:15", breakStart: "11:00", breakEnd: "11:05", end: "11:50" }, // Перемена 5 мин, обед после
        { pair: 3, start: "12:25", breakStart: "13:10", breakEnd: "13:15", end: "14:00" },
        { pair: 4, start: "14:10", breakStart: "14:55", breakEnd: "15:00", end: "15:45" },
        { pair: 5, start: "16:15", breakStart: "17:00", breakEnd: "17:05", end: "17:50" }
    ]
};