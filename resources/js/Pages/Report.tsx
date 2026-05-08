import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { Analysis } from '@/types/fasih';



const T = {
    bg: 'var(--bg)',
    surface: 'var(--bg-card)',
    surface2: 'var(--bg-raised)',
    line: 'var(--line)',
    line2: 'var(--line-2)',
    ink: 'var(--ink)',
    ink2: 'var(--ink-dim)',
    ink3: 'var(--ink-mute)',
    accent: 'var(--accent)',
    accentInk: 'var(--bg)',
    ok: 'var(--fix)',
    warn: 'var(--ink-mute)',
    danger: 'var(--err)',
} as const;

const SCORE_COLOR: Record<number, string> = {
    1: T.danger,
    2: 'color-mix(in srgb, var(--err) 55%, var(--accent))',
    3: T.warn,
    4: T.ok,
    5: T.accent,
};

const SCORE_LABEL: Record<number, string> = {
    1: 'ضعيف جداً',
    2: 'ضعيف',
    3: 'متوسط',
    4: 'جيد جداً',
    5: 'ممتاز',
};

function heroTitle(total: number): string {
    if (total >= 4.5) return 'أداء ممتاز — رائع';
    if (total >= 3.5) return 'أداء قويّ — استمرّ';
    if (total >= 2.5) return 'أداء جيّد — واصل التحسين';
    return 'تحتاج إلى مزيد من التدريب';
}

export default function Report() {
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem('fasih_analysis');
        if (raw) {
            try { setAnalysis(JSON.parse(raw)); }
            catch { setError(true); }
        } else {
            setError(true);
        }
    }, []);

    const ringR = 62;
    const ringC = 2 * Math.PI * ringR;
    const ringProgress = analysis ? analysis.weighted_total / 5 : 0;
    const ringOff = ringC * (1 - ringProgress);

    const dimensions = analysis
        ? [
              { ar: 'الحجة',   weight: '40%', score: analysis.hujja.score,        explanation: analysis.hujja.explanation },
              { ar: 'النطق',   weight: '25%', score: analysis.pronunciation.score, explanation: analysis.pronunciation.explanation },
              { ar: 'الخطاب',  weight: '20%', score: analysis.discourse.score,     explanation: analysis.discourse.explanation },
              { ar: 'الطلاقة', weight: '15%', score: analysis.fluency.score,       explanation: analysis.fluency.explanation },
          ]
        : [];

    const shell = (content: React.ReactNode) => (
        <>
            <Head title="التقرير — فصيح" />
            <div dir="rtl" style={{
                minHeight: '100vh',
                background: T.bg,
                color: T.ink,
                fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
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
                    background: 'radial-gradient(closest-side, var(--accent-glow2), transparent 70%)',
                    filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
                    opacity: 0.18,
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {content}
                </div>
            </div>
        </>
    );

    if (!analysis && !error) {
        return shell(
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '100vh', gap: 16,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: `2.5px solid ${T.line}`,
                    borderTopColor: T.accent,
                    animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif', fontSize: 16, color: T.ink3 }}>
                    جارٍ تحميل التقرير…
                </span>
            </div>
        );
    }

    if (error || !analysis) {
        return shell(
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '100vh', gap: 20, padding: '0 24px',
            }}>
                <span style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif', fontSize: 16, color: T.danger, textAlign: 'center' }}>
                    لم يُعثر على نتائج جلسة. يرجى تسجيل جلسة جديدة.
                </span>
                <button onClick={() => router.visit('/home')} style={ghostBtnStyle}>
                    ابدأ من جديد
                    <ChevronLeft />
                </button>
            </div>
        );
    }

    return shell(
        <>
            {/* ── Header ── */}
            <header className="report-header" style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                borderBottom: `1px solid ${T.line}`,
                background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
                backdropFilter: 'blur(12px)',
                position: 'sticky', top: 0, zIndex: 10,
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

              
              
            </header>

            {/* ── Content ── */}
            <div className="report-content">

                {/* ── Hero ── */}
                <div className="report-hero">
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                            fontSize: 10, color: T.accent,
                            textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 14,
                        }}>
                            تقرير الجلسة 
                        </div>
                        <h1 dir="rtl" style={{
                            fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                            fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700,
                            margin: '0 0 12px', letterSpacing: '-0.015em',
                            color: T.ink, lineHeight: 1.25,
                        }}>
                            {heroTitle(analysis.weighted_total)}
                        </h1>
                        <p dir="rtl" style={{
                            fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                            fontSize: 15, color: T.ink3, margin: 0,
                            fontWeight: 300, maxWidth: 480, lineHeight: 1.8,
                        }}>
                            {analysis.overall_summary}
                        </p>
                    </div>

                    {/* Overall ring */}
                    <div className="report-hero-ring">
                        <svg width="100%" height="100%" viewBox="0 0 138 138" style={{
                            transform: 'rotate(-90deg)',
                            filter: 'drop-shadow(0 0 16px var(--accent-glow))',
                        }}>
                            <circle cx={69} cy={69} r={ringR} strokeWidth={4} fill="none"
                                stroke={'color-mix(in srgb, var(--accent) 10%, transparent)'} strokeLinecap="round" />
                            <circle
                                cx={69} cy={69} r={ringR} strokeWidth={4} fill="none"
                                stroke={T.accent} strokeLinecap="round"
                                strokeDasharray={ringC} strokeDashoffset={ringOff}
                                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{
                                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                fontSize: 36, fontWeight: 600, color: T.ink,
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {analysis.weighted_total.toFixed(1)}
                            </span>
                            <span style={{
                                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                fontSize: 10, color: T.ink3, letterSpacing: '0.1em',
                            }}>
                                من 5
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Metrics strip ── */}
                <div className="report-metrics" style={{
                    background: T.surface, border: `1px solid ${T.line}`,
                }}>
                    {dimensions.map((d, i) => (
                        <div key={i} className="report-metric-item" style={{
                            borderInlineStart: i === 0 ? 'none' : `1px solid ${T.line}`,
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'baseline',
                                justifyContent: 'space-between', marginBottom: 12,
                            }}>
                                <span style={{
                                    fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                                    fontSize: 13, color: T.ink, fontWeight: 500,
                                }}>
                                    {d.ar}
                                </span>
                                <span style={{
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    fontSize: 10, color: T.ink3,
                                }}>
                                    {d.weight}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    flex: 1, height: 3,
                                    background: T.line2, borderRadius: 2, overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: (d.score / 5 * 100) + '%', height: '100%',
                                        background: SCORE_COLOR[d.score], borderRadius: 2,
                                        transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                                        boxShadow: `0 0 8px color-mix(in srgb, ${SCORE_COLOR[d.score]} 55%, transparent)`,
                                    }} />
                                </div>
                                <span style={{
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    fontSize: 14, color: SCORE_COLOR[d.score],
                                    fontVariantNumeric: 'tabular-nums',
                                    minWidth: 12, textAlign: 'end', fontWeight: 700,
                                }}>
                                    {d.score}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Detail cards ── */}
                <div className="report-cards">
                    <DetailCard title="الحجة" score={analysis.hujja.score} explanation={analysis.hujja.explanation}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                            <CheckBadge label="فكرة مركزية" checked={analysis.hujja.claim_identified} />
                            <CheckBadge label="أدلة وشواهد"  checked={analysis.hujja.evidence_found} />
                            <CheckBadge label="خاتمة منطقية" checked={analysis.hujja.has_conclusion} />
                        </div>
                    </DetailCard>

                    <DetailCard title="النطق" score={analysis.pronunciation.score} explanation={analysis.pronunciation.explanation}>
                        {analysis.pronunciation.errors.length > 0 && (
                            <div style={{ marginTop: 14 }}>
                                <div style={{
                                    fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                                    fontSize: 11, color: T.ink3, marginBottom: 8,
                                }}>
                                    أخطاء ملاحظة:
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {analysis.pronunciation.errors.map((err, i) => (
                                        <span key={i} style={{
                                            fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                                            fontSize: 12, padding: '3px 10px', borderRadius: 6,
                                            background: 'color-mix(in srgb, var(--err) 10%, transparent)',
                                            border: '1px solid color-mix(in srgb, var(--err) 25%, transparent)',
                                            color: T.danger,
                                        }}>
                                            {err}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DetailCard>

                    <DetailCard title="الخطاب" score={analysis.discourse.score} explanation={analysis.discourse.explanation}>
                        {analysis.discourse.filler_count > 0 && (
                            <div style={{ marginTop: 14 }}>
                                <div style={{
                                    fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                                    fontSize: 11, color: T.ink3, marginBottom: 8,
                                }}>
                                    كلمات الحشو ({analysis.discourse.filler_count} مرة):
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {analysis.discourse.filler_words.map((w, i) => (
                                        <span key={i} style={{
                                            fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                                            fontSize: 12, padding: '3px 10px', borderRadius: 6,
                                            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                                            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                                            color: T.accent,
                                        }}>
                                            {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DetailCard>

                    <DetailCard title="الطلاقة" score={analysis.fluency.score} explanation={analysis.fluency.explanation}>
                        {analysis.fluency.long_pauses_count > 0 && (
                            <div style={{
                                marginTop: 14, fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                                fontSize: 13, color: T.ink3, lineHeight: 1.6,
                            }}>
                                توقفات طويلة ({'>'} 1.5 ث):{' '}
                                <span style={{
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    color: T.ink, fontWeight: 600,
                                }}>
                                    {analysis.fluency.long_pauses_count}
                                </span>
                            </div>
                        )}
                    </DetailCard>
                </div>

                {/* ── Topic relevance ── */}
                <div style={{
                    background: T.surface,
                    border: `1px solid ${analysis.topic_relevance.on_topic
                        ? 'color-mix(in srgb, var(--fix) 25%, transparent)'
                        : 'color-mix(in srgb, var(--err) 25%, transparent)'}`,
                    borderRadius: 16, padding: '20px 24px', marginBottom: 20,
                    display: 'flex', alignItems: 'flex-start', gap: 18,
                }}>
                    <div style={{ flexShrink: 0 }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36, borderRadius: '50%',
                            background: analysis.topic_relevance.on_topic
                                ? 'color-mix(in srgb, var(--fix) 14%, transparent)'
                                : 'color-mix(in srgb, var(--err) 14%, transparent)',
                            border: `1px solid ${analysis.topic_relevance.on_topic
                                ? 'color-mix(in srgb, var(--fix) 35%, transparent)'
                                : 'color-mix(in srgb, var(--err) 35%, transparent)'}`,
                            color: analysis.topic_relevance.on_topic ? T.ok : T.danger,
                            fontSize: 16, fontWeight: 700,
                        }}>
                            {analysis.topic_relevance.on_topic ? '✓' : '✗'}
                        </span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                            flexWrap: 'wrap',
                        }}>
                            <span style={{
                                fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                                fontSize: 15, fontWeight: 600, color: T.ink,
                            }}>
                                الصلة بالموضوع
                            </span>
                            <span style={{
                                fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                                fontSize: 12, padding: '2px 10px', borderRadius: 999,
                                background: `color-mix(in srgb, ${SCORE_COLOR[analysis.topic_relevance.score]} 10%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${SCORE_COLOR[analysis.topic_relevance.score]} 25%, transparent)`,
                                color: SCORE_COLOR[analysis.topic_relevance.score], fontWeight: 600,
                            }}>
                                {analysis.topic_relevance.score}/5 · {SCORE_LABEL[analysis.topic_relevance.score]}
                            </span>
                        </div>
                        <p dir="rtl" style={{
                            fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                            fontSize: 14, color: T.ink3, lineHeight: 1.8, margin: 0,
                        }}>
                            {analysis.topic_relevance.explanation}
                        </p>
                    </div>
                </div>

                {/* ── Flags ── */}
                {analysis.flags.length > 0 && (
                    <div style={{
                        background: T.surface, border: `1px solid ${T.line}`,
                        borderRadius: 16, padding: '22px 24px', marginBottom: 32,
                    }}>
                        <div style={{
                            fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                            fontSize: 14, fontWeight: 600,
                            marginBottom: 16, color: T.ink,
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{
                                width: 22, height: 22,
                                display: 'grid', placeItems: 'center',
                                borderRadius: '50%',
                                background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                                fontSize: 12, color: T.accent,
                            }}>!</span>
                            أبرز النقاط للتحسين
                        </div>
                        <ul dir="rtl" style={{
                            margin: 0, padding: 0, listStyle: 'none',
                            display: 'flex', flexDirection: 'column', gap: 10,
                        }}>
                            {analysis.flags.map((flag, i) => (
                                <li key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    paddingBottom: i < analysis.flags.length - 1 ? 10 : 0,
                                    borderBottom: i < analysis.flags.length - 1 ? `1px solid ${T.line}` : 'none',
                                }}>
                                    <span style={{
                                        color: T.accent, fontWeight: 700,
                                        flexShrink: 0, marginTop: 2, fontSize: 14,
                                    }}>›</span>
                                    <span style={{
                                        fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                                        fontSize: 14, color: T.ink, lineHeight: 1.65,
                                    }}>
                                        {flag}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Footer ── */}
                <div style={{
                    display: 'flex', justifyContent: 'flex-start',
                    paddingTop: 24, borderTop: `1px solid ${T.line}`,
                }}>
                    <button
                        onClick={() => router.visit('/home')}
                        style={ghostBtnStyle}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = T.accent;
                            (e.currentTarget as HTMLButtonElement).style.color = T.accent;
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = T.line;
                            (e.currentTarget as HTMLButtonElement).style.color = T.ink;
                        }}
                    >
                        موضوع جديد
                        <ChevronLeft />
                    </button>
                </div>

            </div>
        </>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DetailCard({ title, score, explanation, children }: {
    title: string;
    score: 1 | 2 | 3 | 4 | 5;
    explanation: string;
    children?: React.ReactNode;
}) {
    return (
        <div style={{
            background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: 16, padding: '20px 22px',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Score-colored top strip */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: SCORE_COLOR[score], opacity: 0.7,
            }} />
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12,
            }}>
                <span style={{
                    fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                    fontSize: 15, fontWeight: 600, color: T.ink,
                }}>
                    {title}
                </span>
                <span style={{
                    fontFamily: '"IBM Plex Sans Arabic", sans-serif',
                    fontSize: 11, padding: '3px 10px', borderRadius: 999,
                    background: `color-mix(in srgb, ${SCORE_COLOR[score]} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${SCORE_COLOR[score]} 25%, transparent)`,
                    color: SCORE_COLOR[score], fontWeight: 600,
                }}>
                    {score}/5 · {SCORE_LABEL[score]}
                </span>
            </div>
            <p dir="rtl" style={{
                fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
                fontSize: 14, color: T.ink3, lineHeight: 1.8, margin: 0,
            }}>
                {explanation}
            </p>
            {children}
        </div>
    );
}

function CheckBadge({ label, checked }: { label: string; checked: boolean }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: '"IBM Plex Sans Arabic", sans-serif', fontSize: 12,
            padding: '4px 10px', borderRadius: 999,
            background: checked
                ? 'color-mix(in srgb, var(--fix) 10%, transparent)'
                : 'color-mix(in srgb, var(--err) 10%, transparent)',
            border: `1px solid ${checked
                ? 'color-mix(in srgb, var(--fix) 25%, transparent)'
                : 'color-mix(in srgb, var(--err) 25%, transparent)'}`,
            color: checked ? T.ok : T.danger,
        }}>
            {checked ? '✓' : '✗'} {label}
        </span>
    );
}

function ChevronLeft() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: 'rotate(180deg)' }}>
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

const ghostBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '11px 22px', borderRadius: 10,
    border: `1px solid ${T.line}`, background: 'transparent',
    color: T.ink, fontFamily: '"IBM Plex Sans Arabic", "Readex Pro", sans-serif',
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
};
