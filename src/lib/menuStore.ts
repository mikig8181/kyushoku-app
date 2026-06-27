import { supabase } from './supabase'
import type { MonthlyMenu, DayMenu, FoodRecord, ChildName } from '../types'

// ローカルストレージにも保存（オフライン対応）
const LOCAL_KEY = 'kyushoku_menus'
const RECORDS_KEY = 'kyushoku_records'

export function saveMenuLocally(menu: MonthlyMenu) {
  const existing = getLocalMenus()
  const filtered = existing.filter(
    (m) => !(m.childId === menu.childId && m.year === menu.year && m.month === menu.month)
  )
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...filtered, menu]))
}

export function getLocalMenus(): MonthlyMenu[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function getTodayMenu(childId: ChildName, date: string): DayMenu | null {
  const menus = getLocalMenus()
  const [year, month] = date.split('-').map(Number)
  const monthMenu = menus.find(
    (m) => m.childId === childId && m.year === year && m.month === month
  )
  return monthMenu?.days.find((d) => d.date === date) ?? null
}

export function saveFoodRecord(record: FoodRecord) {
  const existing = getFoodRecords()
  const filtered = existing.filter(
    (r) => !(r.childId === record.childId && r.date === record.date && r.menuItemName === record.menuItemName)
  )
  localStorage.setItem(RECORDS_KEY, JSON.stringify([...filtered, record]))
}

export function getFoodRecords(childId?: ChildName): FoodRecord[] {
  try {
    const all: FoodRecord[] = JSON.parse(localStorage.getItem(RECORDS_KEY) ?? '[]')
    return childId ? all.filter((r) => r.childId === childId) : all
  } catch {
    return []
  }
}

// Supabaseとの同期（オプション）
export async function syncToSupabase(menu: MonthlyMenu) {
  if (!import.meta.env.VITE_SUPABASE_URL) return
  await supabase.from('monthly_menus').upsert(menu)
}
