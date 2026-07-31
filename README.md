# Pomodoro PWA — Real-Time Sync

A production-grade Pomodoro Timer Progressive Web App with true real-time synchronization across all logged-in devices. The server is the single source of truth for active timer state; clients only render what the server broadcasts.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Real-Time Server:** Node.js + Express + Socket.IO (persistent WebSocket server)
- **Database:** MongoDB Atlas (users, preferences, templates, historical sessions)
- **Auth:** JWT tokens + Google OAuth 2.0

## Architecture Highlights

- Active timer state lives **in memory** on the Socket.IO server, not in MongoDB.
- Each user joins a dedicated `user:{userId}` Socket.IO room; every action is broadcast to all connected devices in milliseconds.
- Clients keep a local visual countdown but sync with the authoritative server every 10 seconds and on every action.
- PWA manifest + service worker provide offline caching, background sync hooks, and installability.

## Project Structure

```
pomodoro-pwa/
├── apps/
│   ├── web/          # Next.js 15 PWA
│   └── server/       # Socket.IO + Express authoritative server
├── packages/
│   └── shared/       # Shared types, constants, Zod schemas
├── docs/             # Architecture, schema, API, deployment
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- MongoDB (local via Docker or MongoDB Atlas)

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

```bash
cp .env.example apps/web/.env.local
cp .env.example apps/server/.env.local
```

Fill in `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` (optional for local email/password auth).

### 4. Start Development

```bash
pnpm dev
```

This builds the shared package, then starts both the Next.js frontend (port 3000) and the Socket.IO server (port 3001).

## Build & Test

```bash
pnpm build      # Build all apps and packages
pnpm test       # Run unit tests
pnpm typecheck  # Run TypeScript checks
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full Vercel + MongoDB Atlas + Socket.IO server deployment instructions.

## Key Features

- Real-time timer sync across devices
- Classic, Deep Work, and Flow State templates + custom templates
- Fullscreen focus mode with Wake Lock API
- Dashboard with daily/weekly/monthly analytics
- Session history with CSV export
- Dark/light mode, glassmorphism UI, keyboard shortcuts
- PWA installability and offline caching
- Email/password and Google OAuth authentication
