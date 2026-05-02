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
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--f-ar)', fontSize: 13,
            color: 'var(--ink-mute)',
        }}>
            {STEPS.map((s, i) => (
                <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                            display: 'inline-block',
                            width: i === idx ? 20 : 6,
                            height: 6,
                            borderRadius: 3,
                            background: i === idx
                                ? 'var(--accent)'
                                : i < idx
                                    ? 'var(--ink-mute)'
                                    : 'var(--line-2)',
                            boxShadow: i === idx ? '0 0 8px var(--accent-glow)' : 'none',
                            transition: 'width 0.35s var(--e-spring), background 0.3s, box-shadow 0.3s',
                        }} />
                        <span style={{
                            color: i === idx ? 'var(--ink)' : i < idx ? 'var(--ink-mute)' : 'var(--ink-faint)',
                            transition: 'color 0.3s',
                            letterSpacing: 0,
                        }}>
                            {s.ar}
                        </span>
                    </span>
                    {i < STEPS.length - 1 && (
                        <span style={{ color: 'var(--line-2)', fontSize: 11 }}>·</span>
                    )}
                </span>
            ))}
        </div>
    );
}
