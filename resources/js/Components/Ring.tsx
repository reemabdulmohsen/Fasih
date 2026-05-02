interface RingProps {
    size: number;
    stroke: number;
    progress: number; // 0–1
    warn?: boolean;
    glow?: boolean;
    children?: React.ReactNode;
}

export default function Ring({ size, stroke, progress, warn = false, glow = false, children }: RingProps) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(1, progress));
    const off = c * (1 - clamped);
    const trackColor = warn ? 'rgba(239,106,92,0.15)' : 'rgba(124,109,233,0.12)';
    const strokeColor = warn ? 'var(--err)' : 'var(--accent)';
    const glowFilter = warn
        ? 'drop-shadow(0 0 6px rgba(239,106,92,0.5))'
        : 'drop-shadow(0 0 8px var(--accent-glow))';

    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <svg
                width={size} height={size}
                style={{
                    transform: 'rotate(-90deg)',
                    filter: glow ? glowFilter : undefined,
                    transition: 'filter 0.4s',
                }}
            >
                {/* Track */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    strokeWidth={stroke} fill="none"
                    stroke={trackColor} strokeLinecap="round"
                />
                {/* Progress */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    strokeWidth={stroke} fill="none"
                    stroke={strokeColor}
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
