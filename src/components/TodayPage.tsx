import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { getTodayMenu, getFoodRecords } from '../lib/menuStore'
import { suggestDinner } from '../lib/claudeApi'
import { CHILDREN } from '../lib/children'
import type { ChildName, DayMenu, DinnerSuggestion } from '../types'

export function TodayPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedChild, setSelectedChild] = useState<ChildName>('rinka')
  const [menu, setMenu] = useState<DayMenu | null>(null)
  const [suggestions, setSuggestions] = useState<DinnerSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    const m = getTodayMenu(selectedChild, today)
    setMenu(m)
    setSuggestions([])
  }, [selectedChild, today])

  const handleSuggest = async () => {
    if (!menu) return
    setLoadingSuggestions(true)
    try {
      const records = getFoodRecords(selectedChild)
      const result = await suggestDinner(menu, records)
      setSuggestions(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const dateLabel = format(new Date(), 'M月d日（EEE）', { locale: ja })

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-pink-500 text-center mb-2">
        🍱 きょうの給食
      </h1>
      <p className="text-center text-gray-500 text-sm mb-4">{dateLabel}</p>

      {/* 子ども切り替え */}
      <div className="flex gap-3 mb-5">
        {CHILDREN.map((child) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child.id)}
            className={`flex-1 py-2 rounded-2xl font-bold transition-all ${
              selectedChild === child.id
                ? 'bg-pink-400 text-white shadow-md'
                : 'bg-pink-100 text-pink-400'
            }`}
          >
            {child.displayName}
          </button>
        ))}
      </div>

      {menu ? (
        <>
          {/* 昼食 */}
          <MenuSection title="🍚 昼食" items={menu.lunch} color="pink" />
          {/* おやつ */}
          {menu.snack.length > 0 && (
            <MenuSection title="🍪 おやつ" items={menu.snack} color="mint" />
          )}

          {/* 夕食提案ボタン */}
          <button
            onClick={handleSuggest}
            disabled={loadingSuggestions}
            className="w-full mt-5 py-4 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {loadingSuggestions ? '🤖 考え中...' : '🍽️ 夕食を提案してもらう'}
          </button>

          {/* 夕食提案一覧 */}
          {suggestions.length > 0 && (
            <div className="mt-5">
              <h2 className="font-bold text-gray-600 mb-3">✨ 今夜のおすすめ</h2>
              {suggestions.map((s, i) => (
                <DinnerCard key={i} suggestion={s} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 font-bold">今月の献立がまだ登録されていません</p>
          <p className="text-sm text-gray-400 mt-2">「登録」タブからPDFをアップロードしてください</p>
        </div>
      )}
    </div>
  )
}

function getFoodEmoji(name: string): string {
  if (/ご飯|米|おにぎり|チャーハン/.test(name)) return '🍚'
  if (/そうめん|うどん|そば|ラーメン|パスタ|焼きそば|めん|麺/.test(name)) return '🍜'
  if (/パン|トースト/.test(name)) return '🍞'
  if (/魚|さば|さんま|鮭|たら|あじ|ぶり|南部焼き|塩焼き|あんかけ/.test(name)) return '🐟'
  if (/鶏|チキン|から揚げ|唐揚げ/.test(name)) return '🍗'
  if (/豚|ポーク|生姜焼き|豚しゃぶ|豚肉/.test(name)) return '🥩'
  if (/牛|ビーフ|ハンバーグ/.test(name)) return '🥩'
  if (/カレー/.test(name)) return '🍛'
  if (/味噌汁|みそ汁/.test(name)) return '🍲'
  if (/スープ/.test(name)) return '🥣'
  if (/サラダ|和え|浸し|おひたし/.test(name)) return '🥗'
  if (/煮物|煮|甘辛|田舎/.test(name)) return '🥘'
  if (/炒め|炒飯/.test(name)) return '🍳'
  if (/豆腐|厚揚げ|油揚げ/.test(name)) return '🫘'
  if (/牛乳|ヨーグルト|チーズ/.test(name)) return '🥛'
  if (/果物|みかん|バナナ|りんご|メロン|オレンジ|すいか|フルーツ/.test(name)) return '🍎'
  if (/パン|蒸しパン|ドーナツ|クッキー|ケーキ|せんべい/.test(name)) return '🍪'
  if (/きな粉|あんこ/.test(name)) return '🍡'
  if (/とうもろこし/.test(name)) return '🌽'
  return '🍽️'
}

function MenuSection({
  title,
  items,
  color,
}: {
  title: string
  items: { name: string; category: string }[]
  color: 'pink' | 'mint'
}) {
  const bg = color === 'pink' ? 'bg-pink-50 border-pink-200' : 'bg-mint-100 border-mint-200'
  const badge = color === 'pink' ? 'bg-pink-200 text-pink-700' : 'bg-mint-200 text-mint-700'
  return (
    <div className={`rounded-2xl border-2 p-4 mb-3 ${bg}`}>
      <h2 className="font-bold text-gray-700 mb-3">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${badge}`}>
            <span className="text-2xl">{getFoodEmoji(item.name)}</span>
            <span className="font-bold text-sm">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DinnerCard({ suggestion }: { suggestion: DinnerSuggestion }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-gray-800 text-lg">{suggestion.name}</h3>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-bold">
            ⏱ {suggestion.cookingTime}分
          </span>
          {suggestion.isOsekiuchi && (
            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-bold">
              作り置き◎
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-2">{suggestion.reason}</p>
      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-2 mb-3">{suggestion.recipeNote}</p>
      {suggestion.recipeUrl && (
        <a
          href={suggestion.recipeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-pink-100 text-pink-600 text-sm px-4 py-2 rounded-xl font-bold hover:bg-pink-200 transition-colors"
        >
          🔗 レシピを見る
        </a>
      )}
    </div>
  )
}
