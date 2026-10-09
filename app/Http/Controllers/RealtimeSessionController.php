<?php

namespace App\Http\Controllers;

class RealtimeSessionController extends Controller
{
    public function __invoke()
    {
        $key = config('services.munsit.key');

        if (! $key) {
            return response()->json(['error' => 'Munsit API key not configured'], 500);
        }

        // ponytail: raw key to browser — Munsit has no ephemeral tokens; add a WS proxy if this ever goes public
        return response()->json(['token' => $key]);
    }
}
