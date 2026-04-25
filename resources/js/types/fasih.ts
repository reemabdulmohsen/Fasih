export interface Topic {
    id: string;
    ar: string;
    en: string;
    category: { ar: string; en: string };
    hints: { ar: string; en: string }[];
}

export type DiffSegmentType = 'ok' | 'del' | 'ins';

export interface DiffSegment {
    type: DiffSegmentType;
    text: string;
}

export interface ScoreItem {
    value: number;
    label: { ar: string; en: string };
}

export interface FeedbackCardData {
    title: { ar: string; en: string };
    items: { ar: string; en: string }[];
}

export interface Feedback {
    transcript: string;
    diff: DiffSegment[];
    scores: {
        fluency: ScoreItem;
        vocab: ScoreItem;
        grammar: ScoreItem;
        relevance: ScoreItem;
    };
    overall: number;
    cards: {
        strengths: FeedbackCardData;
        improve: FeedbackCardData;
        mistakes: FeedbackCardData;
    };
    followUps: { ar: string; en: string }[];
}
