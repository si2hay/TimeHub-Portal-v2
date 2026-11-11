
<div align="center">

# 🕒 TimeHub-Portal v2

**Портал для студентов с расписанием, таймером пар, заменами и кастомизацией.**

[![Live Demo](https://img.shields.io/badge/🌐_Сайт-Online-success)](https://si2hay.github.io/TimeHub-Portal-v2/)
[![Telegram Bot](https://img.shields.io/badge/📱_Telegram-@timehub__portal__bot-blue)](https://t.me/timehub_portal_bot)
[![GitHub](https://img.shields.io/badge/GitHub-si2hay-black)](https://github.com/si2hay/TimeHub-Portal-v2)

</div>

---

## 📖 О проекте

Это переписанная с нуля версия моего старого проекта. 
Сайт работает как в обычном браузере, так и в виде Telegram Mini App. Написан на Vite без использования фреймворков (Vanilla JS), данные хранятся в Supabase.

### Основные фичи

- 📅 **Расписание** — база разбита по неделям (чет/нечет) и дням.
- 🔄 **Свайпы** — дни листаются свайпами (пальцем или мышкой) с анимацией карточек.
- ⏱ **Таймер пар** — учитывает перемены (5/30/35 минут) и разные звонки для 1 и 2+ курсов. Если пары закончились, ищет ближайшую в будущем.
- 🔔 **Замены** — админ ставит замены на конкретную дату. Есть поддержка кастомного времени.
- 🎨 **Кастомизация** — можно менять тему (Стекло/Классика), цвета, шрифт, ставить обои, включать частицы.
- 🛠 **DANGER ZONE** — панель для админов, чтобы подкрутить время/дату и проверить, как работает таймер.
- 🔍 **Умный поиск** — ищет с опечатками (расстояние Левенштейна) и игнорирует лишние символы.

---

## 🛠️ Стек

- **Сборка:** Vite 6
- **Фронтенд:** Vanilla JS (ES6), чистый CSS
- **Бэкенд:** Supabase (PostgreSQL, Auth, RLS)
- **Хостинг:** GitHub Pages (через Actions)

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
│   ├── api/            # Запросы к Supabase
│   ├── features/       # Чистая логика (таймер, даты, поиск)
│   ├── ui/             # Рендер DOM-элементов
│   ├── pages/          # JS-контроллеры страниц
│   └── constants/      # Звонки, группы, словарь
└── vite.config.js
```

---

## 🗄️ База данных

В проекте 3 таблицы: `profiles`, `schedules`, `substitutions`. 
Везде включен RLS. Права настроены так:
- Смотреть могут все авторизованные пользователи.
- Редактировать расписание и замены: `admin`, `sap` и `starosta` (только для своей группы).
- Управлять пользователями: только `admin`.

---

## 🔒 Безопасность

- RLS-политики на всех таблицах.
- Подтверждение почты при регистрации.
- Ограничения на количество попыток входа (Rate Limits).
- `.env` лежит в `.gitignore`, на GitHub ключи передаются через Secrets.

---

## 🌐 Деплой

Настроен GitHub Actions. При каждом пуше в `main`:
1. Запускается `npm run build`.
2. Секреты подтягиваются из настроек репозитория.
3. Папка `dist` публикуется на GitHub Pages.

Для работы нужно добавить `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в **Settings -> Secrets and variables -> Actions**.

---

## 🤖 Telegram

Проект работает как Telegram Mini App ([@timehub_portal_bot](https://t.me/timehub_portal_bot)). 
Перехватывается системная кнопка "Назад", отключены случайные свайпы вниз для закрытия бота.

---

## 👤 Автор

- GitHub: [@si2hay](https://github.com/si2hay)
- Почта: [gemg944@gmail.com](mailto:gemg944@gmail.com)
- Газпром колледж Волгоград
