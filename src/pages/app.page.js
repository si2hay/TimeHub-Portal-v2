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
    getDateForDayAndWeek 
} from '../features/date.logic.js';
import { getWeather, getWeatherSVG, getClothingAdvice } from '../api/weather.api.js';
import { getTimerState } from '../features/timer.logic.js';
import { getBellsForGroup } from '../features/bells.logic.js';
import { applySubstitutions } from '../features/substitution.logic.js';
import { applyUserSettings } from '../features/settings.logic.js';
import { createHeader } from '../ui/header.ui.js';
import { renderSchedule } from '../ui/schedule.ui.js';
import { renderTimer, updateTimerUI } from '../ui/timer.ui.js';

async function initApp() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = '<div style="text-align:center; padding: 50px;">Загрузка...</div>';

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = `${import.meta.env.BASE_URL}pages/index.html`; return; }

    const profile = await getUserProfile(session.user.id);
    const userGroup = profile?.group_name || '26 АТП-2Бо';
    
    applyUserSettings(profile?.settings);

    let weekOffset = 0; 
    let selectedDay = getCurrentDay(); 
    let currentLessons = [];
    let weatherProvider = localStorage.getItem('weatherProvider') || 'open-meteo';
    const todayDay = getCurrentDay();
    const realCurrentWeek = getCurrentWeek();

    appDiv.innerHTML = `
        <div id="header-container"></div>
        <main class="app-main">
            
            <!-- ВИДЖЕТ: НЕДЕЛЯ + ПОГОДА -->
            <div class="glass-panel dashboard-widget">
                
                <!-- Переключатель недель -->
                <div class="widget-header">
                    <button id="btn-prev-week" class="icon-btn">◀</button>
                    <div class="week-label-wrapper">
                        <span id="week-label" class="week-label">1 неделя</span>
                    </div>
                    <button id="btn-next-week" class="icon-btn">▶</button>
                </div>

                <!-- Погода и совет -->
                <div class="widget-body">
                    <div id="weather-content" class="weather-content">
                        <span style="opacity:0.5;">Загрузка...</span>
                    </div>
                    <div id="clothing-advice" class="clothing-advice">
                        Совет: ...
                    </div>
                </div>

                <!-- Индикатор реальной текущей недели -->
                <div class="widget-footer">
                    Сейчас идет: <strong>${realCurrentWeek} неделя</strong>
                </div>
            </div>

            <!-- ТАЙМЕР -->
            <div id="timer-container"></div>

            <!-- ДНИ И РАСПИСАНИЕ -->
            <div class="schedule-header" style="margin-bottom: 10px;">
                <h3 style="margin: 0; font-size: 18px;">Расписание</h3>
            </div>
            <div id="day-switcher" class="day-switcher"></div>

            <div id="schedule-container" class="schedule-container"></div>
        </main>
    `;

    const header = createHeader(`${getDayNameRus(todayDay)}, ${getTodayDateString()}`, profile);
    document.getElementById('header-container').appendChild(header);

    function renderDaySwitcher() {
        const container = document.getElementById('day-switcher');
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
        container.innerHTML = '';
        
        days.forEach((name, index) => {
            const dayNum = index + 1;
            const btn = document.createElement('button');
            btn.className = 'btn day-btn';
            if (selectedDay === dayNum) btn.classList.add('active');
            btn.textContent = name;
            
            btn.addEventListener('click', () => {
                selectedDay = dayNum;
                renderDaySwitcher();
                loadWeekData();
            });
            container.appendChild(btn);
        });
    }

    async function loadWeekData() {
        const currentWeekNum = getWeekByOffset(weekOffset);
        
        const weekLabel = document.getElementById('week-label');
        weekLabel.textContent = `${currentWeekNum} неделя`;
        
        const targetDate = getDateForDayAndWeek(selectedDay, weekOffset);

        let lessons = await getScheduleForDay(userGroup, currentWeekNum, selectedDay);
        const subs = await getSubstitutions(targetDate, userGroup);
        currentLessons = applySubstitutions(lessons, subs);
        
        document.getElementById('schedule-container').innerHTML = renderSchedule(currentLessons, userGroup);
        
        const timerContainer = document.getElementById('timer-container');
        if (!document.getElementById('timer-widget')) {
            timerContainer.innerHTML = '';
            timerContainer.appendChild(renderTimer(getDayShortRus(selectedDay)));
        } else {
            const hint = document.querySelector('.timer-btn-hint');
            if (hint) hint.textContent = getDayShortRus(selectedDay);
        }
        
        updateTimer();
    }

    const updateTimer = () => {
        const now = new Date();
        const bells = getBellsForGroup(userGroup);
        const state = getTimerState(now, currentLessons, bells);
        updateTimerUI(state);
    };
    setInterval(updateTimer, 1000);

    document.getElementById('btn-prev-week').addEventListener('click', async () => {
        weekOffset -= 1;
        await loadWeekData();
    });
    document.getElementById('btn-next-week').addEventListener('click', async () => {
        weekOffset += 1;
        await loadWeekData();
    });

    let touchStartX = 0;
    let touchEndX = 0;
    const mainEl = document.querySelector('.app-main');
    mainEl.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    mainEl.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        if (touchStartX - touchEndX > threshold) {
            weekOffset += 1; loadWeekData();
        } else if (touchEndX - touchStartX > threshold) {
            weekOffset -= 1; loadWeekData();
        }
    }, { passive: true });

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

    renderDaySwitcher();
    await loadWeekData();
    await loadWeather();
}

initApp();