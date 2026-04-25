import { Head } from '@inertiajs/react';
import { useState } from 'react';
import TopBar from '@/Components/TopBar';
import FeedbackCard from '@/Components/FeedbackCard';
import DiffRender from '@/Components/DiffRender';
import { MOCK_FEEDBACK } from '@/data/mockFeedback';
import { TOPICS } from '@/data/topics';

const SESSION_ID = 'A3B9F2';

type Tab = 'feedback' | 'transcript';

export default function Report() {
    const [tab, setTab] = useState<Tab>('feedback');
    const feedback = MOCK_FEEDBACK;
    const topic = TOPICS[0];
    const s = feedback.scores;

    const metrics = [s.fluency, s.vocab, s.grammar, s.relevance];

    // Overall ring
    const ringR = 64;
    const ringC = 2 * Math.PI * ringR;
    const ringOff = ringC * (1 - feedback.overall / 100);

    return (
        <>
            <Head title="التقرير — فصيح" />

            <div style={{
                maxWidth: 1440, margin: '0 auto',
                minHeight: '100vh', padding: '28px 36px 60px',
            }}>
                <TopBar step="report" session={SESSION_ID} />

                <div style={{ maxWidth: 1120, margin: '0 auto', animation: 'fadeUp 0.5s var(--e-out) both' }}>

                    {/* ── Hero ── */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 40, padding: '36px 8px 32px',
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontFamily: 'var(--f-ar)', fontSize: 13,
                                color: 'var(--ink-mute)', marginBottom: 16,
                            }}>
                                تقريرك
                            </div>
                            <h1 dir="rtl" style={{
                                fontFamily: 'var(--f-ar)', fontSize: 38, fontWeight: 500,
                                margin: '0 0 8px', letterSpacing: '-0.01em',
                            }}>
                                أداء قويّ — استمرّ
                            </h1>
                            <p dir="rtl" style={{
                                fontFamily: 'var(--f-ar)', fontSize: 15,
                                color: 'var(--ink-mute)', margin: 0, fontWeight: 300,
                            }}>
                                لقد قدّمتَ أداءً لافتًا في هذه الجلسة
                            </p>
                        </div>

                        {/* Overall ring */}
                        <div style={{ width: 140, height: 140, flexShrink: 0, position: 'relative' }}>
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
                                    {feedback.overall}
                                </span>
                                <span style={{
                                    fontFamily: 'var(--f-mono)', fontSize: 11,
                                    color: 'var(--ink-mute)',
                                }}>
                                    من 100
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Metrics strip ── */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
                        padding: '20px 0', marginBottom: 36,
                    }}>
                        {metrics.map((m, i) => (
                            <div key={i} style={{
                                padding: '0 24px',
                                borderInlineStart: i === 0 ? 'none' : '1px solid var(--line)',
                                paddingInlineStart: i === 0 ? 8 : undefined,
                                paddingInlineEnd: i === metrics.length - 1 ? 8 : undefined,
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'baseline',
                                    justifyContent: 'space-between', marginBottom: 10,
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--f-ar)', fontSize: 14,
                                        color: 'var(--ink)', fontWeight: 500,
                                    }}>
                                        {m.label.ar}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        flex: 1, height: 4, background: 'var(--line)',
                                        borderRadius: 2, overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: m.value + '%', height: '100%',
                                            background: 'var(--accent)', borderRadius: 2,
                                        }} />
                                    </div>
                                    <span style={{
                                        fontFamily: 'var(--f-mono)', fontSize: 15,
                                        color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
                                        minWidth: 24, textAlign: 'end',
                                    }}>
                                        {m.value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Tabs ── */}
                    <div style={{
                        display: 'flex', gap: 4,
                        borderBottom: '1px solid var(--line)',
                        marginBottom: 28, padding: '0 8px',
                    }}>
                        {([
                            { id: 'feedback' as Tab,    ar: 'الملاحظات' },
                            { id: 'transcript' as Tab,  ar: 'النصّ والتّصحيح' },
                        ]).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                style={{
                                    display: 'inline-flex', alignItems: 'baseline', gap: 10,
                                    padding: '14px 20px',
                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                    color: tab === t.id ? 'var(--ink)' : 'var(--ink-mute)',
                                    borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                                    marginBottom: -1,
                                    fontFamily: 'var(--f-ar)', fontSize: 16, fontWeight: 500,
                                    transition: 'color 0.2s, border-color 0.2s',
                                }}
                            >
                                {t.ar}
                            </button>
                        ))}
                    </div>

                    {/* ── Feedback cards ── */}
                    {tab === 'feedback' && (
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 20, marginTop: 4,
                        }}>
                            <FeedbackCard kind="strengths" data={feedback.cards.strengths} />
                            <FeedbackCard kind="improve"   data={feedback.cards.improve} />
                            <FeedbackCard kind="mistakes"  data={feedback.cards.mistakes} />
                        </div>
                    )}

                    {/* ── Diff / transcript tab ── */}
                    {tab === 'transcript' && (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--line)',
                            borderRadius: 12,
                            padding: 40,
                        }}>
                            <DiffRender segments={feedback.diff} />
                        </div>
                    )}

                    {/* ── Follow-ups ── */}
                    <div style={{
                        background: 'transparent',
                        border: '1px solid var(--line)',
                        borderRadius: 12,
                        padding: 28,
                        marginTop: 36,
                    }}>
                        {/* Head */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 20,
                        }}>
                            <div>
                                <div style={{
                                    fontFamily: 'var(--f-ar)', fontSize: 13,
                                    color: 'var(--ink-mute)', marginBottom: 8,
                                }}>
                                    الجولة التّالية
                                </div>
                                <div style={{
                                    fontFamily: 'var(--f-ar)', fontSize: 18, fontWeight: 500,
                                }}>
                                    أسئلة متابعة من كلامك
                                </div>
                            </div>
                            <button style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '13px 22px', borderRadius: 8,
                                background: 'var(--accent)', color: '#0a0a0b',
                                border: '1px solid var(--accent)',
                                fontFamily: 'var(--f-ar)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                            }}>
                                أجب عن الأسئلة
                            </button>
                        </div>

                        {/* Follow-up list */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {feedback.followUps.map((q, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: 20, alignItems: 'flex-start',
                                    padding: '14px 0',
                                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--f-mono)', fontSize: 12,
                                        color: 'var(--accent)', letterSpacing: '0.16em',
                                        flexShrink: 0, paddingTop: 2,
                                    }}>
                                        0{i + 1}
                                    </span>
                                    <div dir="rtl" style={{
                                        fontFamily: 'var(--f-ar)', fontSize: 16,
                                        color: 'var(--ink)', lineHeight: 1.55,
                                    }}>
                                        {q.ar}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div style={{
                        display: 'flex', justifyContent: 'flex-start',
                        marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--line)',
                    }}>
                        <button style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            padding: '13px 22px', borderRadius: 8,
                            border: '1px solid var(--line)', background: 'transparent',
                            color: 'var(--ink)', fontFamily: 'var(--f-ar)',
                            fontSize: 15, fontWeight: 500, cursor: 'pointer',
                        }}>
                            موضوع جديد →
                        </button>
                    </div>

                    {/* Unused but needed for context: topic shown on report */}
                    <div style={{ display: 'none' }}>{topic.ar}</div>
                </div>
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
