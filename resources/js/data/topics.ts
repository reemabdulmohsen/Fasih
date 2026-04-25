import type { Topic } from '@/types/fasih';

export const TOPICS: Topic[] = [
    {
        id: 't1',
        ar: 'صِف يومك المثاليّ من الصباح حتى المساء',
        en: 'Describe your ideal day from morning until evening',
        category: { ar: 'الحياة اليوميّة', en: 'Daily life' },
        hints: [
            { ar: 'في أيّ ساعة تستيقظ؟', en: 'What time do you wake up?' },
            { ar: 'ما الطعام الذي تتناوله؟', en: 'What food do you eat?' },
            { ar: 'مع من تقضي الوقت؟', en: 'Who do you spend time with?' },
            { ar: 'كيف تنتهي ليلتك؟', en: 'How does your night end?' },
        ],
    },
    {
        id: 't2',
        ar: 'تحدَّث عن هدف تسعى لتحقيقه هذه السنة',
        en: 'Talk about a goal you are pursuing this year',
        category: { ar: 'الأهداف', en: 'Goals' },
        hints: [
            { ar: 'لماذا هذا الهدف بالذات؟', en: 'Why this goal specifically?' },
            { ar: 'ما الخطوات التي اتخذتها؟', en: 'What steps have you taken?' },
            { ar: 'ما العقبات التي تواجهها؟', en: 'What obstacles do you face?' },
            { ar: 'كيف ستحتفل بإنجازه؟', en: 'How will you celebrate?' },
        ],
    },
    {
        id: 't3',
        ar: 'هل غيّر الذكاء الاصطناعيّ حياتك اليوميّة؟',
        en: 'Has AI changed your daily life?',
        category: { ar: 'التكنولوجيا', en: 'Technology' },
        hints: [
            { ar: 'أيّ أدوات تستخدم؟', en: 'Which tools do you use?' },
            { ar: 'ماذا أصبح أسهل؟', en: 'What became easier?' },
            { ar: 'ما الذي يُقلقك؟', en: 'What worries you?' },
            { ar: 'كيف ترى المستقبل؟', en: 'How do you see the future?' },
        ],
    },
    {
        id: 't4',
        ar: 'احكِ عن عيد أو مناسبة تحبّها في ثقافتك',
        en: 'Tell about a holiday or occasion you love in your culture',
        category: { ar: 'الثقافة', en: 'Culture' },
        hints: [
            { ar: 'ما الطقوس الخاصّة؟', en: 'What rituals are special?' },
            { ar: 'أيّ طعام يُحضَّر؟', en: 'What food is prepared?' },
            { ar: 'مع من تحتفل؟', en: 'With whom do you celebrate?' },
            { ar: 'ذكرى لا تُنسى من هذا العيد', en: 'An unforgettable memory' },
        ],
    },
    {
        id: 't5',
        ar: 'صِف مكانًا زُرتَه وتركَ فيك أثرًا',
        en: 'Describe a place you visited that left an impression',
        category: { ar: 'الذاكرة', en: 'Memory' },
        hints: [
            { ar: 'متى ذهبتَ إلى هناك؟', en: 'When did you go?' },
            { ar: 'ماذا رأيت؟', en: 'What did you see?' },
            { ar: 'أيّ شعور تملَّكك؟', en: 'What feeling took over you?' },
            { ar: 'هل تعود إليه؟', en: 'Would you return?' },
        ],
    },
    {
        id: 't6',
        ar: 'ما الكتاب أو الفيلم الذي تنصح به الجميع؟',
        en: 'What book or film do you recommend to everyone?',
        category: { ar: 'الرأي', en: 'Opinion' },
        hints: [
            { ar: 'ما القصّة باختصار؟', en: 'The story in brief?' },
            { ar: 'لماذا أعجبك؟', en: 'Why did you like it?' },
            { ar: 'أيّ شخصيّة تُشبهك؟', en: 'Which character resembles you?' },
            { ar: 'ما الدرس المستفاد؟', en: 'What lesson did it leave?' },
        ],
    },
    {
        id: 't7',
        ar: 'لو سافرتَ في الزمن، إلى أين تذهب؟',
        en: 'If you could travel in time, where would you go?',
        category: { ar: 'الخيال', en: 'Imagination' },
        hints: [
            { ar: 'إلى أيّ عصر؟', en: 'Which era?' },
            { ar: 'مَن تقابل؟', en: 'Whom do you meet?' },
            { ar: 'ماذا تسأل؟', en: 'What do you ask?' },
            { ar: 'هل تعود؟', en: 'Would you come back?' },
        ],
    },
    {
        id: 't8',
        ar: 'ما العادة الصغيرة التي غيّرت حياتك؟',
        en: 'What small habit changed your life?',
        category: { ar: 'التطوّر الذاتيّ', en: 'Self-growth' },
        hints: [
            { ar: 'كيف بدأتَ بها؟', en: 'How did you start?' },
            { ar: 'متى رأيت الفرق؟', en: 'When did you see the difference?' },
            { ar: 'ما الصعوبات؟', en: 'What were the struggles?' },
            { ar: 'نصيحتك لغيرك', en: 'Your advice to others' },
        ],
    },
];
