# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fasih (فصيح)** is an AI-powered Arabic speaking coach. Users practice speaking on random topics for a timed session, receive real-time transcription via GPT-4o Realtime, then see a feedback report with fluency/grammar/vocabulary scores, a diff of corrections, and follow-up questions.

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.2+) with Inertia.js
- **Frontend**: React 18 + TypeScript, bundled by Vite
- **Styling**: Tailwind CSS + CSS custom properties (design tokens in `resources/css/app.css`)
- **AI**: OpenAI GPT-4o Realtime API (WebSocket) for live transcription; Whisper-1 fallback via `/api/transcribe`

## Commands

### Development
```bash
# Start all services concurrently (server, queue, logs, vite)
composer dev

# Or start individually
php artisan serve
npm run dev
```

### Build
```bash
npm run build       # TypeScript check + Vite production build
composer install
```

### Testing
```bash
php artisan test                        # Run all PHPUnit tests
php artisan test --filter TestName      # Run a single test
./vendor/bin/phpunit tests/Unit/ExampleTest.php  # Run specific file
```

### Linting / Formatting
```bash
./vendor/bin/pint          # Laravel Pint (PHP formatter)
```

## Architecture

### Request Flow

1. Browser loads a Laravel blade shell → Inertia bootstraps React via `resources/js/app.tsx`
2. Page components live in `resources/js/Pages/` and are resolved by name from Inertia routes in `routes/web.php`
3. API calls go to `routes/api.php` → Laravel controllers → OpenAI

### Key Pages

| Page | Route | Purpose |
|------|-------|---------|
| `Welcome.tsx` | `/` | Landing |
| `Home.tsx` | `/home` | Topic selection |
| `Record.tsx` | `/record` | Timed recording session |
| `Report.tsx` | `/report` | Feedback and scores |

### Recording Pipeline (`Record.tsx`)

1. Calls `POST /api/realtime-session` → `RealtimeSessionController` creates an OpenAI ephemeral token
2. Browser opens a WebSocket directly to `wss://api.openai.com/v1/realtime` using the ephemeral `client_secret` as a subprotocol (avoids exposing the main API key)
3. An `AudioWorklet` (`pcm-processor`) captures microphone audio, converts Float32 to Int16 PCM, and streams base64-encoded chunks via `input_audio_buffer.append` messages
4. Transcription deltas (`conversation.item.input_audio_transcription.delta`) accumulate per `item_id` in a `Map` and render live
5. On finish, `input_audio_buffer.commit` is sent; the WS stays open 3 s to receive the final transcription event
6. If mic is unavailable, the page falls back to a manual textarea

### Backend Controllers

- `RealtimeSessionController` — single-action, creates an OpenAI Realtime session and returns the ephemeral `client_secret`
- `TranscribeController` — single-action, accepts an audio file upload, calls Whisper-1, returns transcript text

### Frontend Structure

```
resources/js/
  app.tsx              # Inertia bootstrap
  Pages/               # Route-level components
  Components/          # Shared UI (TopBar, Ring, Stepper, FeedbackCard, DiffRender, ScoreRing)
  Layouts/             # Layout wrappers
  data/                # Static data: topics.ts, mockFeedback.ts
  types/fasih.ts       # Shared TypeScript interfaces (Topic, Feedback, DiffSegment, etc.)
```

### Design Tokens

All colours, fonts, and easing are CSS variables defined in `resources/css/app.css`:
- `--accent` (#f0b64a) — primary gold
- `--err` / `--fix` — error red / correction green
- `--f-ar` — Arabic font stack (Readex Pro, Tajawal)
- `--f-mono` — IBM Plex Mono

Use CSS variables for all styling; avoid hardcoding colour values.

## Environment

Requires `OPENAI_API_KEY` in `.env`, exposed to Laravel via `config/services.php`:
```php
'openai' => ['key' => env('OPENAI_API_KEY')]
```

The frontend path alias `@` maps to `resources/js/`.
