

### AI_GUIDE.md

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

- **`src/api/`** — только запросы к Supabase и внешним API.
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

**TimeHub-Portal v2** — учебный портал для студента. Написан на Vite + Supabase, работает как обычный сайт (с адаптивом под ПК и мобилки) и как **Telegram Mini App**.

### 1.1. Функционал
- **Адаптивность (ПК)**: На экранах `> 900px` включается двухколоночная верстка. Слева — липкая (sticky) панель с погодой и таймером (380px). Справа — широкое расписание.
- **MPA**: `index.html` (вход/регистрация), `pages/app.html` (главная), `pages/admin.html` (админка).
- **Off-canvas меню**: открывается по клику на логотип. Два экрана (профиль и настройки). Навигация работает через `history.pushState` для поддержки кнопки «Назад» в Telegram.
- **Авторизация**: Email через Supabase. Роли: `admin`, `sap`, `starosta`, `student`.
- **Свайпы дней**: переключение Пн-Пт по кругу свайпом. Каскадная анимация карточек.
- **Умный таймер**: учитывает перемены (5/30/35 минут) и звонки 1/2+ курса. Если пары прошли — ищет следующую пару в кэше. Есть **полноэкранный режим** (открывается по клику на таймер).
- **Календарь в шапке**: клик по дате открывает кастомный календарь с номерами учебных недель.
- **Замены**: админ ставит на конкретную дату. Автоочистка замен старше 15 дней (при заходе admin/sap).
- **Консультации**: админ назначает время (день, начало, конец, кабинет, предмет). Студенты видят их в профиле.
- **Полное расписание**: модалка в профиле с расписанием на 2 недели вперед.
- **Стрик (Огонёк)**: счетчик дней подряд. Логика в `streak.logic.js` (сброс через 36 часов). Поповер в шапке.
- **Кастомизация**: темы, цвета, шрифты, обои, частицы (с ползунком количества), градиент.
- **Скелетоны**: при загрузке расписания показываются мерцающие карточки-заглушки.
- **Погода**: загружается через `cors.dev` (обход CORS и блокировок РФ без VPN).

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
├── index.html              # Вход
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
│   │                       # schedule, substitution, weather, consultations
│   ├── features/           # ЧИСТАЯ ЛОГИКА
│   │   ├── date.logic.js
│   │   ├── timer.logic.js
│   │   ├── bells.logic.js
│   │   ├── substitution.logic.js
│   │   ├── settings.logic.js
│   │   ├── debug.logic.js
│   │   ├── wallpaper-theme.logic.js
│   │   ├── particles.logic.js
│   │   ├── search.logic.js
│   │   └── streak.logic.js
│   ├── ui/
│   │   ├── header.ui.js
│   │   ├── offcanvas.ui.js
│   │   ├── offcanvas-settings.ui.js
│   │   ├── debug.ui.js
│   │   ├── schedule.ui.js
│   │   ├── timer.ui.js
│   │   ├── admin.ui.js
│   │   ├── admin-schedule.ui.js
│   │   ├── admin-substitution.ui.js
│   │   ├── admin-consultations.ui.js
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
│           ├── consultations.admin.js
│           └── users.admin.js
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
- Формат в шапке: `ДД.ММ.ГГГГ` (функция `formatDateRus`).

### 4.2. Звонки и перемены
В `bells.js` каждая пара описана 4 точками: `start`, `breakStart`, `breakEnd`, `end`.

### 4.3. Умный таймер
- Учитывает текущий день и неделю.
- Если пары прошли → ищет следующую пару в `cache`.
- Есть `timer.ui.js` с полноэкранным режимом (`#fullscreen-timer`).

### 4.4. Свайпы
- **Дни**: свайп влево/вправо переключает Пн-Пт по кругу.
- **Off-canvas меню**: свайп влево закрывает.

### 4.5. Telegram Mini App
- В `offcanvas.ui.js` используется `history.pushState` и `popstate`, чтобы системная кнопка "Назад" корректно закрывала меню.
- Отключены вертикальные свайпы в `app.page.js`.

### 4.6. Автоочистка замен
При заходе в админку `admin` или `sap` вызывается `cleanOldSubstitutions()`.

### 4.7. Версия сборки
В `vite.config.js` добавлен `define: { __BUILD_DATE__: ... }`.

### 4.8. Погода без VPN
В `weather.api.js` запросы идут через прокси `https://proxy.cors.dev/${url}`. Если он падает, идет прямой запрос.

### 4.9. Стили
- ПК-версия: `@media (min-width: 900px)`. Левая колонка `flex: 0 0 380px`, правая `flex: 1`.
- `html, body` не должны иметь `overflow: hidden`, чтобы не ломать мобильный скролл.
- Поповер стрика на стекле использует `rgba(15, 17, 21, 0.85)` для читаемости.
- В калькуляторе оценок `inputmode="numeric"` для вызова цифровой клавиатуры.

---

## 5. Что работает

1. ПК и мобильная верстка без багов скролла.
2. Вход с частицами и фиксом автозаполнения.
3. Главная: свайпы, скелетоны, умный таймер (с фуллскрином), погода через `cors.dev`, стрик.
4. Админка: расписание, замены, консультации, пользователи.
5. Кастомизация: темы, цвета, частицы, обои.
6. Telegram Mini App: нативная кнопка "Назад".
```

### README.md
```markdown
<div align="center">

# 🕒 TimeHub-Portal v2

**Современный портал для студентов: расписание, таймер пар, замены, консультации и кастомизация.**

[![Live Demo](https://img.shields.io/badge/🌐_Сайт-Online-success)](https://si2hay.github.io/TimeHub-Portal-v2/)
[![Telegram Bot](https://img.shields.io/badge/📱_Telegram-@timehub__portal__bot-blue)](https://t.me/timehub_portal_bot)
[![GitHub](https://img.shields.io/badge/GitHub-si2hay-black)](https://github.com/si2hay/TimeHub-Portal-v2)

</div>

---

## 📖 О проекте

Это переписанная с нуля версия моего старого проекта. 
Сайт работает как в обычном браузере (с адаптивом под ПК и мобилки), так и в виде Telegram Mini App. Написан на Vite без использования фреймворков (Vanilla JS), данные хранятся в Supabase.

### Основные фичи

- 📅 **Расписание** — база разбита по неделям (чет/нечет) и дням. На ПК выглядит как удобная двухколоночная сетка.
- 🔄 **Свайпы** — дни листаются свайпами (пальцем или мышкой) с анимацией карточек.
- ⏱ **Умный таймер** — учитывает перемены (5/30/35 минут) и разные звонки для 1 и 2+ курсов. Если пары закончились, ищет ближайшую в будущем. Есть полноэкранный режим!
- 🔔 **Замены** — староста или админ ставит замены на конкретную дату. Есть поддержка кастомного времени и красная подсветка изменений.
- 🎓 **Консультации** — админ назначает время консультаций, студенты видят их в профиле.
- 🔥 **Стрик (Огонёк)** — счетчик дней подряд, когда ты заходил на сайт.
- 🎨 **Кастомизация** — можно менять тему (Стекло/Классика), цвета, шрифт, ставить обои, включать частицы.
- 🌤 **Погода** — загружается без VPN через прокси `cors.dev`.
- 🛠 **DANGER ZONE** — панель для админов, чтобы подкрутить время/дату для тестов.
- 🔍 **Умный поиск** — ищет с опечатками (расстояние Левенштейна) и игнорирует лишние символы.

---

## 🛠️ Стек

- **Сборка:** Vite 6
- **Фронтенд:** Vanilla JS (ES6), чистый CSS
- **Бэкенд:** Supabase (PostgreSQL, Auth, RLS)
- **Хостинг:** GitHub Pages (через Actions)
- **Telegram:** WebApp API

---

## 🚀 Как запустить локально

1. Клонируй репозиторий:
   ```bash
   git clone https://github.com/si2hay/TimeHub-Portal-v2.git
   cd TimeHub-Portal-v2
   ```

2. Установи зависимости:
   ```bash
   npm install
   ```

3. Создай `.env` файл в корне и добавь ключи из Supabase (Project Settings -> API):
   ```env
   VITE_SUPABASE_URL=твой_url
   VITE_SUPABASE_ANON_KEY=твой_anon_ключ
   ```

4. Запусти dev-сервер:
   ```bash
   npm run dev
   ```
   Сайт будет доступен на `http://localhost:3000`.

5. Сборка для продакшена:
   ```bash
   npm run build
   ```

---

## 📁 Структура

```text
├── index.html          # Вход / Регистрация
├── pages/              # HTML страницы (app, admin)
├── public/             # Статика (лого, шрифты)
├── styles/             # CSS (разбит на base, layout, components, themes)
├── src/
│   ├── api/            # Запросы к Supabase и внешним API (погода)
│   ├── features/       # Чистая логика (таймер, даты, поиск, стрик)
│   ├── ui/             # Рендер DOM-элементов
│   ├── pages/          # JS-контроллеры страниц
│   └── constants/      # Звонки, группы, словарь
└── vite.config.js
```

---

## 🗄️ База данных

В проекте 4 таблицы: `profiles`, `schedules`, `substitutions`, `consultations`. 
Везде включен RLS. Права настроены так:
- Смотреть могут все авторизованные пользователи.
- Редактировать расписание и замены: `admin`, `sap` и `starosta` (только для своей группы).
- Управлять пользователями и консультациями: только `admin` и `sap`.

---

## 🌐 Деплой

Настроен GitHub Actions. При каждом пуше в `main`:
1. Запускается `npm run build`.
2. Секреты подтягиваются из настроек репозитория.
3. Папка `dist` публикуется на GitHub Pages.

Для работы нужно добавить `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в **Settings -> Secrets and variables -> Actions**.

---

## 👤 Автор

- GitHub: [@si2hay](https://github.com/si2hay)
- Почта: [gemg944@gmail.com](mailto:gemg944@gmail.com)
