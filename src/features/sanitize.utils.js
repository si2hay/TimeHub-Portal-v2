/**
 * @file src/features/sanitize.utils.js
 * @description Утилита для защиты от XSS-атак.
 * Превращает опасные символы в безопасные HTML-сущности.
 */

export function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}