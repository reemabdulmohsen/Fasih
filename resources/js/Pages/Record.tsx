import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import TopBar from '@/Components/TopBar';
import Ring from '@/Components/Ring';
import { TOPICS } from '@/data/topics';

const SESSION_ID = 'A3B9F2';
const DURATION   = 120;
const BARS       = 22;

type MicState = 'checking' | 'available' | 'unavailable';

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

export default function Record() {
    const topic = TOPICS[0];

    const [timeLeft, setTimeLeft]     = useState(DURATION);
    const [running, setRunning]       = useState(false);
    const [transcript, setTranscript] = useState('');
    const [micState, setMicState]     = useState<MicState>('checking');
    const [typedValue, setTypedValue] = useState('');
    const [levels, setLevels]         = useState(() => Array<number>(BARS).fill(4));
    const [finished, setFinished]     = useState(false);
    const [connecting, setConnecting] = useState(false);

    const streamRef        = useRef<MediaStream | null>(null);
    const wsRef            = useRef<WebSocket | null>(null);
    const audioContextRef  = useRef<AudioContext | null>(null);
    const workletNodeRef   = useRef<AudioWorkletNode | null>(null);
    const sourceNodeRef    = useRef<MediaStreamAudioSourceNode | null>(null);
    const tickRef          = useRef<ReturnType<typeof setInterval> | null>(null);
    const levelRef         = useRef<ReturnType<typeof setInterval> | null>(null);
    const pausedRef        = useRef(false);
    const transcriptMapRef = useRef<Map<string, string>>(new Map());

    // ── Mic permission ────────────────────────────────────────────────
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

    // ── Countdown ─────────────────────────────────────────────────────
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

    // ── Waveform ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!running) { setLevels(Array<number>(BARS).fill(4)); return; }
        levelRef.current = setInterval(() => {
            setLevels(() => Array.from({ length: BARS }, () => 4 + Math.random() * 22));
        }, 120);
        return () => clearInterval(levelRef.current!);
    }, [running]);

    // ── Realtime helpers ──────────────────────────────────────────────
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
        };

        source.connect(worklet);
        // Connect to destination to keep the worklet graph alive
        worklet.connect(ctx.destination);
    };

    const connectRealtime = async () => {
        setConnecting(true);
        try {
            const res = await fetch('/api/realtime-session', { method: 'POST' });
            if (!res.ok) throw new Error('session error');
            const { client_secret } = await res.json();

            // The browser WebSocket API doesn't support custom headers, so OpenAI
            // accepts authentication through WebSocket subprotocols instead.
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
                setRunning(true); // start timer only once audio pipeline is live
            };

            ws.onmessage = (e: MessageEvent) => {
                try { handleEvent(JSON.parse(e.data)); } catch { /* ignore parse errors */ }
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
            ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
            // Keep WS open briefly to receive the final transcription event
            setTimeout(() => ws.close(), 3000);
        }
        sourceNodeRef.current?.disconnect();
        workletNodeRef.current?.disconnect();
        audioContextRef.current?.close().catch(() => {});
        audioContextRef.current = null;
        sourceNodeRef.current   = null;
        workletNodeRef.current  = null;
    };

    // ── Handlers ─────────────────────────────────────────────────────
    const start = () => {
        if (micState === 'available') {
            if (!wsRef.current) {
                // Fresh start: connect WS → setRunning(true) fires inside onopen
                pausedRef.current = false;
                transcriptMapRef.current.clear();
                setTranscript('');
                connectRealtime();
            } else {
                // Resume from pause: WS already open, just unpause
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
        pausedRef.current = true; // stop forwarding audio; WS stays open
    };

    const finishNow = () => {
        setRunning(false);
        setFinished(true);
        clearInterval(tickRef.current!);
        if (micState === 'available') commitAndDisconnect();
    };

    // ── Derived ───────────────────────────────────────────────────────
    const elapsed    = DURATION - timeLeft;
    const progress   = 1 - elapsed / DURATION;
    const mm         = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss         = String(timeLeft % 60).padStart(2, '0');
    const warn       = timeLeft <= 20 && timeLeft > 0;
    const wordSource = micState === 'unavailable' ? typedValue : transcript;
    const wordCount  = wordSource.trim().split(/\s+/).filter(Boolean).length;

    const timerLabel = running
        ? 'جارٍ التسجيل'
        : connecting
            ? 'جارٍ الاتصال…'
            : timeLeft === DURATION
                ? 'جاهز'
                : finished
                    ? 'انتهى'
                    : 'متوقّف';

    const micDotColor = micState === 'unavailable' ? 'var(--err)' : 'var(--fix)';
    const micLabel =
        micState === 'unavailable' ? 'الميكروفون غير متاح · وضع الكتابة'
        : micState === 'available'  ? 'الميكروفون · GPT-4o Realtime'
        : 'جارٍ التحقّق من الميكروفون…';

    return (
        <>
            <Head title="التسجيل — فصيح" />

            <div style={{
                maxWidth: 1440, margin: '0 auto',
                minHeight: '100vh', padding: '28px 36px 60px',
            }}>
                <TopBar step="record" session={SESSION_ID} />

                <div style={{ animation: 'fadeUp 0.5s var(--e-out) both' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1.15fr 1fr',
                        gap: 28, alignItems: 'start',
                    }}>

                        {/* ── LEFT: Timer + controls ── */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--line)',
                            borderRadius: 12, padding: 32, minHeight: 560,
                        }}>
                            {/* Topic strip */}
                            <div style={{
                                paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 28,
                            }}>
                                <div style={{ fontFamily: 'var(--f-ar)', fontSize: 13, color: 'var(--ink-mute)', marginBottom: 8 }}>
                                    الموضوع
                                </div>
                                <div dir="rtl" style={{ fontFamily: 'var(--f-ar)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>
                                    {topic.ar}
                                </div>
                            </div>

                            {/* Timer wrap */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 28px' }}>
                                <Ring size={220} stroke={4} progress={progress} warn={warn}>
                                    <span style={{
                                        fontFamily: 'var(--f-mono)', fontSize: 48,
                                        fontWeight: 400, letterSpacing: '0.02em',
                                        color: warn ? 'var(--err)' : 'var(--ink)',
                                        fontVariantNumeric: 'tabular-nums',
                                        transition: 'color 0.3s',
                                    }}>
                                        {mm}:{ss}
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--f-mono)', fontSize: 10,
                                        textTransform: 'uppercase', letterSpacing: '0.22em',
                                        color: 'var(--ink-mute)',
                                        display: 'flex', alignItems: 'center', gap: 5,
                                    }}>
                                        {running && (
                                            <span style={{ color: 'var(--err)', animation: 'pulse 1.4s ease-in-out infinite' }}>●</span>
                                        )}
                                        {timerLabel}
                                    </span>
                                </Ring>

                                {/* Waveform bars */}
                                <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
                                    {levels.map((h, i) => (
                                        <span key={i} style={{
                                            display: 'block', width: 3,
                                            height: h + 'px',
                                            background: 'var(--accent)',
                                            borderRadius: 1,
                                            opacity: running ? 0.9 : 0.25,
                                            transition: running ? 'height 0.08s linear' : 'none',
                                        }} />
                                    ))}
                                </div>

                                {/* Controls */}
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
                                    {!running && !connecting && timeLeft === DURATION && !finished && (
                                        <button onClick={start} style={primaryBtnStyle}>
                                            <svg width="10" height="10" viewBox="0 0 10 10">
                                                <circle cx="5" cy="5" r="4" fill="currentColor" />
                                            </svg>
                                            ابدأ
                                        </button>
                                    )}
                                    {connecting && (
                                        <button disabled style={{ ...primaryBtnStyle, opacity: 0.6, cursor: 'default' }}>
                                            جارٍ الاتصال…
                                        </button>
                                    )}
                                    {running && (
                                        <button onClick={pause} style={baseBtnStyle}>⏸ إيقاف مؤقّت</button>
                                    )}
                                    {!running && !connecting && timeLeft < DURATION && timeLeft > 0 && !finished && (
                                        <button onClick={start} style={primaryBtnStyle}>استئناف</button>
                                    )}
                                    {!finished && (
                                        <button onClick={finishNow} style={ghostBtnStyle}>إنهاء الآن</button>
                                    )}
                                    {finished && (
                                        <div style={{
                                            fontFamily: 'var(--f-ar)', fontSize: 14,
                                            color: 'var(--fix)', display: 'flex', alignItems: 'center', gap: 6,
                                        }}>
                                            ✓ تمّ التسجيل
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mic status bar */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--line)', borderRadius: 8,
                                marginTop: 18,
                                fontFamily: 'var(--f-ar)', fontSize: 13, color: 'var(--ink-mute)',
                            }}>
                                <span>
                                    <span style={{
                                        display: 'inline-block', width: 6, height: 6,
                                        borderRadius: '50%', background: micDotColor,
                                        marginInlineEnd: 8, verticalAlign: 'middle',
                                    }} />
                                    {micLabel}
                                </span>
                                <span>ينتهي تلقائيًّا عند 00:00</span>
                            </div>
                        </div>

                        {/* ── RIGHT: Transcript ── */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--line)',
                            borderRadius: 12, padding: 32, minHeight: 560,
                            display: 'flex', flexDirection: 'column',
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                                paddingBottom: 14, borderBottom: '1px solid var(--line)', marginBottom: 18,
                            }}>
                                <span style={{ fontSize: 18, fontWeight: 500, fontFamily: 'var(--f-ar)' }}>
                                    النصّ المكتوب
                                </span>
                                <span style={{ fontFamily: 'var(--f-ar)', fontSize: 13, color: 'var(--ink-mute)' }}>
                                    <span style={{ fontFamily: 'var(--f-mono)' }}>{wordCount}</span> كلمة
                                </span>
                            </div>

                            {/* Textarea fallback (mic unavailable) */}
                            {micState === 'unavailable' ? (
                                <textarea
                                    dir="rtl"
                                    value={typedValue}
                                    onChange={e => setTypedValue(e.target.value)}
                                    placeholder="الميكروفون غير متاح — اكتب إجابتك هنا بالعربيّة…"
                                    autoFocus
                                    style={{
                                        flex: 1, width: '100%',
                                        background: 'transparent',
                                        border: '1px dashed var(--line-2)', borderRadius: 8,
                                        color: 'var(--ink)', fontFamily: 'var(--f-ar)',
                                        fontSize: 19, lineHeight: 1.85,
                                        padding: 16, resize: 'none', outline: 'none',
                                        minHeight: 340,
                                    }}
                                />
                            ) : (
                                /* Live transcript display */
                                <div style={{ flex: 1, overflowY: 'auto', paddingInlineEnd: 6 }}>
                                    {transcript ? (
                                        <div dir="rtl" style={{
                                            fontFamily: 'var(--f-ar)', fontSize: 19,
                                            lineHeight: 1.85, color: 'var(--ink)',
                                        }}>
                                            {transcript}
                                        </div>
                                    ) : (
                                        <div dir="rtl" style={{
                                            fontFamily: 'var(--f-ar)', fontSize: 17,
                                            color: 'var(--ink-faint)', fontStyle: 'italic',
                                        }}>
                                            {connecting
                                                ? 'جارٍ الاتصال بـ GPT-4o Realtime…'
                                                : running
                                                    ? 'جارٍ الاستماع… سيظهر النصّ أثناء حديثك.'
                                                    : 'اضغط «ابدأ» للتسجيل، وسيظهر النصّ في الوقت الفعليّ.'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.3; }
                }
            `}</style>
        </>
    );
}

const baseBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '11px 18px', borderRadius: 8,
    border: '1px solid var(--line-2)', background: 'var(--bg-card)',
    color: 'var(--ink)', fontFamily: 'var(--f-ar)',
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
};

const ghostBtnStyle: React.CSSProperties = {
    ...baseBtnStyle, background: 'transparent', borderColor: 'var(--line)',
};

const primaryBtnStyle: React.CSSProperties = {
    ...baseBtnStyle,
    background: 'var(--accent)', color: '#0a0a0b',
    borderColor: 'var(--accent)', fontWeight: 600,
};
