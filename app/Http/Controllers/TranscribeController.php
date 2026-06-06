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

        $response = Http::withHeaders(['x-api-key' => config('services.munsit.key')])
            ->attach('file', file_get_contents($file->path()), 'recording.webm', ['Content-Type' => 'audio/webm'])
            ->post('https://api.munsit.com/api/v1/audio/transcribe', [
                'model' => 'munsit',
            ]);

        if ($response->failed()) {
            \Log::error('Munsit transcription failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return response()->json(['error' => 'Transcription failed'], 500);
        }

        \Log::info('Munsit transcription response', ['body' => $response->body()]);

        return response()->json(['transcript' => $response->json('transcription')]);
    }
}
