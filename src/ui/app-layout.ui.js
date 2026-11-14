/**
 * @file src/ui/app-layout.ui.js
 * @description Каркас главной страницы (левая колонка, правая колонка, футер).
 */

export function renderAppLayout(realWeek, realDateStr) {
    const appDiv = document.getElementById('app');
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
                            <span class="current-date-label">(${realDateStr})</span>
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
}