import type { FeedbackCardData } from '@/types/fasih';

type CardKind = 'strengths' | 'improve' | 'mistakes';

const CONFIG = {
    strengths: {
        ch: '✓',
        topLine: 'var(--fix)',
        border: 'rgba(124,192,138,0.25)',
        bg: 'linear-gradient(180deg, rgba(124,192,138,0.06) 0%, var(--bg-card) 60%)',
        iconBg: 'var(--fix-bg)',
        iconColor: 'var(--fix)',
        itemBorder: 'rgba(124,192,138,0.35)',
    },
    improve: {
        ch: '!',
        topLine: 'var(--accent)',
        border: 'rgba(240,182,74,0.25)',
        bg: 'linear-gradient(180deg, rgba(240,182,74,0.06) 0%, var(--bg-card) 60%)',
        iconBg: 'rgba(240,182,74,0.14)',
        iconColor: 'var(--accent)',
        itemBorder: 'rgba(240,182,74,0.35)',
    },
    mistakes: {
        ch: '×',
        topLine: 'var(--err)',
        border: 'rgba(239,106,92,0.25)',
        bg: 'linear-gradient(180deg, rgba(239,106,92,0.06) 0%, var(--bg-card) 60%)',
        iconBg: 'var(--err-bg)',
        iconColor: 'var(--err)',
        itemBorder: 'rgba(239,106,92,0.35)',
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
            borderRadius: 12,
            padding: '26px 24px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Top accent line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 2, background: cfg.topLine, opacity: 0.7,
            }} />

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingBottom: 14, borderBottom: '1px solid var(--line)', marginBottom: 16,
            }}>
                <span style={{
                    width: 22, height: 22, display: 'grid', placeItems: 'center',
                    borderRadius: '50%', background: cfg.iconBg, color: cfg.iconColor,
                    fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 600, flexShrink: 0,
                }}>
                    {cfg.ch}
                </span>
                <span style={{ fontFamily: 'var(--f-ar)', fontSize: 17, fontWeight: 500 }}>
                    {data.title.ar}
                </span>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.items.map((item, i) => (
                    <div key={i} style={{
                        paddingInlineStart: 16,
                        borderInlineStart: `2px solid ${cfg.itemBorder}`,
                    }}>
                        <div dir="rtl" style={{
                            fontFamily: 'var(--f-ar)', fontSize: 14.5,
                            lineHeight: 1.7, color: 'var(--ink)',
                        }}>
                            {item.ar}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
