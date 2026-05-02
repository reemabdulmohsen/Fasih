import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import TopBar from '@/Components/TopBar';
import type { Analysis } from '@/types/fasih';

const SESSION_ID = 'A3B9F2';

const SCORE_LABEL: Record<number, string> = {
    1: 'ضعيف جداً',
    2: 'ضعيف',
    3: 'متوسط',
    4: 'جيد جداً',
    5: 'ممتاز',
};

const SCORE_COLOR: Record<number, string> = {
    1: 'var(--err)',
    2: '#e07c3a',
    3: '#c9a227',
    4: '#5bab6e',
    5: 'var(--fix)',
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

    // ── Ring geometry ─────────────────────────────────────────────────
    const ringR = 64;
    const ringC = 2 * Math.PI * ringR;
    const ringProgress = analysis ? analysis.weighted_total / 5 : 0;
    const ringOff = ringC * (1 - ringProgress);

    // ── Dimensions ────────────────────────────────────────────────────
    const dimensions = analysis
        ? [
              { ar: 'الحجة',   weight: '40%', score: analysis.hujja.score,         explanation: analysis.hujja.explanation },
              { ar: 'النطق',   weight: '25%', score: analysis.pronunciation.score,  explanation: analysis.pronunciation.explanation },
              { ar: 'الخطاب',  weight: '20%', score: analysis.discourse.score,      explanation: analysis.discourse.explanation },
              { ar: 'الطلاقة', weight: '15%', score: analysis.fluency.score,        explanation: analysis.fluency.explanation },
          ]
        : [];

    // ── Loading / error states ────────────────────────────────────────
    if (!analysis && !error) {
        return (
            <>
                <Head title="التقرير — فصيح" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                    <span style={{ fontFamily: 'var(--f-ar)', fontSize: 17, color: 'var(--ink-mute)', animation: 'pulse 1.2s ease-in-out infinite' }}>
                        جارٍ تحميل التقرير…
                    </span>
                </div>
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            </>
        );
    }

    if (error || !analysis) {
        return (
            <>
                <Head title="التقرير — فصيح" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 20 }}>
                    <span style={{ fontFamily: 'var(--f-ar)', fontSize: 17, color: 'var(--err)' }}>
                        لم يُعثر على نتائج جلسة. يرجى تسجيل جلسة جديدة.
                    </span>
                    <button onClick={() => router.visit('/home')} style={footerBtnStyle}>
                        ابدأ من جديد →
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="التقرير — فصيح" />

            <div className="page-wrap" style={{ maxWidth: 1440, margin: '0 auto', minHeight: '100vh', padding: '28px 36px 60px' }}>
                <TopBar step="report" session={SESSION_ID} />

                <div style={{ maxWidth: 1120, margin: '0 auto', animation: 'fadeUp 0.5s var(--e-out) both' }}>

                    {/* ── Hero ── */}
                    <div className="report-hero" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 40, padding: '36px 8px 32px',
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--f-ar)', fontSize: 13, color: 'var(--ink-mute)', marginBottom: 16 }}>
                                تقريرك
                            </div>
                            <h1 dir="rtl" className="report-hero-title" style={{
                                fontFamily: 'var(--f-ar)', fontSize: 38, fontWeight: 500,
                                margin: '0 0 10px', letterSpacing: '-0.01em',
                            }}>
                                {heroTitle(analysis.weighted_total)}
                            </h1>
                            <p dir="rtl" style={{
                                fontFamily: 'var(--f-ar)', fontSize: 15,
                                color: 'var(--ink-mute)', margin: 0, fontWeight: 300,
                                maxWidth: 540, lineHeight: 1.7,
                            }}>
                                {analysis.overall_summary}
                            </p>
                        </div>

                        {/* Overall ring */}
                        <div className="report-hero-ring" style={{ width: 140, height: 140, flexShrink: 0, position: 'relative' }}>
                            <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx={70} cy={70} r={ringR} strokeWidth={3} fill="none" stroke="var(--line)" strokeLinecap="round" />
                                <circle
                                    cx={70} cy={70} r={ringR} strokeWidth={3} fill="none"
                                    stroke="var(--accent)" strokeLinecap="round"
                                    strokeDasharray={ringC} strokeDashoffset={ringOff}
                                />
                            </svg>
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{
                                    fontFamily: 'var(--f-mono)', fontSize: 38,
                                    fontWeight: 500, color: 'var(--ink)',
                                    fontVariantNumeric: 'tabular-nums',
                                }}>
                                    {analysis.weighted_total.toFixed(1)}
                                </span>
                                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
                                    من 5
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Metrics strip ── */}
                    <div className="report-metrics" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
                        padding: '20px 0', marginBottom: 36,
                    }}>
                        {dimensions.map((d, i) => (
                            <div key={i} className="report-metric-item" style={{
                                padding: '0 24px',
                                borderInlineStart: i === 0 ? 'none' : '1px solid var(--line)',
                                paddingInlineStart: i === 0 ? 8 : undefined,
                                paddingInlineEnd: i === dimensions.length - 1 ? 8 : undefined,
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'baseline',
                                    justifyContent: 'space-between', marginBottom: 10,
                                }}>
                                    <span style={{ fontFamily: 'var(--f-ar)', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
                                        {d.ar}
                                    </span>
                                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-faint)' }}>
                                        {d.weight}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ flex: 1, height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{
                                            width: (d.score / 5 * 100) + '%', height: '100%',
                                            background: SCORE_COLOR[d.score], borderRadius: 2,
                                            transition: 'width 0.6s var(--e-out)',
                                        }} />
                                    </div>
                                    <span style={{
                                        fontFamily: 'var(--f-mono)', fontSize: 15,
                                        color: SCORE_COLOR[d.score],
                                        fontVariantNumeric: 'tabular-nums',
                                        minWidth: 12, textAlign: 'end', fontWeight: 600,
                                    }}>
                                        {d.score}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Detail cards ── */}
                    <div className="report-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>

                        {/* الحجة */}
                        <DetailCard title="الحجة" score={analysis.hujja.score} explanation={analysis.hujja.explanation}>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                                <CheckBadge label="فكرة مركزية" checked={analysis.hujja.claim_identified} />
                                <CheckBadge label="أدلة وشواهد"  checked={analysis.hujja.evidence_found} />
                                <CheckBadge label="خاتمة منطقية" checked={analysis.hujja.has_conclusion} />
                            </div>
                        </DetailCard>

                        {/* النطق */}
                        <DetailCard title="النطق" score={analysis.pronunciation.score} explanation={analysis.pronunciation.explanation}>
                            {analysis.pronunciation.errors.length > 0 && (
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ fontFamily: 'var(--f-ar)', fontSize: 12, color: 'var(--ink-mute)', marginBottom: 8 }}>
                                        أخطاء ملاحظة:
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {analysis.pronunciation.errors.map((err, i) => (
                                            <span key={i} style={{
                                                fontFamily: 'var(--f-ar)', fontSize: 13,
                                                padding: '3px 10px', borderRadius: 6,
                                                background: 'rgba(var(--err-rgb, 220,53,69), 0.1)',
                                                border: '1px solid var(--err)', color: 'var(--err)',
                                            }}>
                                                {err}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </DetailCard>

                        {/* الخطاب */}
                        <DetailCard title="الخطاب" score={analysis.discourse.score} explanation={analysis.discourse.explanation}>
                            {analysis.discourse.filler_count > 0 && (
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ fontFamily: 'var(--f-ar)', fontSize: 12, color: 'var(--ink-mute)', marginBottom: 8 }}>
                                        كلمات الحشو ({analysis.discourse.filler_count} مرة):
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {analysis.discourse.filler_words.map((w, i) => (
                                            <span key={i} style={{
                                                fontFamily: 'var(--f-ar)', fontSize: 13,
                                                padding: '3px 10px', borderRadius: 6,
                                                background: 'rgba(240,182,74,0.1)',
                                                border: '1px solid var(--accent)', color: 'var(--accent)',
                                            }}>
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </DetailCard>

                        {/* الطلاقة */}
                        <DetailCard title="الطلاقة" score={analysis.fluency.score} explanation={analysis.fluency.explanation}>
                            {analysis.fluency.long_pauses_count > 0 && (
                                <div style={{ marginTop: 14, fontFamily: 'var(--f-ar)', fontSize: 13, color: 'var(--ink-mute)' }}>
                                    توقفات طويلة ({'>'} 1.5 ث): {' '}
                                    <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--ink)', fontWeight: 600 }}>
                                        {analysis.fluency.long_pauses_count}
                                    </span>
                                </div>
                            )}
                        </DetailCard>
                    </div>

                    {/* ── Topic relevance ── */}
                    <div style={{
                        background: analysis.topic_relevance.on_topic
                            ? 'rgba(91,171,110,0.06)'
                            : 'rgba(220,53,69,0.06)',
                        border: `1px solid ${analysis.topic_relevance.on_topic ? 'var(--fix)' : 'var(--err)'}`,
                        borderRadius: 12, padding: '20px 28px', marginBottom: 32,
                        display: 'flex', alignItems: 'flex-start', gap: 20,
                    }}>
                        <div style={{ flexShrink: 0, marginTop: 2 }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 32, height: 32, borderRadius: '50%',
                                background: analysis.topic_relevance.on_topic ? 'var(--fix)' : 'var(--err)',
                                color: '#fff', fontSize: 16, fontWeight: 700,
                            }}>
                                {analysis.topic_relevance.on_topic ? '✓' : '✗'}
                            </span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
                            }}>
                                <span style={{ fontFamily: 'var(--f-ar)', fontSize: 15, fontWeight: 500 }}>
                                    الصلة بالموضوع
                                </span>
                                <span style={{
                                    fontFamily: 'var(--f-ar)', fontSize: 12,
                                    padding: '2px 10px', borderRadius: 20,
                                    background: SCORE_COLOR[analysis.topic_relevance.score] + '22',
                                    border: `1px solid ${SCORE_COLOR[analysis.topic_relevance.score]}`,
                                    color: SCORE_COLOR[analysis.topic_relevance.score], fontWeight: 600,
                                }}>
                                    {analysis.topic_relevance.score}/5 · {SCORE_LABEL[analysis.topic_relevance.score]}
                                </span>
                            </div>
                            <p dir="rtl" style={{
                                fontFamily: 'var(--f-ar)', fontSize: 14,
                                color: 'var(--ink-mute)', lineHeight: 1.75, margin: 0,
                            }}>
                                {analysis.topic_relevance.explanation}
                            </p>
                        </div>
                    </div>

                    {/* ── Flags ── */}
                    {analysis.flags.length > 0 && (
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--line)',
                            borderRadius: 12, padding: '24px 28px', marginBottom: 32,
                        }}>
                            <div style={{ fontFamily: 'var(--f-ar)', fontSize: 15, fontWeight: 500, marginBottom: 16 }}>
                                أبرز النقاط للتحسين
                            </div>
                            <ul dir="rtl" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {analysis.flags.map((flag, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>←</span>
                                        <span style={{ fontFamily: 'var(--f-ar)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>
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
                        marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--line)',
                    }}>
                        <button onClick={() => router.visit('/home')} style={footerBtnStyle}>
                            موضوع جديد →
                        </button>
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

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailCard({ title, score, explanation, children }: {
    title: string;
    score: 1 | 2 | 3 | 4 | 5;
    explanation: string;
    children?: React.ReactNode;
}) {
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--line)',
            borderRadius: 12, padding: '24px 28px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--f-ar)', fontSize: 16, fontWeight: 500 }}>{title}</span>
                <span style={{
                    fontFamily: 'var(--f-ar)', fontSize: 12,
                    padding: '3px 10px', borderRadius: 20,
                    background: SCORE_COLOR[score] + '22',
                    border: `1px solid ${SCORE_COLOR[score]}`,
                    color: SCORE_COLOR[score], fontWeight: 600,
                }}>
                    {score}/5 · {SCORE_LABEL[score]}
                </span>
            </div>
            <p dir="rtl" style={{
                fontFamily: 'var(--f-ar)', fontSize: 14,
                color: 'var(--ink-mute)', lineHeight: 1.75,
                margin: 0,
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
            fontFamily: 'var(--f-ar)', fontSize: 12,
            padding: '3px 10px', borderRadius: 20,
            background: checked ? 'rgba(91,171,110,0.12)' : 'rgba(220,53,69,0.08)',
            border: `1px solid ${checked ? 'var(--fix)' : 'var(--err)'}`,
            color: checked ? 'var(--fix)' : 'var(--err)',
        }}>
            {checked ? '✓' : '✗'} {label}
        </span>
    );
}

const footerBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '13px 22px', borderRadius: 8,
    border: '1px solid var(--line)', background: 'transparent',
    color: 'var(--ink)', fontFamily: 'var(--f-ar)',
    fontSize: 15, fontWeight: 500, cursor: 'pointer',
};
