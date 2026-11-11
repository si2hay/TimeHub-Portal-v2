/**
 * @file src/pages/app.page.js
 */
import { supabase } from '../api/supabase-client.js';
import { getUserProfile } from '../api/profile.api.js';
import { getScheduleForDay } from '../api/schedule.api.js';
import { getSubstitutions } from '../api/substitution.api.js';
import { 
    getCurrentWeek, getCurrentDay, getTodayDateString,
    getWeekByOffset, getDayNameRus, getDayShortRus,
    getDateForDayAndWeek, getNow
} from '../features/date.logic.js';
import { getWeather, getWeatherSVG, getClothingAdvice } from '../api/weather.api.js';
import { getTimerState } from '../features/timer.logic.js';
import { getBellsForGroup } from '../features/bells.logic.js';
import { applySubstitutions } from '../features/substitution.logic.js';
import { applyUserSettings } from '../features/settings.logic.js';
import { createHeader } from '../ui/header.ui.js';
import { renderSchedule, renderSkeleton } from '../ui/schedule.ui.js';
import { renderTimer, updateTimerUI } from '../ui/timer.ui.js';

async function initApp() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = '<div style="text-align:center; padding: 50px;">Загрузка...</div>';

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = `${import.meta.env.BASE_URL}index.html`; return; }

    const profile = await getUserProfile(session.user.id);
    const userGroup = profile?.group_name || '26 АТП-2Бо';
    
    applyUserSettings(profile?.settings);

    // При загрузке всегда ставим текущий день и текущую неделю (offset 0)
    let weekOffset = 0; 
    let selectedDay = getCurrentDay(); 
    let currentLessons = [];
    let weatherProvider = localStorage.getItem('weatherProvider') || 'open-meteo';
    const todayDay = getCurrentDay();
    const realCurrentWeek = getCurrentWeek();
    let cache = {};

    appDiv.innerHTML = `
        <div id="header-container"></div>
        <main class="app-main">
            
            <div class="glass-panel dashboard-widget">
                <div class="widget-header">
                    <button id="btn-prev-week" class="icon-btn">◀</button>
                    <div class="week-label-wrapper">
                        <span id="week-label" class="week-label">1 неделя</span>
                    </div>
                    <button id="btn-next-week" class="icon-btn">▶</button>
                </div>

                <div class="widget-body">
                    <div id="weather-content" class="weather-content">
                        <span style="opacity:0.5;">Загрузка...</span>
                    </div>
                    <div id="clothing-advice" class="clothing-advice">
                        Совет: ...
                    </div>
                </div>

                <div class="widget-footer">
                    Сейчас идет: <strong>${realCurrentWeek} неделя</strong>
                </div>
            </div>

            <div id="timer-container"></div>

            <!-- Расписание -->
            <div class="schedule-viewport" id="schedule-viewport">
                <div class="schedule-content-wrap" id="schedule-content"></div>
            </div>

            <div class="schedule-dots" id="schedule-dots"></div>
        </main>
    `;

    const header = createHeader(`${getDayNameRus(todayDay)}, ${getTodayDateString()}`, profile);
    document.getElementById('header-container').appendChild(header);

    const contentEl = document.getElementById('schedule-content');
    const viewport = document.getElementById('schedule-viewport');
    const dotsContainer = document.getElementById('schedule-dots');

    const getPrevDay = (d) => d === 1 ? 5 : d - 1;
    const getNextDay = (d) => d === 5 ? 1 : d + 1;

    function renderDots() {
        dotsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const dot = document.createElement('div');
            dot.className = 'schedule-dot';
            if (i === selectedDay) dot.classList.add('active');
            dot.addEventListener('click', () => jumpToDay(i));
            dotsContainer.appendChild(dot);
        }
    }

    // direction: 1 (следующий), -1 (предыдущий), 0 (без анимации)
    function updateContent(direction = 0) {
        const w = getWeekByOffset(weekOffset);
        const dataCenter = cache[w]?.[selectedDay] || [];

        contentEl.innerHTML = '';
        const newContent = renderSchedule(dataCenter, userGroup);
        
        if (direction > 0) newContent.classList.add('enter-from-right');
        if (direction < 0) newContent.classList.add('enter-from-left');
        
        contentEl.appendChild(newContent);

        currentLessons = dataCenter;
        updateTimer();
        renderDots();

        // ФИКС: Синхронизируем день в плашке таймера
        const hintEl = document.querySelector('.timer-btn-hint');
        if (hintEl) hintEl.textContent = getDayShortRus(selectedDay);
    }

    let isAnimating = false;

    function commitSwipe(newDay, direction = 0) {
        if (isAnimating) return;
        isAnimating = true;

        const outX = direction > 0 ? -60 : (direction < 0 ? 60 : 0);
        contentEl.style.transition = 'transform 0.15s ease-in, opacity 0.15s ease-in';
        contentEl.style.transform = `translateX(${outX}px) scale(0.95)`;
        contentEl.style.opacity = '0';

        setTimeout(() => {
            contentEl.style.transition = 'none';
            contentEl.style.transform = '';
            contentEl.style.opacity = '';
            selectedDay = newDay;
            updateContent(direction);
            isAnimating = false;
        }, 100);
    }

    function jumpToDay(day) {
        if (day === selectedDay || isAnimating) return;
        const dir = day > selectedDay ? 1 : -1;
        commitSwipe(day, dir);
    }

    // --- СВАЙП ЛОГИКА ---
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const threshold = 60;

    const onDragStart = (e) => {
        if (isAnimating) return;
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = startX;
    };

    const onDragMove = (e) => {
        if (!isDragging || isAnimating) return;
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        
        const progress = Math.min(Math.abs(diff) / 150, 1);
        const opacity = 1 - progress * 0.5;
        const scale = 1 - progress * 0.05;
        const translateX = diff * 0.4;
        
        contentEl.style.transform = `translateX(${translateX}px) scale(${scale})`;
        contentEl.style.opacity = opacity;
    };

    const onDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        const diff = currentX - startX;

        if (diff > threshold) {
            commitSwipe(getPrevDay(selectedDay), -1);
        } else if (diff < -threshold) {
            commitSwipe(getNextDay(selectedDay), 1);
        } else {
            contentEl.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
            contentEl.style.transform = '';
            contentEl.style.opacity = '';
            setTimeout(() => { contentEl.style.transition = ''; }, 300);
        }
    };

    viewport.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    viewport.addEventListener('touchstart', onDragStart, { passive: true });
    viewport.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    async function loadWeekData(animateDown = false) {
        const currentWeekNum = getWeekByOffset(weekOffset);
        document.getElementById('week-label').textContent = `${currentWeekNum} неделя`;

        if (cache[currentWeekNum]) {
            if (animateDown) {
                viewport.classList.remove('anim-slide-down');
                void viewport.offsetWidth;
                viewport.classList.add('anim-slide-down');
            }
            updateContent(0);
            return;
        }

        contentEl.innerHTML = '';
        contentEl.appendChild(renderSkeleton());

        const promises = [];
        for (let d = 1; d <= 5; d++) {
            const targetDate = getDateForDayAndWeek(d, weekOffset);
            promises.push(
                Promise.all([
                    getScheduleForDay(userGroup, currentWeekNum, d),
                    getSubstitutions(targetDate, userGroup)
                ]).then(([lessons, subs]) => {
                    return { day: d, data: applySubstitutions(lessons, subs) };
                })
            );
        }

        const results = await Promise.all(promises);
        cache[currentWeekNum] = {};
        results.forEach(res => {
            cache[currentWeekNum][res.day] = res.data;
        });

        if (animateDown) {
            viewport.classList.remove('anim-slide-down');
            void viewport.offsetWidth;
            viewport.classList.add('anim-slide-down');
        }
        updateContent(0);
    }

    const updateTimer = () => {
        const now = getNow();
        const bells = getBellsForGroup(userGroup);
        const state = getTimerState(now, currentLessons, bells);
        updateTimerUI(state);
    };
    setInterval(updateTimer, 1000);

    document.getElementById('btn-prev-week').addEventListener('click', () => {
        weekOffset -= 1;
        loadWeekData(true); 
    });
    document.getElementById('btn-next-week').addEventListener('click', () => {
        weekOffset += 1;
        loadWeekData(true); 
    });

    async function loadWeather() {
        const widget = document.getElementById('weather-content');
        const adviceWidget = document.getElementById('clothing-advice');
        if (!widget) return;
        
        widget.innerHTML = '<span style="opacity:0.5;">Загрузка...</span>';
        const data = await getWeather(weatherProvider);
        
        if (data) {
            const icon = getWeatherSVG(data.condition);
            widget.innerHTML = `
                ${icon}
                <span style="font-weight:bold; font-size: 16px;">${data.temp}°C</span>
                <span style="color: var(--text-muted); font-size: 12px;">ветер ${data.wind} м/с</span>
            `;
            adviceWidget.textContent = `👕 ${getClothingAdvice(data.temp)}`;
        } else {
            widget.innerHTML = '<span style="color: var(--text-muted);">Погода недоступна</span>';
            adviceWidget.textContent = '';
        }
    }

    renderDots();
    await loadWeekData(false);
    
    if (!document.getElementById('timer-widget')) {
        document.getElementById('timer-container').appendChild(renderTimer(getDayShortRus(selectedDay)));
    }

    await loadWeather();
}

initApp();