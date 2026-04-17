# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (backend), Appwrite (mobile cloud DB)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### CineID Mobile App (`artifacts/movie-finder`)
- React Native / Expo SDK 54 mobile app
- "Shazam for Movies" — identifies movies from TikTok links via AI
- **Auth**: Google OAuth via expo-web-browser (credentials needed)
- **Database**: Appwrite for cloud history sync (credentials needed)
- **AI**: GPT-4o via backend proxy (API key stored server-side as env var)
- **Flow**: User copies TikTok link → app detects it → sends to backend → backend calls OpenAI → movie card shown

### API Server (`artifacts/api-server`)
- Express 5 backend
- `/api/identify` — proxies movie identification to OpenAI (requires `OPENAI_API_KEY` env var)
- `/api/healthz` — health check

## Environment Variables Needed
- `OPENAI_API_KEY` — on backend server, for movie identification
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google OAuth web client ID
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — Google OAuth iOS client ID (optional)
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` — Google OAuth Android client ID (optional)
- `EXPO_PUBLIC_APPWRITE_ENDPOINT` — Appwrite endpoint (default: cloud.appwrite.io/v1)
- `EXPO_PUBLIC_APPWRITE_PROJECT_ID` — Appwrite project ID
- `EXPO_PUBLIC_APPWRITE_DATABASE_ID` — Appwrite database ID
- `EXPO_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID` — Appwrite collection for history

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
