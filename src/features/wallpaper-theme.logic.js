/**
 * @file src/features/wallpaper-theme.logic.js
 * @description Максимально надежное извлечение палитры из картинки (Base64, GIF, PNG) с обходом CORS.
 */

// Вспомогательная функция: определение контрастного цвета (черный или белый)
function getContrastColor(hex) {
    if (!hex || !hex.startsWith('#')) return '#ffffff';
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

// Вспомогательная функция: затемнение/осветление цвета
function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1);
}

// Функция загрузки картинки с обходом CORS и фолбэками (если один прокси умрет, сработает другой)
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        // Если это Base64, грузим напрямую. Если ссылка — через прокси.
        if (url.startsWith('data:')) {
            img.src = url;
        } else {
            // Первый прокси (быстрый и надежный)
            img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
            
            // Если первый упал, пробуем второй
            img.onerror = () => {
                img.onerror = () => reject(new Error('Не удалось загрузить картинку ни через один прокси.'));
                img.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            };
        }

        img.onload = () => resolve(img);
    });
}

export async function extractColorsFromImage(url) {
    try {
        const img = await loadImage(url);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Уменьшаем до 50x50 (быстрее анализировать, качество цвета не теряется)
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        
        const data = ctx.getImageData(0, 0, 50, 50).data;
        const colorCounts = {};
        let maxCount = 0;
        let dominantColor = [30, 30, 30];

        // Собираем статистику по цветам
        for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Пропускаем прозрачные пиксели (чтобы фон PNG не портил цвет)
            if (a < 128) continue;

            // Огругляем цвета, чтобы сгруппировать похожие оттенки
            const key = `${Math.round(r/20)*20},${Math.round(g/20)*20},${Math.round(b/20)*20}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;

            if (colorCounts[key] > maxCount) {
                maxCount = colorCounts[key];
                dominantColor = [r, g, b];
            }
        }

        const toHex = (c) => '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');
        
        // 1. Акцентный цвет (берем самый популярный)
        const accent = toHex(dominantColor);
        
        // 2. Умный фон панелей (затемняем акцентный цвет, чтобы получился красивый "монохром")
        // Если акцент темный, делаем панели чуть светлее, если светлый - темнее
        const isAccentDark = getContrastColor(accent) === '#ffffff';
        const surfaceShade = isAccentDark ? 15 : -40; 
        const surfaceBase = shadeColor(accent, surfaceShade);
        
        // Делаем его полупрозрачным (стекло)
        const surfaceHex = surfaceBase.replace('#', '');
        const r = parseInt(surfaceHex.substr(0, 2), 16);
        const g = parseInt(surfaceHex.substr(2, 2), 16);
        const b = parseInt(surfaceHex.substr(4, 2), 16);
        const surface = `rgba(${r}, ${g}, ${b}, 0.85)`;

        // 3. Текст
        const text = getContrastColor(surfaceBase);
        const textMuted = text === '#000000' ? '#444444' : '#bbbbbb';

        // Небольшая задержка для эффекта "Анализ...", чтобы не было слишком резко
        await new Promise(r => setTimeout(r, 400));

        return {
            accent,
            surface,
            text,
            textMuted,
            isDark: isAccentDark
        };

    } catch (error) {
        console.error("Ошибка парсера обоев:", error);
        throw new Error('Не удалось проанализировать картинку. Попробуй другую ссылку или проверь интернет.');
    }
}