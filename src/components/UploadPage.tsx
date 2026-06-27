import { useState, useCallback } from 'react'
import { extractTextFromPDF } from '../lib/pdfParser'
import { parseMenuFromText } from '../lib/claudeApi'
import { saveMenuLocally } from '../lib/menuStore'
import type { ChildName, MonthlyMenu } from '../types'

export function UploadPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'analyzing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setErrorMsg('PDFファイルを選択してください')
      setStatus('error')
      return
    }

    try {
      setStatus('parsing')
      const text = await extractTextFromPDF(file)

      setStatus('analyzing')
      const days = await parseMenuFromText(text, year, month)

      // りんか・みく両方に同じ献立を保存
      const children: ChildName[] = ['rinka', 'miku']
      children.forEach((childId) => {
        const menu: MonthlyMenu = {
          id: `${childId}-${year}-${month}`,
          childId,
          year,
          month,
          days,
          createdAt: new Date().toISOString(),
        }
        saveMenuLocally(menu)
      })
      setStatus('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '不明なエラー')
      setStatus('error')
    }
  }, [year, month])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-pink-500 text-center mb-6">
        📋 献立を登録する
      </h1>

      <p className="text-center text-gray-400 text-sm mb-5">りんか・みく両方に自動登録されます</p>

      {/* 年月選択 */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-600 mb-1">年</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full p-3 rounded-2xl border-2 border-pink-200 bg-white font-bold"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-600 mb-1">月</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full p-3 rounded-2xl border-2 border-pink-200 bg-white font-bold"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
      </div>

      {/* PDFアップロードエリア */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`border-4 border-dashed rounded-3xl p-10 text-center transition-all ${
          dragOver ? 'border-pink-400 bg-pink-50' : 'border-pink-200 bg-white'
        }`}
      >
        <div className="text-5xl mb-3">📄</div>
        <p className="font-bold text-gray-600 mb-4">PDFをここにドラッグ＆ドロップ</p>
        <p className="text-sm text-gray-400 mb-4">または</p>
        <label className="cursor-pointer bg-pink-400 text-white px-6 py-3 rounded-2xl font-bold hover:bg-pink-500 transition-colors">
          ファイルを選択
          <input type="file" accept=".pdf" className="hidden" onChange={onInputChange} />
        </label>
      </div>

      {/* ステータス表示 */}
      {status === 'parsing' && (
        <StatusCard emoji="📖" text="PDFを読み込んでいます..." color="blue" />
      )}
      {status === 'analyzing' && (
        <StatusCard emoji="🤖" text="AIが献立を解析しています..." color="purple" />
      )}
      {status === 'done' && (
        <StatusCard emoji="✅" text="献立の登録が完了しました！" color="green" />
      )}
      {status === 'error' && (
        <StatusCard emoji="❌" text={errorMsg} color="red" />
      )}
    </div>
  )
}

function StatusCard({ emoji, text, color }: { emoji: string; text: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  }
  return (
    <div className={`mt-4 p-4 rounded-2xl border-2 font-bold ${colors[color]}`}>
      {emoji} {text}
    </div>
  )
}
