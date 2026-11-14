/**
 * @file src/ui/offcanvas/settings/appearance.group.js
 * @description Настройки шрифта, темы, размера, скругления и частиц.
 */
import { createSearchableSelect } from '../../custom-select.ui.js';

export function setupAppearanceGroup(container, currentSettings, save) {
    // 1. Шрифт
    const fontContainer = container.querySelector('#font-select-container');
    let currentFontDisplay = 'RussoOne';
    if (currentSettings.font === 'pressstart2p') currentFontDisplay = 'Press Start 2P';
    if (currentSettings.font === 'tiny5duo') currentFontDisplay = 'Tiny5 Duo';

    fontContainer.appendChild(createSearchableSelect(
        ['RussoOne', 'Press Start 2P', 'Tiny5 Duo'],
        currentFontDisplay,
        'Выберите шрифт', 'hidden-font-select',
        (val) => { 
            currentSettings.font = val === 'Press Start 2P' ? 'pressstart2p' : 
                                  (val === 'Tiny5 Duo' ? 'tiny5duo' : 'russoone'); 
            save(); 
        }
    ));

    // 2. Тема оформления
    const themeContainer = container.querySelector('#theme-select-container');
    const currentThemeName = currentSettings.theme === 'theme-classic' ? 'Классика' : 'Стекло (Glass)';
    themeContainer.appendChild(createSearchableSelect(
        ['Стекло (Glass)', 'Классика'],
        currentThemeName, 'Выберите тему', 'hidden-theme-select',
        (val) => { currentSettings.theme = val === 'Классика' ? 'theme-classic' : 'theme-glass'; save(); }
    ));

    // 3. Провайдер погоды
    const weatherContainer = container.querySelector('#weather-provider-container');
    const currentWeatherProvider = localStorage.getItem('weatherProvider') || 'open-meteo';
    const weatherDisplayValue = currentWeatherProvider === 'open-meteo' ? 'Open-Meteo' : 'wttr.in';
    weatherContainer.appendChild(createSearchableSelect(
        ['Open-Meteo', 'wttr.in'], weatherDisplayValue, 'Выберите провайдера', 'hidden-weather-select',
        (val) => {
            const providerCode = val === 'Open-Meteo' ? 'open-meteo' : 'wttr.in';
            localStorage.setItem('weatherProvider', providerCode);
            window.location.reload();
        }
    ));

    // 4. Слайдеры (размер шрифта, скругление, кол-во частиц)
    const syncSlider = (rangeId, inputId, settingKey, isGradient = false) => {
        const range = container.querySelector(`#${rangeId}`);
        const input = container.querySelector(`#${inputId}`);
        if (!range || !input) return;
        const update = (val) => {
            const v = parseInt(val); range.value = v; input.value = v;
            if (isGradient) currentSettings.gradient[settingKey] = v; else currentSettings[settingKey] = v;
            save();
        };
        range.addEventListener('input', (e) => update(e.target.value));
        input.addEventListener('change', (e) => update(e.target.value));
    };

    syncSlider('font-size-range', 'font-size-input', 'fontSize');
    syncSlider('radius-range', 'radius-input', 'borderRadius');
    syncSlider('particle-count-range', 'particle-count-input', 'particleCount');

    // 5. Тумблеры
    const particleCountRow = container.querySelector('#particle-count-row');
    
    container.querySelector('#toggle-custom-colors')?.addEventListener('change', (e) => { 
        currentSettings.useCustomColors = e.target.checked; 
        save(); 
    });
    
    container.querySelector('#toggle-particles')?.addEventListener('change', (e) => { 
        currentSettings.particlesEnabled = e.target.checked; 
        particleCountRow.style.display = e.target.checked ? 'flex' : 'none';
        save(); 
    });
}