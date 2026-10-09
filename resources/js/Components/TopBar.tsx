import { useEffect, useState } from 'react';
import type { StepId } from '@/Components/Stepper';

interface TopBarProps {
    step: StepId;
    session: string;
}

const STEPS: { id: StepId; ar: string; n: string }[] = [
    { id: 'topic',  ar: 'الموضوع', n: '١' },
    { id: 'record', ar: 'التسجيل', n: '٢' },
    { id: 'report', ar: 'التقرير', n: '٣' },
];

function readTheme(): 'dark' | 'light' | null {
    try { return localStorage.getItem('fasih_theme') as 'dark' | 'light' | null; } catch { return null; }
}
function applyTheme(t: 'dark' | 'light') {
    try { localStorage.setItem('fasih_theme', t); } catch { /* storage blocked */ }
    if (t === 'dark') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
}

function MicGlyph() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <path d="M12 18v3" />
        </svg>
    );
}
function MoonIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}
function SunIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

export default function TopBar({ step, session }: TopBarProps) {
    const [theme, setTheme] = useState<'dark' | 'light'>(() =>
        typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    const [hover, setHover] = useState(false);
    const idx = STEPS.findIndex(s => s.id === step);

    useEffect(() => {
        const saved = readTheme();
        if (saved) { setTheme(saved); applyTheme(saved); }
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        applyTheme(next);
    };

    return (
        <header className="topbar" dir="rtl" style={{
            display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16,
            padding: '0 0 18px', borderBottom: '1px solid var(--line)', marginBottom: 32,
            fontFamily: 'var(--f-ar)',
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'start' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'var(--accent)', color: 'var(--bg)',
                    display: 'grid', placeItems: 'center',
                    boxShadow: '0 0 18px var(--accent-glow2)',
                }}>
                    <MicGlyph />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 900, lineHeight: 1.1, color: 'var(--ink)' }}>
                        فصيح
                    </span>
                    <span style={{ fontSize: 12, lineHeight: 1.2, color: 'var(--ink-dim)' }}>
                        استوديو المحادثة
                    </span>
                </div>
            </div>

            {/* Steps: segmented control */}
            <nav className="topbar-stepper" aria-label="مراحل الجلسة" style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: 4,
                background: 'var(--bg-raised)', border: '1px solid var(--line)', borderRadius: 999,
            }}>
                {STEPS.map((s, i) => {
                    const active = i === idx, done = i < idx;
                    return (
                        <span key={s.id} aria-current={active ? 'step' : undefined} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 14px 6px 12px', borderRadius: 999,
                            background: active ? 'var(--bg-card)' : 'transparent',
                            boxShadow: active ? '0 1px 2px rgba(15,21,48,0.08), 0 0 0 1px var(--line)' : 'none',
                            color: active ? 'var(--ink)' : done ? 'var(--ink-dim)' : 'var(--ink-mute)',
                            fontSize: 13, fontWeight: active ? 700 : 500,
                            transition: 'background 0.3s var(--e-out), color 0.3s',
                        }}>
                            <span style={{
                                width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center',
                                fontSize: 12, fontWeight: 700, lineHeight: 1,
                                background: active ? 'var(--accent)' : done ? 'var(--accent-glow2)' : 'transparent',
                                color: active ? 'var(--bg)' : done ? 'var(--accent)' : 'var(--ink-mute)',
                                border: active || done ? 'none' : '1px solid var(--line-2)',
                            }}>
                                {done ? '✓' : s.n}
                            </span>
                            {s.ar}
                        </span>
                    );
                })}
            </nav>

            {/* Session + theme */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifySelf: 'end' }}>
                <div className="topbar-session" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, height: 36,
                    padding: '0 14px', borderRadius: 999, border: '1px solid var(--line)',
                    background: 'var(--bg-card)', fontSize: 13, color: 'var(--ink-dim)',
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fix)' }} />
                    الجلسة
                    <span dir="ltr" style={{ fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.06em' }}>
                        {session}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={toggleTheme}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    aria-label={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                    title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                    style={{
                        width: 36, height: 36, display: 'grid', placeItems: 'center', flexShrink: 0,
                        borderRadius: 999, cursor: 'pointer',
                        border: `1px solid ${hover ? 'var(--accent)' : 'var(--line)'}`,
                        background: 'var(--bg-card)',
                        color: hover ? 'var(--accent)' : 'var(--ink-dim)',
                        transition: 'color 0.2s, border-color 0.2s',
                    }}
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </header>
    );
}
