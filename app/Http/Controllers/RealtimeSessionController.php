<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class RealtimeSessionController extends Controller
{
    public function __invoke()
    {
        $response = Http::withToken(config('services.openai.key'))
            ->post('https://api.openai.com/v1/realtime/sessions', [
                'model' => 'gpt-realtime-1.5',
                'modalities' => ['text'],
                'instructions' => '',
                'input_audio_format' => 'pcm16',
                'input_audio_transcription' => [
                    'model' => 'gpt-4o-transcribe',
                    'language' => 'ar',
                ],
                'turn_detection' => [
                    'type' => 'server_vad',
                    'threshold' => 0.5,
                    'prefix_padding_ms' => 300,
                    'silence_duration_ms' => 600,
                    'create_response' => false,
                ],
            ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to create realtime session'], 500);
        }

        return response()->json([
            'client_secret' => $response->json('client_secret.value'),
        ]);
    }
}
