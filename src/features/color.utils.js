/**
 * @file src/features/color.utils.js
 * @description Математические утилиты для работы с цветом (без DOM).
 */

export function getContrastColor(hex) {
    if (!hex || !hex.startsWith('#')) return '#ffffff';
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

export function shadeColor(hex, percent) {
    if (!hex || !hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1);
}

export function hexToRgba(hex, alpha) {
    if (!hex || !hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = num >> 16;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}