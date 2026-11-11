/**
 * @file src/ui/offcanvas-settings.ui.js
 * @description Экран настроек (кастомизация) внутри off-canvas.
 * DANGER ZONE рендерится отдельно через debug.ui.js.
 */
import { supabase } from '../api/supabase-client.js';
import { applyUserSettings } from '../features/settings.logic.js';
import { extractColorsFromImage } from '../features/wallpaper-theme.logic.js';
import { createSearchableSelect } from './custom-select.ui.js';
import { createDebugZone } from './debug.ui.js';

export function renderSettingsView(container, profile) {
    const userId = profile?.id;
    const settings = profile?.settings || {};

    const defaultColors = { accent: '#0062b1', surface: 'rgba(26, 29, 36, 0.7)', text: '#e2e8f0', textMuted: '#94a3b8' };
    const colors = { ...defaultColors, ...(settings.colors || {}) };
    const gradient = settings.gradient || { enabled: false, color1: '#0f1115', color2: '#2c5364', angle: 135 };
    const particleCount = settings.particleCount || 30;

    let currentSettings = JSON.parse(JSON.stringify(settings));
    if (!currentSettings.colors) currentSettings.colors = { ...defaultColors };
    if (!currentSettings.gradient) currentSettings.gradient = { ...gradient };
    if (!currentSettings.particleCount) currentSettings.particleCount = 30;

    container.innerHTML = `
        <div class="settings-group glass-panel active">
            <div class="settings-header"><span>Оформление</span><span class="arrow">▼</span></div>
            <div class="settings-content"><div class="settings-inner">
                <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 5px;">
                    <span class="label">Шрифт</span>
                    <div id="font-select-container" style="width: 100%;"></div>
                </div>
                <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 5px;">
                    <span class="label">Тема оформления</span>
                    <div id="theme-select-container" style="width: 100%;"></div>
                </div>
                <div class="setting-row">
                    <span class="label">Размер (10-ст.)</span>
                    <div class="slider-wrapper">
                        <input type="range" id="font-size-range" min="1" max="25" value="${settings.fontSize || 10}">
                        <input type="number" id="font-size-input" class="slider-input" min="1" max="25" value="${settings.fontSize || 10}">
                    </div>
                </div>
                <div class="setting-row">
                    <span class="label">Скругление</span>
                    <div class="slider-wrapper">
                        <input type="range" id="radius-range" min="0" max="32" value="${settings.borderRadius || 12}">
                        <input type="number" id="radius-input" class="slider-input" min="0" max="32" value="${settings.borderRadius || 12}">
                    </div>
                </div>
                
                <div class="setting-row">
                    <span class="label">Частицы на фоне</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-particles" ${settings.particlesEnabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <div class="setting-row" id="particle-count-row" style="display: ${settings.particlesEnabled ? 'flex' : 'none'};">
                    <span class="label">Кол-во частиц</span>
                    <div class="slider-wrapper">
                        <input type="range" id="particle-count-range" min="10" max="150" step="5" value="${particleCount}">
                        <input type="number" id="particle-count-input" class="slider-input" min="10" max="150" step="5" value="${particleCount}">
                    </div>
                </div>

                <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 5px; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                    <span class="label">Провайдер погоды</span>
                    <div id="weather-provider-container" style="width: 100%;"></div>
                </div>
            </div></div>
        </div>

        <div class="settings-group glass-panel">
            <div class="settings-header"><span>Свои цвета</span><span class="arrow">▼</span></div>
            <div class="settings-content"><div class="settings-inner">
                <div class="setting-row"><span class="label">Вкл. свои цвета</span><label class="toggle-switch"><input type="checkbox" id="toggle-custom-colors" ${settings.useCustomColors ? 'checked' : ''}><span class="toggle-slider"></span></label></div>
                <div class="setting-row"><span class="label">Акцент</span> <input type="color" id="color-accent" value="${colors.accent}"></div>
                <div class="setting-row"><span class="label">Карточки</span> <input type="color" id="color-surface" value="#1a1d24"></div>
                <div class="setting-row"><span class="label">Осн. текст</span> <input type="color" id="color-text" value="${colors.text}"></div>
                <div class="setting-row"><span class="label">Второст. текст</span> <input type="color" id="color-text-muted" value="${colors.textMuted}"></div>
                <div class="setting-row" style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;"><span class="label">Градиент на фоне</span><label class="toggle-switch"><input type="checkbox" id="toggle-gradient" ${gradient.enabled ? 'checked' : ''}><span class="toggle-slider"></span></label></div>
                <div class="setting-row"><span class="label">Цвет 1</span> <input type="color" id="grad-color1" value="${gradient.color1}"></div>
                <div class="setting-row"><span class="label">Цвет 2</span> <input type="color" id="grad-color2" value="${gradient.color2}"></div>
                <div class="setting-row"><span class="label">Угол</span><div class="slider-wrapper"><input type="range" id="grad-angle" min="0" max="360" value="${gradient.angle}"><input type="number" id="grad-angle-input" class="slider-input" min="0" max="360" value="${gradient.angle}"></div></div>
            </div></div>
        </div>

        <div class="settings-group glass-panel">
            <div class="settings-header"><span>Фон сайта</span><span class="arrow">▼</span></div>
            <div class="settings-content"><div class="settings-inner">
                <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 8px;"><span class="label">Ссылка на медиа (URL)</span><input type="text" id="bg-url" class="admin-select" value="${settings.bgUrl || ''}" placeholder="https://..." style="width: 100%;"></div>
                <div class="setting-row"><span class="label">Затемнение</span><input type="range" id="bg-darkness" min="0" max="10" value="${settings.bgDarkness || 0}"></div>
                <div class="setting-row"><span class="label">Размытие</span><input type="range" id="bg-blur" min="0" max="10" value="${settings.bgBlur || 0}"></div>
                <button id="btn-theme-from-bg" class="btn btn-primary btn-full" style="margin-top: 10px;">✨ Взять цвета с фона</button>
            </div></div>
        </div>

        <div id="debug-zone-container"></div>

        <button id="btn-reset-settings" class="btn btn-ghost btn-full" style="margin-top: 20px;">Сбросить все настройки</button>
    `;

    const save = async () => {
        applyUserSettings(currentSettings);
        if (userId) await supabase.from('profiles').update({ settings: currentSettings }).eq('id', userId);
    };

    // 1. Шрифт
    const fontContainer = container.querySelector('#font-select-container');
    fontContainer.appendChild(createSearchableSelect(
        ['Minecraft', 'Tsap-Tsarap'],
        currentSettings.font === 'tsap' ? 'Tsap-Tsarap' : 'Minecraft',
        'Выберите шрифт', 'hidden-font-select',
        (val) => { currentSettings.font = val === 'Tsap-Tsarap' ? 'tsap' : 'minecraft'; save(); }
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

    // Слайдеры
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
    syncSlider('grad-angle', 'grad-angle-input', 'angle', true);
    
    // Слайдер количества частиц
    const particleCountRow = container.querySelector('#particle-count-row');
    syncSlider('particle-count-range', 'particle-count-input', 'particleCount');

    // Тумблеры и цвета
    container.querySelector('#toggle-custom-colors')?.addEventListener('change', (e) => { currentSettings.useCustomColors = e.target.checked; save(); });
    
    // Тумблер частиц
    container.querySelector('#toggle-particles')?.addEventListener('change', (e) => { 
        currentSettings.particlesEnabled = e.target.checked; 
        particleCountRow.style.display = e.target.checked ? 'flex' : 'none';
        save(); 
    });

    const setColorAndEnable = (colorKey, value) => {
        currentSettings.colors[colorKey] = value;
        currentSettings.useCustomColors = true;
        const tgl = container.querySelector('#toggle-custom-colors');
        if (tgl) tgl.checked = true;
        save();
    };

    container.querySelector('#color-accent')?.addEventListener('input', (e) => setColorAndEnable('accent', e.target.value));
    container.querySelector('#color-surface')?.addEventListener('input', (e) => setColorAndEnable('surface', e.target.value));
    container.querySelector('#color-text')?.addEventListener('input', (e) => setColorAndEnable('text', e.target.value));
    container.querySelector('#color-text-muted')?.addEventListener('input', (e) => setColorAndEnable('textMuted', e.target.value));

    container.querySelector('#toggle-gradient')?.addEventListener('change', (e) => { currentSettings.gradient.enabled = e.target.checked; save(); });
    container.querySelector('#grad-color1')?.addEventListener('input', (e) => { currentSettings.gradient.color1 = e.target.value; save(); });
    container.querySelector('#grad-color2')?.addEventListener('input', (e) => { currentSettings.gradient.color2 = e.target.value; save(); });

    container.querySelector('#bg-url')?.addEventListener('change', (e) => { currentSettings.bgUrl = e.target.value; save(); });
    container.querySelector('#bg-darkness')?.addEventListener('input', (e) => { currentSettings.bgDarkness = parseInt(e.target.value); save(); });
    container.querySelector('#bg-blur')?.addEventListener('input', (e) => { currentSettings.bgBlur = parseInt(e.target.value); save(); });

    // Взять цвета с фона
    container.querySelector('#btn-theme-from-bg')?.addEventListener('click', async () => {
        if (!currentSettings.bgUrl) return alert('Сначала укажи ссылку на фон!');
        const btn = container.querySelector('#btn-theme-from-bg');
        btn.textContent = 'Анализ...';
        try {
            const extracted = await extractColorsFromImage(currentSettings.bgUrl);
            currentSettings.colors = { ...currentSettings.colors, ...extracted };
            currentSettings.useCustomColors = true;
            container.querySelector('#toggle-custom-colors').checked = true;
            container.querySelector('#color-accent').value = extracted.accent;
            container.querySelector('#color-surface').value = extracted.surface;
            container.querySelector('#color-text').value = extracted.text;
            save();
            btn.textContent = '✨ Готово!';
            setTimeout(() => btn.textContent = '✨ Взять цвета с фона', 2000);
        } catch (e) {
            alert(e.message);
            btn.textContent = '✨ Взять цвета с фона';
        }
    });

    // Сброс
    container.querySelector('#btn-reset-settings')?.addEventListener('click', async () => {
        if (!confirm('Сбросить все настройки?')) return;
        currentSettings = {
            font: 'minecraft', fontSize: 10, borderRadius: 12,
            useCustomColors: false, colors: { ...defaultColors },
            gradient: { enabled: false, color1: '#0f1115', color2: '#2c5364', angle: 135 },
            bgUrl: '', bgDarkness: 0, bgBlur: 0, particlesEnabled: false, particleCount: 30, theme: 'theme-glass'
        };
        applyUserSettings(currentSettings);
        if (userId) await supabase.from('profiles').update({ settings: currentSettings }).eq('id', userId);
        window.location.reload();
    });

    // Сворачивание групп (аккордеон)
    container.querySelectorAll('.settings-header').forEach(hdr => {
        hdr.addEventListener('click', () => {
            const group = hdr.parentElement;
            const isActive = group.classList.contains('active');
            container.querySelectorAll('.settings-group').forEach(g => g.classList.remove('active'));
            if (!isActive) group.classList.add('active');
        });
    });

    // DANGER ZONE
    const debugZone = createDebugZone(profile);
    if (debugZone) {
        const dzc = container.querySelector('#debug-zone-container');
        dzc.appendChild(debugZone);
        // Отдельный обработчик свёртывания, т.к. DANGER ZONE рендерится позже
        const header = debugZone.querySelector('.settings-header');
        header.addEventListener('click', () => {
            const isActive = debugZone.classList.contains('active');
            container.querySelectorAll('.settings-group').forEach(g => g.classList.remove('active'));
            if (!isActive) debugZone.classList.add('active');
        });
    }
}