import Stepper, { type StepId } from '@/Components/Stepper';

interface TopBarProps {
    step: StepId;
    session: string;
}

export default function TopBar({ step, session }: TopBarProps) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: 24, borderBottom: '1px solid var(--line)', marginBottom: 36,
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 34, height: 34, border: '1.5px solid var(--accent)',
                    borderRadius: 8, display: 'grid', placeItems: 'center',
                    fontSize: 18, color: 'var(--accent)', background: 'rgba(240,182,74,0.05)',
                }}>
                    🗣️
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                    <span style={{ fontFamily: 'var(--f-ar)', fontSize: 17, fontWeight: 500 }}>
                        استوديو المحادثة
                    </span>
                    <span style={{
                        fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-mute)',
                        textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: 3,
                    }}>
                        Arabic Speaking Coach
                    </span>
                </div>
            </div>

            <Stepper step={step} />

            <div style={{
                fontFamily: 'var(--f-mono)', fontSize: 11,
                color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
                الجلسة · <span style={{ color: 'var(--ink-dim)' }}>{session}</span>
            </div>
        </div>
    );
}
