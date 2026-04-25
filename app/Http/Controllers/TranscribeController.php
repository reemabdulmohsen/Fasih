<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TranscribeController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate([
            'audio' => 'required|file|max:25600',
        ]);

        $file = $request->file('audio');

        $response = Http::withToken(config('services.openai.key'))
            ->attach('file', file_get_contents($file->path()), 'audio.webm', ['Content-Type' => 'audio/webm'])
            ->post('https://api.openai.com/v1/audio/transcriptions', [
                'model'    => 'whisper-1',
                'language' => 'ar',
            ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Transcription failed'], 500);
        }

        return response()->json(['transcript' => $response->json('text')]);
    }
}
