import { useState } from 'react'
import { TodayPage } from './components/TodayPage'
import { UploadPage } from './components/UploadPage'
import { RecordPage } from './components/RecordPage'
import { SettingsPage } from './components/SettingsPage'

type Tab = 'today' | 'upload' | 'record' | 'settings'

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: 'today', emoji: '🍱', label: '今日' },
  { id: 'record', emoji: '📝', label: '記録' },
  { id: 'upload', emoji: '📋', label: '登録' },
  { id: 'settings', emoji: '⚙️', label: '設定' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="min-h-screen bg-pink-50 font-rounded pb-20">
      {/* Header */}
      <header className="bg-white border-b-2 border-pink-100 px-4 py-3 text-center sticky top-0 z-10">
        <h1 className="text-xl font-black text-pink-500">🌸 きゅうしょくノート</h1>
      </header>

      {/* Content */}
      <main className="pt-2">
        {tab === 'today' && <TodayPage />}
        {tab === 'record' && <RecordPage />}
        {tab === 'upload' && <UploadPage />}
        {tab === 'settings' && <SettingsPage />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-pink-100 flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 transition-colors ${
              tab === t.id ? 'text-pink-500' : 'text-gray-400'
            }`}
          >
            <span className="text-2xl">{t.emoji}</span>
            <span className={`text-xs font-bold mt-0.5 ${tab === t.id ? 'text-pink-500' : 'text-gray-400'}`}>
              {t.label}
            </span>
            {tab === t.id && (
              <div className="absolute bottom-0 h-1 w-12 bg-pink-400 rounded-t-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
