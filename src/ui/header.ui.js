/**
 * @file src/ui/header.ui.js
 * @description Шапка приложения с кликабельной датой и красивым стриком.
 */
import { createOffcanvas } from './offcanvas.ui.js';
import { createDatepicker } from './custom-datepicker.ui.js';
import { getTodayDateString } from '../features/date.logic.js';

function getStreakText(n) {
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${n} дней`;
    if (lastDigit === 1) return `${n} день`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${n} дня`;
    return `${n} дней`;
}

export function createHeader(dateString, profile, onDateChange, isStreakUpdated = false) {
    const header = document.createElement('header');
    header.className = 'app-header glass-panel';

    const base = import.meta.env.BASE_URL;
    const email = profile?.email || 'user@mail.ru';
    const settings = profile?.settings || {};
    const streakCount = settings.streak || 0;
    const streakText = getStreakText(streakCount);

    header.innerHTML = `
        <div class="header-left">
            <div class="header-logo" id="logo-trigger">
                <img src="${base}logo.png" alt="TH" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" style="display: none;">TH</div>
                <div class="logo-text">
                    <h1>TimeHub</h1>
                    <span>Portal</span>
                </div>
            </div>
            
            <div class="streak-wrapper" id="streak-wrapper">
                <div class="streak-badge ${isStreakUpdated ? 'streak-pulse' : ''}" id="streak-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff6400" stroke="none"><path d="M12 2c0 0-4 4-4 9 0 2 1 4 4 4s4-2 4-4c0-5-4-9-4-9z"/></svg>
                    ${streakCount}
                </div>
                
                <div class="streak-popover" id="streak-popover">
                    <div class="streak-popover-header">
                        <span class="streak-popover-fire">🔥</span>
                        <span class="streak-popover-title">Твой огонек</span>
                    </div>
                    <div class="streak-popover-body">
                        <div class="streak-popover-count">${streakText}</div>
                        <div class="streak-popover-text">
                            ${streakCount > 0 
                                ? 'Заходи каждый день, чтобы не потерять серию!' 
                                : 'Зайди завтра, чтобы начать серию!'}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="header-date-wrapper" id="header-date-wrapper"></div>
    `;

    const offcanvas = createOffcanvas(profile);
    header.querySelector('#logo-trigger').addEventListener('click', offcanvas.open);

    const streakBtn = header.querySelector('#streak-btn');
    const streakPopover = header.querySelector('#streak-popover');

    streakBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        streakPopover.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!streakPopover.contains(e.target) && e.target !== streakBtn) {
            streakPopover.classList.remove('active');
        }
    });

    const dateWrapper = header.querySelector('#header-date-wrapper');
    const dp = createDatepicker(getTodayDateString(), (newDate) => {
        if (onDateChange) onDateChange(newDate);
    }, 'header-date-picker', 'right');
    
    const capsule = dp.querySelector('.datepicker-capsule');
    capsule.classList.add('header-date-btn');
    const textEl = capsule.querySelector('.date-text');
    textEl.innerHTML = dateString; 
    textEl.style.lineHeight = '1.2';
    textEl.style.textAlign = 'right';
    textEl.style.fontSize = 'calc(13px * var(--font-scale))';
    
    capsule.querySelector('.calendar-icon').style.display = 'none';
    dateWrapper.appendChild(dp);

    if (isStreakUpdated) {
        setTimeout(() => {
            const badge = header.querySelector('.streak-badge');
            if (badge) badge.classList.remove('streak-pulse');
        }, 2000);
    }

    return header;
}