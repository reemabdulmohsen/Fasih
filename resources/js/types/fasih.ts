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

export interface WordTimestamp {
    word: string;
    start: number;
    end: number;
}

export interface Analysis {
    hujja: {
        score: 1 | 2 | 3 | 4 | 5;
        claim_identified: boolean;
        evidence_found: boolean;
        has_conclusion: boolean;
        explanation: string;
    };
    pronunciation: {
        score: 1 | 2 | 3 | 4 | 5;
        errors: string[];
        explanation: string;
    };
    discourse: {
        score: 1 | 2 | 3 | 4 | 5;
        filler_count: number;
        filler_words: string[];
        explanation: string;
    };
    fluency: {
        score: 1 | 2 | 3 | 4 | 5;
        long_pauses_count: number;
        explanation: string;
    };
    weighted_total: number;
    overall_summary: string;
    topic_relevance: {
        score: 1 | 2 | 3 | 4 | 5;
        on_topic: boolean;
        explanation: string;
    };
    flags: string[];
}
