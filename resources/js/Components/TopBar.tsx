import { useEffect, useState } from 'react';
import Stepper, { type StepId } from '@/Components/Stepper';

interface TopBarProps {
    step: StepId;
    session: string;
}

function MoonIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

export default function TopBar({ step, session }: TopBarProps) {
    const [theme, setTheme] = useState<'dark' | 'light'>('light');

    useEffect(() => {
        const saved = localStorage.getItem('fasih_theme') as 'dark' | 'light' | null;
        if (saved) {
            setTheme(saved);
            if (saved === 'dark') {
                document.documentElement.dataset.theme = 'dark';
            } else {
                delete document.documentElement.dataset.theme;
            }
        }
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('fasih_theme', next);
        if (next === 'dark') {
            document.documentElement.dataset.theme = 'dark';
        } else {
            delete document.documentElement.dataset.theme;
        }
    };

    return (
        <div className="topbar" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 32,
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 36, height: 36,
                    border: '1.5px solid var(--accent)',
                    borderRadius: 10,
                    display: 'grid', placeItems: 'center',
                    fontSize: 17,
                    background: 'var(--accent-glow2)',
                    boxShadow: '0 0 12px var(--accent-glow)',
                    flexShrink: 0,
                }}>
                    🗣️
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                    <span style={{ fontFamily: 'var(--f-ar)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                        استوديو المحادثة
                    </span>
                    <span style={{
                        fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-mute)',
                        textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 2,
                    }}>
                        Arabic Speaking Coach
                    </span>
                </div>
            </div>

            <div className="topbar-stepper">
                <Stepper step={step} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="topbar-session" style={{
                    fontFamily: 'var(--f-mono)', fontSize: 10,
                    color: 'var(--ink-mute)', letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                    الجلسة · <span style={{ color: 'var(--accent)' }}>{session}</span>
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                    style={{
                        width: 32, height: 32,
                        display: 'grid', placeItems: 'center',
                        border: '1px solid var(--line-2)',
                        borderRadius: 8,
                        background: 'transparent',
                        color: 'var(--ink-mute)',
                        cursor: 'pointer',
                        transition: 'color 0.2s, border-color 0.2s',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-mute)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line-2)';
                    }}
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </div>
    );
}
