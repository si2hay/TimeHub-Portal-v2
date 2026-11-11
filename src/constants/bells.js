/**
 * @file src/constants/bells.js
 * @description Расписание звонков для 1-го и 2-го курсов.
 * @exports BELLS
 */

export const BELLS = {
    // 1 курс
    course1: [
        { pair: 1, start: "08:30", end: "10:05" },
        { pair: 2, start: "10:15", end: "12:15" },
        { pair: 3, start: "12:25", end: "14:00" },
        { pair: 4, start: "14:10", end: "15:45" },
        { pair: 5, start: "16:15", end: "17:50" }
    ],
    // 2+ курс 
    course2plus: [
        { pair: 1, start: "09:10", end: "10:40" },
        { pair: 2, start: "11:20", end: "12:50" },
        { pair: 3, start: "13:05", end: "14:35" },
        { pair: 4, start: "14:45", end: "16:15" },
        { pair: 5, start: "16:25", end: "17:55" }
    ]
};