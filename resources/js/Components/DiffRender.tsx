import type { DiffSegment } from '@/types/fasih';

export default function DiffRender({ segments }: { segments: DiffSegment[] }) {
    return (
        <div dir="rtl" style={{
            fontFamily: 'var(--f-ar)', fontSize: 19, lineHeight: 2.1, color: 'var(--ink)',
        }}>
            {segments.map((seg, i) => {
                if (seg.type === 'ok') return <span key={i}>{seg.text}</span>;
                if (seg.type === 'del') return (
                    <span key={i} style={{
                        color: 'var(--err)', background: 'var(--err-bg)',
                        textDecoration: 'line-through', padding: '2px 6px',
                        borderRadius: 4, margin: '0 1px',
                    }}>
                        {seg.text}
                    </span>
                );
                if (seg.type === 'ins') return (
                    <span key={i} style={{
                        color: 'var(--fix)', background: 'var(--fix-bg)',
                        padding: '2px 6px', borderRadius: 4, margin: '0 1px',
                    }}>
                        {seg.text}
                    </span>
                );
                return null;
            })}
        </div>
    );
}
