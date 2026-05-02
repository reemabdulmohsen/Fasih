<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AnalyzeController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate([
            'transcript' => 'required|string',
            'topic' => 'required|string',
            'long_pauses_count' => 'required|integer|min:0',
            'filler_count' => 'required|integer|min:0',
            'filler_words' => 'present|array',
        ]);

        $systemPrompt = <<<'PROMPT'
أنت مقيِّم لغوي متخصص في الفصحى المعاصرة. مهمتك تقييم خطاب عربي منطوق وفق أربعة محاور.

⚠️ قواعد صارمة قبل التقييم:
- إذا كان النص أقل من 30 كلمة: الحجة لا تتجاوز 2 تلقائياً.
- إذا لم تُذكر أي فكرة مركزية واضحة: claim_identified = false، والحجة = 1.
- إذا لم يوجد أي دليل أو شاهد أو مثال: evidence_found = false.
- إذا لم تكن هناك خاتمة أو إغلاق: has_conclusion = false.
- الدرجة 4 أو 5 تستلزم أداءً استثنائياً واضحاً — الشك يُخفّض الدرجة لا يرفعها.
- لا تجامل ولا تُقدّر النية. قيّم ما قيل فعلاً لا ما أراد المتحدث قوله.

المحاور:
1. الحجة (40%): فكرة مركزية + أدلة + خاتمة منطقية.
2. النطق (25%): ق، ض، ظ، ذ، ث — الحركات القصيرة — التحولات اللهجية.
3. الخطاب (20%): كلمات الحشو (يعني، آه، إيه، مم، صح، طيب)، التكرار، الإسراف في الواو. عدد كلمات الحشو مُعطى مسبقاً — استخدمه مباشرة.
4. الطلاقة (15%): التوقفات الطويلة (عددها مُعطى)، سرعة الكلام، التنغيم.
5. الصلة بالموضوع: هل بقي المتحدث في صلب الموضوع المطلوب؟ on_topic = false إذا انحرف المتحدث بوضوح عن الموضوع أو لم يتطرق إليه أصلاً.

سلّم التقييم:
1 = ضعيف جداً — أداء مجزأ، لا محتوى واضح
2 = ضعيف — محاولة لكن إخفاقات جوهرية
3 = متوسط — أداء مقبول بأخطاء ملحوظة
4 = جيد جداً — أداء قوي بأخطاء نادرة فقط
5 = ممتاز — أداء احترافي لا يُمنح إلا نادراً

أجب بـ JSON فقط دون أي نص إضافي:
{
  "hujja": { "score": <1-5>, "claim_identified": <true|false>, "evidence_found": <true|false>, "has_conclusion": <true|false>, "explanation": "<بالعربية>" },
  "pronunciation": { "score": <1-5>, "errors": ["<كلمة أو نمط>"], "explanation": "<بالعربية>" },
  "discourse": { "score": <1-5>, "filler_count": <عدد>, "filler_words": ["<كلمة>"], "explanation": "<بالعربية>" },
  "fluency": { "score": <1-5>, "long_pauses_count": <عدد>, "explanation": "<بالعربية>" },
  "topic_relevance": { "score": <1-5>, "on_topic": <true|false>, "explanation": "<بالعربية، اذكر بوضوح إن كان المتحدث تطرق للموضوع أم انحرف عنه>" },
  "overall_summary": "<ملخص من جملتين إلى ثلاث بالعربية>",
  "flags": ["< أهم المشكلات للإصلاح او التحسين اذكر خمسة على الاقل مع شرح مبسط للمشكلة>"]
}
PROMPT;

        $fillerWordsStr = implode('، ', $request->filler_words);
        $userMessage = <<<MSG
الموضوع المطلوب التحدث عنه:
«{$request->topic}»

النص المنطوق:
«{$request->transcript}»

مؤشرات محسوبة مسبقاً:
- عدد التوقفات الطويلة (أكثر من 1.5 ثانية): {$request->long_pauses_count}
- عدد كلمات الحشو: {$request->filler_count}
- كلمات الحشو المرصودة: {$fillerWordsStr}

قيِّم النص وفق المحاور الخمسة وأعد JSON فقط.
MSG;

        $response = Http::withToken(config('services.openai.key'))
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $userMessage],
                ],
            ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Analysis failed'], 500);
        }

        $content = $response->json('choices.0.message.content');
        $analysis = json_decode($content, true);

        if (! $analysis) {
            return response()->json(['error' => 'Invalid response from model'], 500);
        }

        return response()->json($analysis);
    }
}
