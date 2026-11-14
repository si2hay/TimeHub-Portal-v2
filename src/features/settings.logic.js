/**
 * @file src/features/settings.logic.js
 * @description Применение настроек (цвета, шрифты, фон, умный контраст, темы, частицы).
 */
import { initParticles, destroyParticles } from './particles.logic.js';

function getContrastColor(hex) {
    if (!hex || !hex.startsWith('#')) return '#ffffff';
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

function shadeColor(hex, percent) {
    if (!hex || !hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1);
}

function hexToRgba(hex, alpha) {
    if (!hex || !hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = num >> 16;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyUserSettings(settings) {
    if (!settings) return;

    // Убираем все возможные классы шрифтов
    document.body.classList.remove('font-russoone', 'font-pressstart2p', 'font-tiny5duo', 'theme-glass', 'theme-classic');

    // Устанавливаем шрифт. Если старый 'minecraft', принудительно меняем на 'russoone'
    let fontKey = settings.font || 'russoone';
    if (fontKey === 'minecraft') fontKey = 'russoone';
    document.body.classList.add(`font-${fontKey}`);

    const currentTheme = settings.theme || 'theme-glass';
    document.body.classList.add(currentTheme);

    const root = document.documentElement;
    root.style.setProperty('--font-scale', (settings.fontSize || 10) / 10);

    if (settings.useCustomColors && settings.colors) {
        const cc = settings.colors;
        const textColor = getContrastColor(cc.surface || '#1a1d24');

        if (cc.accent) {
            root.style.setProperty('--accent-color', cc.accent);
            root.style.setProperty('--accent-text', getContrastColor(cc.accent));
            const hoverShade = getContrastColor(cc.accent) === '#000000' ? -15 : 15;
            root.style.setProperty('--accent-hover', shadeColor(cc.accent, hoverShade));
        }

        if (cc.surface) {
            root.style.setProperty('--surface-color', cc.surface);
            root.style.setProperty('--text-main', cc.text || textColor);
            root.style.setProperty('--text-muted', cc.textMuted || (textColor === '#000000' ? '#333333' : '#aaaaaa'));
            
            if (cc.surface.includes('rgba')) {
                root.style.setProperty('--glass-bg', cc.surface);
            } else {
                root.style.setProperty('--glass-bg', hexToRgba(cc.surface, 0.85));
            }
        }

        if (cc.bg) {
            root.style.setProperty('--bg-color', cc.bg);
        }
    } else {
        root.style.removeProperty('--accent-color');
        root.style.removeProperty('--accent-text');
        root.style.removeProperty('--accent-hover');
        root.style.removeProperty('--surface-color');
        root.style.removeProperty('--text-main');
        root.style.removeProperty('--text-muted');
        root.style.removeProperty('--glass-bg');
        root.style.removeProperty('--bg-color');
    }

    if (settings.borderRadius !== undefined) {
        root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
    }

    if (settings.gradient && settings.gradient.enabled) {
        document.body.style.backgroundImage = `linear-gradient(${settings.gradient.angle}deg, ${settings.gradient.color1}, ${settings.gradient.color2})`;
        document.body.style.backgroundSize = '200% 200%';
        document.body.style.animation = 'gradient-anim 10s ease infinite';
    } else {
        document.body.style.backgroundImage = '';
        document.body.style.animation = '';
    }

    let bgEl = document.getElementById('custom-bg');
    if (settings.bgUrl) {
        document.body.style.backgroundColor = 'transparent';
        if (!bgEl) {
            bgEl = document.createElement('div');
            bgEl.id = 'custom-bg';
            bgEl.style.cssText = 'position:fixed; top:-5vh; left:-5vw; width:110vw; height:110vh; z-index:-3; pointer-events:none; overflow:hidden;';
            document.body.prepend(bgEl);
        }
        const isVideo = settings.bgUrl.match(/\.(mp4|webm|ogg)$/i);
        const darkFilter = `brightness(${1 - (settings.bgDarkness || 0) / 10}) blur(${(settings.bgBlur || 0) * 1.5}px)`;
        if (isVideo) {
            bgEl.innerHTML = `<video src="${settings.bgUrl}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;filter: ${darkFilter};"></video>`;
        } else {
            bgEl.innerHTML = `<img src="${settings.bgUrl}" style="width:100%;height:100%;object-fit:cover;filter: ${darkFilter};">`;
        }
    } else {
        document.body.style.backgroundColor = '';
        if (bgEl) bgEl.remove();
    }

    if (settings.particlesEnabled) {
        initParticles(settings.particleCount || 30);
    } else {
        destroyParticles();
    }
}