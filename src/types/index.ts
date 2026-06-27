export type ChildName = 'rinka' | 'miku'

export interface Child {
  id: ChildName
  name: string
  displayName: string
  grade: string
}

export interface MenuItem {
  name: string
  category: 'main' | 'side' | 'soup' | 'snack' | 'other'
}

export interface DayMenu {
  date: string // YYYY-MM-DD
  lunch: MenuItem[]
  snack: MenuItem[]
}

export interface MonthlyMenu {
  id: string
  childId: ChildName
  year: number
  month: number
  days: DayMenu[]
  createdAt: string
}

export type FoodReaction = 'loved' | 'ate' | 'left' | 'refused'

export interface FoodRecord {
  id: string
  childId: ChildName
  date: string
  menuItemName: string
  reaction: FoodReaction
  note?: string
}

export interface DinnerSuggestion {
  name: string
  reason: string
  cookingTime: number
  isOsekiuchi: boolean // 作り置き
  recipeUrl?: string
  recipeNote: string
}
