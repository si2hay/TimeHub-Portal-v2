/**
 * @file src/ui/transitions.ui.js
 * @description Плавные переходы между страницами (шторка).
 */

let isNavigating = false;

export function initTransitions() {
    // Создаем шторку
    const curtain = document.createElement('div');
    curtain.className = 'page-transition-curtain';
    document.body.appendChild(curtain);

    // Убираем шторку при загрузке страницы
    requestAnimationFrame(() => {
        setTimeout(() => {
            curtain.classList.add('ready');
        }, 50); // Небольшая задержка, чтобы DOM успел отрисоваться
    });

    // Перехватываем клики по ссылкам
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        
        // Игнорируем внешние ссылки, якоря и target="_blank"
        if (!href || href.startsWith('#') || link.target === '_blank') return;
        if (href.startsWith('http') && !href.includes(window.location.hostname)) return;
        if (isNavigating) return; // Защита от дабл-клика

        e.preventDefault();
        isNavigating = true;

        // Показываем шторку
        curtain.classList.remove('ready');

        // Ждем окончания анимации и переходим
        setTimeout(() => {
            window.location.href = href;
        }, 300); // Совпадает с CSS transition
    });
}