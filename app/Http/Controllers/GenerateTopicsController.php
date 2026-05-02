<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class GenerateTopicsController extends Controller
{
    public function __invoke()
    {
        $systemPrompt = <<<'PROMPT'
أنت مساعد يُنشئ مواضيع نقاش وجدل للمتحدثين بالعربية الفصحى.

أنشئ 8 مواضيع جدلية يمكن للمتحدث أن يُبدي رأيه فيها ويحتجّ له. يجب أن تكون المواضيع:
-  خلافية وتحتمل وجهات نظر متعددة
- متنوعة في الفئات (تقنية، اجتماع، تعليم، اقتصاد، بيئة، ثقافة...)
- واضحة ومباشرة تستفزّ المتحدث للتعبير عن موقفه
- تجنب المواضيع التي تتعلق بالسياسة العامة أو الديمقراطية او الدينية 
- تجنب المواضيع التي تتطلب معرفه عميقه بمجال محدد
- المواضيع يجب ان تكون عامة بالنسبة للجميع
أجب بـ JSON فقط بهذا الشكل الحرفي:
{
  "topics": [
    {
      "id": "t1",
      "ar": "<الموضوع بالعربية الفصحى>",
      "en": "<الموضوع بالإنجليزية>",
      "category": { "ar": "<الفئة بالعربية>", "en": "<الفئة بالإنجليزية>" },
      "hints": [
        { "ar": "<سؤال مساعد 1 بالعربية>", "en": "<بالإنجليزية>" },
        { "ar": "<سؤال مساعد 2 بالعربية>", "en": "<بالإنجليزية>" },
        { "ar": "<سؤال مساعد 3 بالعربية>", "en": "<بالإنجليزية>" },
        { "ar": "<سؤال مساعد 4 بالعربية>", "en": "<بالإنجليزية>" }
      ]
    }
  ]
}

كرّر هذا لثمانية مواضيع مختلفة. أعد JSON فقط بدون أي نص إضافي.
PROMPT;

        $response = Http::withToken(config('services.openai.key'))
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => 'أنشئ 8 مواضيع جدلية متنوعة الآن.'],
                ],
            ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Topic generation failed'], 500);
        }

        $content = $response->json('choices.0.message.content');
        $data = json_decode($content, true);

        if (! $data || ! isset($data['topics'])) {
            return response()->json(['error' => 'Invalid response from model'], 500);
        }

        return response()->json($data['topics']);
    }
}
