interface RingProps {
    size: number;
    stroke: number;
    progress: number; // 0–1
    warn?: boolean;
    children?: React.ReactNode;
}

export default function Ring({ size, stroke, progress, warn = false, children }: RingProps) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(1, progress));
    const off = c * (1 - clamped);

    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    strokeWidth={stroke} fill="none"
                    stroke="var(--line)" strokeLinecap="round"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    strokeWidth={stroke} fill="none"
                    stroke={warn ? 'var(--err)' : 'var(--accent)'}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={off}
                    style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
                />
            </svg>
            {children && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                    {children}
                </div>
            )}
        </div>
    );
}
