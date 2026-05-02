import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type HealthStatus = 'loading' | 'success' | 'error';

type HealthResponse = {
    status: string;
    project: string;
};

export default function Welcome() {
    const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Apply saved theme
        const saved = localStorage.getItem('fasih_theme');
        if (saved === 'dark') {
            document.documentElement.dataset.theme = 'dark';
        } else {
            delete document.documentElement.dataset.theme;
        }

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
        ? 'var(--fix)'
        : healthStatus === 'error'
            ? 'var(--err)'
            : 'var(--ink-faint)';

    const statusLabel = healthStatus === 'success'
        ? 'النظام جاهز'
        : healthStatus === 'error'
            ? 'API غير متاح'
            : 'جارٍ التحقّق…';

    return (
        <>
            <Head title="فصيح — مدرّب اللغة العربية" />

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '0 20px',
            }}>

                {/* Top bar */}
                <header style={{
                    maxWidth: 1100,
                    width: '100%',
                    margin: '0 auto',
                    padding: '20px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--line)',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34,
                            border: '1.5px solid var(--accent)',
                            borderRadius: 9,
                            display: 'grid', placeItems: 'center',
                            fontSize: 16,
                            background: 'var(--accent-glow2)',
                            boxShadow: '0 0 12px var(--accent-glow)',
                        }}>
                            🗣️
                        </div>
                        <span style={{ fontFamily: 'var(--f-ar)', fontSize: 16, fontWeight: 600 }}>فصيح</span>
                    </div>

                    {/* Status */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        fontFamily: 'var(--f-mono)', fontSize: 11,
                        color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.14em',
                    }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: statusColor,
                            display: 'inline-block',
                            boxShadow: healthStatus === 'success' ? '0 0 6px var(--fix)' : 'none',
                            transition: 'background 0.4s, box-shadow 0.4s',
                            animation: healthStatus === 'loading' ? 'pulse 1.2s ease-in-out infinite' : 'none',
                        }} />
                        {statusLabel}
                    </div>
                </header>

                {/* Hero */}
                <main style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 0 60px',
                }}>
                    <div style={{
                        maxWidth: 720,
                        width: '100%',
                        textAlign: 'center',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                        transition: 'opacity 0.6s var(--e-out), transform 0.6s var(--e-out)',
                    }}>

                        {/* Kicker badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 14px',
                            border: '1px solid var(--line-2)',
                            borderRadius: 999,
                            background: 'var(--accent-glow2)',
                            fontFamily: 'var(--f-mono)', fontSize: 10,
                            color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.2em',
                            marginBottom: 36,
                        }}>
                            <span style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: 'var(--accent)',
                                display: 'inline-block',
                                animation: 'pulse 2s ease-in-out infinite',
                            }} />
                            Arabic Speaking Coach · AI Powered
                        </div>

                        {/* Main title */}
                        <h1 style={{
                            fontFamily: 'var(--f-ar)',
                            fontSize: 'clamp(72px, 18vw, 120px)',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            margin: '0 0 20px',
                            background: 'linear-gradient(135deg, var(--ink) 30%, var(--accent) 70%, #93c5fd 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            backgroundSize: '200% 200%',
                            animation: 'gradientShift 6s ease infinite',
                        }}>
                            فصيح
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            fontFamily: 'var(--f-en)',
                            fontSize: 'clamp(15px, 3vw, 18px)',
                            color: 'var(--ink-mute)',
                            margin: '0 auto 48px',
                            fontWeight: 300,
                            maxWidth: 460,
                            lineHeight: 1.7,
                        }}>
                            Practice spoken Arabic. Get AI-powered feedback.
                            <br />Improve every session.
                        </p>

                        {/* CTA */}
                        <button
                            className="welcome-cta-btn"
                            onClick={() => router.visit('/home')}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 12,
                                padding: '16px 36px',
                                borderRadius: 12,
                                border: '1px solid var(--accent)',
                                background: 'var(--accent)',
                                color: '#fff',
                                fontFamily: 'var(--f-ar)', fontSize: 17, fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 0 24px var(--accent-glow), 0 4px 20px rgba(0,0,0,0.3)',
                                transition: 'transform 0.2s var(--e-spring), box-shadow 0.2s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px var(--accent-glow), 0 8px 28px rgba(0,0,0,0.35)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px var(--accent-glow), 0 4px 20px rgba(0,0,0,0.3)';
                            }}
                        >
                            ابدأ التدريب
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                        {/* Feature chips */}
                        <div className="welcome-chips" style={{
                            display: 'flex', flexWrap: 'wrap', gap: 10,
                            justifyContent: 'center', marginTop: 48,
                        }}>
                            {['تسجيل صوتي مباشر', 'تفريغ فوري بـ GPT-4o', 'تقرير شامل', 'تصحيح النطق'].map((f, i) => (
                                <span key={i} style={{
                                    padding: '6px 14px',
                                    border: '1px solid var(--line)',
                                    borderRadius: 999,
                                    fontFamily: 'var(--f-ar)', fontSize: 13,
                                    color: 'var(--ink-mute)',
                                    background: 'var(--bg-card)',
                                }}>
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Footer line */}
                <div style={{
                    textAlign: 'center', paddingBottom: 24,
                    fontFamily: 'var(--f-mono)', fontSize: 10,
                    color: 'var(--ink-faint)', letterSpacing: '0.14em',
                }}>
                    FASIH · AI ARABIC COACH · 2025
                </div>
            </div>
        </>
    );
}
