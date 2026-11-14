/**
 * @file src/pages/app.page.js
 * @description Главная страница приложения. ПК-версия разделена на две колонки.
 */
import { supabase } from '../api/supabase-client.js';
import { getUserProfile } from '../api/profile.api.js';
import { getScheduleForDay } from '../api/schedule.api.js';
import { getSubstitutions } from '../api/substitution.api.js';
import { 
    getCurrentWeek, getCurrentDay, getTodayDateString, formatDateRus,
    getWeekByOffset, getDayNameRus, getDayNameRusAccusative, getDayShortRus,
    getDateForDayAndWeek, getNow
} from '../features/date.logic.js';
import { getWeather, getWeatherSVG, getClothingAdvice } from '../api/weather.api.js';
import { getTimerState } from '../features/timer.logic.js';
import { getBellsForGroup } from '../features/bells.logic.js';
import { applySubstitutions } from '../features/substitution.logic.js';
import { applyUserSettings } from '../features/settings.logic.js';
import { updateStreak } from '../features/streak.logic.js'; 
import { createHeader } from '../ui/header.ui.js';
import { renderSchedule, renderSkeleton } from '../ui/schedule.ui.js';
import { renderTimer, updateTimerUI } from '../ui/timer.ui.js';

async function initApp() {
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        tg.disableVerticalSwipes(); 
        tg.enableClosingConfirmation(); 
        tg.BackButton.hide(); 
    }

    const appDiv = document.getElementById('app');
    appDiv.innerHTML = '<div style="text-align:center; padding: 50px;">Загрузка...</div>';

    // --- ИНИЦИАЛИЗАЦИЯ АВТОРИЗАЦИИ ---
    const initPage = async (session) => {
        let profile = await getUserProfile(session.user.id);
        const userGroup = profile?.group_name || '26 АТП-2Бо';
        
        applyUserSettings(profile?.settings);

        // --- ЛОГИКА СТРИКА ---
        const settings = profile?.settings || {};
        const currentStreak = settings.streak || 0;
        const lastVisit = settings.last_streak_timestamp || null;
        
        const { newStreak, isUpdated } = updateStreak(currentStreak, lastVisit);
        
        if (isUpdated) {
            const newSettings = { ...settings, streak: newStreak, last_streak_timestamp: Date.now() };
            profile.settings = newSettings;
            supabase.from('profiles').update({ settings: newSettings }).eq('id', session.user.id).then();
        }

        const realDay = getCurrentDay(); // 1-7
        const realWeek = getCurrentWeek();
        const realDateStr = getTodayDateString();

        // --- УМНАЯ ЛОГИКА ВЫБОРА ДНЯ ---
        const getSmartViewState = () => {
            const day = getCurrentDay();
            const now = getNow();
            const mins = now.getHours() * 60 + now.getMinutes();
            
            // Если сегодня выходной (Сб или Вс) — показываем понедельник следующей недели
            if (day === 6 || day === 7) return { day: 1, offset: 1 };
            
            // Если будний день, проверяем, закончились ли пары
            const bells = getBellsForGroup(userGroup);
            const lastBell = bells[bells.length - 1];
            
            if (lastBell) {
                const [h, m] = lastBell.end.split(':').map(Number);
                if (mins >= h * 60 + m) {
                    // Если сегодня пятница и пары кончились — показываем понедельник следующей недели
                    if (day === 5) return { day: 1, offset: 1 };
                    // Если будний день и пары кончились — показываем завтра
                    return { day: day + 1, offset: 0 };
                }
            }
            // Пары еще идут или не начались — показываем сегодня
            return { day: day, offset: 0 };
        };

        const initialView = getSmartViewState();
        let weekOffset = initialView.offset; 
        let selectedDay = initialView.day; 
        
        let currentLessons = [];
        let weatherProvider = localStorage.getItem('weatherProvider') || 'open-meteo';
        let cache = {};

        // ФОРМАТ ДЛЯ ШАПКИ
        const getHeaderDateString = () => {
            const realStr = `${getDayNameRus(realDay)}, ${formatDateRus(realDateStr)}`;
            const targetDate = getDateForDayAndWeek(selectedDay, weekOffset);
            const targetStr = `${getDayNameRus(selectedDay)}, ${formatDateRus(targetDate)}`;

            return `Сегодня: ${realStr}<br><span style="font-size: 10px; opacity: 0.7; font-weight: normal;">Выбран: ${targetStr}</span>`;
        };

        // Синхронизация шапки и календаря
        const updateHeaderAndCalendar = () => {
            const textEl = document.querySelector('.header-date-wrapper .date-text');
            if (textEl) textEl.innerHTML = getHeaderDateString();
            
            const dpWrapper = document.querySelector('.custom-datepicker-wrapper');
            if (dpWrapper && dpWrapper.updateDate) {
                const newDate = getDateForDayAndWeek(selectedDay, weekOffset);
                dpWrapper.updateDate(newDate);
            }
        };

        const handleDateChange = (dateStr) => {
            const selectedDate = new Date(dateStr);
            const todayDate = new Date(realDateStr);
            
            const currentDayOfWeek = todayDate.getDay() === 0 ? 7 : todayDate.getDay();
            const targetDayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
            
            const mondayCurrent = new Date(todayDate);
            mondayCurrent.setDate(todayDate.getDate() - (currentDayOfWeek - 1));
            
            const mondayTarget = new Date(selectedDate);
            mondayTarget.setDate(selectedDate.getDate() - (targetDayOfWeek - 1));
            
            const diffDays = Math.round((mondayTarget - mondayCurrent) / (1000 * 60 * 60 * 24));
            weekOffset = Math.round(diffDays / 7);
            
            selectedDay = (targetDayOfWeek > 5) ? 1 : targetDayOfWeek;
            
            updateHeaderAndCalendar();
            loadWeekData(true);
        };

        appDiv.innerHTML = `
            <div id="header-container"></div>
            <main class="app-main">
                <div class="desktop-layout">
                    
                    <!-- ЛЕВАЯ КОЛОНКА -->
                    <aside class="desktop-sidebar">
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
                                Сейчас идет: <strong>${realWeek} неделя</strong>
                            </div>
                        </div>

                        <div id="timer-container"></div>
                    </aside>

                    <!-- ПРАВАЯ КОЛОНКА -->
                    <section class="desktop-content">
                        <div class="schedule-viewport" id="schedule-viewport">
                            <div class="schedule-content-wrap" id="schedule-content"></div>
                        </div>
                        <div class="schedule-dots" id="schedule-dots"></div>
                    </section>
                    
                </div>

                <footer class="app-footer">
                    <div class="footer-content">
                        <p class="footer-info">
                            Заполнение расписаний и замен для своей группы выполняется старостой вручную через удобный билдер. 
                            Чтобы стать старостой, обратитесь в <a href="https://t.me/+sq9RDqa2I2A3M2Iy" target="_blank">наш Telegram-чат</a>.
                        </p>
                        <p class="footer-thanks">
                            Авторы проекта будут благодарны за любую поддержку и идеи ☕
                        </p>
                    </div>
                </footer>
            </main>
        `;

        // ФИКС: Передаем правильную целевую дату при создании шапки
        const initialTargetDate = getDateForDayAndWeek(selectedDay, weekOffset);
        const header = createHeader(getHeaderDateString(), initialTargetDate, profile, handleDateChange, isUpdated);
        document.getElementById('header-container').appendChild(header);

        // ФИКС: Принудительно синхронизируем календарь сразу после рендера
        updateHeaderAndCalendar();

        const contentEl = document.getElementById('schedule-content');
        const viewport = document.getElementById('schedule-viewport');
        const dotsContainer = document.getElementById('schedule-dots');

        const getPrevDay = (d) => d === 1 ? 5 : d - 1;
        const getNextDay = (d) => d === 5 ? 1 : d + 1;

        function formatBigTimeLeft(mins) {
            if (mins < 0) return "00:00";
            const d = Math.floor(mins / (24 * 60));
            const h = Math.floor((mins % (24 * 60)) / 60);
            const m = mins % 60;
            
            if (d > 0) return `${d} д ${h} ч ${m} мин`;
            if (h > 0) return `${h} ч ${m} мин`;
            return `${m} мин`;
        }

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

        function updateContent(direction = 0) {
            const w = getWeekByOffset(weekOffset);
            const dataCenter = cache[w]?.[selectedDay] || [];

            const startHeight = contentEl.offsetHeight;
            
            contentEl.innerHTML = '';
            const newContent = renderSchedule(dataCenter, userGroup);
            
            if (direction > 0) newContent.classList.add('enter-from-right');
            if (direction < 0) newContent.classList.add('enter-from-left');
            
            contentEl.appendChild(newContent);

            currentLessons = dataCenter;
            updateTimer();
            renderDots();

            const hintEl = document.querySelector('.timer-btn-hint');
            if (hintEl) hintEl.textContent = getDayShortRus(selectedDay);

            const endHeight = contentEl.offsetHeight;
            contentEl.style.height = `${startHeight}px`;
            contentEl.style.overflow = 'hidden';
            void contentEl.offsetHeight;
            contentEl.style.transition = 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            contentEl.style.height = `${endHeight}px`;

            setTimeout(() => {
                contentEl.style.height = '';
                contentEl.style.transition = '';
                contentEl.style.overflow = '';
            }, 300);
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
                
                updateHeaderAndCalendar();
                updateContent(direction);
                isAnimating = false;
            }, 100);
        }

        function jumpToDay(day) {
            if (day === selectedDay || isAnimating) return;
            const dir = day > selectedDay ? 1 : -1;
            commitSwipe(day, dir);
        }

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        const threshold = 60;

        const onDragStart = (e) => {
            if (isAnimating) return;
            isDragging = true;
            if (e.type.includes('mouse')) {
                startX = e.clientX;
                startY = e.clientY;
            } else {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
            currentX = startX;
            currentY = startY;
        };

        const onDragMove = (e) => {
            if (!isDragging || isAnimating) return;
            
            if (e.type.includes('mouse')) {
                currentX = e.clientX;
                currentY = e.clientY;
            } else {
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;
            }

            const diffX = currentX - startX;
            const diffY = currentY - startY;
            
            if (Math.abs(diffX) > Math.abs(diffY) && e.cancelable) {
                e.preventDefault();
            }

            const progress = Math.min(Math.abs(diffX) / 150, 1);
            const opacity = 1 - progress * 0.5;
            const scale = 1 - progress * 0.05;
            const translateX = diffX * 0.4;
            
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
        viewport.addEventListener('touchmove', onDragMove, { passive: false });
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

        // --- УМНЫЙ ТАЙМЕР ---
        const updateTimer = () => {
            const currentNow = getNow();
            const bells = getBellsForGroup(userGroup);
            const currentMins = currentNow.getHours() * 60 + currentNow.getMinutes();

            const todayDate = new Date(realDateStr);
            todayDate.setHours(0, 0, 0, 0);
            const targetDate = new Date(getDateForDayAndWeek(selectedDay, weekOffset));
            targetDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((targetDate - todayDate) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                updateTimerUI({ status: 'empty', text: 'В этот день пары уже прошли', progress: 0 });
                return;
            }

            if (diffDays === 0 && currentLessons.length > 0) {
                const state = getTimerState(currentNow, currentLessons, bells);
                updateTimerUI(state);
                return;
            }

            // Ищем ближайший день с парами
            let searchDay = selectedDay;
            let searchWeekOffset = weekOffset;
            let daysAdded = 0;
            let foundLesson = null;
            let foundStartStr = null;

            for (let i = 0; i < 14; i++) {
                if (i > 0) {
                    searchDay++;
                    if (searchDay > 5) { searchDay = 1; searchWeekOffset++; }
                    daysAdded++;
                }

                const w = getWeekByOffset(searchWeekOffset);
                const lessons = cache[w]?.[searchDay] || [];
                
                if (i === 0 && diffDays === 0 && lessons.length === 0) continue;

                if (lessons.length > 0) {
                    foundLesson = lessons[0];
                    const bell = bells.find(b => b.pair === foundLesson.pair_num);
                    foundStartStr = foundLesson.custom_start || (bell ? bell.start : '08:30');
                    break;
                }
            }

            if (!foundLesson) {
                updateTimerUI({ status: 'empty', text: 'Пар на ближайшие дни нет', progress: 0 });
                return;
            }

            const [h, m] = foundStartStr.split(':').map(Number);
            const targetMins = h * 60 + m;
            
            const currentDateObj = new Date(realDateStr);
            currentDateObj.setHours(0,0,0,0);
            const foundDateObj = new Date(getDateForDayAndWeek(searchDay, searchWeekOffset));
            foundDateObj.setHours(0,0,0,0);
            const finalDiffDays = Math.round((foundDateObj - currentDateObj) / (1000 * 60 * 60 * 24));

            const minsLeft = (finalDiffDays * 24 * 60) + targetMins - currentMins;

            let dayLabel = 'сегодня';
            if (finalDiffDays === 1) dayLabel = 'завтра';
            else if (finalDiffDays === 2) dayLabel = 'послезавтра';
            else if (finalDiffDays > 2) dayLabel = getDayNameRusAccusative(searchDay);

            updateTimerUI({
                status: 'waiting',
                text: `До пары ${dayLabel} в ${foundStartStr}:`,
                subject: foundLesson.subject,
                room: foundLesson.room,
                timeLeft: formatBigTimeLeft(minsLeft),
                progress: 0
            });
        };
        setInterval(updateTimer, 1000);

        document.getElementById('btn-prev-week').addEventListener('click', () => {
            weekOffset -= 1;
            updateHeaderAndCalendar();
            loadWeekData(true); 
        });
        
        document.getElementById('btn-next-week').addEventListener('click', () => {
            weekOffset += 1;
            updateHeaderAndCalendar();
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

        document.getElementById('btn-today')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const smartView = getSmartViewState();
            weekOffset = smartView.offset;
            selectedDay = smartView.day;
            updateHeaderAndCalendar();
            loadWeekData(true);
        });

        await loadWeather();
    };

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'INITIAL_SESSION') {
            if (session) {
                initPage(session);
            } else {
                window.location.href = `${import.meta.env.BASE_URL}index.html`;
            }
        }
    });
}

initApp();