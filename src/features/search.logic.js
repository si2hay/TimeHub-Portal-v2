/**
 * @file src/features/search.logic.js
 * @description Умный поиск (Smart Search). Игнорирует пробелы, дефисы и прощает опечатки.
 * @exports smartSearch
 */

// Вспомогательная функция для расчета расстояния Левенштейна (опечатки)
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // замена
                    matrix[i][j - 1] + 1,     // вставка
                    matrix[i - 1][j] + 1      // удаление
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

/**
 * Умный поиск
 * @param {Array} items - Массив элементов для поиска
 * @param {String} query - Строка запроса
 * @param {Function} getSearchStr - Функция, которая возвращает строку для поиска из элемента
 * @returns {Array} Отфильтрованный массив
 */
export function smartSearch(items, query, getSearchStr = (item) => String(item)) {
    if (!query || query.trim() === '') return items;
    
    // Убираем всё кроме букв и цифр
    const cleanQuery = query.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
    if (cleanQuery === '') return items;

    return items.filter(item => {
        const originalStr = getSearchStr(item);
        const cleanStr = originalStr.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
        
        // 1. Прямое вхождение без пробелов и дефисов (26ат -> 26атп1бо)
        if (cleanStr.includes(cleanQuery)) return true;
        
        // 2. Опечатки (Levenshtein)
        if (cleanQuery.length > 2 && cleanStr.length > 2) {
            // Если запрос совпадает с началом строки с 1-2 опечатками
            if (cleanStr.length >= cleanQuery.length) {
                const substring = cleanStr.slice(0, cleanQuery.length + 1);
                if (levenshtein(cleanQuery, substring) <= 2) return true;
            }
            // Или если это короткое слово (типа email) и опечатка 1 символ
            if (cleanQuery.length > 4 && cleanStr.length > 4) {
                 if (levenshtein(cleanQuery, cleanStr) <= 2) return true;
            }
        }
        
        // 3. Поиск по словам (если есть пробелы в оригинальном запросе)
        const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
        if (queryWords.length > 1) {
            const strWords = originalStr.toLowerCase().split(/\s+/).filter(Boolean);
            return queryWords.every(qw => 
                strWords.some(sw => sw.includes(qw) || (qw.length > 2 && levenshtein(qw, sw) <= 1))
            );
        }

        return false;
    });
}