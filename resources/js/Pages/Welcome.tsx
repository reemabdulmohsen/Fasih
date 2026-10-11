import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DiffRender from '@/Components/DiffRender';
import { TOPICS } from '@/data/topics';
import type { DiffSegment, Topic } from '@/types/fasih';

const SAMPLE_DIFF: DiffSegment[] = [
    { type: 'ok', text: 'استيقظتُ ' },
    { type: 'del', text: 'الساعة سبعة' },
    { type: 'ins', text: 'الساعة السابعة' },
    { type: 'ok', text: ' صباحًا، ثم ذهبتُ إلى العمل مع ' },
    { type: 'del', text: 'اصحابي' },
    { type: 'ins', text: 'أصحابي' },
    { type: 'ok', text: '.' },
];

function MicGlyph() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <path d="M12 18v3" />
        </svg>
    );
}

function ShuffleGlyph() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" />
        </svg>
    );
}

export default function Welcome() {
    const [topics, setTopics] = useState<Topic[]>(TOPICS);
    const [picked, setPicked] = useState(0);

    useEffect(() => {
        fetch('/api/topics')
            .then(r => r.json())
            .then((data: Topic[]) => { if (Array.isArray(data) && data.length > 0) setTopics(data); })
            .catch(() => { /* keep TOPICS fallback */ });
    }, []);

    const total = topics.length;
    const topic = topics[picked];

    const shuffle = () => {
        if (total <= 1) return;
        let next = Math.floor(Math.random() * total);
        if (next === picked) next = (next + 1) % total;
        setPicked(next);
    };

    const startRecording = () => {
        sessionStorage.setItem('fasih_topic', JSON.stringify(topic));
        router.visit('/record');
    };

    return (
        <>
            <Head title="فصيح — ابدأ التدريب" />

            <div dir="rtl" style={{ minHeight: '100vh', boxSizing: 'border-box', color: 'var(--ink)', fontFamily: 'var(--f-ar)', display: 'flex', flexDirection: 'column' }}>

                {/* ── Header ─────────────────────────────────── */}
                <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '22px 36px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px var(--accent-glow2)' }}>
                            <MicGlyph />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 20, color: 'var(--ink)' }}>فصيح</span>
                            <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>مدرّبك على الفصحى</span>
                        </div>
                    </div>
                    <a href="#account" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-dim)', textDecoration: 'none', padding: '10px 16px', borderRadius: 10, border: '1px solid var(--line-2)', background: 'var(--bg-card)', minHeight: 44, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center' }}>تسجيل الدخول</a>
                </header>

                <main style={{ width: '100%', maxWidth: 1180, margin: '0 auto', boxSizing: 'border-box', padding: '64px 24px 48px', display: 'flex', flexDirection: 'column', gap: 96 }}>

                    {/* ── Hero ───────────────────────────────── */}
                    <section style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
                        <div style={{ flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <h1 className="ar-flow fs-up" style={{ animationDelay: '.05s', margin: 0, fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 'clamp(34px, 5.5vw, 60px)', lineHeight: 1.3, color: 'var(--ink)' }}>
                                تكلّم دقيقتين، واعرف أين <span className="ar-mark">تتعثّر</span>
                            </h1>
                            <p className="fs-up" style={{ animationDelay: '.18s', margin: 0, fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.8, color: 'var(--ink-dim)', maxWidth: 520 }}>
                                اختر موضوعًا وتحدّث بالفصحى. يكتب فصيح كلامك ويصحّحه كلمةً كلمة، ثم يعطيك تقريرًا عن الطلاقة والمفردات والقواعد.
                            </p>
                            <div className="fs-up" style={{ animationDelay: '.3s', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                                <a href="#topics" className="fs-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '0 28px', borderRadius: 10, background: 'var(--accent)', color: 'var(--bg)', fontWeight: 700, fontSize: 17, textDecoration: 'none', boxShadow: '0 0 18px var(--accent-glow2)' }}>
                                    اختر موضوعك
                                    <svg aria-hidden="true" className="fs-nudge" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </a>
                                <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>بلا حساب · دقيقتان · تقرير فوري</span>
                            </div>
                        </div>

                        <aside aria-label="مثال من تقرير" className="fs-up" style={{ animationDelay: '.45s', flex: '1 1 400px', minWidth: 0, background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>هكذا يبدو التصحيح</span>
                            <div style={{ background: 'var(--bg-raised)', borderRadius: 16, padding: '18px 22px' }}>
                                <DiffRender segments={SAMPLE_DIFF} />
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span aria-hidden="true" style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: 'var(--fix-bg)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
                                <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-dim)' }}>«الساعة السابعة» بدل «الساعة سبعة»: الساعة تُذكَر بالعدد الترتيبي المعرَّف.</p>
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span aria-hidden="true" style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: 'var(--fix-bg)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
                                <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-dim)' }}>«أصحابي» بهمزة القطع، لأنّ مفردها «صاحِب».</p>
                            </div>
                        </aside>
                    </section>

                    {/* ── Steps ──────────────────────────────── */}
                    <section aria-labelledby="steps-title" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
                            <h2 id="steps-title" style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.35 }}>
                                من الفكرة إلى <span className="ar-mark">التقرير</span>
                            </h2>
                            <p style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--ink-dim)' }}>ثلاث محطّات، وأقلّ من خمس دقائق.</p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div aria-hidden="true" className="fs-line" style={{ position: 'absolute', top: 28, right: '16%', left: '16%', borderTop: '2px dashed var(--line-2)' }} />
                            <ol style={{ position: 'relative', listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

                                <li className="fs-reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
                                    <span className="fs-pop" style={{ animationDelay: '.2s', width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 28, boxShadow: '0 0 0 8px var(--bg), 0 0 18px var(--accent-glow2)' }}>١</span>
                                    <div aria-hidden="true" style={{ position: 'relative', width: '100%', maxWidth: 300, height: 190, background: 'var(--bg-raised)', borderRadius: 18, overflow: 'hidden' }}>
                                        <div className="fs-fan-l" style={{ position: 'absolute', top: 44, right: '50%', width: 170, marginRight: -85, padding: '14px 16px', boxSizing: 'border-box', background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 14, transform: 'rotate(-9deg) translateX(-46px)', textAlign: 'right', fontSize: 13, color: 'var(--ink-dim)' }}>مدينتك بعد عشر سنوات</div>
                                        <div className="fs-fan-r" style={{ position: 'absolute', top: 44, right: '50%', width: 170, marginRight: -85, padding: '14px 16px', boxSizing: 'border-box', background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 14, transform: 'rotate(8deg) translateX(46px)', textAlign: 'right', fontSize: 13, color: 'var(--ink-dim)' }}>كتاب غيّر رأيك</div>
                                        <div className="fs-float" style={{ position: 'absolute', top: 58, right: '50%', width: 180, marginRight: -90, padding: '16px 18px', boxSizing: 'border-box', background: 'var(--bg-card)', border: '2px solid var(--accent)', borderRadius: 14, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: '0 0 18px var(--accent-glow2)' }}>
                                            <span style={{ fontSize: 12, color: 'var(--accent)' }}>حياة يومية</span>
                                            <span style={{ fontSize: 14, color: 'var(--ink)' }}>رحلة لا تُنسى</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <span style={{ fontSize: 18, fontWeight: 700 }}>اختر موضوعًا</span>
                                        <span style={{ fontSize: 14, color: 'var(--ink-dim)' }}>من البطاقات، أو دع فصيح يختار لك.</span>
                                    </div>
                                </li>

                                <li className="fs-reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
                                    <span className="fs-pop" style={{ animationDelay: '.5s', width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 28, boxShadow: '0 0 0 8px var(--bg), 0 0 18px var(--accent-glow2)' }}>٢</span>
                                    <div aria-hidden="true" style={{ width: '100%', maxWidth: 300, height: 190, background: 'var(--bg-raised)', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                                        <div style={{ position: 'relative', width: 64, height: 64 }}>
                                            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent-glow)', animation: 'fsPulse 1.8s ease-out infinite' }} />
                                            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MicGlyph />
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 32 }}>
                                            {[-0.1, -0.5, -0.3, -0.8, -0.2, -0.6, -0.4, -0.9, -0.7].map((delay, i) => (
                                                <span key={i} style={{ width: 4, height: 32, borderRadius: 2, background: 'var(--accent)', animation: 'fsWave 1s ease-in-out infinite', animationDelay: `${delay}s` }} />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: 'var(--ink-dim)' }}>٠١:٤٢ / ٠٢:٠٠</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <span style={{ fontSize: 18, fontWeight: 700 }}>تكلّم دقيقتين</span>
                                        <span style={{ fontSize: 14, color: 'var(--ink-dim)' }}>ترى كلامك مكتوبًا وأنت تتحدّث.</span>
                                    </div>
                                </li>

                                <li className="fs-reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
                                    <span className="fs-pop" style={{ animationDelay: '.8s', width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 28, boxShadow: '0 0 0 8px var(--bg), 0 0 18px var(--accent-glow2)' }}>٣</span>
                                    <div aria-hidden="true" style={{ width: '100%', maxWidth: 300, height: 190, boxSizing: 'border-box', padding: '22px 24px', background: 'var(--bg-raised)', borderRadius: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
                                        {[
                                            { label: 'الطلاقة', pct: 82, color: 'var(--accent)', delay: '.9s' },
                                            { label: 'المفردات', pct: 64, color: 'var(--fix)', delay: '1s' },
                                            { label: 'القواعد', pct: 45, color: 'var(--err)', delay: '1.1s' },
                                            { label: 'الصلة', pct: 90, color: 'var(--accent)', delay: '1.2s' },
                                        ].map(row => (
                                            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ width: 64, textAlign: 'right', fontSize: 13, color: 'var(--ink-dim)' }}>{row.label}</span>
                                                <span style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--line)' }}>
                                                    <span className="fs-bar" style={{ animationDelay: row.delay, display: 'block', width: `${row.pct}%`, height: '100%', borderRadius: 999, background: row.color }} />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <span style={{ fontSize: 18, fontWeight: 700 }}>اقرأ تقريرك</span>
                                        <span style={{ fontSize: 14, color: 'var(--ink-dim)' }}>أربع مهارات، ونصّك مصحّحًا كلمةً كلمة.</span>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* ── Topics ─────────────────────────────── */}
                    <section id="topics" aria-labelledby="topics-title" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <h2 id="topics-title" style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.35 }}>
                                    عن ماذا <span className="ar-mark">ستتحدّث</span>؟
                                </h2>
                                <p style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--ink-dim)' }}>كل بطاقة سؤال يفتح لك الكلام.</p>
                            </div>
                            <button type="button" onClick={shuffle} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid var(--line-2)', background: 'var(--bg-card)', color: 'var(--ink-dim)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <ShuffleGlyph />
                                اختر لي
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                            {topics.map((t, i) => {
                                const on = i === picked;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        className="fs-topic fs-up fs-reveal"
                                        onClick={() => setPicked(i)}
                                        aria-pressed={on}
                                        style={{
                                            animationDelay: `${i * 80}ms`,
                                            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
                                            minHeight: 140, padding: '20px 22px', boxSizing: 'border-box', textAlign: 'right',
                                            fontFamily: 'var(--f-ar)', borderRadius: 16, cursor: 'pointer',
                                            transition: 'transform .2s var(--e-out), box-shadow .2s',
                                            background: 'var(--bg-card)',
                                            border: on ? '2px solid var(--accent)' : '2px solid var(--line)',
                                            boxShadow: on ? '0 0 18px var(--accent-glow2)' : 'none',
                                            transform: on ? 'translateY(-4px)' : 'none',
                                        }}
                                    >
                                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: on ? 'var(--accent)' : 'var(--bg-raised)', color: on ? 'var(--bg)' : 'var(--ink-dim)' }}>
                                            {t.category.ar}
                                        </span>
                                        <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, lineHeight: 1.4, color: 'var(--ink)' }}>
                                            {t.ar}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 24px', borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--line)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                                <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>موضوعك</span>
                                <span style={{ fontSize: 18, fontWeight: 700 }}>{topic?.ar}</span>
                            </div>
                            <button type="button" className="fs-cta fs-breathe" onClick={startRecording} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 52, padding: '0 28px', border: 0, borderRadius: 10, background: 'var(--accent)', color: 'var(--bg)', fontWeight: 700, fontSize: 17, cursor: 'pointer', fontFamily: 'inherit' }}>
                                ابدأ التسجيل
                                <svg aria-hidden="true" className="fs-dot" viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="6" fill="currentColor" /></svg>
                            </button>
                        </div>
                    </section>

                    {/* ── Account ────────────────────────────── */}
                    <section id="account" className="fs-reveal" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '28px 32px', borderRadius: 18, background: 'var(--bg-raised)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 360px', minWidth: 0 }}>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>احفظ تقدّمك</h2>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-dim)' }}>بعد أوّل تقرير، أنشئ حسابًا لتتابع درجاتك من جلسة إلى أخرى وترجع إلى تصحيحاتك السابقة.</p>
                        </div>
                        <a href="#account" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 20px', borderRadius: 10, border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--bg-card)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>أنشئ حسابًا</a>
                    </section>
                </main>

                <footer style={{ marginTop: 'auto', padding: '28px 24px', textAlign: 'center', fontSize: 13, color: 'var(--ink-dim)' }}>فصيح · مدرّبك على الفصحى</footer>
            </div>
        </>
    );
}
