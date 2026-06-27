import { useState } from 'react'
import { format } from 'date-fns'
import { getTodayMenu, saveFoodRecord, getFoodRecords } from '../lib/menuStore'
import { CHILDREN } from '../lib/children'
import type { ChildName, FoodReaction, FoodRecord } from '../types'

const REACTION_OPTIONS: { value: FoodReaction; emoji: string; label: string; color: string }[] = [
  { value: 'loved', emoji: '😍', label: 'お代わり！', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  { value: 'ate', emoji: '😊', label: '完食', color: 'bg-green-100 border-green-400 text-green-700' },
  { value: 'left', emoji: '😐', label: '残した', color: 'bg-orange-100 border-orange-400 text-orange-700' },
  { value: 'refused', emoji: '😣', label: '食べなかった', color: 'bg-red-100 border-red-400 text-red-700' },
]

export function RecordPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedChild, setSelectedChild] = useState<ChildName>('rinka')
  const [reactions, setReactions] = useState<Record<string, FoodReaction>>({})
  const [saved, setSaved] = useState(false)

  const menu = getTodayMenu(selectedChild, today)
  const allItems = menu ? [...menu.lunch, ...menu.snack] : []
  const existingRecords = getFoodRecords(selectedChild).filter((r) => r.date === today)

  const setReaction = (itemName: string, reaction: FoodReaction) => {
    setReactions((prev) => ({ ...prev, [itemName]: reaction }))
    setSaved(false)
  }

  const handleSave = () => {
    allItems.forEach((item) => {
      const reaction = reactions[item.name]
      if (!reaction) return
      const record: FoodRecord = {
        id: `${selectedChild}-${today}-${item.name}`,
        childId: selectedChild,
        date: today,
        menuItemName: item.name,
        reaction,
      }
      saveFoodRecord(record)
    })
    setSaved(true)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-pink-500 text-center mb-2">
        📝 きょうはどうだった？
      </h1>
      <p className="text-center text-gray-500 text-sm mb-5">帰宅後に聞いて記録しよう</p>

      {/* 子ども切り替え */}
      <div className="flex gap-3 mb-5">
        {CHILDREN.map((child) => (
          <button
            key={child.id}
            onClick={() => { setSelectedChild(child.id); setSaved(false); setReactions({}) }}
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

      {allItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p>今日の献立データがありません</p>
        </div>
      ) : (
        <>
          {allItems.map((item) => {
            const existing = existingRecords.find((r) => r.menuItemName === item.name)
            const current = reactions[item.name] ?? existing?.reaction
            return (
              <div key={item.name} className="bg-white rounded-2xl border-2 border-gray-100 p-4 mb-3 shadow-sm">
                <p className="font-bold text-gray-700 mb-3">🍽 {item.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  {REACTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setReaction(item.name, opt.value)}
                      className={`py-2 px-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        current === opt.value
                          ? opt.color + ' scale-105 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          <button
            onClick={handleSave}
            className="w-full mt-3 py-4 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-md"
          >
            {saved ? '✅ 保存しました！' : '💾 保存する'}
          </button>
        </>
      )}
    </div>
  )
}
