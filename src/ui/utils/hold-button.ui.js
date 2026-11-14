/**
 * @file src/ui/utils/hold-button.ui.js
 * @description Универсальная логика для кнопок с удержанием (жидкая анимация).
 * Используется в настройках, админке и кнопке выхода.
 */

export function setupHoldButton(btn, onComplete, duration = 3000) {
    if (!btn) return;
    const originalText = btn.textContent;
    let timer = null;

    const start = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        e.preventDefault();
        btn.classList.add('is-holding');
        btn.textContent = 'Удерживайте...';
        
        timer = setTimeout(() => {
            btn.classList.remove('is-holding');
            btn.textContent = originalText;
            onComplete();
        }, duration);
    };

    const cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        btn.classList.remove('is-holding');
        btn.textContent = originalText;
    };

    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', cancel);
    btn.addEventListener('mouseleave', cancel);
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', cancel);
    btn.addEventListener('touchcancel', cancel);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
}