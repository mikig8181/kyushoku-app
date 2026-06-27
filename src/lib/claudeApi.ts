import type { DayMenu, DinnerSuggestion, FoodRecord } from '../types'

// Vercel Edge Function経由でAPIを呼ぶ（CORSを回避）
const API_URL = '/api/claude'

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
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
  const prompt = `保育園の${year}年${month}月の献立表テキストから、各日の昼食とおやつを抽出してください。

テキスト:
${rawText}

以下のJSON形式のみで返してください（説明文不要）:
{"days":[{"date":"${year}-${String(month).padStart(2,'0')}-01","lunch":[{"name":"料理名","category":"main"}],"snack":[{"name":"おやつ名","category":"snack"}]}]}

ルール:
- 土日祝はスキップ
- dateはYYYY-MM-DD形式
- 昼食のcategoryはmain/soup/sideのいずれか
- おやつのcategoryはsnack
- 牛乳・麦茶は省略してOK
- JSONのみ返す`

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
