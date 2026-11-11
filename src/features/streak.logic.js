/**
 * @file src/features/settings.logic.js
 * @description Применение настроек (цвета, шрифты, фон, умный контраст).
 */

// Вспомогательная функция для определения контраста
function getContrastColor(hex) {
    if (!hex || !hex.startsWith('#')) return '#ffffff';
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

export function applyUserSettings(settings) {
    if (!settings) return;
    
    document.body.className = ''; 
    if (settings.font) document.body.classList.add(`font-${settings.font}`);
    
    const root = document.documentElement;
    root.style.setProperty('--font-scale', (settings.fontSize || 10) / 10);

    // Умный контраст для кастомных цветов
    if (settings.useCustomColors && settings.colors) {
        if (settings.colors.accent) {
            root.style.setProperty('--accent-color', settings.colors.accent);
            // Если акцент слишком светлый, текст на кнопках должен быть черным
            root.style.setProperty('--accent-text', getContrastColor(settings.colors.accent));
        }
        if (settings.colors.surface) {
            root.style.setProperty('--surface-color', settings.colors.surface);
            // Автоматически ставим цвет текста в зависимости от фона карточек!
            const textColor = getContrastColor(settings.colors.surface);
            root.style.setProperty('--text-main', textColor);
            root.style.setProperty('--text-muted', textColor === '#000000' ? '#333333' : '#aaaaaa');
        }
        // Если пользователь сам выбрал цвет текста, перезаписываем поверх умного
        if (settings.colors.text) root.style.setProperty('--text-main', settings.colors.text);
        if (settings.colors.textMuted) root.style.setProperty('--text-muted', settings.colors.textMuted);
    } else {
        root.style.removeProperty('--accent-color');
        root.style.removeProperty('--accent-text');
        root.style.removeProperty('--surface-color');
        root.style.removeProperty('--text-main');
        root.style.removeProperty('--text-muted');
    }
    
    if (settings.borderRadius !== undefined) {
        root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
    }

    // Градиент
    if (settings.gradient && settings.gradient.enabled) {
        document.body.style.backgroundImage = `linear-gradient(${settings.gradient.angle}deg, ${settings.gradient.color1}, ${settings.gradient.color2})`;
        document.body.style.backgroundSize = "200% 200%";
        document.body.style.animation = "gradient-anim 10s ease infinite";
    } else {
        document.body.style.backgroundImage = '';
        document.body.style.animation = '';
    }

    // Фоновая картинка/видео
    let bgEl = document.getElementById('custom-bg');
    if (settings.bgUrl) {
        document.body.style.backgroundColor = 'transparent';
        if (!bgEl) {
            bgEl = document.createElement('div');
            bgEl.id = 'custom-bg';
            bgEl.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
            document.body.prepend(bgEl);
        }
        const isVideo = settings.bgUrl.match(/\.(mp4|webm|ogg)$/i);
        const darkFilter = `brightness(${1 - (settings.bgDarkness||0)/10}) blur(${(settings.bgBlur||0) * 1.5}px)`;
        if (isVideo) {
            bgEl.innerHTML = `<video src="${settings.bgUrl}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;filter: ${darkFilter};"></video>`;
        } else {
            bgEl.innerHTML = `<img src="${settings.bgUrl}" style="width:100%;height:100%;object-fit:cover;filter: ${darkFilter};">`;
        }
    } else {
        document.body.style.backgroundColor = '';
        if (bgEl) bgEl.remove();
    }
}