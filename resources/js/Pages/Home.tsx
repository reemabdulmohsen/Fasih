import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import TopBar from '@/Components/TopBar';
import { TOPICS } from '@/data/topics';
import type { Topic } from '@/types/fasih';

const SESSION_ID = 'A3B9F2';

export default function Home() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [topicIdx, setTopicIdx] = useState(0);

    useEffect(() => {
        fetch('/api/topics')
            .then(r => r.json())
            .then((data: Topic[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    setTopics(data);
                } else {
                    setTopics(TOPICS);
                }
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

    return (
        <>
            <Head title="فصيح" />

            <div className="page-wrap" style={{
                maxWidth: 1440, margin: '0 auto',
                minHeight: '100vh', padding: '28px 36px 60px',
            }}>
                <TopBar step="topic" session={SESSION_ID} />

                {loading && (
                    <div style={{
                        maxWidth: 880, margin: '40px auto',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', gap: 16, padding: '80px 0',
                        color: 'var(--ink-mute)', fontFamily: 'var(--f-ar)', fontSize: 15,
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            border: '2px solid var(--line)',
                            borderTopColor: 'var(--accent)',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        جارٍ توليد المواضيع...
                    </div>
                )}

                {!loading && topic && (
                <div style={{ animation: 'fadeUp 0.5s var(--e-out) both' }}>
                    <div className="home-card" style={{
                        maxWidth: 880, margin: '40px auto',
                        padding: '64px 56px',
                        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-raised) 100%)',
                        border: '1px solid var(--line)',
                        borderRadius: 14,
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Gold accent top line */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                            opacity: 0.4,
                        }} />

                        {/* Meta row: category badge + topic counter */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: 32,
                        }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '5px 10px',
                                border: '1px solid var(--line-2)',
                                borderRadius: 999,
                                color: 'var(--ink-dim)',
                                background: 'rgba(255,255,255,0.02)',
                            }}>
                                <span style={{
                                    width: 4, height: 4, borderRadius: '50%',
                                    background: 'var(--accent)', display: 'inline-block',
                                }} />
                                <span style={{ fontFamily: 'var(--f-ar)', fontSize: 12 }}>
                                    {topic.category.ar}
                                </span>
                            </div>
                            <span style={{ fontFamily: 'var(--f-ar)', fontSize: 13, color: 'var(--ink-mute)' }}>
                                الموضوع{' '}
                                <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--f-mono)' }}>
                                    {String(topicIdx + 1).padStart(2, '0')}
                                </span>
                                {' '}من {String(total).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Topic prompt */}
                        <div style={{ marginBottom: 32 }}>
                            <div style={{
                                fontFamily: 'var(--f-ar)', fontSize: 13,
                                color: 'var(--ink-mute)', marginBottom: 14,
                            }}>
                                موضوع اليوم
                            </div>
                            <h1 dir="rtl" className="home-title" style={{
                                fontFamily: 'var(--f-ar)', fontSize: 44, fontWeight: 500,
                                lineHeight: 1.35, color: 'var(--ink)',
                                margin: 0, letterSpacing: '-0.005em',
                            }}>
                                {topic.ar}
                            </h1>
                        </div>

                        {/* Hints */}
                        <div style={{
                            fontFamily: 'var(--f-ar)', fontSize: 13,
                            color: 'var(--ink-mute)', marginBottom: 14,
                        }}>
                            أسئلة تساعدك
                        </div>
                        <div className="hints-grid" style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: 10, marginBottom: 48,
                        }}>
                            {topic.hints.map((h, i) => (
                                <div key={i} style={{
                                    padding: '14px 18px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 8,
                                    display: 'flex', flexDirection: 'column', gap: 4,
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--f-mono)', fontSize: 10,
                                        color: 'var(--accent)', letterSpacing: '0.2em',
                                    }}>
                                        0{i + 1}
                                    </span>
                                    <span dir="rtl" style={{
                                        fontFamily: 'var(--f-ar)', fontSize: 16, color: 'var(--ink)',
                                    }}>
                                        {h.ar}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="home-actions" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 12, paddingTop: 28, borderTop: '1px solid var(--line)',
                        }}>
                            <button onClick={shuffle} style={ghostBtnStyle}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" />
                                </svg>
                                موضوع آخر
                            </button>
                            <button onClick={() => {
                                sessionStorage.setItem('fasih_topic', JSON.stringify(topic));
                                router.visit('/record');
                            }} style={primaryBtnStyle}>
                                ابدأ التسجيل
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}

const baseBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '13px 22px', borderRadius: 8,
    border: '1px solid var(--line-2)', background: 'var(--bg-card)',
    color: 'var(--ink)', fontFamily: 'var(--f-ar)',
    fontSize: 15, fontWeight: 500, cursor: 'pointer',
};

const ghostBtnStyle: React.CSSProperties = {
    ...baseBtnStyle, background: 'transparent', borderColor: 'var(--line)',
};

const primaryBtnStyle: React.CSSProperties = {
    ...baseBtnStyle,
    background: 'var(--accent)', color: '#0a0a0b',
    borderColor: 'var(--accent)', fontWeight: 600,
};
