import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { TOPICS } from '@/data/topics';
import { analyzeSpeech } from '@/lib/analyzeSpeech';
import type { Topic } from '@/types/fasih';

const SESSION_ID = 'A3B9F2';
const DURATION   = 120;
const BARS       = 40;

const HINTS = [
    { ar: 'اِربط بمثال شخصي',           en: 'Add a personal example' },
    { ar: 'استخدم «لأنّ» لتعليل رأيك',  en: 'Use «because» to justify' },
    { ar: 'اختم بفكرة جامعة',            en: 'Wrap with a closing thought' },
];

// Design tokens — lime-accent dark theme
const T = {
    bg:        'oklch(14% 0.012 280)',
    surface:   'oklch(20% 0.012 280)',
    surface2:  'oklch(24% 0.012 280)',
    line:      'oklch(28% 0.012 280)',
    line2:     'oklch(34% 0.012 280)',
    ink:       'oklch(97% 0.005 90)',
    ink2:      'oklch(78% 0.01 90)',
    ink3:      'oklch(58% 0.01 90)',
    accent:    'oklch(92% 0.22 125)',
    accentInk: 'oklch(14% 0.01 280)',
    ok:        'oklch(80% 0.18 150)',
    warn:      'oklch(80% 0.16 70)',
    danger:    'oklch(70% 0.2 25)',
} as const;

type MicState    = 'checking' | 'available' | 'unavailable';
type StudioState = 'idle' | 'connecting' | 'recording' | 'paused' | 'finished' | 'analyzing';

function loadTopic(): Topic {
    try {
        const raw = sessionStorage.getItem('fasih_topic');
        if (raw) return JSON.parse(raw) as Topic;
    } catch { /* ignore */ }
    return TOPICS[0];
}

// Runs inside an AudioWorklet — converts Float32 mic samples to Int16 PCM
const PCM_PROCESSOR = `
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel) {
      const int16 = new Int16Array(channel.length);
      for (let i = 0; i < channel.length; i++) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        int16[i] = s < 0 ? s * 32768 : s * 32767;
      }
      this.port.postMessage({ pcm: int16.buffer }, [int16.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

function toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VoiceOrb({ state, level, size = 240 }: { state: StudioState; level: number; size?: number }) {
    const contSize   = size + 40;
    const scale      = state === 'recording' ? 1 + level * 0.18 : 1;
    const isRec      = state === 'recording';
    const isPaused   = state === 'paused';
    const isDone     = state === 'finished' || state === 'analyzing';

    return (
        <div style={{
            position: 'absolute', inset: '50% auto auto 50%',
            transform: 'translate(-50%, -50%)',
            width: contSize, height: contSize, pointerEvents: 'none',
        }}>
            {/* Pulse rings — only while recording */}
            <div style={{ position: 'absolute', inset: 0 }}>
                {isRec && [0, 1, 2].map(i => (
                    <span key={i} style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        border: `1.5px solid ${T.accent}99`,
                        animation: 'pulseRing 1.8s ease-out infinite',
                        animationDelay: `${i * 0.6}s`,
                        opacity: 0,
                    }} />
                ))}
            </div>

            {/* Orb body */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: size, height: size,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transition: 'transform 0.12s ease-out',
            }}>
                {/* Blob */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 30%, ${T.accent}f0, ${T.accent} 55%, oklch(70% 0.20 125))`,
                    animation: isPaused ? 'none' : 'blob 7s ease-in-out infinite',
                    filter: isPaused ? 'saturate(0.4) brightness(0.85)' : 'none',
                    boxShadow: [
                        `0 30px 80px -20px ${T.accent}99`,
                        `inset 0 -20px 40px oklch(70% 0.20 125 / 0.50)`,
                        `inset 0 20px 40px oklch(100% 0 0 / 0.30)`,
                    ].join(', '),
                }} />
                {/* Ambient glow */}
                <div style={{
                    position: 'absolute', inset: -Math.round(size / 8), borderRadius: '50%',
                    background: `radial-gradient(closest-side, ${T.accent}4d, transparent 70%)`,
                    filter: 'blur(20px)', zIndex: -1,
                    opacity: state === 'idle' ? 0.4 : 0.8,
                }} />
                {/* Core icon */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'grid', placeItems: 'center',
                    color: T.accentInk,
                }}>
                    {isDone ? (
                        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    ) : isPaused ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ width: 10, height: 36, background: 'currentColor', borderRadius: 4 }} />
                            <span style={{ width: 10, height: 36, background: 'currentColor', borderRadius: 4 }} />
                        </div>
                    ) : (
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="3" width="6" height="12" rx="3" fill={isRec ? 'currentColor' : 'none'} />
                            <path d="M5 11a7 7 0 0 0 14 0" />
                            <path d="M12 18v3" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProgressRing({ progress, size = 420 }: { progress: number; size?: number }) {
    const stroke = 2;
    const r = size / 2 - stroke;
    const c = 2 * Math.PI * r;
    return (
        <svg
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            width={size} height={size}
        >
            <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                stroke={T.accent} strokeWidth={stroke} fill="none"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - progress)}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
        </svg>
    );
}

function Waveform({ active, levels }: { active: boolean; levels: number[] }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, height: 56, padding: '0 24px',
            opacity: active ? 1 : 0.45,
            transition: 'opacity 0.3s',
        }}>
            {levels.map((v, i) => (
                <span key={i} style={{
                    flex: 1, maxWidth: 8, display: 'block',
                    height: active
                        ? `${Math.max(4, v * 52)}px`
                        : `${8 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 14}px`,
                    background: active
                        ? `linear-gradient(180deg, ${T.accent}, ${T.accent}99)`
                        : T.line2,
                    borderRadius: 4,
                    transition: active ? 'height 0.08s linear' : 'height 0.4s',
                }} />
            ))}
        </div>
    );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
    return (
        <div style={{
            background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: 16, padding: '12px 16px', minWidth: 96,
        }}>
            <div style={{
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em',
                color: T.ink, lineHeight: 1,
            }}>
                {value}
            </div>
            <div style={{ fontSize: 11, color: T.ink3, marginTop: 6, letterSpacing: '0.04em' }}>
                {label}
            </div>
        </div>
    );
}

function HintCard({ hint }: { hint: { ar: string; en: string } }) {
    return (
        <div style={{
            background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: 16, padding: '14px 16px', width: 200,
            animation: 'hintIn 0.5s ease',
        }}>
            <div style={{
                fontSize: 10, color: T.accent, letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontWeight: 700,
            }}>
                اقتراح
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>
                {hint.ar}
            </div>
            <div style={{
                fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                fontSize: 11, color: T.ink3, marginTop: 4,
                direction: 'ltr', textAlign: 'left' as const,
            }}>
                {hint.en}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Record() {
    const topic = loadTopic();

    const [timeLeft, setTimeLeft]         = useState(DURATION);
    const [running, setRunning]           = useState(false);
    const [transcript, setTranscript]     = useState('');
    const [micState, setMicState]         = useState<MicState>('checking');
    const [typedValue, setTypedValue]     = useState('');
    const [levels, setLevels]             = useState(() => Array<number>(BARS).fill(0));
    const [finished, setFinished]         = useState(false);
    const [connecting, setConnecting]     = useState(false);
    const [analyzing, setAnalyzing]       = useState(false);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);
    const [hintIdx, setHintIdx]           = useState(0);
    const [vw, setVw]                     = useState(1280);

    const streamRef        = useRef<MediaStream | null>(null);
    const wsRef            = useRef<WebSocket | null>(null);
    const audioContextRef  = useRef<AudioContext | null>(null);
    const workletNodeRef   = useRef<AudioWorkletNode | null>(null);
    const sourceNodeRef    = useRef<MediaStreamAudioSourceNode | null>(null);
    const tickRef          = useRef<ReturnType<typeof setInterval> | null>(null);
    const levelRef         = useRef<ReturnType<typeof setInterval> | null>(null);
    const pausedRef        = useRef(false);
    const transcriptMapRef = useRef<Map<string, string>>(new Map());
    const typedValueRef    = useRef('');
    const silenceStartRef  = useRef<number | null>(null);
    const longPausesRef    = useRef(0);

    // ── Viewport width ─────────────────────────────────────────────
    useEffect(() => {
        const update = () => setVw(window.innerWidth);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // ── Mic permission ─────────────────────────────────────────────
    useEffect(() => {
        navigator.mediaDevices?.getUserMedia({ audio: true })
            .then(stream => { streamRef.current = stream; setMicState('available'); })
            .catch(() => setMicState('unavailable'));
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            wsRef.current?.close();
            audioContextRef.current?.close();
        };
    }, []);

    // ── Countdown ──────────────────────────────────────────────────
    useEffect(() => {
        if (!running) return;
        tickRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(tickRef.current!);
                    setRunning(false);
                    setFinished(true);
                    commitAndDisconnect();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(tickRef.current!);
    }, [running]);

    // ── Analyze then navigate ───────────────────────────────────────
    useEffect(() => {
        if (!finished) return;
        let cancelled = false;
        const run = async () => {
            await new Promise(r => setTimeout(r, 3000));
            if (cancelled) return;
            setAnalyzing(true);
            const text = micState === 'unavailable'
                ? typedValueRef.current
                : buildTranscript();
            if (!text.trim()) {
                if (!cancelled) {
                    setAnalyzing(false);
                    setAnalyzeError('لم يُسجَّل أي نصّ. تأكّد من أن الميكروفون يعمل وحاول من جديد.');
                }
                return;
            }
            try {
                const analysis = await analyzeSpeech(text, longPausesRef.current, topic.ar);
                if (!cancelled) {
                    sessionStorage.setItem('fasih_analysis', JSON.stringify(analysis));
                    router.visit('/report');
                }
            } catch (e) {
                console.error('Analysis failed:', e);
                if (!cancelled) {
                    setAnalyzing(false);
                    setAnalyzeError('فشل التحليل. تحقّق من الاتصال بالإنترنت أو مفتاح API وحاول مجدّداً.');
                }
            }
        };
        run();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished]);

    // ── Waveform sim ────────────────────────────────────────────────
    useEffect(() => {
        if (!running) { setLevels(Array<number>(BARS).fill(0)); return; }
        levelRef.current = setInterval(() => {
            setLevels(() => Array.from({ length: BARS }, () => Math.random()));
        }, 80);
        return () => clearInterval(levelRef.current!);
    }, [running]);

    // ── Hint rotation ───────────────────────────────────────────────
    useEffect(() => {
        const t = setInterval(() => setHintIdx(i => (i + 1) % HINTS.length), 4500);
        return () => clearInterval(t);
    }, []);

    // ── Realtime helpers ───────────────────────────────────────────
    const buildTranscript = () =>
        Array.from(transcriptMapRef.current.values()).filter(Boolean).join(' ');

    const handleEvent = (ev: Record<string, any>) => {
        if (ev.type === 'conversation.item.input_audio_transcription.delta') {
            transcriptMapRef.current.set(
                ev.item_id,
                (transcriptMapRef.current.get(ev.item_id) ?? '') + (ev.delta ?? ''),
            );
            setTranscript(buildTranscript());
        } else if (ev.type === 'conversation.item.input_audio_transcription.completed') {
            transcriptMapRef.current.set(ev.item_id, ev.transcript ?? '');
            setTranscript(buildTranscript());
        } else if (ev.type === 'error') {
            console.error('[Realtime]', ev.error);
        }
    };

    const setupAudio = async () => {
        if (!streamRef.current) return;
        const ctx = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = ctx;
        const blobUrl = URL.createObjectURL(new Blob([PCM_PROCESSOR], { type: 'application/javascript' }));
        await ctx.audioWorklet.addModule(blobUrl);
        URL.revokeObjectURL(blobUrl);
        const source = ctx.createMediaStreamSource(streamRef.current);
        const worklet = new AudioWorkletNode(ctx, 'pcm-processor');
        sourceNodeRef.current = source;
        workletNodeRef.current = worklet;
        worklet.port.onmessage = (e: MessageEvent) => {
            if (pausedRef.current) return;
            const ws = wsRef.current;
            if (ws?.readyState !== WebSocket.OPEN) return;
            ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: toBase64(e.data.pcm) }));
            const samples = new Int16Array(e.data.pcm);
            let sumSq = 0;
            for (let i = 0; i < samples.length; i++) sumSq += samples[i] * samples[i];
            const rms = Math.sqrt(sumSq / samples.length);
            const now = Date.now();
            if (rms < 800) {
                if (silenceStartRef.current === null) silenceStartRef.current = now;
                else if (now - silenceStartRef.current >= 1500) {
                    longPausesRef.current += 1;
                    silenceStartRef.current = null;
                }
            } else {
                silenceStartRef.current = null;
            }
        };
        source.connect(worklet);
        worklet.connect(ctx.destination);
    };

    const connectRealtime = async () => {
        setConnecting(true);
        try {
            const res = await fetch('/api/realtime-session', { method: 'POST' });
            if (!res.ok) throw new Error('session error');
            const { client_secret } = await res.json();
            const ws = new WebSocket(
                'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
                ['realtime', `openai-insecure-api-key.${client_secret}`, 'openai-beta.realtime-v1'],
            );
            wsRef.current = ws;
            ws.onopen = async () => {
                ws.send(JSON.stringify({
                    type: 'session.update',
                    session: {
                        modalities: ['text'],
                        instructions: '',
                        input_audio_format: 'pcm16',
                        input_audio_transcription: { model: 'gpt-4o-transcribe', language: 'ar' },
                        turn_detection: {
                            type: 'server_vad',
                            threshold: 0.5,
                            prefix_padding_ms: 300,
                            silence_duration_ms: 600,
                            create_response: false,
                        },
                    },
                }));
                await setupAudio();
                setConnecting(false);
                setRunning(true);
            };
            ws.onmessage = (e: MessageEvent) => {
                try { handleEvent(JSON.parse(e.data)); } catch { /* ignore */ }
            };
            ws.onerror = () => setConnecting(false);
            ws.onclose = () => { wsRef.current = null; };
        } catch {
            setConnecting(false);
        }
    };

    const commitAndDisconnect = () => {
        pausedRef.current = true;
        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            setTimeout(() => ws.close(), 3000);
        }
        sourceNodeRef.current?.disconnect();
        workletNodeRef.current?.disconnect();
        audioContextRef.current?.close().catch(() => {});
        audioContextRef.current = null;
        sourceNodeRef.current   = null;
        workletNodeRef.current  = null;
    };

    const start = () => {
        if (micState === 'available') {
            if (!wsRef.current) {
                pausedRef.current = false;
                transcriptMapRef.current.clear();
                setTranscript('');
                silenceStartRef.current = null;
                longPausesRef.current = 0;
                connectRealtime();
            } else {
                pausedRef.current = false;
                setRunning(true);
            }
        } else {
            setRunning(true);
        }
    };

    const pause = () => {
        setRunning(false);
        clearInterval(tickRef.current!);
        pausedRef.current = true;
    };

    const finishNow = () => {
        setRunning(false);
        setFinished(true);
        clearInterval(tickRef.current!);
        if (micState === 'available') commitAndDisconnect();
    };

    const reset = () => {
        setRunning(false);
        clearInterval(tickRef.current!);
        pausedRef.current = true;
        wsRef.current?.close();
        wsRef.current = null;
        sourceNodeRef.current?.disconnect();
        workletNodeRef.current?.disconnect();
        audioContextRef.current?.close().catch(() => {});
        audioContextRef.current = null;
        sourceNodeRef.current   = null;
        workletNodeRef.current  = null;
        transcriptMapRef.current.clear();
        setTranscript('');
        setTypedValue('');
        typedValueRef.current = '';
        setTimeLeft(DURATION);
        setFinished(false);
        setAnalyzing(false);
        setAnalyzeError(null);
        setLevels(Array<number>(BARS).fill(0));
        longPausesRef.current = 0;
        silenceStartRef.current = null;
    };

    // ── Derived ────────────────────────────────────────────────────
    const elapsed   = DURATION - timeLeft;
    const mm        = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss        = String(timeLeft % 60).padStart(2, '0');
    const wordSource = micState === 'unavailable' ? typedValue : transcript;
    const wordCount  = wordSource.trim().split(/\s+/).filter(Boolean).length;
    const allWords   = wordSource.trim().split(/\s+/).filter(Boolean);
    const visible    = allWords.slice(Math.max(0, allWords.length - 14));
    const wpm        = wordCount > 0 && elapsed > 5 ? Math.round(wordCount / elapsed * 60) : 0;
    const orbLevel   = running ? levels.reduce((a, b) => a + b, 0) / levels.length : 0;

    const isMobile   = vw < 600;
    const stageSize  = isMobile ? Math.min(300, vw - 32) : 460;
    const ringSize   = stageSize - 40;
    const orbBodySize = Math.round(stageSize * 240 / 460);

    const studioState: StudioState = analyzing ? 'analyzing'
        : finished    ? 'finished'
        : running     ? 'recording'
        : connecting  ? 'connecting'
        : timeLeft === DURATION ? 'idle'
        : 'paused';

    const primaryLabel: Record<StudioState, string> = {
        idle:       'ابدأ التسجيل',
        connecting: 'جارٍ الاتصال…',
        recording:  'إيقاف مؤقت',
        paused:     'استئناف',
        finished:   'تمّ التسجيل',
        analyzing:  'جارٍ التحليل…',
    };

    const handlePrimary = () => {
        if (studioState === 'idle' || studioState === 'paused') start();
        else if (studioState === 'recording') pause();
    };

    // ── Keyboard shortcuts ─────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
            if (e.code === 'Space') { e.preventDefault(); handlePrimary(); }
            if (e.code === 'KeyR')  { e.preventDefault(); reset(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    // ── Render ──────────────────────────────────────────────────────
    return (
        <>
            <Head title="استوديو التسجيل — فصيح" />

            <div
                dir="rtl"
                className={`state-${studioState}`}
                style={{
                    minHeight: '100vh',
                    background: T.bg,
                    color: T.ink,
                    fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                    display: 'grid',
                    gridTemplateRows: 'auto 1fr',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Grain texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
                    backgroundSize: '4px 4px',
                    pointerEvents: 'none', zIndex: 0,
                }} />

                {/* Ambient top glow */}
                <div style={{
                    position: 'absolute',
                    top: '-20%', left: '50%', transform: 'translateX(-50%)',
                    width: 1100, height: 1100, borderRadius: '50%',
                    background: `radial-gradient(closest-side, ${T.accent}38, transparent 70%)`,
                    filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
                    opacity: running ? 0.55 : (finished || analyzing) ? 0.7 : 0.25,
                    transition: 'opacity 0.8s ease',
                }} />

                {/* ── Header ─────────────────────────────────────────── */}
                <header className="record-header" style={{
                    position: 'relative', zIndex: 5,
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    padding: '22px 36px',
                    borderBottom: `1px solid ${T.line}`,
                    background: `oklch(14% 0.012 280 / 0.85)`,
                    backdropFilter: 'blur(12px)',
                }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: T.accent, color: T.accentInk,
                            display: 'grid', placeItems: 'center', flexShrink: 0,
                        }}>
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
                                <path d="M5 11a7 7 0 0 0 14 0" />
                                <path d="M12 18v3" />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
                            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>فصيح</span>
                            <span style={{
                                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                fontSize: 10, letterSpacing: '0.18em', color: T.ink3, marginTop: 3,
                            }}>
                                SPEAKING STUDIO · v2
                            </span>
                        </div>
                    </div>

                    {/* Nav pills */}
                    <nav className="record-nav" style={{
                        display: 'flex', gap: 6,
                        background: T.surface, border: `1px solid ${T.line}`,
                        padding: 5, borderRadius: 999,
                    }}>
                        {(['جلسة', 'سجلّي', 'المسارات'] as const).map((label, i) => (
                            <button key={label} style={{
                                background: i === 0 ? T.ink : 'transparent', border: 0,
                                padding: '8px 18px', borderRadius: 999,
                                color: i === 0 ? T.bg : T.ink2,
                                fontSize: 13, fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                            }}>
                                {label}
                            </button>
                        ))}
                    </nav>

                    {/* Streak + session ID */}
                    <div className="record-streak" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-start' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: T.surface, border: `1px solid ${T.line}`,
                            padding: '7px 12px', borderRadius: 999,
                            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                            fontSize: 13, fontWeight: 600,
                        }}>
                            <span>🔥</span>
                            <span>12</span>
                        </div>
                        <span style={{
                            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                            fontSize: 11, color: T.ink3, letterSpacing: '0.1em',
                        }}>
                            {SESSION_ID}
                        </span>
                    </div>
                </header>

                {/* ── Stage ──────────────────────────────────────────── */}
                <main className="record-main" style={{
                    position: 'relative', zIndex: 2,
                    display: 'grid',
                    gridTemplateRows: 'auto 1fr auto auto auto auto',
                    gap: 18,
                    padding: isMobile ? '16px 16px 20px' : '24px 48px 28px',
                    maxWidth: 1280, margin: '0 auto', width: '100%',
                    alignContent: 'start',
                    overflowY: 'auto',
                }}>

                    {/* Topic */}
                    <section style={{ textAlign: 'center', padding: '8px 0 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                background: `${T.accent}26`,
                                color: T.accent,
                                border: `1px solid ${T.accent}4d`,
                                padding: '6px 14px', borderRadius: 999,
                                fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
                            }}>
                                {topic.category.ar} · B2
                            </span>
                            <span style={{
                                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                fontSize: 11, color: T.ink3, letterSpacing: '0.1em',
                            }}>
                                {SESSION_ID}
                            </span>
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(26px, 3.2vw, 44px)',
                            fontWeight: 700, lineHeight: 1.25,
                            letterSpacing: '-0.015em',
                            margin: '0 auto 12px',
                            maxWidth: 880,
                        }}>
                            {topic.ar}
                        </h1>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            fontSize: 13, color: T.ink3,
                        }}>
                            <span style={{ color: T.accent }}>•</span>
                            <span>دقيقتان · رأي شخصي</span>
                            <span style={{
                                width: 4, height: 4,
                                background: T.ink3, borderRadius: '50%',
                                display: 'inline-block',
                            }} />
                            <span>العربية الفصحى</span>
                        </div>
                    </section>

                    {/* Hero: orb + ring + rails */}
                    <section style={{
                        position: 'relative',
                        display: 'grid', placeItems: 'center',
                        padding: '8px 0', minHeight: stageSize,
                    }}>
                        {/* Centre stage */}
                        <div style={{
                            position: 'relative',
                            width: stageSize, height: stageSize,
                            display: 'grid', placeItems: 'center',
                        }}>
                            <ProgressRing progress={elapsed / DURATION} size={ringSize} />
                            <VoiceOrb state={studioState} level={orbLevel} size={orbBodySize} />

                            {/* Timer pill */}
                            <div style={{
                                position: 'absolute', bottom: -12, left: '50%',
                                transform: 'translateX(-50%)',
                                textAlign: 'center', pointerEvents: 'none',
                            }}>
                                <div style={{
                                    display: 'inline-flex',
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    fontSize: 14, fontWeight: 500,
                                    letterSpacing: '0.04em',
                                    color: running ? T.ink : T.ink3,
                                    background: T.surface,
                                    border: `1px solid ${running ? T.accent + '66' : T.line}`,
                                    padding: '6px 14px', borderRadius: 999, gap: 2,
                                    transition: 'border-color 0.3s, color 0.3s',
                                }}>
                                    <span>{mm}</span>
                                    <span style={{
                                        animation: running ? 'pulse 1.4s steps(2) infinite' : 'none',
                                    }}>:</span>
                                    <span>{ss}</span>
                                </div>
                            </div>
                        </div>

                        {/* Left rail — stats */}
                        <aside className="studio-rail" style={{
                            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                            right: `calc(50% + ${Math.round(stageSize / 2) + 12}px)`,
                            display: 'flex', flexDirection: 'column', gap: 12, zIndex: 3,
                        }}>
                            <StatChip label="كلمات" value={wordCount} />
                            <StatChip label="ك/د"   value={running && elapsed > 5 ? wpm : '—'} />
                            <StatChip label="ثقة"   value={running ? '92%' : '—'} />
                        </aside>

                        {/* Right rail — hints */}
                        <aside className="studio-rail" style={{
                            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                            left: `calc(50% + ${Math.round(stageSize / 2) + 12}px)`,
                            display: 'flex', flexDirection: 'column', gap: 12, zIndex: 3,
                        }}>
                            {studioState !== 'finished' && studioState !== 'analyzing' && (
                                <HintCard hint={HINTS[hintIdx]} key={hintIdx} />
                            )}
                        </aside>
                    </section>

                    {/* Waveform */}
                    <Waveform active={running} levels={levels} />

                    {/* Transcript / textarea / analyzing */}
                    {(studioState === 'finished' || studioState === 'analyzing') ? (
                        <div style={{
                            background: T.surface, border: `1px solid ${T.line}`,
                            borderRadius: 18, padding: '18px 22px',
                            minHeight: 70,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        }}>
                            {analyzing ? (
                                <>
                                    <span style={{
                                        width: 16, height: 16, borderRadius: '50%',
                                        border: `2px solid ${T.accent}40`,
                                        borderTopColor: T.accent,
                                        animation: 'spin 0.7s linear infinite',
                                        display: 'block', flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: 15, color: T.accent }}>جارٍ تحليل كلامك…</span>
                                </>
                            ) : (
                                <span style={{ fontSize: 15, color: T.ok }}>
                                    ✓ تمّ التسجيل — جارٍ التحليل…
                                </span>
                            )}
                        </div>

                    ) : micState === 'unavailable' ? (
                        <div style={{
                            background: T.surface, border: `1px solid ${T.line}`,
                            borderRadius: 18, padding: '18px 22px',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <span style={{
                                position: 'absolute', top: -10, right: 18,
                                background: T.bg, padding: '0 10px',
                                fontSize: 10, color: T.ink3, letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                            }}>
                                النص الحيّ
                            </span>
                            <textarea
                                dir="rtl"
                                value={typedValue}
                                onChange={e => {
                                    setTypedValue(e.target.value);
                                    typedValueRef.current = e.target.value;
                                }}
                                placeholder="الميكروفون غير متاح — اكتب إجابتك هنا بالعربيّة…"
                                autoFocus
                                style={{
                                    width: '100%', minHeight: 80,
                                    background: 'transparent', border: 'none',
                                    color: T.ink, fontFamily: 'inherit',
                                    fontSize: 16, lineHeight: 1.6,
                                    padding: 0, resize: 'none', outline: 'none',
                                }}
                            />
                        </div>

                    ) : (
                        <div dir="rtl" style={{
                            background: T.surface, border: `1px solid ${T.line}`,
                            borderRadius: 18, padding: '18px 22px',
                            minHeight: 70,
                            display: 'flex', flexWrap: 'wrap',
                            alignItems: 'center', gap: '6px 8px',
                            fontSize: 16, fontWeight: 500, lineHeight: 1.6,
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <span style={{
                                position: 'absolute', top: -10, right: 18,
                                background: T.bg, padding: '0 10px',
                                fontSize: 10, color: T.ink3, letterSpacing: '0.14em',
                                textTransform: 'uppercase' as const,
                                fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                            }}>
                                النص الحيّ
                            </span>

                            {studioState === 'idle' && (
                                <span style={{ color: T.ink3, fontWeight: 400, fontSize: 14, width: '100%', textAlign: 'center' }}>
                                    اضغط ابدأ لبدء التسجيل
                                </span>
                            )}
                            {studioState === 'connecting' && (
                                <span style={{ color: T.ink3, fontWeight: 400, fontSize: 14, width: '100%', textAlign: 'center' }}>
                                    جارٍ الاتصال بـ GPT-4o Realtime…
                                </span>
                            )}
                            {(studioState === 'recording' || studioState === 'paused') && visible.length === 0 && (
                                <span style={{
                                    color: studioState === 'recording' ? T.accent : T.ink3,
                                    fontWeight: 400, fontSize: 14, width: '100%', textAlign: 'center',
                                }}>
                                    {studioState === 'recording' ? 'يستمع…' : '—'}
                                </span>
                            )}
                            {visible.map((w, i) => (
                                <span
                                    key={allWords.length - visible.length + i}
                                    style={{ display: 'inline-block', animation: 'wordIn 0.4s cubic-bezier(0.2,0.7,0.2,1) both' }}
                                >
                                    {w}
                                </span>
                            ))}
                            {studioState === 'recording' && (
                                <span style={{
                                    display: 'inline-block',
                                    width: 2, height: 18,
                                    background: T.accent,
                                    animation: 'pulse 1s steps(2) infinite',
                                    verticalAlign: 'middle', marginInlineStart: 4,
                                }} />
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {analyzeError && (
                        <div dir="rtl" style={{
                            fontSize: 13, color: T.danger,
                            padding: '10px 14px', borderRadius: 10,
                            border: `1px solid ${T.danger}4d`,
                            background: `${T.danger}1a`, lineHeight: 1.6,
                        }}>
                            {analyzeError}
                        </div>
                    )}

                    {/* Controls */}
                    <section className="record-controls" style={{
                        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                        gap: 12, alignItems: 'center',
                    }}>
                        {/* Reset */}
                        <button
                            onClick={reset}
                            disabled={studioState === 'idle'}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                justifyContent: 'center', justifySelf: 'end',
                                background: T.surface, border: `1px solid ${T.line}`,
                                color: T.ink2, padding: '14px 22px', borderRadius: 999,
                                fontSize: 14, fontWeight: 600,
                                cursor: studioState === 'idle' ? 'not-allowed' : 'pointer',
                                opacity: studioState === 'idle' ? 0.35 : 1,
                                fontFamily: 'inherit', transition: 'all 0.2s',
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
                            </svg>
                            إعادة
                        </button>

                        {/* Primary */}
                        {(studioState === 'finished' || studioState === 'analyzing') ? (
                            <div className="record-controls-primary" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                justifyContent: 'center',
                                background: `${T.accent}1a`, border: `1px solid ${T.accent}33`,
                                color: T.accent, padding: '18px 36px', borderRadius: 999,
                                fontSize: 15, fontWeight: 600, minWidth: 220,
                            }}>
                                {analyzing && (
                                    <span style={{
                                        width: 16, height: 16, borderRadius: '50%',
                                        border: `2px solid ${T.accent}40`,
                                        borderTopColor: T.accent,
                                        animation: 'spin 0.7s linear infinite',
                                        display: 'block', flexShrink: 0,
                                    }} />
                                )}
                                {primaryLabel[studioState]}
                            </div>
                        ) : (
                            <button
                                className="record-controls-primary"
                                onClick={handlePrimary}
                                disabled={studioState === 'connecting' || micState === 'checking'}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 14,
                                    justifyContent: 'center',
                                    background: T.accent, color: T.accentInk,
                                    border: 0, padding: '18px 36px 18px 28px', borderRadius: 999,
                                    fontSize: 16, fontWeight: 700,
                                    cursor: (studioState === 'connecting' || micState === 'checking') ? 'not-allowed' : 'pointer',
                                    opacity: (studioState === 'connecting' || micState === 'checking') ? 0.7 : 1,
                                    boxShadow: [
                                        '0 1px 0 rgba(255,255,255,0.4) inset',
                                        `0 -10px 30px oklch(70% 0.20 125 / 0.80) inset`,
                                        `0 14px 40px -10px ${T.accent}b3`,
                                    ].join(', '),
                                    minWidth: 220, fontFamily: 'inherit',
                                    transition: 'transform 0.15s ease',
                                }}
                            >
                                <span style={{ display: 'grid', placeItems: 'center' }}>
                                    {studioState === 'connecting' ? (
                                        <span style={{
                                            width: 22, height: 22, borderRadius: '50%',
                                            border: `3px solid ${T.accentInk}40`,
                                            borderTopColor: T.accentInk,
                                            animation: 'spin 0.7s linear infinite', display: 'block',
                                        }} />
                                    ) : studioState === 'recording' ? (
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <span style={{ width: 6, height: 22, background: 'currentColor', borderRadius: 2 }} />
                                            <span style={{ width: 6, height: 22, background: 'currentColor', borderRadius: 2 }} />
                                        </div>
                                    ) : studioState === 'paused' ? (
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
                                            <path d="M5 11a7 7 0 0 0 14 0" />
                                            <path d="M12 18v3" />
                                        </svg>
                                    )}
                                </span>
                                <span>{primaryLabel[studioState]}</span>
                                <span style={{
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    fontSize: 10,
                                    background: `${T.accentInk}24`,
                                    color: `${T.accentInk}b3`,
                                    padding: '3px 8px', borderRadius: 6, letterSpacing: '0.08em',
                                }}>
                                    SPACE
                                </span>
                            </button>
                        )}

                        {/* Finish */}
                        <button
                            onClick={finishNow}
                            disabled={studioState === 'idle' || studioState === 'finished' || studioState === 'analyzing'}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                justifyContent: 'center', justifySelf: 'start',
                                background: T.surface, border: `1px solid ${T.line}`,
                                color: T.ink2, padding: '14px 22px', borderRadius: 999,
                                fontSize: 14, fontWeight: 600,
                                cursor: (studioState === 'idle' || studioState === 'finished' || studioState === 'analyzing')
                                    ? 'not-allowed' : 'pointer',
                                opacity: (studioState === 'idle' || studioState === 'finished' || studioState === 'analyzing')
                                    ? 0.35 : 1,
                                fontFamily: 'inherit', transition: 'all 0.2s',
                            }}
                        >
                            إنهاء
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </section>

                    {/* Status bar */}
                    <footer style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: 14, borderTop: `1px solid ${T.line}`,
                        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                        fontSize: 11, color: T.ink3, letterSpacing: '0.06em',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                                background: studioState === 'recording' ? T.accent
                                    : studioState === 'paused' ? T.warn
                                    : (studioState === 'finished' || studioState === 'analyzing') ? T.ok
                                    : T.ink3,
                                boxShadow: studioState === 'recording' ? `0 0 0 4px ${T.accent}4d` : 'none',
                                animation: studioState === 'recording' ? 'recordGlow 1.4s ease-in-out infinite' : 'none',
                            }} />
                            <span style={{ fontFamily: 'inherit', fontSize: 12 }}>
                                {studioState === 'idle'      && 'جاهز للتسجيل'}
                                {studioState === 'connecting' && 'جارٍ الاتصال…'}
                                {studioState === 'recording' && 'يسجّل الآن'}
                                {studioState === 'paused'    && 'متوقف مؤقتاً'}
                                {(studioState === 'finished' || studioState === 'analyzing') && 'اكتملت الجلسة'}
                            </span>
                            {micState === 'available' && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.ok, display: 'inline-block' }} />
                                    GPT-4o Realtime
                                </span>
                            )}
                            {micState === 'unavailable' && (
                                <span style={{ color: T.danger }}>وضع الكتابة</span>
                            )}
                        </div>
                        <div className="record-footer-hints" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <kbd style={{
                                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                background: T.surface, border: `1px solid ${T.line}`,
                                padding: '2px 6px', borderRadius: 5, color: T.ink2, fontSize: 10,
                            }}>SPACE</kbd>
                            للتشغيل
                            <span style={{ color: T.line2 }}>·</span>
                            <kbd style={{
                                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                background: T.surface, border: `1px solid ${T.line}`,
                                padding: '2px 6px', borderRadius: 5, color: T.ink2, fontSize: 10,
                            }}>R</kbd>
                            للإعادة
                            <span style={{ color: T.line2 }}>·</span>
                            GPT-4o Realtime
                        </div>
                    </footer>

                </main>
            </div>
        </>
    );
}
