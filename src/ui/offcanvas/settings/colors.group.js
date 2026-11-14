/**
 * @file src/ui/offcanvas/settings/colors.group.js
 * @description Настройки кастомных цветов и градиента.
 */
import { extractColorsFromImage } from '../../wallpaper-theme.ui.js';

export function setupColorsGroup(container, currentSettings, save, applyUserSettings) {
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

    // Градиент
    container.querySelector('#toggle-gradient')?.addEventListener('change', (e) => { currentSettings.gradient.enabled = e.target.checked; save(); });
    container.querySelector('#grad-color1')?.addEventListener('input', (e) => { currentSettings.gradient.color1 = e.target.value; save(); });
    container.querySelector('#grad-color2')?.addEventListener('input', (e) => { currentSettings.gradient.color2 = e.target.value; save(); });
    
    const gradAngleRange = container.querySelector('#grad-angle');
    const gradAngleInput = container.querySelector('#grad-angle-input');
    if (gradAngleRange && gradAngleInput) {
        const updateAngle = (val) => {
            const v = parseInt(val); gradAngleRange.value = v; gradAngleInput.value = v;
            currentSettings.gradient.angle = v;
            save();
        };
        gradAngleRange.addEventListener('input', (e) => updateAngle(e.target.value));
        gradAngleInput.addEventListener('change', (e) => updateAngle(e.target.value));
    }

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
}