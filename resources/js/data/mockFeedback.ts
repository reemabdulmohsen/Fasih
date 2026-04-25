import type { Feedback } from '@/types/fasih';

export const MOCK_FEEDBACK: Feedback = {
    transcript:
        'في الصباح أستيقظ في الساعة سبعة و أشرب القهوة مع أمّي. بعد ذلك أذهب إلى العمل بالسيارة. في العمل أقرأ الإيميلات و أكتب التقارير. في الظهر آكل مع زملاء في مطعم قريب. بعد العمل أروح إلى البيت و أرتاح قليلًا. في الليل أقرأ كتاب قبل النوم.',

    diff: [
        { type: 'ok',  text: 'في الصباح أستيقظ في الساعة ' },
        { type: 'del', text: 'سبعة' },
        { type: 'ins', text: 'السابعة' },
        { type: 'ok',  text: ' ' },
        { type: 'del', text: 'و' },
        { type: 'ins', text: 'وَ' },
        { type: 'ok',  text: ' أشرب القهوة مع أمّي. بعد ذلك أذهب إلى العمل بالسيارة. في العمل أقرأ الإيميلات ' },
        { type: 'ins', text: 'الرسائل الإلكترونيّة' },
        { type: 'ok',  text: ' وأكتب التقارير. في الظهر آكل مع ' },
        { type: 'del', text: 'زملاء' },
        { type: 'ins', text: 'زملائي' },
        { type: 'ok',  text: ' في مطعم قريب. بعد العمل ' },
        { type: 'del', text: 'أروح' },
        { type: 'ins', text: 'أعود' },
        { type: 'ok',  text: ' إلى البيت وأرتاح قليلًا. في الليل أقرأ ' },
        { type: 'del', text: 'كتاب' },
        { type: 'ins', text: 'كتابًا' },
        { type: 'ok',  text: ' قبل النوم.' },
    ],

    scores: {
        fluency:   { value: 82, label: { ar: 'الطلاقة',  en: 'Fluency'    } },
        vocab:     { value: 74, label: { ar: 'المفردات', en: 'Vocabulary' } },
        grammar:   { value: 68, label: { ar: 'القواعد',  en: 'Grammar'    } },
        relevance: { value: 91, label: { ar: 'الصلة',    en: 'Relevance'  } },
    },
    overall: 79,

    cards: {
        strengths: {
            title: { ar: 'نقاط القوّة', en: 'Strengths' },
            items: [
                { ar: 'إيقاع طبيعيّ وتدفُّق واضح للأفكار من الصباح إلى الليل.', en: 'Natural pacing and a clear flow of ideas from morning to night.' },
                { ar: 'استخدامك للرّوابط الزمنيّة مثل «بعد ذلك» و«في الليل» يربط المشاهد جيّدًا.', en: 'Time connectors like "after that" and "at night" stitch scenes together well.' },
                { ar: 'نطق حروف الحلق (ح، ع) سليم ومريح للأذن.', en: 'Throat consonants (ḥ, ʿ) are pronounced cleanly and pleasantly.' },
            ],
        },
        improve: {
            title: { ar: 'ما يمكن تحسينه', en: 'Areas to improve' },
            items: [
                { ar: 'استخدم الأعداد الترتيبيّة: «الساعة السابعة» بدل «الساعة سبعة».', en: 'Use ordinal numbers: "al-sābiʿa" instead of the cardinal "sabʿa".' },
                { ar: 'انتبه لنصب المفعول به المنوَّن: «أقرأ كتابًا».', en: 'Remember tanwīn on the direct object: "kitāban" (a book, accusative).' },
                { ar: 'عوِّض الكلمات العامّيّة («أروح») بالفصيحة («أعود») حين تمرّن الفصحى.', en: 'Swap colloquial verbs ("arūḥ") for MSA ("aʿūd") when practising Fuṣḥā.' },
            ],
        },
        mistakes: {
            title: { ar: 'أخطاء شائعة', en: 'Common mistakes' },
            items: [
                { ar: 'المفعول به بعد فعل متعدٍّ يحتاج إلى فتحة/تنوين فتح.', en: 'A direct object after a transitive verb needs a fatḥa or tanwīn fatḥ.' },
                { ar: 'استعارة ألفاظ أجنبيّة («إيميل») حيث توجد بدائل عربيّة راسخة.', en: 'Borrowing foreign words ("email") where established Arabic equivalents exist.' },
                { ar: 'جمع المذكّر السالم بعد «مع» يجرّ ويُضاف: «زملائي».', en: 'Sound masculine plural after "maʿ" takes iḍāfa: "zumalāʾī" (my colleagues).' },
            ],
        },
    },

    followUps: [
        { ar: 'ذكرتَ أنّك تشرب القهوة مع أمّك — صِف هذه اللّحظة بالتّفصيل.', en: 'You mentioned coffee with your mother — describe that moment in detail.' },
        { ar: 'ما أصعب تقرير كتبتَه في العمل، ولماذا؟', en: 'What is the hardest report you have written at work, and why?' },
        { ar: 'أيّ كتاب تقرؤه هذه الأيّام قبل النوم؟ ولماذا اخترتَه؟', en: 'Which book are you reading these nights? And why did you pick it?' },
    ],
};
