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

        // Forward the real container type — Safari uploads MP4/AAC, Chrome WebM;
        // a mislabelled file makes Munsit return an empty transcription.
        $response = Http::withHeaders(['x-api-key' => config('services.munsit.key')])
            ->attach('file', file_get_contents($file->path()), $file->getClientOriginalName(), ['Content-Type' => $file->getClientMimeType()])
            ->post('https://api.munsit.com/api/v1/audio/transcribe', [
                'model' => 'munsit',
            ]);

        if ($response->failed()) {
            \Log::error('Munsit transcription failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json(['error' => 'Transcription failed'], 500);
        }

        return response()->json(['transcript' => $response->json('transcription')]);
    }
}
