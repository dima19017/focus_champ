# Focus Champ — Стек технологий

## Принципы выбора

1. **AI-дружественность** — фреймворки с лучшей документацией и поддержкой в AI-инструментах (Cursor, Copilot, Codeium)
2. **Популярность** — большие сообщества, много ответов на StackOverflow, GitHub issues
3. **Простота деплоя** — serverless-first, минимум DevOps на старте
4. **PWA-ready** — работа на мобильных браузерах из коробки
5. **Бесплатно для MVP** — generous free tiers

---

## Итоговый стек

| Слой | Технология | Почему |
|------|-----------|--------|
| **Фреймворк** | Next.js 15 (App Router) | Лучшая экосистема 2024-2026, React Server Components, PWA, AI-документация №1 |
| **Язык** | TypeScript (strict mode) | Без вариантов — типизация спасает от багов |
| **База данных** | PostgreSQL + Prisma ORM | Prisma — лучшая DX для AI-разработки, автогенерация типов |
| **Аутентификация** | NextAuth.js v5 (Auth.js) | Встроен в экосистему Next.js, credentials provider для логин/пароль |
| **Стили** | TailwindCSS v4 + shadcn/ui | Компоненты из коробки, кастомизация, бесплатно |
| **Состояние** | TanStack Query + Zustand | React Query для серверного стейта, Zustand для UI-состояния |
| **Real-time** | Server-Sent Events (SSE) | Бесплатно, HTTP-native, достаточно для обновления очков |
| **AI анализ** | Google Gemini 2.5 Flash / OpenAI GPT-4o-mini | Vision API для анализа скриншотов, дешево, быстро |
| **Загрузка файлов** | Uploadthing / Vercel Blob | Бесплатный тир, простой API для загрузки скриншотов |
| **Деплой** | Vercel (Hobby) | Бесплатно, CI/CD из коробки, preview deployments |
| **Мониторинг** | Vercel Analytics (Web Vitals) + Sentry (free tier) | Бесплатный тир для старта |
| **Cron/фоновые задачи** | Vercel Cron Jobs + Next.js API routes | Бесплатно, встроено в платформу |
| **PWA** | next-pwa (Serwist) | Offline-режим, installable на телефоне |

---

## Почему этот стек

### Next.js 15 App Router

- **AI-документация №1**: каждый AI-инструмент знает Next.js лучше всех остальных фреймворков
- React Server Components снижают количество клиентского JS → быстро на мобильных
- Встроенная маршрутизация, API routes, middleware
- next-pwa делает приложение устанавливаемым на телефоны
- Vercel деплой в один клик

### PostgreSQL + Prisma

- Prisma — золотой стандарт DX: визуальный редактор схемы, автогенерация TypeScript типов, миграции
- PostgreSQL на Vercel (Neon) или Supabase — бесплатный тир 500MB
- Простая масштабируемость

### NextAuth.js v5 (Auth.js)

- Credentials provider → логин/пароль без email-подтверждения (MVP)
- JWT-сессии (не нужен Redis)
- Встроенная защита роутов через middleware
- Легко добавить OAuth позже (Google, GitHub, Apple)

### TailwindCSS + shadcn/ui

- shadcn/ui дает 40+ готовых компонентов (кнопки, модалки, формы, таблицы)
- Все компоненты копируются в проект → полный контроль над кодом
- Tailwind v4 с CSS-first конфигурацией — еще проще

### TanStack Query + Zustand

- TanStack Query: кеширование, ревалидация, optimistic updates — все для серверных данных
- Zustand: легковесный (1KB), простой API для UI-состояния (модалки, темы)

### Google Gemini 2.5 Flash

- $0.075 / 1K изображений — дешевле OpenAI в ~2 раза
- Быстрый Vision API для анализа скриншотов
- Хорошо парсит текст с изображений (даты, цифры, названия приложений)

### Server-Sent Events (SSE)

- Не нужен WebSocket-сервер (Pusher стоит $49/мес)
- Достаточно для обновления очков раз в ~30 секунд
- HTTP-native, работает через Vercel Edge

---

## Что не выбрали и почему

| Отвергнуто | Причина |
|-----------|---------|
| SvelteKit | Меньше AI-документации, меньше сообщество |
| Remix | Хорош, но Next.js App Router дает больше (RSC, PWA) |
| Supabase Auth | Избыточен для MVP, привязка к Supabase |
| Clerk | Платный после 10K MAU |
| MongoDB | Нет схемы → плохо для AI-разработки |
| Drizzle ORM | Хорош, но Prisma удобнее для AI (Prisma Studio) |
| tRPC | Избыточен при Server Components |
| WebSockets/Pusher | Платно, избыточно для MVP |
| OpenAI Vision | Дороже Gemini, медленнее |
| AWS S3 | Сложнее настройка, нет бесплатного egress |
| Railway/Fly.io | Vercel проще для Next.js |
| React Native/Expo | Мобильная разработка сложнее веба в 3-5 раз |
| Redux | Избыточен, много бойлерплейта |
| Strapi/headless CMS | Избыточен — пишем свой бекенд |

---

## Альтернативы на будущее (по мере роста)

| Заменить | На | Когда |
|----------|----|-------|
| SSE | WebSockets (Pusher/Socket.io) | >1000 одновременных пользователей в комнатах |
| Gemini Flash | Gemini Pro / GPT-4o | Нужна лучшая точность анализа |
| Vercel Blob | Cloudflare R2 | Большие объемы, дешевле egress |
| PostgreSQL Neon | Supabase | Нужен Realtime из коробки |
| NextAuth credentials | OAuth (Google, Apple) | Когда добавим подтверждение email |
| Vercel Cron | Inngest / Trigger.dev | Сложные цепочки задач |
