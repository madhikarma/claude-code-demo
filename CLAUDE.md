# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Install deps, generate Prisma client, run migrations (first-time setup)
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests with Vitest
npm run db:reset     # Reset database
```

Run a single test file:
```bash
npx vitest run src/lib/transform/__tests__/jsx-transformer.test.ts
```

## Architecture Overview

UIGen is a Next.js 15 (App Router) AI-powered React component generator. Users describe components in a chat interface, Claude generates code using AI tools, and results render live in a sandboxed iframe.

### Core Data Flow

```
User chat input
  → /api/chat (Vercel AI SDK streamText + Claude)
  → AI tools (str_replace_editor, file_manager) modify VirtualFileSystem
  → FileSystemContext broadcasts updates
  → PreviewFrame: jsx-transformer converts JSX → HTML + import map → iframe.srcdoc
```

### Key Modules

- **`src/app/api/chat/route.ts`** — Streaming chat endpoint. Calls `getLanguageModel()` from `lib/provider.ts` (returns Claude or MockLanguageModel when no API key), passes AI tools defined in `lib/tools/`.

- **`src/lib/file-system.ts`** — In-memory virtual file system (Map-based). Used by AI tools to read/write files. Serialized as JSON to the DB `projects.data` column.

- **`src/lib/transform/jsx-transformer.ts`** — Compiles JSX to browser-runnable HTML using Babel standalone + import maps. This is what powers the live preview.

- **`src/lib/contexts/`** — Two React contexts:
  - `chat-context.tsx` — Wraps Vercel AI SDK's `useChat`, manages messages and tool call responses
  - `file-system-context.tsx` — Holds the VirtualFileSystem instance, propagates file changes

- **`src/lib/tools/`** — AI tool definitions:
  - `str-replace.ts` — String-replace-based code editing (Claude's preferred editing strategy)
  - `file-manager.ts` — File create/delete operations

- **`src/lib/prompts/generation.tsx`** — System prompt sent to Claude on every chat request.

- **`src/actions/`** — Next.js Server Actions for auth (`index.ts`) and project CRUD.

- **`src/middleware.ts`** — Protects API routes; auth is JWT-based (HTTP-only cookies) via `lib/auth.ts`.

### UI Layout

Three-panel resizable layout (`react-resizable-panels`):
- **Left**: `ChatInterface` (messages + input)
- **Right tab 1**: `PreviewFrame` (iframe sandbox)
- **Right tab 2**: `FileTree` + `CodeEditor` (Monaco editor)

### Database

Prisma + SQLite. Two models:
- `User` — email/password (bcrypt)
- `Project` — `messages` (JSON stringified chat history), `data` (JSON serialized VirtualFileSystem), optional `userId` (null = anonymous)

### Path Alias

`@/*` maps to `src/*`.

## Code Style

Use comments sparingly. Only comment complex or non-obvious code.
