import type { FeedbackCardData } from '@/types/fasih';

type CardKind = 'strengths' | 'improve' | 'mistakes';

const CONFIG = {
    strengths: {
        ch: '✓',
        topLine: 'var(--fix)',
        border: 'rgba(90,184,160,0.2)',
        bg: 'linear-gradient(160deg, rgba(90,184,160,0.06) 0%, var(--bg-card) 60%)',
        iconBg: 'var(--fix-bg)',
        iconColor: 'var(--fix)',
        itemBorder: 'rgba(90,184,160,0.3)',
    },
    improve: {
        ch: '!',
        topLine: 'var(--accent)',
        border: 'rgba(124,109,233,0.2)',
        bg: 'linear-gradient(160deg, rgba(124,109,233,0.07) 0%, var(--bg-card) 60%)',
        iconBg: 'rgba(124,109,233,0.15)',
        iconColor: 'var(--accent)',
        itemBorder: 'rgba(124,109,233,0.3)',
    },
    mistakes: {
        ch: '×',
        topLine: 'var(--err)',
        border: 'rgba(239,106,92,0.2)',
        bg: 'linear-gradient(160deg, rgba(239,106,92,0.06) 0%, var(--bg-card) 60%)',
        iconBg: 'var(--err-bg)',
        iconColor: 'var(--err)',
        itemBorder: 'rgba(239,106,92,0.3)',
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
