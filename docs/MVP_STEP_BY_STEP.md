# Focus Champ MVP — Пошаговый план реализации

> **Стек**: Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL + NextAuth.js + TailwindCSS + shadcn/ui
> **Деплой**: Vercel (Hobby)
> **Ожидаемый срок**: 5 недель (один разработчик + AI-ассистент)

---

```
sudo apt install proxychains4 -y
echo "socks5 45.114.60.140 1080 proxyuser S19T76d20l07" >> /etc/proxychains4.conf
```

## Подготовка окружения (перед началом)

### Установка Node.js через nvm

> **Что делаем**: устанавливаем `nvm` — менеджер версий Node.js. Он позволяет переключаться между разными версиями Node для разных проектов.
> **Зачем**: чтобы версия Node не конфликтовала с другими проектами. Без nvm при глобальном обновлении Node старые проекты могут сломаться.
> **Почему nvm**: стандарт индустрии. `nvm use` автоматически подхватывает `.nvmrc` из папки проекта — зашёл в папку, и версия Node уже правильная.

```bash
# Установка nvm (один раз)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Перезайти в терминал или:
source ~/.bashrc

# Установить последнюю LTS-версию Node.js
nvm install --lts
nvm use --lts

# Проверка
node -v   # должно быть >= 20.x
npm -v    # должно быть >= 10.x
```

### Установка pnpm

> **Что делаем**: устанавливаем `pnpm` — быстрый и экономный пакетный менеджер.
> **Зачем**: `pnpm` использует hard links — одинаковые пакеты хранятся на диске один раз, даже если используются в 10 проектах. Это экономит гигабайты места. Плюс он быстрее npm на 30-50%.
> **Почему не yarn**: yarn тоже хорош, но pnpm сейчас самый быстрый и строгий (не даёт использовать необъявленные зависимости). AI-инструменты (Cursor, Copilot) генерируют код под pnpm так же хорошо, как под npm.

```bash
# Глобальная установка (единственный раз)
npm install -g pnpm

# Проверка
pnpm -v
```

### Фиксация версии Node под проект

```bash
# После создания проекта (шаг 1.1) выполнить в папке focus_champ:
node -v > .nvmrc
```

Теперь при входе в папку проекта достаточно `nvm use` — и версия Node автоматически переключится.

### Что где живёт

| Что | Где | Влияние на систему |
|-----|-----|-------------------|
| Node.js | Управляется nvm (`~/.nvm/`) | Изолировано по версиям |
| pnpm | Глобально (`/usr/local/bin/`) | Единственный глобальный пакет |
| Зависимости проекта | `node_modules/` | Локально, удаляется вместе с папкой |
| Prisma, Next.js CLI | `npx` / `pnpm exec` | Запускаются из `node_modules/.bin/` |

### Полезные алиасы (добавить в `~/.bashrc`)

```bash
alias pnd="pnpm run dev"
alias pnb="pnpm run build"
alias pnl="pnpm run lint"
alias ps="proxychains4 npx prisma studio"
alias pdp="proxychains4 npx prisma db push"
alias pg="proxychains4 npx prisma generate"
```

---

## Неделя 1: Фундамент проекта

### Правильный порядок выполнения

```
Подготовка:
  1. nvm install --lts          ← менеджер версий Node
  2. node -v > .nvmrc           ← зафиксировать версию в проекте

Шаг 1.1 (в /home/dima/home/focus_champ/):
  3. npx create-next-app        ← создать проект (один раз, одна команда)

Шаг 0 — Git (в /home/dima/home/focus_champ/ — родительской!):
  4. git init && git add .      ← единый репозиторий: код + документация

Шаг 1.2 (в /home/dima/home/focus_champ/ — корень = приложение):
  5. pnpm install               ← базовые зависимости Next.js
  6. pnpm add prisma ...        ← MVP-зависимости
```

> **Важно**: шаги 5-7 используют `pnpm`, но `create-next-app` (шаг 3) внутри себя использует `npm` — это нормально, проект создаётся на npm, а дальше работаем через pnpm.

### Настройка прокси (если используется)

Если сеть требует прокси (Россия, Китай, корпоративная сеть) — настрой **до** шага 1.1:

```bash
# Установить прокси для npm (использовать свои креды)
npm config set proxy socks5h://user:pass@host:port
npm config set https-proxy socks5h://user:pass@host:port

# Разрешить self-signed сертификаты (прокси могут подменять)
npm config set strict-ssl false
```

**⚠️ Важно**: `proxychains` не всегда корректно пробрасывает DNS для npm. Надёжнее настраивать прокси напрямую через `npm config`, а не через `proxychains4`. Но для **npx prisma** (TCP-подключение к БД) — `proxychains4` обязателен и работает.

Если `create-next-app` зависает на `npm install` — **выбери ОДИН из вариантов** (не выполняй все подряд!):

```bash
# Вариант А: проверить прокси и повторить
curl -x socks5h://user:pass@host:port https://registry.npmjs.org/ -I --max-time 10

# Вариант Б: использовать pnpm вместо npm (надёжнее через прокси)
pnpm create next-app@latest focus_champ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Вариант В: прямое зеркало (если прокси не нужен для Китая)
npm config set registry https://registry.npmmirror.com
npx create-next-app@latest focus_champ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Шаг 1.1 — Инициализация Next.js 15

> **Что делаем**: создаём новый Next.js проект с TypeScript, Tailwind, ESLint, App Router.
> **Зачем**: это скелет приложения. App Router — современная архитектура Next.js (Server Components, layouts, streaming). TypeScript даёт автодополнение и ловит ошибки на этапе написания кода.
> **Почему именно эти флаги**: `--src-dir` кладёт код в `src/` (чище корень проекта), `--import-alias "@/*"` даёт короткие импорты `@/components/...` вместо `../../components/...`.

```bash
proxychains4 npx create-next-app@latest focus_champ \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*"
# create-next-app создаст папку focus_champ/ с проектом
# Затем перенеси всё на уровень выше (best practice: приложение в корне репо):
mv focus_champ/* .
mv focus_champ/.[!.]* . 2>/dev/null
rmdir focus_champ
```

> **Ожидаемое время**: 3-10 минут в зависимости от сети. При использовании прокси `npm install` внутри `create-next-app` может занять до 15 минут — это нормально, пакеты скачиваются в `~/.npm/_cacache` (2+ ГБ), затем разархивируются в `node_modules/`. Если процесс завис намертво (>10 мин без движения диска) — см. [Настройка прокси](#настройка-прокси-если-используется) выше.

**На вопрос `Would you like to use React Compiler?` → выбрать `No`** (React Compiler экспериментальный, для MVP не нужен — он автоматически мемоизирует компоненты, но может сломать неочевидные места).

> **После создания**: `pnpm` (v10+) блокирует build-скрипты. Создай `.npmrc` в корне проекта:
> ```
> onlyBuiltDependencies=sharp unrs-resolver msw
> ```
> Если появляются новые ignored builds — дополняй строку через пробел.
>
> **Важно**: файл `.npmrc` должен быть создан ДО `pnpm install` и ДО `shadcn init`, иначе оба упадут с `ERR_PNPM_IGNORED_BUILDS`.

**Проверка**: `pnpm dev` → открывается `http://localhost:3000`

### Шаг 0 — Git-репозиторий и GitHub

> **Выполняется в `/home/dima/home/focus_champ/` (родительская папка) — НЕ внутри приложения!**
>
> **Что делаем**: единый git-репозиторий для всего проекта: код приложения + документация + планы + диаграммы.
> **Зачем**: хранить историю изменений всего проекта, откатываться, дать AI-ассистенту полный контекст. Плюс резервная копия в облаке.
> **Почему репозиторий в корне, а не в папке приложения**: приложение (`focus_champ/`) — это только код. Документация, планы, диаграммы лежат на уровень выше. Один репозиторий на всё.

> ⚠️ **Важно**: `create-next-app` создаёт свой `.git` внутри папки приложения. Перед инициализацией корневого репо — **удали внутренний**:
> ```bash
> rm -rf /home/dima/home/focus_champ/focus_champ/.git 2>/dev/null
> # После переноса приложения в корень этот шаг не нужен — просто убедись, что нет вложенного .git/
> ```

```
focus_champ/                    ← git root + приложение (всё в одном месте)
├── .gitignore
├── package.json                ← Next.js
├── src/                        ← код приложения
├── PLAN.md                     ← документация
├── docs/                       ← планы, схемы, MVP
└── design.md                   ← дизайн-система
```

```bash
cd /home/dima/home/focus_champ
git init

# .gitignore: исключаем артефакты, оставляем документацию
cat > .gitignore << 'EOF'
**/node_modules/
**/.next/
**/.env
**/.env.local
.tmp/
*.log
EOF

git init
git add .
git commit -m "init: Focus Champ — документация + Next.js scaffold"
git remote add origin https://github.com/dima19017/focus_champ.git
git branch -M main
git push -u origin main
```

**Проверка**: `git remote -v` → `https://github.com/dima19017/focus_champ.git`. Открыть в браузере → видно и код, и `PLAN.md`.

### Шаг 1.2 — Установка зависимостей

> **Выполняется в `/home/dima/home/focus_champ/` (корень репозитория = папка приложения).**
>
> **Что делаем**: устанавливаем все библиотеки, которые понадобятся в MVP.
> **Зачем**: чтобы не прерываться потом на `pnpm add ...` — ставим всё сразу.
> **Почему именно эти пакеты**: Prisma (ORM для БД), NextAuth (аутентификация), Zustand (лёгкий стейт-менеджер), TanStack Query (кеширование серверных данных), shadcn/ui (готовые UI-компоненты), zod (валидация форм), Uploadthing (загрузка скриншотов), Gemini SDK (AI-анализ).

```bash
pnpm install
pnpm add prisma @prisma/client @prisma/adapter-pg next-auth@beta @auth/prisma-adapter
pnpm add zustand @tanstack/react-query
pnpm add lucide-react class-variance-authority clsx tailwind-merge
pnpm add zod react-hook-form @hookform/resolvers
pnpm add uploadthing @uploadthing/react
pnpm add @google/generative-ai
pnpm add date-fns bcryptjs
pnpm add -D prisma @types/node
pnpm approve-builds
pnpm dev
```

### Шаг 1.3 — Инициализация shadcn/ui

> **Что делаем**: подключаем shadcn/ui — библиотеку из 40+ готовых компонентов (кнопки, карточки, модалки, формы).
> **Зачем**: не писать компоненты с нуля. shadcn/ui копирует исходники в твой проект — ты их полностью контролируешь и можешь менять.
> **Почему не MUI / Ant Design**: shadcn/ui на Tailwind — не тянет за собой CSS-in-JS рантайм. Компоненты легче, на мобильных быстрее. AI-инструменты знают shadcn/ui наизусть.

```bash
npx shadcn@latest init
# shadcn v4 — ответы:
#   1. Select a component library → Radix
#   2. Which preset? → Nova (Lucide иконки + Geist шрифт — позже заменим на Inter)
#   (дальше будут ещё вопросы — см. ниже)
npx shadcn@latest add button card input label form dialog sonner tabs separator badge avatar progress dropdown-menu
```

**Проверка**: импортировать `Button` из `@/components/ui/button` — рендерится без ошибок.

### Шаг 1.4 — Настройка Prisma + PostgreSQL

> **Что делаем**: подключаем Prisma ORM к PostgreSQL.
> **Зачем**: Prisma даёт типобезопасные запросы к БД (автогенерация TypeScript типов из схемы), визуальный редактор (`prisma studio`), миграции.
> **Почему PostgreSQL, а не SQLite**: SQLite — файл, не подходит для продакшена (нет конкурентных записей). PostgreSQL — бесплатный тир на Neon/Supabase, держит сотни пользователей.

Создать базу на [Neon](https://neon.tech) (free tier: 500MB, хватит на MVP) или использовать локальный PostgreSQL.

`.env`:
```env
DATABASE_URL="postgresql://user:pass@host/dbname"
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"   # или порт, на котором реально запущен dev (3001, 3002...)
```

```bash
npx prisma init
```

> ⚠️ **Прокси**: Prisma подключается к БД по TCP. Все `npx prisma` команды — через `proxychains4`. Neon через прокси работает (проверено).

**Проверка**: `proxychains4 npx prisma db push` → `"The database is already in sync"`.

### Шаг 1.5 — Prisma-схема (базовая)

> **Что делаем**: описываем структуру базы данных в файле `schema.prisma`. Это единый источник правды — из него Prisma генерирует TypeScript-типы и управляет таблицами.
> **Зачем**: схема = документация + типы + миграции в одном файле. Меняешь схему → `prisma db push` → таблицы обновлены. Меняешь схему → `prisma generate` → типы TypeScript обновлены.
> **Почему именно эти 8 моделей**: это минимальный набор для MVP. User (игрок), Room (комната), Task (задача), RoomMember (связь игрок-комната), CompetitionDay (игровой день), DayScore (очки за день), TaskSubmission (отметка выполнения), DayWinner (победитель дня). Остальное (друзья, лидерборд) — фаза 2.

Создать `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  displayName  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  memberships       RoomMember[]
  taskSubmissions   TaskSubmission[]
  createdRooms      Room[]         @relation("RoomCreator")
  wonDays           DayWinner[]
}

model Room {
  id        String     @id @default(cuid())
  name      String
  joinCode  String     @unique
  status    String     @default("ACTIVE")
  creatorId String
  createdAt DateTime   @default(now())

  creator User          @relation("RoomCreator", fields: [creatorId], references: [id])
  tasks   Task[]
  members RoomMember[]
  days    CompetitionDay[]
}

model Task {
  id                   String   @id @default(cuid())
  roomId               String
  title                String
  points               Int
  requiresVerification Boolean  @default(false)
  sortOrder            Int      @default(0)
  createdAt            DateTime @default(now())

  room        Room             @relation(fields: [roomId], references: [id])
  submissions TaskSubmission[]
}

model RoomMember {
  id       String   @id @default(cuid())
  roomId   String
  userId   String
  joinedAt DateTime @default(now())

  room Room @relation(fields: [roomId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@unique([roomId, userId])
}

model CompetitionDay {
  id        String   @id @default(cuid())
  roomId    String
  dayNumber Int
  date      DateTime @default(now())
  status    String   @default("ACTIVE")
  winnerId  String?

  room      Room          @relation(fields: [roomId], references: [id])
  winner    DayWinner?
  scores    DayScore[]
  submissions TaskSubmission[]

  @@unique([roomId, dayNumber])
}

model DayScore {
  id          String @id @default(cuid())
  dayId       String
  userId      String
  totalPoints Int    @default(0)

  day CompetitionDay @relation(fields: [dayId], references: [id])
}

model TaskSubmission {
  id         String   @id @default(cuid())
  taskId     String
  userId     String
  dayId      String
  status     String   @default("PENDING")
  proofUrl   String?
  aiResponse Json?
  createdAt  DateTime @default(now())
  reviewedAt DateTime?

  task Task          @relation(fields: [taskId], references: [id])
  user User          @relation(fields: [userId], references: [id])
  day  CompetitionDay @relation(fields: [dayId], references: [id])

  @@unique([taskId, userId, dayId])
}

model DayWinner {
  id     String @id @default(cuid())
  dayId  String @unique
  userId String

  day  CompetitionDay @relation(fields: [dayId], references: [id])
  user User           @relation(fields: [userId], references: [id])
}
```

```bash
proxychains4 npx prisma db push
proxychains4 npx prisma generate
```

**Проверка**: `proxychains4 npx prisma studio` → открывается веб-интерфейс, таблицы созданы.

### Шаг 1.6 — Настройка NextAuth.js

> **Что делаем**: настраиваем аутентификацию через NextAuth.js v5 (бета). Используем Credentials provider — вход по логину и паролю.
> **Зачем**: без аутентификации нельзя отличить одного пользователя от другого. NextAuth берёт на себя сессии, куки, защиту от CSRF, хеширование паролей.
> **Почему Credentials, а не OAuth**: для MVP нужна максимальная простота. OAuth (Google, GitHub) потребует регистрации приложения у провайдера. Credentials — просто логин + пароль. OAuth добавим позже.

`src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  })

export const prisma = globalForPrisma.prisma || createPrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

> **Prisma v7**: требует явный adapter или `accelerateUrl`. Используем `@prisma/adapter-pg` для прямого подключения к PostgreSQL. Установить: `pnpm add @prisma/adapter-pg`.

`src/lib/auth.ts`:
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Логин" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        // check user, verify password
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
})
```

Создать `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

**Проверка**: `http://localhost:3001/api/auth/signin` — не 404.

### Шаг 1.7 — Цветовая схема (из design.md)

> **Что делаем**: заменяем Nova-тему на нашу dark-first палитру из `design.md`.
> **Зачем**: чтобы все компоненты shadcn/ui использовали наши цвета (`#0B1020`, `#7C4DFF`, `#22C55E`...) вместо стандартных.
> **Почему dark-first**: приложение для вечернего использования — тёмная тема по умолчанию, без переключателя. `:root` = тёмная тема.

`src/app/globals.css` — заменить содержимое:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-inter);
  --font-heading: var(--font-inter);
}

:root,
.dark {
  --background: #0B1020;
  --foreground: #f1f5f9;
  --card: #131B33;
  --card-foreground: #f1f5f9;
  --popover: #1A2444;
  --popover-foreground: #f1f5f9;
  --primary: #7C4DFF;
  --primary-foreground: #ffffff;
  --secondary: #1A2444;
  --secondary-foreground: #94a3b8;
  --muted: #1A2444;
  --muted-foreground: #64748b;
  --accent: #7C4DFF;
  --accent-foreground: #ffffff;
  --destructive: #EF4444;
  --border: rgba(255, 255, 255, 0.1);
  --input: rgba(255, 255, 255, 0.1);
  --ring: #7C4DFF;
  --radius: 0.625rem;
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; color-scheme: dark; }
}
```

> **Объяснение**: `components.json` (`"cssVariables": true`) говорит shadcn использовать CSS-переменные для цветов. Мы переопределяем их под наш дизайн. `color-scheme: dark` говорит браузеру рисовать скроллбары и инпуты в тёмной теме.

### Шаг 1.8 — Базовая структура роутов

> **Что делаем**: создаём файловую структуру страниц согласно Next.js App Router — каждая папка = URL.
> **Зачем**: чтобы был скелет навигации, и можно было проверять, что всё компилируется.
> **Почему именно такая структура**: `/login` и `/register` — публичные (без авторизации), `/dashboard` и `/room/*` — защищённые (middleware). Корневая страница сразу редиректит на дашборд.

```
src/app/
├── layout.tsx        ← корневой layout (theme, font)
├── page.tsx          ← редирект на /dashboard
├── login/page.tsx    ← заглушка
├── register/page.tsx ← заглушка
├── dashboard/
│   └── page.tsx      ← заглушка "Привет, {user}!"
└── api/auth/[...nextauth]/route.ts
```

**Проверка**: `pnpm build` — без ошибок.

---

## Неделя 2: Аутентификация + Комнаты

### Шаг 2.1 — Регистрация (API + страница)

> **Что делаем**: реализуем endpoint регистрации и страницу с формой.
> **Зачем**: пользователь должен создать аккаунт, чтобы участвовать в соревнованиях.
> **Почему своя регистрация, а не только NextAuth**: NextAuth Credentials provider отвечает только за вход. Регистрацию (создание User + хеширование пароля) делаем отдельным API-роутом. Это стандартный паттерн для NextAuth.

**API**: `src/app/api/auth/register/route.ts`
```typescript
export async function POST(req: Request) {
  const { username, password } = await req.json()
  // Валидация: username 3-20 символов, password 6+
  // Проверка уникальности username
  // bcrypt.hash(password, 10)
  // Создать User
  // Вернуть { success: true }
}
```

**Страница** `/register`: форма с `react-hook-form` + `zod`:
- Поля: Логин, Пароль, Повторите пароль
- Валидация на клиенте (zod schema)
- Валидация на сервере (уникальность логина)
- После успеха → `signIn("credentials", ...)` → редирект на `/dashboard`

**Проверка**: зарегистрироваться → user появляется в Prisma Studio.

### Шаг 2.2 — Вход (страница)

> **Что делаем**: страница логина через NextAuth `signIn()`.
> **Зачем**: пользователь входит в существующий аккаунт.
> **Почему `signIn("credentials", { redirect: false })`**: с `redirect: false` мы сами управляем редиректом через `router.push()`. Это даёт контроль над UX — можно показать ошибку на той же странице, а не перебрасывать на отдельную страницу ошибки NextAuth.

**Страница** `/login`:
- Поля: Логин, Пароль
- `signIn("credentials", { username, password, redirect: false })`
- Ошибка → toast «Неверный логин или пароль»
- Успех → `router.push("/dashboard")`
- Ссылка «Нет аккаунта? Зарегистрироваться»

**Проверка**: войти под созданным пользователем → редирект на дашборд.

### Шаг 2.3 — Защита роутов (middleware)

> **Что делаем**: Next.js middleware — проверяет сессию перед рендерингом защищённых страниц.
> **Зачем**: чтобы неавторизованный пользователь не мог попасть на `/dashboard` или `/room/*` по прямой ссылке.
> **Почему middleware, а не проверка в каждом layout**: middleware выполняется на edge (быстрее) и один раз для всех защищённых роутов. Не нужно дублировать проверку в каждом layout.

`src/middleware.ts`:
```typescript
export { auth as middleware } from "@/lib/auth"
export const config = {
  matcher: ["/dashboard/:path*", "/room/:path*", "/profile/:path*"]
}
```

**Проверка**: `http://localhost:3000/dashboard` без входа → редирект на `/login`.

### Шаг 2.4 — Dashboard (список комнат)

> **Что делаем**: главный экран после входа — показывает список комнат, в которых участвует пользователь.
> **Зачем**: это «центр управления» — отсюда пользователь видит свои соревнования и создаёт новые.
> **Почему API-роут, а не Server Component с прямым запросом к БД**: Server Component может напрямую вызывать Prisma. Но для MVP API-роуты удобнее: их можно вызывать и с клиента (TanStack Query), и для будущего мобильного API.

**API**: `src/app/api/rooms/route.ts`
```typescript
export async function GET() {
  const session = await auth()
  // prisma.roomMember.findMany({ where: { userId }, include: { room: true } })
  // Вернуть комнаты
}
```

**Страница** `/dashboard`:
- Приветствие «Привет, {username}!»
- Если комнат нет → Empty State: «У вас пока нет комнат»
- Список карточек комнат: название, кол-во участников, код, день N
- Две кнопки CTA: «Создать комнату», «Присоединиться»
- Bottom Navigation (4 иконки: Главная, Друзья, Лидерборд, Профиль)

**Проверка**: зайти на дашборд → видно Empty State + кнопки.

### Шаг 2.5 — Создание комнаты

> **Что делаем**: форма создания комнаты с динамическим списком задач.
> **Зачем**: пользователь настраивает соревнование под себя — какие привычки, сколько очков, нужна ли AI-проверка.
> **Почему код генерируется на сервере**: чтобы гарантировать уникальность. 6 символов (буквы + цифры) = 2.1 млрд комбинаций — коллизий практически не будет, но есть цикл `while` с проверкой.

**Страница** `/room/create`:
- Поле «Название комнаты»
- Секция «Задачи»:
  - Кнопка «+ Добавить задачу» (динамический список)
  - Каждая задача: название + очки + чекбокс «Требуется подтверждение»
  - Кнопка удаления задачи
- Валидация: минимум 1 задача, название не пустое, очки > 0
- Кнопка «Создать комнату»

**API**: `POST /api/rooms`
```typescript
// Генерация joinCode (6 символов, буквы+цифры)
// Транзакция: создать Room + Task[] + RoomMember(creator)
// Создать CompetitionDay(dayNumber: 1) для текущего дня
// Вернуть room с joinCode
```

**После создания**: показать модалку/страницу с кодом + кнопка «Войти в комнату».

**Проверка**: создать комнату → в БД: Room + Tasks + RoomMember + CompetitionDay.

### Шаг 2.6 — Присоединение по коду

> **Что делаем**: экран ввода 6-значного кода для присоединения к существующей комнате.
> **Зачем**: это основной способ приглашения — создатель отправляет код другу, друг вводит и сразу участвует. Не нужно добавлять в друзья, подтверждать email и т.д.
> **Почему 6 символов**: достаточно для 2 млрд комбинаций, легко вводить на телефоне, не нужно запоминать.

**Страница** `/room/join`:
- Поле ввода кода (6 символов, авто-uppercase)
- Кнопка «Присоединиться»
- Обработка ошибок

**API**: `POST /api/rooms/join`
```typescript
// Найти Room по joinCode
// Проверить, что пользователь ещё не участник
// Создать RoomMember
// Вернуть room
```

**Проверка**: создать вторым аккаунтом → присоединиться → в БД 2 RoomMember.

### Шаг 2.7 — Страница комнаты (базовая)

> **Что делаем**: главный игровой экран — показывает комнату, задачи, участников.
> **Зачем**: это экран, где пользователь будет проводить 90% времени. От его UX зависит удержание.
> **Почему пока без игровой механики**: на этом шаге только вёрстка и данные. Механика (отметка выполнения, очки) добавляется на неделе 3. Разделяем структуру и логику.

**Страница** `/room/[id]`:
- Заголовок: название комнаты, код, день N
- Список участников
- Список задач (пока без статусов, просто названия + очки)
- Кнопка «Назад»

**API**: `GET /api/rooms/[id]`
```typescript
// Вернуть room с tasks, members (с user), currentDay
```

**Проверка**: открыть комнату → видно название, задачи, участников.

---

## Неделя 3: Игровая механика

### Шаг 3.1 — Отметка выполнения (без AI)

> **Что делаем**: кнопка «Выполнил» для задач без AI-проверки. Создаёт TaskSubmission, начисляет очки.
> **Зачем**: базовая механика — пользователь отмечает задачу и получает очки. Без этого соревнования не работают.
> **Почему optimistic update (сразу зелёная галочка, не ждём ответа сервера)**: на мобильном интернете задержка 200-500мс. Optimistic update делает интерфейс мгновенным. Если сервер вернёт ошибку — откатываем.

**API**: `POST /api/tasks/[id]/submit`
```typescript
// Проверить, что пользователь в комнате
// Найти/создать currentDay
// Создать TaskSubmission(status: "PENDING" → "VERIFIED" если без проверки)
// Обновить DayScore: totalPoints += task.points
// Вернуть обновлённый DayScore
```

**UI в комнате**:
- Для каждой задачи: кнопка «Отметить выполнение»
- После нажатия → optimistic update (сразу зелёная галочка)
- TanStack Query инвалидирует данные

**Проверка**: отметить задачу → очки обновились в DayScore.

### Шаг 3.2 — Турнирная таблица дня

> **Что делаем**: рендерим отсортированный список участников с очками и прогресс-барами.
> **Зачем**: соревновательный элемент — пользователь видит, кто лидирует и насколько.
> **Почему прогресс-бары от максимального счёта, а не от суммы очков в комнате**: так визуально понятнее. Если у лидера 50 очков, а у второго 45 — бары почти одинаковые. Если бы бары были от суммы всех задач (например, 200), разница была бы незаметна.

**API**: дополнить `GET /api/rooms/[id]` — возвращать DayScore[] для текущего дня с сортировкой по очкам.

**UI**: таблица в комнате:
```
🥇 PlayerOne — 55 очков ████████░░
🥈 Anna      — 45 очков ██████░░░░
🥉 Bob       — 30 очков ████░░░░░░
```

**Проверка**: у двух участников разные очки → правильный порядок.

### Шаг 3.3 — Завершение дня (Cron Job)

> **Что делаем**: автоматическое завершение дня — выбор победителя и создание нового дня.
> **Зачем**: чтобы каждый день автоматически подводился итог. Без cron пользователям пришлось бы ждать ручного завершения.
> **Почему отдельный API-роут + Vercel Cron, а не setTimeout на сервере**: serverless-функции не живут дольше нескольких секунд. Vercel Cron надёжно вызывает эндпоинт каждые 24 часа.

**API**: `src/app/api/cron/end-day/route.ts`
```typescript
// Найти все ACTIVE CompetitionDay, где date < now()
// Для каждого:
//   1. Найти DayScore с макс totalPoints → объявить победителя
//   2. Создать DayWinner
//   3. Обновить CompetitionDay.status = "COMPLETED"
//   4. Создать новый CompetitionDay(dayNumber + 1, status: "ACTIVE")
```

**Vercel**: `vercel.json`
```json
{
  "crons": [{
    "path": "/api/cron/end-day",
    "schedule": "0 0 * * *"
  }]
}
```

**Для разработки**: эндпоинт `POST /api/rooms/[id]/end-day` для ручного тестирования.

**Проверка**: вызвать end-day → в БД: day.status=COMPLETED, winner создан, новый день ACTIVE.

### Шаг 3.4 — Победитель дня (UI)

> **Что делаем**: баннер с поздравлением победителя на странице комнаты.
> **Зачем**: эмоциональная награда — мотивирует возвращаться на следующий день.
> **Почему баннер, а не модальное окно**: баннер не перекрывает интерфейс — пользователь может сразу посмотреть итоги и задачи нового дня.

**UI в комнате** после завершения дня:
```
🏆 День 5 завершён!
Победитель: PlayerOne (55 очков)
```

**Проверка**: завершить день → видно баннер победителя.

### Шаг 3.5 — Real-time обновления (SSE)

> **Что делаем**: Server-Sent Events — сервер пушит обновления клиенту без перезагрузки страницы.
> **Зачем**: когда один игрок отмечает задачу, другие видят это сразу. Без SSE пришлось бы обновлять страницу вручную.
> **Почему SSE, а не WebSocket**: SSE проще — это обычный HTTP, работает через Vercel, не нужен отдельный сервер. WebSocket нужен для двусторонней связи (чат), но у нас достаточно односторонней (сервер → клиент). Для MVP упрощённый вариант — `router.refresh()` раз в 10 секунд.

**API**: `src/app/api/sse/[roomId]/route.ts`
```typescript
export async function GET(req, { params }) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Подписаться на изменения (in-memory EventEmitter или Redis)
      // Отправлять события: "score_updated", "submission_verified", "day_ended"
      // keepalive каждые 30 сек
    }
  })
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" }
  })
}
```

**Клиент**: `useEffect` с `EventSource` → при событии инвалидировать TanStack Query.

**Для простоты MVP**: можно использовать `router.refresh()` раз в 10 секунд вместо SSE. SSE — опционально, если останется время.

**Проверка**: отметить задачу в одном окне → во втором окне обновилось без перезагрузки.

---

## Неделя 4: AI-верификация

### Шаг 4.1 — Настройка Uploadthing

> **Что делаем**: подключаем сервис для загрузки скриншотов пользователей.
> **Зачем**: скриншоты нужно где-то хранить, чтобы отправить их в Gemini Vision API. Uploadthing даёт прямую загрузку с клиента (быстро) + защиту (middleware с проверкой авторизации).
> **Почему Uploadthing, а не Vercel Blob напрямую**: Uploadthing — обёртка над Blob с готовыми React-компонентами и middleware. Меньше кода, быстрее разработка. Бесплатный тир: 2GB хранилища.

`src/app/api/uploadthing/core.ts`:
```typescript
import { createUploadthing } from "uploadthing/next"
const f = createUploadthing()
export const ourFileRouter = {
  proofImage: f({ image: { maxFileSize: "8MB" } })
    .middleware(async () => {
      const session = await auth()
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url }
    }),
}
```

**UI**: компонент загрузки (drag-and-drop или кнопка выбора файла).

**Проверка**: загрузить картинку → получить URL.

### Шаг 4.2 — Интеграция Gemini Vision

> **Что делаем**: пишем функцию, которая берёт URL скриншота и возвращает структурированный вердикт (JSON).
> **Зачем**: это ядро AI-фичи — без этой функции приложение ничем не отличается от обычного трекера привычек.
> **Почему Gemini 2.5 Flash, а не GPT-4o**: Gemini Flash — $0.075 за 1000 изображений, GPT-4o — ~$0.15. Для MVP, где важна стоимость, Gemini дешевле в 2 раза. Качество сравнимые для задачи парсинга скриншотов. Всегда можно переключиться на другую модель позже.

`src/lib/gemini.ts`:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function verifyTaskScreenshot(imageUrl: string, taskTitle: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  
  const prompt = `Ты — система автоматической проверки выполнения ежедневных задач.
Задача: "${taskTitle}"
Проанализируй скриншот и ответь СТРОГО в JSON:
{
  "verified": true/false,
  "confidence": 0.0-1.0,
  "extractedData": {},
  "reasoning": "краткое обоснование на русском"
}
Проверяй дату на скриншоте — она должна быть за сегодня или вчера.`

  const imageResp = await fetch(imageUrl).then(r => r.arrayBuffer())
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: Buffer.from(imageResp).toString("base64"), mimeType: "image/png" } }
  ])
  
  const text = result.response.text()
  // Извлечь JSON из ответа (может быть обёрнут в ```json ... ```)
  return JSON.parse(extractJson(text))
}
```

`src/lib/ai-prompts.ts` — вынести промпты в отдельный файл, кастомизировать под типы задач (сон, экранное время, фитнес).

**Проверка**: вручную вызвать `verifyTaskScreenshot` с тестовым скриншотом → получить JSON.

### Шаг 4.3 — API верификации

> **Что делаем**: эндпоинт, который соединяет загрузку скриншота, вызов Gemini и начисление очков.
> **Зачем**: клиенту нужен один вызов — отправил скриншот, получил результат + обновлённые очки.
> **Почему не на клиенте (прямой вызов Gemini из браузера)**: нельзя светить API-ключ на клиенте. Вся AI-логика должна быть на сервере. Плюс на сервере мы проверяем авторизацию и принадлежность к комнате.

**API**: `POST /api/tasks/[id]/verify`
```typescript
// 1. Получить taskId, imageUrl из тела
// 2. Проверить, что задача требует верификации
// 3. Вызвать verifyTaskScreenshot(imageUrl, task.title)
// 4. Создать TaskSubmission(status: VERIFIED/REJECTED, proofUrl, aiResponse)
// 5. Если verified → обновить DayScore(totalPoints += task.points)
// 6. Вернуть результат
```

**Проверка**: через Postman/curl отправить запрос → правильный статус + очки.

### Шаг 4.4 — UI верификации

> **Что делаем**: полный пользовательский путь: загрузка → ожидание → результат.
> **Зачем**: без UI пользователь не может воспользоваться AI-проверкой. Это главная фича приложения, интерфейс должен быть безупречным.
> **Почему 4 шага (загрузка → превью → лоадер → результат)**: пользователь должен понимать, что происходит на каждом этапе. Загрузка без превью — страшно (не знаешь, то ли отправил). Лоадер без прогресса — непонятно, сколько ждать. Результат без данных — непонятно, почему такое решение.

**Шаг 1 — Кнопка загрузки**: для задач с `requiresVerification: true` показывать кнопку «Загрузить подтверждение» вместо «Отметить выполнение».

**Шаг 2 — Модалка загрузки**:
- Drag-and-drop зона / кнопка выбора файла
- Превью загруженного скриншота
- Кнопка «Отправить на проверку»

**Шаг 3 — Лоадер**:
- Прогресс-бар «🤖 AI анализирует...»
- Блокировка других действий на время проверки

**Шаг 4 — Результат**:
- ✅ Подтверждено: +N очков, данные со скриншота, confidence
- ❌ Отклонено: причина из AI, возможность загрузить ещё раз

**Проверка**: загрузить реальный скриншот → AI возвращает результат → UI обновляется.

### Шаг 4.5 — Обработка ошибок AI

> **Что делаем**: предусматриваем все возможные сбои при AI-верификации.
> **Зачем**: AI — недетерминированная система. Gemini может не ответить, вернуть мусор, превысить лимит. Без обработки ошибок пользователь увидит «Something went wrong» и уйдёт.
> **Почему отдельный шаг**: обычно обработку ошибок оставляют на потом, но для AI-фичи это критично. Если AI-верификация — главная фича, она должна работать надёжно или хотя бы понятно сообщать о проблемах.

- Таймаут Gemini (>10 сек) → «AI не ответил, попробуйте позже»
- Невалидный JSON в ответе → «Ошибка анализа, отправьте другой скриншот»
- Пустой/битый скриншот → «Не удалось прочитать изображение»
- Превышение лимита API → graceful degradation (показать warning)

**Проверка**: отправить не-скриншот (случайную картинку) → AI возвращает `verified: false`.

---

## Неделя 5: Полировка + Профиль + Деплой

### Шаг 5.1 — Профиль пользователя

> **Что делаем**: страница профиля с базовой статистикой.
> **Зачем**: пользователь хочет видеть свой прогресс: сколько побед, сколько дней отыграно. Это мотивирует.
> **Почему минимум в MVP**: статистика считается через агрегатные запросы к БД — не храним отдельно. Для MVP этого достаточно. В фазе 2 можно добавить кеширование.

**Страница** `/profile`:
- Аватар (заглушка — инициалы)
- Никнейм (редактируемый inline)
- Статистика: побед, дней сыграно, комнат, очков
- Кнопка «Выйти»

**API**: `GET /api/profile`, `PATCH /api/profile`.

**Проверка**: зайти в профиль → статистика корректна.

### Шаг 5.2 — Обработка ошибок и валидация

> **Что делаем**: добавляем Error Boundary, Skeleton-загрузки, 404, toast-уведомления, валидацию всех форм.
> **Зачем**: без этого приложение выглядит сломанным при любой ошибке. Скелетоны делают загрузку быстрее психологически. Toasts дают обратную связь.
> **Почему Next.js error.tsx / loading.tsx**: встроенный механизм App Router. `error.tsx` в папке роута автоматически становится границей ошибки для этого роута и всех вложенных. `loading.tsx` показывается во время загрузки страницы. Минимум кода.

- `error.tsx` на каждый роут (Error Boundary)
- `loading.tsx` на каждый роут (Skeleton)
- `not-found.tsx` (404 страница)
- Toast-уведомления через shadcn/ui Sonner
- Валидация всех форм через zod

**Проверка**: открыть несуществующий роут → 404. Отключить БД → Error Boundary.

### Шаг 5.3 — Responsive дизайн

> **Что делаем**: проверяем, что все экраны работают на телефонах (375px ширина).
> **Зачем**: приложение позиционируется как mobile-first — большинство пользователей будут заходить с телефона.
> **Почему Tailwind mobile-first**: Tailwind по умолчанию генерирует стили для маленьких экранов, а `md:`, `lg:` добавляют для больших. Это совпадает с нашим приоритетом — сначала телефон, потом десктоп.

- Mobile-first: все экраны должны работать на ширине 375px
- Тестирование в Chrome DevTools (iPhone 14, Pixel 7)
- Плавные переходы между экранами
- Bottom Navigation фиксированная снизу

**Проверка**: открыть в DevTools mobile mode → всё влезает, ничего не обрезано.

### Шаг 5.4 — Базовая PWA

> **Что делаем**: добавляем возможность установить приложение на домашний экран телефона.
> **Зачем**: пользователь заходит каждый день — важно, чтобы иконка была на домашнем экране, как у нативного приложения. PWA решает это без разработки под iOS/Android.
> **Почему Serwist (next-pwa)**: специализированная библиотека для Next.js. Генерирует Service Worker, который кеширует статику — приложение открывается мгновенно даже при плохом интернете.

Установить `serwist`:
```bash
pnpm add @serwist/next @serwist/sw
```

`next.config.ts`:
```typescript
import withSerwist from "@serwist/next"
export default withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
})(nextConfig)
```

Добавить `manifest.json` в `src/app/`:
```json
{
  "name": "Focus Champ",
  "short_name": "FocusChamp",
  "start_url": "/dashboard",
  "display": "standalone",
  "theme_color": "#0B1020",
  "background_color": "#0B1020",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
}
```

**Проверка**: Lighthouse PWA audit → score > 80.

### Шаг 5.5 — Деплой на Vercel

> **Что делаем**: выкладываем приложение в интернет.
> **Зачем**: чтобы дать ссылку первым пользователям. Vercel — родная платформа для Next.js, деплой в одну команду.
> **Почему Vercel, а не VPS**: на VPS нужно настраивать nginx, SSL, CI/CD, мониторинг. Vercel делает это автоматически. Hobby-план бесплатный, хватает на MVP. Когда пользователей станет >1000, можно перейти на Pro ($20/мес) или свой сервер.

```bash
# Установить Vercel CLI
pnpm add -g vercel

# Деплой
vercel

# Переменные окружения (в Vercel Dashboard):
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GEMINI_API_KEY, UPLOADTHING_SECRET
```

**Проверка**: открыть деплой-URL → регистрация → комната → AI-верификация работает.

### Шаг 5.6 — End-to-end тестирование сценария

> **Что делаем**: проходим полный пользовательский путь двумя аккаунтами — имитируем реальное использование.
> **Зачем**: найти баги, которые не видны при тестировании отдельных компонентов. Например, гонка условий при одновременной отметке задач.
> **Почему два аккаунта, а не автотесты**: для MVP ручное тестирование быстрее, чем написание e2e-тестов. Автотесты добавим когда функционал устаканится (фаза 2).

Пройти полный сценарий двумя аккаунтами:
1. User1 регистрируется, создаёт комнату с 3 задачами (1 с AI)
2. User2 регистрируется, присоединяется по коду
3. User1 отмечает задачу без AI → очки обновляются у обоих
4. User2 загружает скриншот → AI проверяет → очки начислены
5. День завершается → объявлен победитель
6. Новый день начинается автоматически

---

## Сводная таблица статуса

| Неделя | Шаг | Задача | Суть | Статус |
|--------|-----|--------|------|--------|
| 1 | 1.1 | Инициализация Next.js | Создание скелета приложения | ✅ |
| 1 | 0 | Git + GitHub | Единый репозиторий на всё | ✅ |
| 1 | 1.2 | Зависимости | Установка всех библиотек сразу | ✅ |
| 1 | 1.3 | shadcn/ui | Готовые UI-компоненты | ✅ |
| 1 | 1.4 | Prisma + PostgreSQL | Подключение к базе данных | ✅ |
| 1 | 1.5 | Prisma-схема | 8 таблиц: User, Room, Task, ... | ✅ |
| 1 | 1.6 | NextAuth.js | Вход по логину/паролю | ✅ |
| 1 | 1.7 | Цветовая схема | Dark theme, CSS-переменные | ✅ |
| 1 | 1.8 | Структура роутов | Файлы страниц-заглушек | ✅ |
| 2 | 2.1 | Регистрация | API + форма с валидацией | ⬜ |
| 2 | 2.2 | Вход | Страница логина через NextAuth | ⬜ |
| 2 | 2.3 | Middleware | Защита роутов от неавторизованных | ⬜ |
| 2 | 2.4 | Dashboard | Список комнат + Empty State | ⬜ |
| 2 | 2.5 | Создание комнаты | Форма с задачами, генерация кода | ⬜ |
| 2 | 2.6 | Присоединение | Ввод кода → вход в комнату | ⬜ |
| 2 | 2.7 | Страница комнаты | Задачи, участники, день N | ⬜ |
| 3 | 3.1 | Отметка выполнения | Кнопка «Выполнил» + очки | ⬜ |
| 3 | 3.2 | Турнирная таблица | Сортировка + прогресс-бары | ⬜ |
| 3 | 3.3 | Cron: завершение дня | Авто-подведение итогов в 00:00 | ⬜ |
| 3 | 3.4 | UI победителя | Баннер с поздравлением | ⬜ |
| 3 | 3.5 | Real-time (SSE) | Обновление без перезагрузки | ⬜ |
| 4 | 4.1 | Uploadthing | Загрузка скриншотов | ⬜ |
| 4 | 4.2 | Gemini Vision | AI-анализ скриншотов | ⬜ |
| 4 | 4.3 | API верификации | Эндпоинт проверки | ⬜ |
| 4 | 4.4 | UI верификации | Модалка: загрузка → результат | ⬜ |
| 4 | 4.5 | Ошибки AI | Таймауты, мусор, лимиты | ⬜ |
| 5 | 5.1 | Профиль | Статистика, выход | ⬜ |
| 5 | 5.2 | Обработка ошибок | Error Boundary, Skeleton, 404 | ⬜ |
| 5 | 5.3 | Responsive | Mobile-first, 375px | ⬜ |
| 5 | 5.4 | PWA | Установка на телефон | ⬜ |
| 5 | 5.5 | Деплой на Vercel | Приложение в интернете | ⬜ |
| 5 | 5.6 | E2E тестирование | Полный сценарий двумя аккаунтами | ⬜ |

---

## Переменные окружения (`.env`)

```env
# База данных
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"   # или порт, на котором реально запущен dev (3001, 3002...)

# Google Gemini AI
GEMINI_API_KEY="..."

# Uploadthing
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."
```

---

## Полезные команды на каждый день

```bash
pnpm dev                        # Запуск dev-сервера
proxychains4 npx prisma studio  # Визуальный редактор БД
proxychains4 npx prisma db push    # Применить изменения схемы
proxychains4 npx prisma generate   # Перегенерировать Prisma Client
pnpm build                      # Production-сборка
pnpm lint                       # Проверка ESLint
```
