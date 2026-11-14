/**
 * @file src/ui/timer/timer.utils.js
 * @description Утилиты для форматирования времени в таймерах.
 */

// Форматирование для фуллскрина (блоки)
export function formatFullscreenTime(timeStr) {
    if (!timeStr) return '';
    
    if (timeStr === '00:00') {
        return `<div class="fs-time-group"><span class="fs-time-num">00</span><span class="fs-time-unit">мин</span></div>`;
    }

    let html = '';
    const dMatch = timeStr.match(/(\d+)\s*д/);
    const hMatch = timeStr.match(/(\d+)\s*ч/);
    const mMatch = timeStr.match(/(\d+)\s*мин/);

    if (dMatch) {
        html += `<div class="fs-time-group"><span class="fs-time-num">${dMatch[1]}</span><span class="fs-time-unit">д</span></div>`;
    }
    if (hMatch) {
        html += `<div class="fs-time-group"><span class="fs-time-num">${hMatch[1]}</span><span class="fs-time-unit">ч</span></div>`;
    }
    if (mMatch) {
        html += `<div class="fs-time-group"><span class="fs-time-num">${mMatch[1]}</span><span class="fs-time-unit">мин</span></div>`;
    }

    if (html === '') {
        html = `<div class="fs-time-group"><span class="fs-time-num" style="font-size: 40px;">${timeStr}</span></div>`;
    }

    return html;
}

// Форматирование для обычного виджета
export function formatCompactTime(timeStr) {
    if (!timeStr) return '';
    // Делаем неразрывными пробелы ТОЛЬКО между цифрой и единицей измерения.
    // Пробелы между разными единицами (например, "1 д" и "8 ч") остаются обычными,
    // чтобы текст мог красиво переноситься на новую строку, если не влезает.
    return timeStr.replace(/(\d+)\s+([а-яА-ЯёЁ]+)/g, '$1&nbsp;$2');
}