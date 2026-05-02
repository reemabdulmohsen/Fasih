import type { Analysis } from '@/types/fasih';

// Matches Arabic filler sounds: اممم، آه، إيه، مم، يعني، صح، طيب، وو
const FILLER_PATTERN = /(?<!\S)(يعني|آه+|إيه+|آ?م{2,}|صح|طيب|وو+)(?!\S)/g;

function detectFillers(transcript: string): { filler_count: number; filler_words: string[] } {
    const matches = [...transcript.matchAll(FILLER_PATTERN)].map(m => m[1]);
    const filler_words = [...new Set(matches)];
    return { filler_count: matches.length, filler_words };
}

export async function analyzeSpeech(
    transcript: string,
    long_pauses_count: number,
    topic: string,
): Promise<Analysis> {
    const { filler_count, filler_words } = detectFillers(transcript);

    const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ transcript, topic, long_pauses_count, filler_count, filler_words }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Analysis request failed');
    }

    const data = await res.json();

    const weighted_total =
        Math.round(
            (data.hujja.score * 0.4 +
                data.pronunciation.score * 0.25 +
                data.discourse.score * 0.2 +
                data.fluency.score * 0.15) *
                10,
        ) / 10;

    return { ...data, weighted_total } as Analysis;
}
