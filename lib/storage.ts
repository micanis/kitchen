/**
 * LocalStorageを使ったデータ永続化ユーティリティ
 */

import { Recipe } from '@/types'

const STORAGE_KEY = 'recipe-app-recipes'

/**
 * LocalStorageからレシピ一覧を取得
 */
export function getRecipes(): Recipe[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return []
    }
    return JSON.parse(data) as Recipe[]
  } catch (error) {
    console.error('Failed to load recipes from localStorage:', error)
    return []
  }
}

/**
 * レシピ一覧をLocalStorageに保存
 */
export function saveRecipes(recipes: Recipe[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
  } catch (error) {
    console.error('Failed to save recipes to localStorage:', error)
  }
}

/**
 * 特定のレシピをIDで取得
 */
export function getRecipeById(id: string): Recipe | null {
  const recipes = getRecipes()
  return recipes.find((recipe) => recipe.id === id) || null
}

/**
 * 新しいレシピを追加
 */
export function addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Recipe {
  const recipes = getRecipes()
  const now = new Date().toISOString()

  const newRecipe: Recipe = {
    ...recipe,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }

  recipes.push(newRecipe)
  saveRecipes(recipes)
  return newRecipe
}

/**
 * 既存のレシピを更新
 */
export function updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt'>>): Recipe | null {
  const recipes = getRecipes()
  const index = recipes.findIndex((recipe) => recipe.id === id)

  if (index === -1) {
    return null
  }

  const updatedRecipe: Recipe = {
    ...recipes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  recipes[index] = updatedRecipe
  saveRecipes(recipes)
  return updatedRecipe
}

/**
 * レシピを削除
 */
export function deleteRecipe(id: string): boolean {
  const recipes = getRecipes()
  const filteredRecipes = recipes.filter((recipe) => recipe.id !== id)

  if (filteredRecipes.length === recipes.length) {
    return false // レシピが見つからなかった
  }

  saveRecipes(filteredRecipes)
  return true
}

/**
 * 簡易的なID生成（タイムスタンプ + ランダム文字列）
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
