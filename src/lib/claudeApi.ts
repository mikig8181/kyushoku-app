import type { DayMenu, DinnerSuggestion, FoodRecord } from '../types'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

function getApiKey(): string {
  return localStorage.getItem('anthropic_api_key') || import.meta.env.VITE_ANTHROPIC_API_KEY || ''
}

async function callClaude(prompt: string): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('APIキーが設定されていません。「設定」タブから入力してください。')

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API エラー: ${err}`)
  }

  const data = await res.json()
  return data.content[0].text as string
}

// PDFテキスト → 月間献立データ（JSON）に変換
export async function parseMenuFromText(
  rawText: string,
  year: number,
  month: number
): Promise<DayMenu[]> {
  const prompt = `
以下は保育園の${year}年${month}月の献立表から抽出したテキストです。
このテキストを解析して、各日の給食（昼食）とおやつのメニューを抽出してください。

テキスト:
---
${rawText}
---

以下のJSON形式で返してください。日付はYYYY-MM-DD形式にしてください。
メニュー名は日本語そのままで、categoryは lunch の items か snack の items に分類してください。

{
  "days": [
    {
      "date": "2024-01-06",
      "lunch": [
        {"name": "ごはん", "category": "main"},
        {"name": "鶏の唐揚げ", "category": "main"},
        {"name": "みそ汁", "category": "soup"}
      ],
      "snack": [
        {"name": "りんご", "category": "snack"}
      ]
    }
  ]
}

土日・祝日はスキップしてください。JSONのみ返してください（説明文不要）。
`

  const result = await callClaude(prompt)
  const jsonMatch = result.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('献立データの解析に失敗しました')

  const parsed = JSON.parse(jsonMatch[0])
  return parsed.days as DayMenu[]
}

// 夕食提案を生成
export async function suggestDinner(
  todayMenu: DayMenu,
  foodRecords: FoodRecord[]
): Promise<DinnerSuggestion[]> {
  const lunchItems = todayMenu.lunch.map((m) => m.name).join('、')
  const snackItems = todayMenu.snack.map((m) => m.name).join('、')

  // 好みサマリー
  const loved = [...new Set(foodRecords.filter((r) => r.reaction === 'loved').map((r) => r.menuItemName))]
  const disliked = [...new Set(foodRecords.filter((r) => r.reaction === 'refused').map((r) => r.menuItemName))]

  const prompt = `
あなたは共働き家庭の食事をサポートするアシスタントです。

【明日の給食】
昼食: ${lunchItems}
おやつ: ${snackItems}

【子どもたちの好み（過去の記録より）】
好きなもの: ${loved.length > 0 ? loved.join('、') : 'データなし'}
苦手なもの: ${disliked.length > 0 ? disliked.join('、') : 'データなし'}

【条件】
- 給食と食材・料理がかぶらない
- 共働きで時間がない → 1時間以内に3品作れる時短レシピ、または1週間作り置き可能なレシピ
- 子どもたちが食べやすい味付け
- 子どもの苦手なものは避ける

以下のJSON形式で夕食候補を4つ提案してください:

[
  {
    "name": "料理名",
    "reason": "給食と何がかぶっていないか・なぜこの料理かの説明（1〜2文）",
    "cookingTime": 調理時間(分・数字),
    "isOsekiuchi": 作り置き可否(true/false),
    "recipeNote": "簡単な作り方のコツ（1〜2文）",
    "recipeUrl": "クックパッドやDelishKitchenなどの検索URLを生成（https://cookpad.com/search/料理名 の形式）"
  }
]

JSONのみ返してください。
`

  const result = await callClaude(prompt)
  const jsonMatch = result.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('夕食提案の生成に失敗しました')

  return JSON.parse(jsonMatch[0]) as DinnerSuggestion[]
}
