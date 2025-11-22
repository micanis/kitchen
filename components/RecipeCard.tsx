'use client'

/**
 * レシピカードコンポーネント
 * 一覧画面で表示されるレシピのカード
 */

import { Recipe } from '@/types'
import Link from 'next/link'

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const ingredientCount = recipe.ingredients.length

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {recipe.name}
        </h3>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>材料: {ingredientCount}個</span>
          <span>倍率: {recipe.scalingMultiplier}x</span>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          作成日: {new Date(recipe.createdAt).toLocaleDateString('ja-JP')}
        </div>
      </div>
    </Link>
  )
}
