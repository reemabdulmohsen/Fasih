interface ScoreRingProps {
    value: number;
    arLabel: string;
}

export default function ScoreRing({ value, arLabel }: ScoreRingProps) {
    const r = 26;
    const c = 2 * Math.PI * r;
    const off = c * (1 - value / 100);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 58, height: 58, position: 'relative', flexShrink: 0 }}>
                <svg
                    width={58} height={58}
                    style={{
                        transform: 'rotate(-90deg)',
                        filter: 'drop-shadow(0 0 6px var(--accent-glow))',
                    }}
                >
                    <circle cx={29} cy={29} r={r} strokeWidth={3} fill="none"
                        stroke="rgba(124,109,233,0.12)" strokeLinecap="round" />
                    <circle
                        cx={29} cy={29} r={r} strokeWidth={3} fill="none"
                        stroke="var(--accent)" strokeLinecap="round"
                        strokeDasharray={c} strokeDashoffset={off}
                        style={{ transition: 'stroke-dashoffset 0.8s var(--e-out)' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink)',
                    fontVariantNumeric: 'tabular-nums', fontWeight: 500,
                }}>
                    {value}
                </div>
            </div>
            <span style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500, fontFamily: 'var(--f-ar)' }}>
                {arLabel}
            </span>
        </div>
    );
}
