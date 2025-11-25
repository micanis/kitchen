'use client'

/**
 * レシピ管理用のReact Context
 * グローバルな状態管理を提供
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Recipe } from '@/types'
import * as storage from './storage'

interface RecipeContextType {
  recipes: Recipe[]
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Recipe
  updateRecipe: (id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => Recipe | null
  deleteRecipe: (id: string) => boolean
  getRecipeById: (id: string) => Recipe | null
  duplicateRecipe: (id: string) => Recipe | null
  exportRecipes: () => void
  importRecipes: (file: File) => Promise<{ success: boolean; message: string; count?: number }>
  isLoading: boolean
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 初回マウント時にLocalStorageからデータを読み込み
  useEffect(() => {
    const loadedRecipes = storage.getRecipes()
    setRecipes(loadedRecipes)
    setIsLoading(false)
  }, [])

  const addRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecipe = storage.addRecipe(recipe)
    setRecipes((prev) => [...prev, newRecipe])
    return newRecipe
  }

  const updateRecipe = (id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => {
    const updatedRecipe = storage.updateRecipe(id, updates)
    if (updatedRecipe) {
      setRecipes((prev) => prev.map((recipe) => (recipe.id === id ? updatedRecipe : recipe)))
    }
    return updatedRecipe
  }

  const deleteRecipe = (id: string) => {
    const success = storage.deleteRecipe(id)
    if (success) {
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id))
    }
    return success
  }

  const getRecipeById = (id: string) => {
    return recipes.find((recipe) => recipe.id === id) || null
  }

  const duplicateRecipe = (id: string) => {
    const recipe = getRecipeById(id)
    if (!recipe) return null

    // レシピを複製（IDと日時を除く）
    const { id: _, createdAt: __, updatedAt: ___, ...recipeData } = recipe
    const duplicatedRecipe = addRecipe({
      ...recipeData,
      name: `${recipe.name} (コピー)`,
    })
    return duplicatedRecipe
  }

  const exportRecipes = () => {
    const dataStr = JSON.stringify(recipes, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `recipes_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importRecipes = async (file: File): Promise<{ success: boolean; message: string; count?: number }> => {
    try {
      const text = await file.text()
      const importedRecipes = JSON.parse(text) as Recipe[]

      // バリデーション
      if (!Array.isArray(importedRecipes)) {
        return { success: false, message: 'ファイル形式が正しくありません' }
      }

      // 各レシピを追加
      let count = 0
      for (const recipe of importedRecipes) {
        // 必須フィールドのチェック
        if (!recipe.name || !recipe.ingredients || !recipe.structureType) {
          continue
        }

        const { id: _, createdAt: __, updatedAt: ___, ...recipeData } = recipe
        addRecipe(recipeData)
        count++
      }

      return { success: true, message: `${count}件のレシピをインポートしました`, count }
    } catch (error) {
      return { success: false, message: 'ファイルの読み込みに失敗しました' }
    }
  }

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipeById,
        duplicateRecipe,
        exportRecipes,
        importRecipes,
        isLoading,
      }}
    >
      {children}
    </RecipeContext.Provider>
  )
}

export function useRecipes() {
  const context = useContext(RecipeContext)
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider')
  }
  return context
}
