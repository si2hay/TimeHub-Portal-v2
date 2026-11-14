/**
 * @file src/ui/wallpaper-theme.ui.js
 * @description Извлечение палитры из картинки (Base64, GIF, PNG) с обходом CORS.
 */
import { getContrastColor, shadeColor } from '../features/color.utils.js';

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        if (url.startsWith('data:')) {
            img.src = url;
        } else {
            img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
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
        
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        
        const data = ctx.getImageData(0, 0, 50, 50).data;
        const colorCounts = {};
        let maxCount = 0;
        let dominantColor = [30, 30, 30];

        for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue;

            const key = `${Math.round(r/20)*20},${Math.round(g/20)*20},${Math.round(b/20)*20}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;

            if (colorCounts[key] > maxCount) {
                maxCount = colorCounts[key];
                dominantColor = [r, g, b];
            }
        }

        const toHex = (c) => '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');
        const accent = toHex(dominantColor);
        
        const isAccentDark = getContrastColor(accent) === '#ffffff';
        const surfaceShade = isAccentDark ? 15 : -40; 
        const surfaceBase = shadeColor(accent, surfaceShade);
        
        const surfaceHex = surfaceBase.replace('#', '');
        const r = parseInt(surfaceHex.substr(0, 2), 16);
        const g = parseInt(surfaceHex.substr(2, 2), 16);
        const b = parseInt(surfaceHex.substr(4, 2), 16);
        const surface = `rgba(${r}, ${g}, ${b}, 0.85)`;

        const text = getContrastColor(surfaceBase);
        const textMuted = text === '#000000' ? '#444444' : '#bbbbbb';

        await new Promise(r => setTimeout(r, 400));

        return { accent, surface, text, textMuted, isDark: isAccentDark };
    } catch (error) {
        console.error("Ошибка парсера обоев:", error);
        throw new Error('Не удалось проанализировать картинку. Попробуй другую ссылку или проверь интернет.');
    }
}