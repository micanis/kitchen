'use client'

/**
 * レシピ一覧コンポーネント
 */

import { useRecipes } from '@/lib/RecipeContext'
import RecipeCard from './RecipeCard'
import Link from 'next/link'

export default function RecipeList() {
  const { recipes, isLoading } = useRecipes()

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          まだレシピがありません
        </p>
        <Link
          href="/recipes/new"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          最初のレシピを作成
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          レシピ一覧 ({recipes.length})
        </h2>
        <Link
          href="/recipes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新規作成
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
