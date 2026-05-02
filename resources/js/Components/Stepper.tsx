export type StepId = 'topic' | 'record' | 'report' | 'review' | 'final';

const STEPS: { id: StepId; ar: string }[] = [
    { id: 'report', ar: 'التقرير'  },
    { id: 'record', ar: 'التسجيل'  },
    { id: 'topic',  ar: 'الموضوع'  },
];

export default function Stepper({ step }: { step: StepId }) {
    const idx = STEPS.findIndex(s => s.id === step);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--f-mono)', fontSize: 11,
            color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.16em',
        }}>
            {STEPS.map((s, i) => (
                <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                        background: i === idx ? 'var(--accent)' : i < idx ? 'var(--ink-dim)' : 'var(--line-2)',
                        transition: 'background 0.3s',
                    }} />
                    <span style={{
                        color: i === idx ? 'var(--ink)' : i < idx ? 'var(--ink-dim)' : 'var(--ink-faint)',
                        fontFamily: 'var(--f-ar)', fontSize: 13,
                        letterSpacing: 0, textTransform: 'none',
                    }}>
                        {s.ar}
                    </span>
                    {i < STEPS.length - 1 && (
                        <span style={{ color: 'var(--ink-faint)' }}>—</span>
                    )}
                </span>
            ))}
        </div>
    );
}
