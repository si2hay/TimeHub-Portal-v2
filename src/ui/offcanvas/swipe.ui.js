/**
 * @file src/ui/offcanvas/swipe.ui.js
 * @description Логика свайпа для закрытия off-canvas меню.
 * Исправлен баг с ложным кликом на ПК после свайпа мышкой.
 */

export function setupSwipeToClose(offcanvas, overlay, closeCallback) {
    let startX = 0, currentX = 0, startTime = 0, isSwiping = false;
    let hasDragged = false; // Флаг, что мы реально двигали меню

    const onDragStart = (e) => {
        if (!offcanvas.classList.contains('open') || document.querySelector('.global-modal.active')) return;
        if (e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea')) return;
        
        isSwiping = true;
        hasDragged = false; // Сбрасываем флаг при новом касании
        startTime = Date.now();
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        
        offcanvas.style.transition = 'none';
        overlay.style.transition = 'none';
        offcanvas.style.userSelect = 'none';
    };

    const onDragMove = (e) => {
        if (!isSwiping) return;
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        
        // Если сдвинули больше чем на 5 пикселей — это свайп, а не клик
        if (Math.abs(diff) > 5) hasDragged = true;

        if (diff < 0) {
            offcanvas.style.transform = `translateX(${diff}px)`;
            const opacity = 1 - (Math.abs(diff) / offcanvas.offsetWidth);
            overlay.style.opacity = Math.max(0, opacity);
        }
    };

    const onDragEnd = () => {
        if (!isSwiping) return;
        isSwiping = false;
        
        const diff = currentX - startX;
        const time = Date.now() - startTime;
        
        offcanvas.style.transition = ''; 
        overlay.style.transition = '';
        offcanvas.style.userSelect = '';
        
        if ((time < 250 && diff < -30) || diff < -(offcanvas.offsetWidth * 0.15)) {
            closeCallback(); 
        } else {
            offcanvas.style.transform = '';
            overlay.style.opacity = '';
        }

        // ФИКС: Если был свайп, глушим следующий клик, чтобы не нажать кнопку случайно
        if (hasDragged) {
            const preventClick = (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                document.removeEventListener('click', preventClick, true);
            };
            document.addEventListener('click', preventClick, true);
            // Убираем слушатель через 100мс, если клик так и не пришел
            setTimeout(() => document.removeEventListener('click', preventClick, true), 100);
        }
    };

    const isPointerFine = window.matchMedia('(pointer: fine)').matches;

    offcanvas.addEventListener('touchstart', onDragStart, { passive: true });
    offcanvas.addEventListener('touchmove', onDragMove, { passive: true });
    offcanvas.addEventListener('touchend', onDragEnd);

    if (isPointerFine) {
        offcanvas.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
    }
}