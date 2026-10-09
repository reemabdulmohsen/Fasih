import type { FeedbackCardData } from '@/types/fasih';

type CardKind = 'strengths' | 'improve' | 'mistakes';

const CONFIG = {
    strengths: {
        ch: '✓',
        topLine: 'var(--fix)',
        border: 'color-mix(in srgb, var(--fix) 20%, transparent)',
        bg: 'linear-gradient(160deg, color-mix(in srgb, var(--fix) 6%, transparent) 0%, var(--bg-card) 60%)',
        iconBg: 'var(--fix-bg)',
        iconColor: 'var(--fix)',
        itemBorder: 'color-mix(in srgb, var(--fix) 30%, transparent)',
    },
    improve: {
        ch: '!',
        topLine: 'var(--accent)',
        border: 'color-mix(in srgb, var(--accent) 20%, transparent)',
        bg: 'linear-gradient(160deg, color-mix(in srgb, var(--accent) 7%, transparent) 0%, var(--bg-card) 60%)',
        iconBg: 'color-mix(in srgb, var(--accent) 15%, transparent)',
        iconColor: 'var(--accent)',
        itemBorder: 'color-mix(in srgb, var(--accent) 30%, transparent)',
    },
    mistakes: {
        ch: '×',
        topLine: 'var(--err)',
        border: 'color-mix(in srgb, var(--err) 20%, transparent)',
        bg: 'linear-gradient(160deg, color-mix(in srgb, var(--err) 6%, transparent) 0%, var(--bg-card) 60%)',
        iconBg: 'var(--err-bg)',
        iconColor: 'var(--err)',
        itemBorder: 'color-mix(in srgb, var(--err) 30%, transparent)',
    },
} as const;

interface FeedbackCardProps {
    kind: CardKind;
    data: FeedbackCardData;
}

export default function FeedbackCard({ kind, data }: FeedbackCardProps) {
    const cfg = CONFIG[kind];

    return (
        <div style={{
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: 14,
            padding: '24px 22px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Top accent line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 2, background: cfg.topLine, opacity: 0.6,
            }} />

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                paddingBottom: 12, borderBottom: '1px solid var(--line)', marginBottom: 14,
            }}>
                <span style={{
                    width: 24, height: 24, display: 'grid', placeItems: 'center',
                    borderRadius: '50%', background: cfg.iconBg, color: cfg.iconColor,
                    fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                    {cfg.ch}
                </span>
                <span style={{ fontFamily: 'var(--f-ar)', fontSize: 16, fontWeight: 500 }}>
                    {data.title.ar}
                </span>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.items.map((item, i) => (
                    <div key={i} style={{
                        paddingInlineStart: 14,
                        borderInlineStart: `2px solid ${cfg.itemBorder}`,
                    }}>
                        <div dir="rtl" style={{
                            fontFamily: 'var(--f-ar)', fontSize: 14,
                            lineHeight: 1.75, color: 'var(--ink)',
                        }}>
                            {item.ar}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
