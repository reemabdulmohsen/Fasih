# Fasih (فصيح)

An AI-powered Arabic speaking coach. Practice speaking on random topics for a timed session, receive real-time transcription, and get instant feedback on fluency, grammar, and vocabulary.

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.2+) with Inertia.js
- **Frontend**: React 18 + TypeScript, bundled by Vite
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o Realtime API (WebSocket) for live transcription; Whisper-1 fallback

## Requirements

- PHP 8.2+
- Node.js
- Composer
- An `OPENAI_API_KEY` in your `.env` file

## Setup

```bash
composer install
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env
php artisan key:generate
```

## Development

```bash
composer dev   # starts server, queue, logs, and vite concurrently
```

Or individually:

```bash
php artisan serve
npm run dev
```

## Build

```bash
npm run build
```

## Testing

```bash
php artisan test
```

## How It Works

1. User selects a topic and starts a timed speaking session
2. The browser opens a WebSocket to the OpenAI Realtime API using an ephemeral token from the backend
3. Audio is captured via an AudioWorklet, converted to PCM, and streamed in real time
4. Transcription appears live on screen
5. On completion, the user receives a feedback report with fluency, grammar, and vocabulary scores, a diff of corrections, and follow-up questions
