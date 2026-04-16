# NoteAI — Smart Note Taking App

> A full-stack AI-powered note taking app built with Next.js 14, TypeScript, PostgreSQL, and Hugging Face. Create, organize, and enhance your notes with AI-generated summaries, grammar improvements, and smart tag suggestions.

![NoteAI Banner](assets/images/profile.png)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge)](https://your-live-demo-url.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Live Demo](#live-demo)

---

## Overview

NoteAI is a production-ready note taking application that integrates AI directly into your writing workflow. Users can write notes, then use one-click AI tools to generate a summary, clean up grammar and clarity, or auto-generate relevant tags — all without leaving the editor.

The app is built on the **Next.js App Router** with a fully typed TypeScript codebase, **Better Auth** for session-based authentication, **Drizzle ORM** with a **Neon PostgreSQL** database, and **Hugging Face's Inference API** for all AI features.

---

## Features

### Notes
- Create, edit, and delete notes
- Pin important notes to the top
- Search notes by title in real time
- Auto-save draft on title blur (for new notes)
- Responsive editor with auto-resizing textarea

### AI (Powered by Hugging Face)
- **AI Summary** — generates a 2–3 sentence summary of your note
- **AI Improve** — rewrites your note for clarity, grammar, and flow
- **AI Tags** — auto-generates 3–6 relevant lowercase tags

### Auth
- Email and password signup / login
- Session-based authentication via Better Auth
- Protected routes with automatic redirect

### UI / UX
- Light and dark mode (system default + toggle)
- Skeleton loading states
- Toast notifications for all actions
- Fully responsive layout (sidebar + main + AI panel)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS + shadcn/ui + Radix UI |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| API Layer | Hono (type-safe HTTP framework) |
| AI | Hugging Face Inference API |
| Validation | Zod |
| Forms | React Hook Form |
| Fonts | Geist Sans + Geist Mono |
| Toasts | Sonner |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser (Client)                 │
│   React components, hooks, client-side state         │
│   Tailwind CSS + shadcn/ui + dark/light mode         │
└────────────────────┬────────────────────────────────┘
                     │  fetch()
┌────────────────────▼────────────────────────────────┐
│              Next.js App Router (Server)             │
│                                                      │
│  /api/[[...route]]  →  Hono router                  │
│   ├── /api/auth/**  →  Better Auth handler           │
│   ├── /api/notes    →  CRUD (Drizzle + Neon)        │
│   └── /api/ai/**    →  Hugging Face Inference API   │
└──────────────┬────────────────────┬─────────────────┘
               │                    │
┌──────────────▼──────┐  ┌──────────▼──────────────┐
│  Neon PostgreSQL     │  │  Hugging Face Router     │
│  (Serverless DB)     │  │  Llama-3.1-8B-Instruct  │
│  Drizzle ORM         │  │  via Cerebras (free)     │
└─────────────────────┘  └──────────────────────────┘
```

**Frontend** — All pages are client components (`"use client"`) that call the API with `fetch`. State is managed with `React.useState` and `React.useEffect`. No external state library is used.

**Backend** — A single catch-all API route (`/api/[[...route]]`) uses Hono to handle all requests. Better Auth is mounted under `/api/auth/**`. All routes require a valid session.

**Database** — Drizzle ORM with Neon's serverless PostgreSQL driver. Schema is defined in `src/lib/db/schema.ts` and migrations are run with `drizzle-kit push`.

**AI** — Three API endpoints (`/api/ai/summarize`, `/api/ai/improve`, `/api/ai/tags`) call the Hugging Face Inference Router with an OpenAI-compatible `messages` format. No AI SDK is used — plain `fetch`.

---

## Screenshots

> Replace these placeholders with actual screenshots once deployed.

| Dashboard | Note Editor | AI Panel |
|---|---|---|
| ![Dashboard](assets/images/dashboard.png) | ![Editor](assets/images/noteeditor.png) | ![AI Panel](assets/images/aipanel.png) |

| Login | Profile | Dark Mode |
|---|---|---|
| ![Login](assets/images/login.png) | ![Profile](assets/images/profile.png) | ![Dark](assets/images/darkmode.png) |

---

## Folder Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── api/
│   │   └── [[...route]]/
│   │       └── route.ts        # Hono API router (notes + AI + auth)
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── register/page.tsx   # Register page
│   ├── dashboard/page.tsx      # Notes dashboard
│   ├── notes/
│   │   ├── [id]/page.tsx       # Edit existing note
│   │   └── new/page.tsx        # Create new note
│   ├── profile/page.tsx        # User profile + stats
│   ├── globals.css             # Global styles + Tailwind directives
│   └── layout.tsx              # Root layout (theme + fonts)
│
├── components/
│   ├── ai/
│   │   ├── AIButton.tsx        # Individual AI action button
│   │   └── AIPanel.tsx         # Sidebar AI panel (summarize/improve/tags)
│   ├── layout/
│   │   ├── Sidebar.tsx         # App sidebar with navigation
│   │   ├── ThemeProvider.tsx   # next-themes wrapper
│   │   └── ThemeToggle.tsx     # Light/dark toggle button
│   ├── notes/
│   │   ├── NoteCard.tsx        # Note card for dashboard grid
│   │   ├── NoteEditor.tsx      # Title + content editor inputs
│   │   ├── NotesSkeleton.tsx   # Loading skeleton for notes
│   │   └── SearchBar.tsx       # Real-time search input
│   └── ui/                     # shadcn/ui components (button, card, etc.)
│
├── lib/
│   ├── ai/
│   │   └── index.ts            # Hugging Face AI functions
│   ├── auth/
│   │   ├── client.ts           # Better Auth client (useSession)
│   │   └── index.ts            # Better Auth server config
│   ├── db/
│   │   ├── index.ts            # Drizzle DB instance (Neon)
│   │   └── schema.ts           # Database schema (users, notes, sessions)
│   └── utils.ts                # Shared utilities (cn, formatDate, etc.)
│
└── types/
    └── index.ts                # Shared TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A [Neon](https://neon.tech) account (free)
- A [Hugging Face](https://huggingface.co) account (free)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-notes-app.git
cd ai-notes-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```bash
cp .env.example .env.local
```

Fill in the values — see [Environment Variables](#environment-variables) below.

### 4. Set up the database

Push the Drizzle schema to your Neon database:

```bash
npx drizzle-kit push
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build
npm run start
```

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# PostgreSQL connection string from Neon dashboard
# Get it at: neon.tech → your project → Connection String (pooled)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Random secret used to sign auth session tokens
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BETTER_AUTH_SECRET=your_64_character_hex_secret_here

# Your app's base URL
# Use http://localhost:3000 for development
# Change to your Vercel URL after deployment
BETTER_AUTH_URL=http://localhost:3000

# Hugging Face API token
# Get it at: huggingface.co → Settings → Access Tokens → New token (read)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxx

# Public app URL (accessible in the browser)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Where to get each value

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) → New Project → Connection String |
| `BETTER_AUTH_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `BETTER_AUTH_URL` | `http://localhost:3000` for dev, your Vercel URL for production |
| `HUGGINGFACE_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` |

---

## Database Setup

The schema is defined with Drizzle ORM in `src/lib/db/schema.ts`. It includes four tables: `users`, `sessions`, `accounts`, `verifications` (managed by Better Auth) and `notes` (the app's main table).

To create all tables in your Neon database, run:

```bash
npx drizzle-kit push
```

To inspect your database visually:

```bash
npx drizzle-kit studio
```

---

## Live Demo

**[View Live App →](https://ai-notes-taking-app-zeta.vercel.app/auth/login)**

> Replace this link with your actual Vercel deployment URL.

To deploy your own copy:

1. Push the repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)
