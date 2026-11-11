
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

**Supabase:**
```bash
cat src/api/*.js | wl-copy
```

**UI-компоненты:**
```bash
cat src/ui/*.js | wl-copy
```

**Страницы:**
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

## 🛑 ПРАВИЛО №3: АРХИТЕКТУРА

- **`src/api/`** — только запросы к Supabase.
- **`src/features/`** — только чистая логика и математика (без DOM и запросов к БД).
- **`src/ui/`** — только создание HTML-элементов и обновление DOM.
- **`src/pages/`** — «дирижеры». Связывают API, Features и UI.
- **`src/constants/`** — статичные данные (звонки, группы, словарь).
- **`styles/`** — разбиты на `base`, `layout`, `components`, `themes`. В `main.css` только `@import`.

---

## 🛑 ПРАВИЛО №4: СТИЛЬ

- Пользователь — студент, не профессиональный разработчик. Объясняй просто, но пиши рабочий код.
- Всегда проверяй, что не сломал импорты.
- **Никогда не хардкодь** абсолютные пути в HTML. Используй `import.meta.env.BASE_URL`.
- **Всегда** используй `createSearchableSelect` и `createDatepicker` вместо нативных `<select>` и `<input type="date">`.
- Для сеток используй `minmax(0, 1fr)`.
- Не забывай про `-webkit-tap-highlight-color: transparent;`.
- Используй CSS-переменные (`--accent-color`, `--text-main` и т.д.).
- Единый класс `.btn` для всех кнопок.

---

## 1. Обзор проекта

**TimeHub-Portal v2** — учебный портал для студента. Написан на Vite + Supabase, работает как обычный сайт и как **Telegram Mini App**.

### 1.1. Функционал
- **MPA**: `index.html` (вход/регистрация, в корне), `pages/app.html` (главная), `pages/admin.html` (админка).
- **Off-canvas меню**: открывается по клику на логотип. Два экрана (профиль и настройки) с анимацией. Закрывается свайпом влево (палец или мышь) или крестиком.
- **Авторизация**: Email через Supabase. Роли: `admin`, `sap`, `starosta`, `student`.
- **Свайпы дней**: переключение Пн-Пт по кругу свайпом. Каскадная анимация карточек.
- **Умный таймер**: учитывает перемены (5/30/35 минут) и звонки 1/2+ курса. Если пары прошли — ищет следующую пару в кэше (может писать "До пары завтра в 08:30: 14 ч 10 мин").
- **Календарь в шапке**: клик по дате открывает кастомный календарь с номерами учебных недель под каждой датой.
- **Замены**: админ ставит на конкретную дату. Кастомное время, красная подсветка изменений. Автоочистка замен старше 15 дней (при заходе admin/sap).
- **DANGER ZONE**: машина времени для админов. Только Дата и Время (неделя/день вычисляются автоматически).
- **Кастомизация**: темы, цвета, шрифты, обои, частицы (с ползунком количества), градиент.
- **Скелетоны**: при загрузке расписания показываются мерцающие карточки-заглушки.

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

## 2. Структура файлов

```text
timehub-v2/
├── index.html              # Вход (в корне для GitHub Pages)
├── pages/
│   ├── app.html
│   └── admin.html
├── public/                 # logo.png, favicon.ico, fonts
├── styles/
│   ├── base/               # reset, variables, fonts
│   ├── layout/             # app-grid, admin
│   ├── components/         # form, custom-select, custom-datepicker,
│   │                       # settings, header, timer, card, modal,
│   │                       # button, auth
│   ├── themes/             # glass, classic
│   └── main.css            # @import всех файлов
├── src/
│   ├── constants/          # bells, groups, dictionary
│   ├── api/                # supabase-client, profile, users,
│   │                       # schedule, substitution, weather
│   ├── features/           # ЧИСТАЯ ЛОГИКА
│   │   ├── date.logic.js        # Недели, дни, падежи, форматирование дат
│   │   ├── timer.logic.js       # Статус пары (с переменами)
│   │   ├── bells.logic.js       # Выбор звонков по курсу
│   │   ├── substitution.logic.js # Наложение замен
│   │   ├── settings.logic.js    # Умный контраст, применение настроек
│   │   ├── debug.logic.js       # Машина времени
│   │   ├── wallpaper-theme.logic.js # Палитра из картинки
│   │   ├── particles.logic.js   # Частицы на Canvas
│   │   ├── search.logic.js      # Умный поиск (Левенштейн)
│   │   └── streak.logic.js      # Стрик
│   ├── ui/                 # ОТРИСОВКА DOM
│   │   ├── header.ui.js
│   │   ├── offcanvas.ui.js
│   │   ├── offcanvas-settings.ui.js
│   │   ├── debug.ui.js
│   │   ├── schedule.ui.js
│   │   ├── timer.ui.js
│   │   ├── admin.ui.js
│   │   ├── admin-schedule.ui.js
│   │   ├── admin-substitution.ui.js
│   │   ├── custom-select.ui.js
│   │   ├── custom-datepicker.ui.js
│   │   └── modal.ui.js
│   └── pages/
│       ├── app.page.js
│       ├── auth.page.js
│       ├── admin.page.js
│       └── admin/
│           ├── schedule.admin.js
│           ├── substitution.admin.js
│           └── users.admin.js
├── .env
├── .gitignore
├── package.json
├── vite.config.js
└── AI_GUIDE.md
```

---

## 3. База данных

3 таблицы с RLS:

1. **`profiles`**: `id`, `email`, `role`, `group_name`, `settings` (jsonb).
2. **`schedules`**: `id`, `group_name`, `week_num`, `day_num`, `pair_num`, `subject`, `room`, `teacher`, `custom_start`, `custom_end`.
3. **`substitutions`**: `id`, `group_name`, `date_str`, `pair_num`, `subject`, `room`, `teacher`, `custom_start`, `custom_end`. Если `subject` пустой — пара отменена.

**RLS:**
- Читать могут все авторизованные.
- Писать: `admin`, `sap`, `starosta` (только своя группа).
- Управлять пользователями: только `admin`.

**Важно:** при запросах всегда используй `Number(weekNum)`, `Number(dayNum)`, `.trim()` для строк.

---

## 4. Логика

### 4.1. Время и даты
- Неделя: `(Math.floor(daysSinceStart / 7) % 2) + 1`, стартовая дата `2026-10-26`.
- День: 1-5 (в выходные 1).
- Формат в шапке: `ДД.ММ.ГГГГ` (функция `formatDateRus`).
- Падежи для дней: `getDayNameRusAccusative` → "в понедельник", "во вторник", "в среду".

### 4.2. Звонки и перемены
В `bells.js` каждая пара описана 4 точками: `start`, `breakStart`, `breakEnd`, `end`. Это нужно для таймера, чтобы он точно знал, где 5-минутная перемена, а где обед 30 минут (у 1 курса).

### 4.3. Умный таймер
- Учитывает текущий день (`selectedDay`), неделю (`weekOffset`).
- Если пары прошли → ищет следующую пару в `cache` (может быть завтра, послезавтра, в понедельник).
- Форматирует время с днями: `formatBigTimeLeft` → "X д X ч X мин".

### 4.4. Свайпы
- **Дни**: свайп влево/вправо переключает Пн-Пт по кругу. `touchstart/move/end` + `mousedown/move/up`.
- **Off-canvas меню**: свайп влево закрывает. Порог — 30% ширины меню.

### 4.5. Telegram Mini App
- `index.html` подключает `telegram-web-app.js`.
- В `app.page.js`: `tg.expand()`, `tg.disableVerticalSwipes()`, `tg.enableClosingConfirmation()`, `tg.BackButton.hide()`.
- В `offcanvas.ui.js`: при открытии `tg.BackButton.show()`, при закрытии `tg.BackButton.hide()`. Обработчик `BackButton.onClick` закрывает меню или возвращает на предыдущий экран.

### 4.6. Автоочистка замен
При заходе в админку `admin` или `sap` вызывается `cleanOldSubstitutions()` (без `await`), которая удаляет все `substitutions` старше 15 дней.

### 4.7. Версия сборки
В `vite.config.js` добавлен `define: { __BUILD_DATE__: ... }`. В `offcanvas.ui.js` версия выводится в футере профиля: `v2.0 | Сборка: 12.11.2026, 14:30`.

### 4.8. Стили
- Не использовать `transform: translateY()` на hover.
- Кнопки используют `var(--accent-color)`.
- Скелетоны: `.skeleton-block::after` с анимацией `shimmer`.
- Кастомный скроллбар через `*::-webkit-scrollbar`.
- На мобилках убирать тяжёлые эффекты (blur, анимации).

---

## 5. Что работает

1. Вход с частицами, размытым лого на фоне, фиксом автозаполнения Chrome.
2. Главная: свайпы дней, каскадная анимация карточек, скелетоны, умный таймер, погода, совет по одежде.
3. Календарь в шапке с номерами недель.
4. Админка: расписание, замены (со сдвигом и подсветкой), пользователи (умный поиск). Автоочистка старых замен.
5. Кастомизация: темы, цвета, шрифты, частицы (с ползунком), обои.
6. DANGER ZONE: только календарь + время (неделя/день автовычисляются).
7. Telegram Mini App: нативная кнопка "Назад", блокировка свайпа-закрытия.
8. Версия сборки в профиле + ссылка на сайт колледжа.

---

## 6. Контакты

- GitHub: `https://github.com/si2hay`
- Репозиторий: `https://github.com/si2hay/TimeHub-Portal-v2`
- Почта: `gemg944@gmail.com`
