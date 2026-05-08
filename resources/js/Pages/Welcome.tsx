import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type HealthStatus = 'loading' | 'success' | 'error';

type HealthResponse = {
    status: string;
    project: string;
};

// Design tokens — light theme with blue accent
const T = {
    bg:        'oklch(99% 0.003 280)',
    surface:   'oklch(96% 0.005 280)',
    surface2:  'oklch(93% 0.006 280)',
    line:      'oklch(88% 0.008 280)',
    line2:     'oklch(82% 0.008 280)',
    ink:       'oklch(14% 0.012 280)',
    ink2:      'oklch(32% 0.01 280)',
    ink3:      'oklch(52% 0.01 280)',
    accent:    'oklch(55% 0.22 255)',
    accentInk: 'oklch(99% 0.003 280)',
    ok:        'oklch(45% 0.18 150)',
    danger:    'oklch(50% 0.2 25)',
} as const;

export default function Welcome() {
    const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        let active = true;
        const loadHealth = async () => {
            try {
                const response = await fetch('/api/health', {
                    headers: { Accept: 'application/json' },
                });
                if (!response.ok) throw new Error('Health check failed.');
                const data: HealthResponse = await response.json();
                if (active) setHealthStatus(data.status === 'ok' ? 'success' : 'error');
            } catch {
                if (active) setHealthStatus('error');
            }
        };

        void loadHealth();
        return () => { active = false; };
    }, []);

    const statusColor = healthStatus === 'success'
        ? T.ok
        : healthStatus === 'error'
            ? T.danger
            : T.ink3;

    const statusLabel = healthStatus === 'success'
        ? 'النظام جاهز'
        : healthStatus === 'error'
            ? 'API غير متاح'
            : 'جارٍ التحقّق…';

    return (
        <>
            <Head title="فصيح — مدرّب الفصاحة" />

            <div style={{
                minHeight: '100vh',
                background: T.bg,
                color: T.ink,
                fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto',
                position: 'relative',
                overflowX: 'hidden',
            }}>
                {/* Grain texture */}
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)',
                    backgroundSize: '4px 4px',
                    pointerEvents: 'none', zIndex: 0,
                }} />

                {/* Ambient glow */}
                <div style={{
                    position: 'fixed',
                    top: '-20%', left: '50%', transform: 'translateX(-50%)',
                    width: 1100, height: 1100, borderRadius: '50%',
                    background: `radial-gradient(closest-side, ${T.accent}28, transparent 70%)`,
                    filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
                    opacity: 0.18,
                }} />

                {/* ── Header ─────────────────────────────────── */}
                <header style={{
                    position: 'relative', zIndex: 5,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    padding: '22px 36px',
                    borderBottom: `1px solid ${T.line}`,
                    background: `oklch(99% 0.003 280 / 0.88)`,
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
                                SPEAKING COACH · v2
                            </span>
                        </div>
                    </div>

                    {/* Center spacer */}
                    <div />

                    {/* Health status */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: T.surface, border: `1px solid ${T.line}`,
                            padding: '7px 14px', borderRadius: 999,
                            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                            fontSize: 11, color: T.ink3, letterSpacing: '0.1em',
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: statusColor,
                                display: 'inline-block',
                                boxShadow: healthStatus === 'success' ? `0 0 6px ${T.ok}` : 'none',
                                transition: 'background 0.4s, box-shadow 0.4s',
                                animation: healthStatus === 'loading' ? 'pulse 1.2s ease-in-out infinite' : 'none',
                            }} />
                            {statusLabel}
                        </div>
                    </div>
                </header>

                {/* ── Hero ───────────────────────────────────── */}
                <main style={{
                    position: 'relative', zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 24px',
                }}>
                    <div style={{
                        maxWidth: 680,
                        width: '100%',
                        textAlign: 'center',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                        transition: 'opacity 0.6s ease, transform 0.6s ease',
                    }}>

                        {/* Main title */}
                        <h1 style={{
                            fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                            fontSize: 'clamp(72px, 18vw, 120px)',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            margin: '0 0 20px',
                            background: `linear-gradient(135deg, ${T.ink} 30%, ${T.accent} 70%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            فصيح
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                            fontSize: 'clamp(15px, 3vw, 17px)',
                            color: T.ink3,
                            margin: '0 auto 48px',
                            fontWeight: 300,
                            maxWidth: 400,
                            lineHeight: 1.8,
                        }}>
                            تكلّم بثقة
                            <br />
                            فصيح يسمعك ويصحّح لك في ثواني
                        </p>

                        {/* CTA */}
                        <button
                            onClick={() => router.visit('/home')}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 12,
                                padding: '14px 32px',
                                borderRadius: 12,
                                border: `1px solid ${T.accent}`,
                                background: T.accent,
                                color: T.accentInk,
                                fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                                fontSize: 16, fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: `0 0 20px ${T.accent}44, 0 4px 16px rgba(0,0,0,0.12)`,
                                transition: 'transform 0.2s ease, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 28px ${T.accent}55, 0 8px 24px rgba(0,0,0,0.16)`;
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${T.accent}44, 0 4px 16px rgba(0,0,0,0.12)`;
                            }}
                        >
                            ابدأ التدريب
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                        {/* Feature chips */}
                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: 10,
                            justifyContent: 'center', marginTop: 48,
                        }}>
                            {['تسجيل صوتي مباشر', 'تقرير شامل', 'تصحيح النطق'].map((f, i) => (
                                <span key={i} style={{
                                    padding: '6px 14px',
                                    border: `1px solid ${T.line2}`,
                                    borderRadius: 999,
                                    fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                                    fontSize: 13,
                                    color: T.ink3,
                                    background: T.surface,
                                }}>
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                </main>

                {/* ── Footer ─────────────────────────────────── */}
                <div style={{
                    position: 'relative', zIndex: 2,
                    textAlign: 'center', paddingBottom: 24,
                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                    fontSize: 10, color: T.ink3, letterSpacing: '0.14em',
                }}>
                    FASIH · AI ARABIC COACH · 2025
                </div>
            </div>
        </>
    );
}
