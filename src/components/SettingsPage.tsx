import { useState } from 'react'

export function SettingsPage() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') ?? '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem('anthropic_api_key', apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isKeySet = apiKey.startsWith('sk-ant-')

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-pink-500 text-center mb-6">
        ⚙️ 設定
      </h1>

      {/* APIキー設定 */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-700">🔑 Claude APIキー</h2>
          {isKeySet && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold">✅ 設定済み</span>}
        </div>

        {/* 取得方法の案内 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3 text-sm">
          <p className="font-bold text-yellow-700 mb-1">📋 APIキーの取得方法</p>
          <ol className="text-yellow-700 space-y-1 list-decimal list-inside text-xs">
            <li>Chromeで <span className="font-mono font-bold">console.anthropic.com</span> を開く</li>
            <li>Claudeと同じアカウントでログイン</li>
            <li>左メニュー「API Keys」→「Create Key」</li>
            <li>名前は何でもOK → 作成</li>
            <li>表示された <span className="font-mono">sk-ant-...</span> をコピーして下に貼る</li>
          </ol>
        </div>

        <div className="relative mb-3">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setSaved(false) }}
            placeholder="ここにsk-ant-...を貼り付け"
            className="w-full p-3 pr-12 rounded-xl border-2 border-gray-200 font-mono text-sm"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-3 text-gray-400 text-sm"
          >
            {showKey ? '🙈' : '👁️'}
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full py-3 bg-pink-400 text-white rounded-xl font-bold disabled:opacity-40"
        >
          {saved ? '✅ 保存しました！' : '保存する'}
        </button>
      </div>

      {/* ホーム画面追加 */}
      <div className="bg-pink-50 rounded-2xl border-2 border-pink-100 p-4 text-sm text-gray-600">
        <p className="font-bold mb-2">📱 スマホのホーム画面に追加する方法</p>
        <p className="mb-1">
          <b>iPhone（Safari）:</b> 下の共有ボタン
          <span className="mx-1 bg-gray-200 px-1 rounded">⬆</span>
          → 「ホーム画面に追加」
        </p>
        <p><b>Android（Chrome）:</b> 右上メニュー → 「アプリをインストール」</p>
      </div>
    </div>
  )
}
