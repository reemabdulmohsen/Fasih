import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { TOPICS } from '@/data/topics';
import type { Topic } from '@/types/fasih';

const SESSION_ID = 'A3B9F2';

// Design tokens — matches Record.tsx dark theme
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
} as const;

export default function Home() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [topicIdx, setTopicIdx] = useState(0);

    useEffect(() => {
        fetch('/api/topics')
            .then(r => r.json())
            .then((data: Topic[]) => {
                if (Array.isArray(data) && data.length > 0) setTopics(data);
                else setTopics(TOPICS);
            })
            .catch(() => setTopics(TOPICS))
            .finally(() => setLoading(false));
    }, []);

    const topic = topics[topicIdx];
    const total = topics.length;

    const shuffle = () => {
        if (total <= 1) return;
        let next = topicIdx;
        while (next === topicIdx) next = Math.floor(Math.random() * total);
        setTopicIdx(next);
    };

    const startSession = () => {
        sessionStorage.setItem('fasih_topic', JSON.stringify(topic));
        router.visit('/record');
    };

    return (
        <>
            <Head title="فصيح · الموضوع" />

            <style>{`
                .home-header {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    padding: 22px 36px;
                }
                .home-card-inner {
                    padding: 36px 32px;
                    border-radius: 20px;
                }
                .home-sticky-bar { display: none; }

                @media (max-width: 860px) {
                    .home-header {
                        grid-template-columns: 1fr auto !important;
                        padding: 14px 20px !important;
                    }
                    .home-nav { display: none !important; }
                    .home-streak { justify-content: flex-end !important; }
                    .home-streak-id { display: none !important; }
                }
                @media (max-width: 600px) {
                    .home-card-inner {
                        padding: 24px 18px !important;
                        border-radius: 16px !important;
                    }
                    .hints-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .home-start-btn-card { display: none !important; }
                    .home-sticky-bar {
                        display: block !important;
                        position: sticky;
                        bottom: 0;
                        padding: 10px 0 8px;
                        background: linear-gradient(to bottom, transparent 0%, oklch(14% 0.012 280) 40%);
                    }
                    .home-sticky-bar button {
                        width: 100% !important;
                        justify-content: center !important;
                        padding: 17px 24px !important;
                        font-size: 17px !important;
                        border-radius: 14px !important;
                    }
                    .home-actions {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .home-actions button {
                        justify-content: center !important;
                    }
                    .home-shuffle-btn {
                        order: 2 !important;
                    }
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: T.bg,
                color: T.ink,
                fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                overflow: 'hidden',
                position: 'relative',
            }}>
                {/* Grain texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
                    backgroundSize: '4px 4px',
                    pointerEvents: 'none', zIndex: 0,
                }} />

                {/* Ambient glow */}
                <div style={{
                    position: 'absolute',
                    top: '-20%', left: '50%', transform: 'translateX(-50%)',
                    width: 1100, height: 1100, borderRadius: '50%',
                    background: `radial-gradient(closest-side, ${T.accent}28, transparent 70%)`,
                    filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
                    opacity: 0.4,
                }} />

                {/* ── Header ─────────────────────────────────────── */}
                <header className="home-header" style={{
                    position: 'relative', zIndex: 5,
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
                                SPEAKING COACH · v2
                            </span>
                        </div>
                    </div>

                    {/* Nav pills */}
                    <nav className="home-nav" style={{
                        display: 'flex', gap: 6,
                        background: T.surface, border: `1px solid ${T.line}`,
                        padding: 5, borderRadius: 999,
                    }}>
                        {(['الموضوع', 'سجلّي', 'المسارات'] as const).map((label, i) => (
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
                    <div className="home-streak" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-start' }}>
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
                        <span className="home-streak-id" style={{
                            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                            fontSize: 11, color: T.ink3, letterSpacing: '0.1em',
                        }}>
                            {SESSION_ID}
                        </span>
                    </div>
                </header>

                {/* ── Main ───────────────────────────────────────── */}
                <main style={{
                    position: 'relative', zIndex: 2,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 16px 32px',
                }}>
                    {/* Loading */}
                    {loading && (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: 16, color: T.ink3,
                            fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                            fontSize: 15,
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                border: `2px solid ${T.line2}`,
                                borderTopColor: T.accent,
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            جارٍ توليد المواضيع...
                        </div>
                    )}

                    {!loading && topic && (
                        <div style={{
                            width: '100%', maxWidth: 680,
                            animation: 'fadeUp 0.5s ease both',
                        }}>
                            {/* Topic card */}
                            <div className="home-card-inner" style={{
                                background: T.surface,
                                border: `1px solid ${T.line}`,
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                {/* Top accent line */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                                    background: `linear-gradient(90deg, transparent 0%, ${T.accent} 50%, transparent 100%)`,
                                    opacity: 0.8,
                                }} />

                                {/* Corner glow */}
                                <div style={{
                                    position: 'absolute', top: -60, right: -60,
                                    width: 220, height: 220, borderRadius: '50%',
                                    background: `radial-gradient(circle, ${T.accent}18 0%, transparent 70%)`,
                                    pointerEvents: 'none',
                                }} />

                                {/* Meta row */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    marginBottom: 28,
                                }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 7,
                                        padding: '5px 13px',
                                        border: `1px solid ${T.accent}4d`,
                                        borderRadius: 999,
                                        color: T.accent,
                                        background: `${T.accent}18`,
                                        fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                                        fontSize: 12, fontWeight: 600,
                                    }}>
                                        <span style={{
                                            width: 5, height: 5, borderRadius: '50%',
                                            background: T.accent, display: 'inline-block',
                                            boxShadow: `0 0 6px ${T.accent}`,
                                        }} />
                                        {topic.category.ar}
                                    </span>
                                    <span style={{
                                        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                        fontSize: 11, color: T.ink3, letterSpacing: '0.1em',
                                    }}>
                                        {String(topicIdx + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(total).padStart(2, '0')}
                                    </span>
                                </div>

                                {/* Topic label */}
                                <div style={{
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    fontSize: 10, color: T.ink3,
                                    letterSpacing: '0.18em', textTransform: 'uppercase',
                                    marginBottom: 10,
                                }}>
                                    TOPIC · موضوع اليوم
                                </div>

                                {/* Topic title */}
                                <h1 dir="rtl" style={{
                                    fontSize: 'clamp(22px, 4vw, 38px)',
                                    fontWeight: 700, lineHeight: 1.4,
                                    letterSpacing: '-0.01em',
                                    color: T.ink,
                                    margin: '0 0 28px',
                                }}>
                                    {topic.ar}
                                </h1>

                                {/* Divider */}
                                <div style={{ height: 1, background: T.line, marginBottom: 22 }} />

                                {/* Hints label */}
                                <div style={{
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    fontSize: 10, color: T.ink3,
                                    letterSpacing: '0.18em', textTransform: 'uppercase',
                                    marginBottom: 14,
                                }}>
                                    HINTS · أسئلة تساعدك
                                </div>

                                {/* Hints grid */}
                                <div className="hints-grid" style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    gap: 10, marginBottom: 32,
                                }}>
                                    {topic.hints.map((h, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '14px 16px',
                                                background: T.surface2,
                                                border: `1px solid ${T.line2}`,
                                                borderRadius: 12,
                                                display: 'flex', flexDirection: 'column', gap: 6,
                                                transition: 'border-color 0.2s, background 0.2s',
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLDivElement).style.borderColor = `${T.accent}66`;
                                                (e.currentTarget as HTMLDivElement).style.background = `${T.accent}0f`;
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLDivElement).style.borderColor = T.line2;
                                                (e.currentTarget as HTMLDivElement).style.background = T.surface2;
                                            }}
                                        >
                                            <span style={{
                                                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                                fontSize: 10, color: T.accent, letterSpacing: '0.2em',
                                            }}>
                                                0{i + 1}
                                            </span>
                                            <span dir="rtl" style={{
                                                fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                                                fontSize: 14, color: T.ink2, lineHeight: 1.6,
                                            }}>
                                                {h.ar}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="home-actions" style={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', gap: 12,
                                }}>
                                    <button
                                        className="home-shuffle-btn"
                                        onClick={shuffle}
                                        style={ghostBtnStyle}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = `${T.accent}66`;
                                            (e.currentTarget as HTMLButtonElement).style.color = T.ink;
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = T.line2;
                                            (e.currentTarget as HTMLButtonElement).style.color = T.ink2;
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" />
                                        </svg>
                                        موضوع آخر
                                    </button>
                                    <button
                                        className="home-start-btn-card"
                                        onClick={startSession}
                                        style={primaryBtnStyle}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 32px ${T.accent}66, 0 4px 16px rgba(0,0,0,0.3)`;
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 18px ${T.accent}44`;
                                        }}
                                    >
                                        ابدأ التسجيل
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Sticky start button — mobile only */}
                            <div className="home-sticky-bar">
                                <button
                                    onClick={startSession}
                                    style={primaryBtnStyle}
                                >
                                    ابدأ التسجيل
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

const baseBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 9,
    padding: '12px 22px', borderRadius: 10,
    border: `1px solid ${T.line2}`,
    background: 'transparent',
    color: T.ink2,
    fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
    fontSize: 15, fontWeight: 500, cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s, border-color 0.2s, color 0.2s',
};

const ghostBtnStyle: React.CSSProperties = {
    ...baseBtnStyle,
};

const primaryBtnStyle: React.CSSProperties = {
    ...baseBtnStyle,
    background: T.accent,
    color: T.accentInk,
    borderColor: T.accent,
    fontWeight: 700,
    boxShadow: `0 0 18px ${T.accent}44`,
};
