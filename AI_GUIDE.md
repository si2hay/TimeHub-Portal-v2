
### 📄 `AI_GUIDE.md` 


# TimeHub-Portal v2 — AI Guide

> ⚠️ Если в этом гайде написано одно, а в присланном коде пользователя — другое, **всегда истинным считается код пользователя**.

> 🛑 Ты — Senior Frontend разработчик. Твоя задача — поддерживать и развивать проект **TimeHub-Portal v2**. Пиши чистый, надёжный код, соблюдай модульность (один файл = одна задача) и правила ниже.

---

## 🛑 ПРАВИЛО №1: ЗАПРОС ФАЙЛОВ

**Ты НЕ ИМЕЕШЬ ПРАВА писать код, если не видел актуальное содержимое файла, который нужно изменить. Никаких "я предположу, что там написано...". Только реальный код пользователя.**

Прежде чем писать код, давать советы или менять файлы, запроси у пользователя актуальный код командой:
*"Чтобы я ничего не сломал, скинь мне актуальные файлы командой: `cat путь/к/файлу1.js путь/к/файлу2.js | wl-copy`"*.

Так как проект модульный, проси скидывать файлы блоками:

**Ядро и математика:**
```bash
cat src/constants/*.js src/features/*.js | wl-copy
```

**API и хранилища:**
```bash
cat src/api/*.js src/pages/app/*.js | wl-copy
```

**UI-компоненты (главные):**
```bash
cat src/ui/*.js | wl-copy
```

**UI-компоненты (модули):**
```bash
cat src/ui/offcanvas/*.js src/ui/offcanvas/settings/*.js src/ui/timer/*.js src/ui/utils/*.js | wl-copy
```

**Страницы и Админка:**
```bash
cat index.html pages/*.html src/pages/*.js src/pages/admin/*.js | wl-copy
```

**Стили:**
```bash
cat styles/main.css styles/base/*.css styles/layout/*.css styles/components/*.css styles/themes/*.css | wl-copy
```

---

## 🛑 ПРАВИЛО №2: ОТВЕТ ДОЛЖЕН БЫТЬ ПОЛНЫМ

- **ЗАПРЕЩЕНО** давать куски кода типа `// ... тут твой старый код ...` или `<!-- остальное без изменений -->`.
- Если меняешь файл — пишешь его **ЦЕЛИКОМ**, от `/** @file ... */` до последней скобки.
- **Обязательно** указывай полный путь к файлу перед блоком кода (например, `### src/features/timer.logic.js`).
- **В каждом файле должен быть заголовок** `@file` и `@description` (для JS) или `/** @file */` (для CSS).
- Комментарии в коде — только на русском языке.

---

## 🛑 ПРАВИЛО №3: АРХИТЕКТУРА И МОДУЛЬНОСТЬ

- **`src/assets/`** — статика, обрабатываемая Vite (логотип, шрифты `.woff2`).
- **`src/api/`** — только запросы к Supabase и внешним API.
- **`src/features/`** — только чистая логика и математика (без DOM и запросов к БД).
- **`src/ui/`** — только создание HTML-элементов и обновление DOM.
  - **`src/ui/utils/`** — переиспользуемые UI-утилиты (например, `hold-button.ui.js`).
  - **`src/ui/offcanvas/`** — модули для меню профиля.
  - **`src/ui/offcanvas/settings/`** — модули для настроек кастомизации.
  - **`src/ui/timer/`** — модули для виджета и фуллскрина таймера.
- **`src/pages/`** — «дирижеры». Связывают API, Features и UI.
  - **`src/pages/app/`** — хранилища и кеши (например, `schedule.store.js`).
- **`src/constants/`** — статичные данные (звонки, группы, словарь).
- **`styles/`** — разбиты на `base`, `layout`, `components`, `themes`. В `main.css` только `@import`.
- **Один файл = одна задача.** Не пихай всё в один файл. Если логика разрастается — выноси в отдельный модуль.

---

## 🛑 ПРАВИЛО №4: СТИЛЬ, БЕЗОПАСНОСТЬ И КАЧЕСТВО

- Пользователь — студент, не профессиональный разработчик. Объясняй просто, но пиши рабочий код.
- Всегда проверяй, что не сломал импорты.
- **Никогда не хардкодь** абсолютные пути. В HTML используй `%BASE_URL%`, в JS — `import.meta.env.BASE_URL`, для ассетов — `import logoUrl from '../assets/logo.png'`.
- **Всегда** используй `createSearchableSelect` и `createDatepicker` вместо нативных `<select>` и `<input type="date">`.
- Для сеток используй `minmax(0, 1fr)`.
- Не забывай про `-webkit-tap-highlight-color: transparent;`.
- Используй CSS-переменные (`--accent-color`, `--text-main`, `--menu-bg` и т.д.).
- Единый класс `.btn` для всех кнопок.
- **Безопасность (XSS)**: ВСЕГДА оборачивай данные из БД в `escapeHTML()` (из `src/features/sanitize.utils.js`) перед вставкой в `innerHTML` или атрибуты `value=""`.
- **Оптимизация мобилок**: Избегай тяжелых `backdrop-filter`, больших `box-shadow` и `transition: all`.
- **Шрифты**: Только `.woff2`.
- **Адаптивность**: Используй `clamp()` для крупных шрифтов (например, таймер), `white-space: nowrap` для кнопок, `flex: 1` и `min-width: 0` для слайдеров.
- **Без костылей.** Если для фикса нужно 10 строк CSS, а можно сделать через переменную — делай через переменную.

---

## 1. Обзор проекта

**TimeHub-Portal v2** — учебный портал для студента. Написан на Vite + Supabase, работает как обычный сайт (с адаптивом под ПК и мобилки) и как **Telegram Mini App**.

### 1.1. Функционал
- **Адаптивность (ПК)**: На экранах `> 900px` включается двухколоночная верстка. Слева — липкая (sticky) панель с погодой и таймером (380px). Справа — широкое расписание.
- **Плавные переходы (SPA-like)**: При переходе между HTML-страницами появляется темная шторка с лоадером, скрывающая белую вспышку браузера.
- **Умный выбор дня**: Если сегодня выходной (Сб/Вс) или пары уже закончились, портал автоматически открывает расписание на следующий учебный день (логика в `smart-view.logic.js`).
- **MPA**: `index.html` (вход), `pages/app.html` (главная), `pages/admin.html` (админка).
- **Off-canvas меню**: открывается по клику на логотип. Внутри профиля есть аккордеоны для Справочника (Калькулятор, Библиотеки, Консультации).
- **Авторизация**: Email через Supabase. Роли: `admin`, `sap`, `starosta`, `student`.
- **Свайпы дней**: переключение Пн-Пт по кругу свайпом. Каскадная анимация карточек.
- **Умный таймер**: учитывает перемены и звонки. Есть полноэкранный режим и кнопка «Ближайший». Текст автоматически переносится (без троеточий) и масштабируется через `clamp()`.
- **Календарь в шапке**: клик по дате открывает кастомный календарь с номерами учебных недель. Выходные заблокированы.
- **Виджет «Неделя + Погода»**: показывает номер текущей учебной недели, реальную дату, погоду (с кешем и таймаутом) и совет по одежде.
- **Замены**: админ ставит на конкретную дату. Автоочистка замен старше 15 дней. Старосты видят только свою группу.
- **Консультации**: админ назначает время. Студенты видят их в профиле (с кешем и предзагрузкой).
- **Полное расписание**: модалка на 2 недели вперед. Запросы оптимизированы (параллельный `Promise.all`).
- **Стрик (Огонёк)**: счетчик дней подряд.
- **Кастомизация**: темы, цвета, шрифты (RussoOne, PressStart2P, Tiny5Duo), обои, частицы, градиент, калькулятор оценок. Кнопка «Назад» — круглая SVG.
- **Безопасные действия**: Кнопки «Выйти», «Сбросить» и «Удалить фон» требуют удержания (3 секунды). Вынесено в утилиту `setupHoldButton`.
- **Скелетоны**: мерцающие заглушки с задержкой 150-200 мс, чтобы не мигать при быстром интернете.
- **Погода**: через `cors.dev`. Есть `AbortController` (8с), кеш в `sessionStorage` на 30 минут и fallback на устаревший кеш при ошибке сети.

### 1.2. Стек
- Vite 6
- Vanilla JS (ES6 Modules)
- Чистый CSS
- Supabase (PostgreSQL, Auth, RLS)
- GitHub Pages (через Actions)
- Telegram WebApp API

### 1.3. `.env` (не коммитится)
```env
VITE_SUPABASE_URL=твой_url
VITE_SUPABASE_ANON_KEY=твой_publishable_ключ
```

---

## 2. Структура файлов (Актуальная)

```text
timehub-v2/
├── index.html              # Вход
├── pages/
│   ├── app.html
│   └── admin.html
├── public/                 # favicon.ico, .nojekyll
├── src/
│   ├── assets/             # logo.png, fonts/*.woff2
│   ├── constants/          # bells, groups, dictionary
│   ├── api/                # supabase-client, profile, users,
│   │                       # schedule, substitution, weather, consultations
│   ├── features/           # ЧИСТАЯ ЛОГИКА
│   │   ├── color.utils.js        # Математика цвета
│   │   ├── sanitize.utils.js     # Защита от XSS (escapeHTML)
│   │   ├── smart-view.logic.js   # Логика умного старта
│   │   ├── date.logic.js
│   │   ├── timer.logic.js
│   │   ├── bells.logic.js
│   │   ├── substitution.logic.js
│   │   ├── debug.logic.js
│   │   ├── search.logic.js
│   │   └── streak.logic.js
│   ├── ui/
│   │   ├── app-layout.ui.js      # Каркас главной страницы
│   │   ├── weather-widget.ui.js  # Виджет погоды
│   │   ├── settings.ui.js        # Применение настроек (DOM)
│   │   ├── particles.ui.js       # Частицы (Canvas)
│   │   ├── wallpaper-theme.ui.js # Анализ обоев
│   │   ├── header.ui.js
│   │   ├── offcanvas.ui.js       # Дирижер меню
│   │   ├── offcanvas-settings.ui.js # Дирижер настроек
│   │   ├── schedule.ui.js
│   │   ├── timer.ui.js           # Дирижер таймера
│   │   ├── admin.ui.js
│   │   ├── admin-schedule.ui.js
│   │   ├── admin-substitution.ui.js
│   │   ├── admin-consultations.ui.js
│   │   ├── custom-select.ui.js
│   │   ├── custom-datepicker.ui.js
│   │   ├── transitions.ui.js
│   │   ├── debug.ui.js
│   │   ├── modal.ui.js
│   │   ├── timer/
│   │   │   ├── timer.widget.ui.js
│   │   │   ├── timer.fullscreen.ui.js
│   │   │   └── timer.utils.js
│   │   ├── offcanvas/
│   │   │   ├── calculator.ui.js
│   │   │   ├── consults.ui.js
│   │   │   ├── full-schedule.ui.js
│   │   │   ├── logout.ui.js
│   │   │   ├── swipe.ui.js
│   │   │   └── settings/
│   │   │       ├── appearance.group.js
│   │   │       ├── colors.group.js
│   │   │       └── background.group.js
│   │   └── utils/
│   │       └── hold-button.ui.js # Универсальное удержание
│   └── pages/
│       ├── app.page.js           # Дирижер главной
│       ├── auth.page.js
│       ├── admin.page.js
│       ├── app/
│       │   └── schedule.store.js # Кеш расписания
│       └── admin/
│           ├── schedule.admin.js
│           ├── substitution.admin.js
│           ├── consultations.admin.js
│           └── users.admin.js
├── styles/
│   ├── base/               # reset, variables, fonts
│   ├── layout/             # app-grid, admin
│   ├── components/         # form, custom-select, custom-datepicker,
│   │                       # settings, header, timer, card, modal,
│   │                       # button, auth, transition
│   ├── themes/             # glass, classic
│   └── main.css            # @import всех файлов
├── .env
├── .gitignore
├── package.json
├── vite.config.js
└── AI_GUIDE.md
```

---

## 3. База данных

4 таблицы с RLS:

1. **`profiles`**: `id`, `email`, `role`, `group_name`, `settings` (jsonb).
2. **`schedules`**: `id`, `group_name`, `week_num`, `day_num`, `pair_num`, `subject`, `room`, `teacher`, `custom_start`, `custom_end`.
3. **`substitutions`**: `id`, `group_name`, `date_str`, `pair_num`, `subject`, `room`, `teacher`, `custom_start`, `custom_end`. Если `subject` пустой — пара отменена.
4. **`consultations`**: `id`, `subject`, `room`, `day_num`, `time_start`, `time_end`.

**RLS:**
- Читать могут все авторизованные.
- Писать расписание/замены: `admin`, `sap`, `starosta` (только своя группа).
- Писать консультации и управлять пользователями: только `admin` и `sap`.

**Важно:** при запросах всегда используй `Number(weekNum)`, `Number(dayNum)`, `.trim()` для строк.

---

## 4. Логика

### 4.1. Время и даты
- Неделя: `(Math.floor(daysSinceStart / 7) % 2) + 1`, стартовая дата `2026-10-26`.
- День: 1-5 (в выходные 1).
- **Умный старт**: `getSmartViewState()` в `src/features/smart-view.logic.js`.

### 4.2. Звонки и перемены
В `bells.js` каждая пара описана 4 точками: `start`, `breakStart`, `breakEnd`, `end`.

### 4.3. Умный таймер
- Логика расчета — в `src/features/timer.logic.js`.
- UI разделен: `timer.widget.ui.js` и `timer.fullscreen.ui.js`.
- **Обычный виджет**: использует `formatCompactTime` (неразрывные пробелы между числом и единицей), CSS `clamp()` и `white-space: normal`, чтобы время аккуратно переносилось, а не обрезалось троеточием.
- **Фуллскрин**: время парсится через `formatFullscreenTime` и разбивается на блоки.

### 4.4. Свайпы
- **Дни**: свайп влево/вправо переключает Пн-Пт.
- **Off-canvas меню**: свайп влево закрывает. **ФИКС ПК**: если был свайп мышкой, следующий `click` глушится через `e.stopPropagation()`, чтобы случайно не нажать кнопку.

### 4.5. Telegram Mini App
- В `offcanvas.ui.js` используется `history.pushState` и `popstate` для нативной кнопки "Назад".

### 4.6. Автоочистка замен
При заходе в админку `admin` или `sap` вызывается `cleanOldSubstitutions()`.

### 4.7. Версия сборки
В `vite.config.js` добавлен `define: { __BUILD_DATE__: ... }`.

### 4.8. Погода без VPN
В `weather.api.js` запросы идут через прокси `https://proxy.cors.dev/${url}`. Добавлен `AbortController` (таймаут 8с) и кеш в `sessionStorage` на 30 минут. При ошибке отдается старый кеш.

### 4.9. Анимация удержания (Жидкость)
Вынесена в `src/ui/utils/hold-button.ui.js`. Используется для выхода, сброса настроек и удаления фона.

### 4.10. Плавные переходы (SPA-эффект)
- В HTML прописан инлайн-стиль `html { background-color: #0f1115; } body { background-color: transparent; }`.
- В `src/ui/transitions.ui.js` создается шторка.

### 4.11. Стили, Шрифты и Частицы
- Шрифты лежат в `src/assets/fonts/` (только `.woff2`).
- Частицы (Canvas) в `src/ui/particles.ui.js`. DPR ограничен (max 2), пауза при `document.hidden`.
- Скролл: `html` имеет `overscroll-behavior: none`, `body` — `contain`.

### 4.12. Адаптивность и масштабирование
- **Шрифт**: `calc(размер * var(--font-scale))`. Для крупных заголовков/времени используется `clamp()`.
- **Кнопки и бейджи**: `white-space: nowrap`, `flex-shrink: 0`.
- **Ползунки**: `flex: 1`, `min-width: 0`.

### 4.13. Админка и парсинг данных
- Кастомные селекты возвращают **строки**. Перед отправкой в Supabase конвертируются в числа (`Number()`).
- **Старосты**: В `schedule.admin.js` и `substitution.admin.js` список групп ограничивается `profile.group_name`, если роль `starosta`.

### 4.14. Мобильная производительность
- `transition: all` заменен на конкретные свойства. Убраны тяжелые `box-shadow` и вложенные `backdrop-filter`.
- `setInterval` таймера останавливается при `document.hidden`.
- Скелетоны показываются с задержкой (150-200 мс).

### 4.15. Асинхронная загрузка консультаций
- Вынесена в `src/ui/offcanvas/consults.ui.js`.
- Кеш (`consultsCache`) и дедупликация запросов.
- Скелетон появляется через 150 мс, если данные еще не пришли.

### 4.16. Безопасность (XSS)
- В `src/features/sanitize.utils.js` есть `escapeHTML()`.
- **Правило**: любые данные из БД (`subject`, `room`, `teacher`, `email`), вставляемые через `innerHTML` или `value=""`, должны быть обернуты в `escapeHTML()`.

### 4.17. Утечки памяти (Оптимизация)
- В `custom-select.ui.js` и `custom-datepicker.ui.js` глобальные слушатели клика (`document.addEventListener('click')`) вешаются **один раз** на модуль. Это предотвращает утечки при пересоздании сотен селектов в админке.

---

## 5. Что работает

1. ПК и мобильная верстка без багов скролла.
2. Умный выбор дня с мгновенной синхронизацией календаря.
3. Жидкая анимация кнопки выхода (синхронизирована с 3с).
4. Плавные SPA-переходы без белой вспышки.
5. Главная: свайпы, скелетоны, умный таймер (с переработанным фуллскрином), погода (с кешем и таймаутом), стрик.
6. Высокая производительность на мобилках: убраны лаги при открытии меню, оптимизированы частицы и таймеры.
7. Идеальный адаптив: таймер не вылезает за края (перенос строк), ползунки в настройках растягиваются.
8. Админка: расписание, замены, консультации, пользователи. Старосты видят только свою группу.
9. Кастомизация: темы, цвета, частицы, обои, кастомный калькулятор.
10. Telegram Mini App: нативная кнопка "Назад".
11. **Безопасность**: все данные из БД защищены от XSS (экранирование).
12. **Модульность**: страницы и меню разбиты на десятки маленьких файлов, каждый отвечает за свою задачу.
