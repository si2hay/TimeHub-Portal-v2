/**
 * @file src/ui/offcanvas-settings.ui.js
 * @description Экран настроек (кастомизация) внутри off-canvas. Дирижер.
 */
import { supabase } from '../api/supabase-client.js';
import { applyUserSettings } from './settings.ui.js';
import { createDebugZone } from './debug.ui.js';
import { setupHoldButton } from './utils/hold-button.ui.js';
import { setupAppearanceGroup } from './offcanvas/settings/appearance.group.js';
import { setupColorsGroup } from './offcanvas/settings/colors.group.js';
import { setupBackgroundGroup } from './offcanvas/settings/background.group.js';

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
                
                <div class="setting-row">
                    <span class="label">Затемнение</span>
                    <div class="slider-wrapper">
                        <input type="range" id="bg-darkness" min="0" max="10" value="${settings.bgDarkness || 0}">
                        <input type="number" id="bg-darkness-input" class="slider-input" min="0" max="10" value="${settings.bgDarkness || 0}">
                    </div>
                </div>
                <div class="setting-row">
                    <span class="label">Размытие</span>
                    <div class="slider-wrapper">
                        <input type="range" id="bg-blur" min="0" max="10" value="${settings.bgBlur || 0}">
                        <input type="number" id="bg-blur-input" class="slider-input" min="0" max="10" value="${settings.bgBlur || 0}">
                    </div>
                </div>

                <button id="btn-theme-from-bg" class="btn btn-primary btn-full" style="margin-top: 10px;">✨ Взять цвета с фона</button>
                <button id="btn-remove-bg" class="btn btn-danger btn-full btn-hold-action btn-hold-long" style="margin-top: 10px;">Удалить фон</button>
            </div></div>
        </div>

        <div id="debug-zone-container"></div>

        <button id="btn-reset-settings" class="btn btn-danger btn-full btn-hold-action btn-hold-long" style="margin-top: 20px;">Сбросить все настройки</button>
    `;

    const save = async () => {
        applyUserSettings(currentSettings);
        if (userId) await supabase.from('profiles').update({ settings: currentSettings }).eq('id', userId);
    };

    // Инициализация групп
    setupAppearanceGroup(container, currentSettings, save);
    setupColorsGroup(container, currentSettings, save, applyUserSettings);
    setupBackgroundGroup(container, currentSettings, save);

    // СБРОС ВСЕХ НАСТРОЕК (Удержание 3с)
    const btnResetSettings = container.querySelector('#btn-reset-settings');
    setupHoldButton(btnResetSettings, async () => {
        currentSettings = {
            font: 'russoone',
            fontSize: 10, borderRadius: 12,
            useCustomColors: false, colors: { ...defaultColors },
            gradient: { enabled: false, color1: '#0f1115', color2: '#2c5364', angle: 135 },
            bgUrl: '', bgDarkness: 0, bgBlur: 0, particlesEnabled: false, particleCount: 30, theme: 'theme-glass'
        };
        applyUserSettings(currentSettings);
        if (userId) await supabase.from('profiles').update({ settings: currentSettings }).eq('id', userId);
        window.location.reload();
    }, 3000);

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
        const header = debugZone.querySelector('.settings-header');
        header.addEventListener('click', () => {
            const isActive = debugZone.classList.contains('active');
            container.querySelectorAll('.settings-group').forEach(g => g.classList.remove('active'));
            if (!isActive) debugZone.classList.add('active');
        });
    }
}