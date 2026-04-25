import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type HealthStatus = 'loading' | 'success' | 'error';

type HealthResponse = {
    status: string;
    project: string;
};

export default function Welcome() {
    const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading');

    useEffect(() => {
        let active = true;

        const loadHealth = async () => {
            try {
                const response = await fetch('/api/health', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) throw new Error('Health check request failed.');

                const data: HealthResponse = await response.json();

                if (active) {
                    setHealthStatus(data.status === 'ok' ? 'success' : 'error');
                }
            } catch {
                if (active) setHealthStatus('error');
            }
        };

        void loadHealth();
        return () => { active = false; };
    }, []);

    return (
        <>
            <Head title="فصيح — Arabic Speaking Coach" />

            <div style={{ maxWidth: 1440, margin: '0 auto', minHeight: '100vh', padding: '28px 36px 60px', position: 'relative', display: 'flex', flexDirection: 'column' }}>

                {/* Top bar */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24, borderBottom: '1px solid var(--line)', marginBottom: 36 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 34, height: 34,
                            border: '1.5px solid var(--accent)',
                            borderRadius: 8,
                            display: 'grid', placeItems: 'center',
                            fontFamily: 'var(--f-ar)',
                            fontSize: 18,
                            color: 'var(--accent)',
                            background: 'rgba(240,182,74,0.05)',
                        }}>
                            🗣️
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                            <span style={{ fontFamily: 'var(--f-ar)', fontSize: 17, fontWeight: 500 }}>فصيح</span>
                            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: 3 }}>
                                Arabic Speaking Coach
                            </span>
                        </div>
                    </div>

                    {/* API status dot */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                        <span style={{
                            display: 'inline-block',
                            width: 6, height: 6, borderRadius: '50%',
                            background: healthStatus === 'success' ? 'var(--fix)' : healthStatus === 'error' ? 'var(--err)' : 'var(--ink-faint)',
                            transition: 'background 0.3s',
                        }} />
                        {healthStatus === 'success' ? 'API Online' : healthStatus === 'error' ? 'API Offline' : 'Checking…'}
                    </div>
                </header>

                {/* Hero card */}
                <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        maxWidth: 880,
                        width: '100%',
                        margin: '0 auto',
                        padding: '64px 56px',
                        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-raised) 100%)',
                        border: '1px solid var(--line)',
                        borderRadius: 14,
                        position: 'relative',
                        overflow: 'hidden',
                        textAlign: 'center',
                        animation: 'fadeUp .5s var(--e-out) both',
                    }}>
                        {/* Accent line at top */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                            opacity: 0.4,
                        }} />

                        {/* Kicker */}
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 28 }}>
                            Arabic Speaking Coach
                        </div>

                        {/* Arabic title */}
                        <h1 style={{ fontFamily: 'var(--f-ar)', fontSize: 80, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                            فصيح
                        </h1>

                        {/* English subtitle */}
                        <p style={{ fontFamily: 'var(--f-en)', fontSize: 16, color: 'var(--ink-mute)', margin: '0 0 48px', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.01em' }}>
                            Practice spoken Arabic. Get real feedback. Improve every session.
                        </p>

                        {/* Divider */}
                        <div style={{ height: 1, background: 'var(--line)', margin: '0 0 36px' }} />

                        {/* Status badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', border: '1px solid var(--line-2)', borderRadius: 999, background: 'rgba(255,255,255,0.02)', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                            <span style={{
                                display: 'inline-block',
                                width: 6, height: 6, borderRadius: '50%',
                                background: healthStatus === 'success' ? 'var(--fix)' : healthStatus === 'error' ? 'var(--err)' : 'var(--ink-faint)',
                            }} />
                            {healthStatus === 'success' ? 'System ready' : healthStatus === 'error' ? 'API unavailable' : 'Connecting…'}
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
