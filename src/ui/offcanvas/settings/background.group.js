/**
 * @file src/ui/offcanvas/settings/background.group.js
 * @description Настройки фонового изображения/видео и его удаление.
 */
import { setupHoldButton } from '../../utils/hold-button.ui.js';

export function setupBackgroundGroup(container, currentSettings, save) {
    container.querySelector('#bg-url')?.addEventListener('change', (e) => { 
        currentSettings.bgUrl = e.target.value; 
        save(); 
    });

    // Универсальный синхронизатор для ползунков и числовых инпутов
    const syncSlider = (rangeId, inputId, settingKey) => {
        const range = container.querySelector(`#${rangeId}`);
        const input = container.querySelector(`#${inputId}`);
        if (!range || !input) return;
        
        const update = (val) => {
            const v = parseInt(val); 
            range.value = v; 
            input.value = v;
            currentSettings[settingKey] = v;
            save();
        };
        
        range.addEventListener('input', (e) => update(e.target.value));
        input.addEventListener('change', (e) => update(e.target.value));
    };

    syncSlider('bg-darkness', 'bg-darkness-input', 'bgDarkness');
    syncSlider('bg-blur', 'bg-blur-input', 'bgBlur');

    // Удаление фона (с удержанием 3с)
    const btnRemoveBg = container.querySelector('#btn-remove-bg');
    setupHoldButton(btnRemoveBg, async () => {
        currentSettings.bgUrl = '';
        container.querySelector('#bg-url').value = '';
        await save();
        btnRemoveBg.textContent = 'Фон удален!';
        setTimeout(() => btnRemoveBg.textContent = 'Удалить фон', 2000);
    }, 3000);
}