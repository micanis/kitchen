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

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipeById,
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
