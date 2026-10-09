# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fasih (فصيح)** is an AI-powered Arabic speaking coach. Users practice speaking on random topics for a timed session, receive real-time transcription via Munsit STT, then see a feedback report with fluency/grammar/vocabulary scores, a diff of corrections, and follow-up questions.

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.2+) with Inertia.js
- **Frontend**: React 18 + TypeScript, bundled by Vite
- **Styling**: Tailwind CSS + CSS custom properties (design tokens in `resources/css/app.css`)
- **AI**: Munsit STT (REST for the final transcript, WebSocket for live on-screen text); OpenAI `gpt-4o` for the feedback analysis via `/api/analyze`

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

Two independent audio paths run off the same `MediaStream`:

1. **REST (authoritative)** — `MediaRecorder` records the full session (`audio/webm` on Chrome/Firefox, `audio/mp4` → `.m4a` on Safari; the container label must match the bytes or Munsit returns an empty transcription). On finish the blob is POSTed to `/api/transcribe`, and the returned transcript feeds `/api/analyze`.
2. **Live streaming (display-only, best-effort)** — an `AudioWorklet` (`pcm-processor`) converts mic audio to Int16 PCM @16 kHz; ~1 s batches (first chunk prefixed with WAV headers) are sent as `{event: "audio_chunk", data: {audioBuffer: [...]}}` over `wss://api.munsit.com/api/v1/websocket/speech-to-text`. Incoming `{event: "transcription"}` events carry the cumulative transcript and render live. Any WS failure degrades silently — the REST path is unaffected. This worklet also does RMS-based long-pause detection for the analysis metadata.

If mic is unavailable, the page falls back to a manual textarea.

### Backend Controllers

- `RealtimeSessionController` — single-action, returns the Munsit API key for the browser's live-streaming WebSocket (Munsit has no ephemeral tokens)
- `TranscribeController` — single-action, accepts an audio file upload, forwards it to Munsit's REST transcriber, returns transcript text
- `AnalyzeController` — single-action, sends the transcript to OpenAI `gpt-4o` and returns the structured feedback report

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
- `--accent` (#1859FF light / #4A7AFF dark) — primary blue
- `--err` / `--fix` — error red / correction green
- `--f-ar` — Arabic UI: Thmanyah Sans (falls back to IBM Plex Sans Arabic)
- `--f-display` — headlines and the فصيح wordmark: Thmanyah Serif Display
- `--f-serif` — reading text (transcripts, feedback): Thmanyah Serif Text
- `--f-mono` — IBM Plex Mono for timers, ids and eyebrows

Thmanyah font files are NOT committed (the license forbids redistribution). Download them from https://font.thmanyah.com and put the woff2 files in `public/fonts/thmanyah/` (gitignored).

Arabic type rules: never letter-space Arabic; `.ar-flow` (flowing letters) on display headlines only; `.ar-mark` highlights one key word per headline; kashida at most once, on the last word of a display line.

Use CSS variables for all styling; avoid hardcoding colour values.

## Environment

Requires `OPENAI_API_KEY` (analysis) and `MUNSIT_API_KEY` (transcription) in `.env`, exposed to Laravel via `config/services.php`:
```php
'openai' => ['key' => env('OPENAI_API_KEY')],
'munsit' => ['key' => env('MUNSIT_API_KEY')],
```

The frontend path alias `@` maps to `resources/js/`.
