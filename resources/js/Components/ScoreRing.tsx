interface ScoreRingProps {
    value: number;
    arLabel: string;
}

export default function ScoreRing({ value, arLabel }: ScoreRingProps) {
    const r = 26;
    const c = 2 * Math.PI * r;
    const off = c * (1 - value / 100);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 58, height: 58, position: 'relative', flexShrink: 0 }}>
                <svg width={58} height={58} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={29} cy={29} r={r} strokeWidth={3} fill="none" stroke="var(--line)" strokeLinecap="round" />
                    <circle
                        cx={29} cy={29} r={r} strokeWidth={3} fill="none"
                        stroke="var(--accent)" strokeLinecap="round"
                        strokeDasharray={c} strokeDashoffset={off}
                    />
                </svg>
                <div style={{
                    position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--f-mono)', fontSize: 14, color: 'var(--ink)',
                    fontVariantNumeric: 'tabular-nums',
                }}>
                    {value}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500, fontFamily: 'var(--f-ar)' }}>
                    {arLabel}
                </span>
            </div>
        </div>
    );
}
