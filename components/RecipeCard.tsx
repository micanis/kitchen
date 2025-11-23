'use client'

/**
 * レシピカードコンポーネント
 * 一覧画面で表示されるレシピのカード
 * Phase 4: レスポンシブデザイン・アクセシビリティ・パフォーマンス対応
 */

import { Recipe } from '@/types'
import Link from 'next/link'
import { memo } from 'react'

interface RecipeCardProps {
  recipe: Recipe
}

function RecipeCard({ recipe }: RecipeCardProps) {
  const ingredientCount = recipe.ingredients.length

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      aria-label={`${recipe.name}のレシピを表示`}
    >
      <article className="h-full p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md group-hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-600">
        <div className="flex items-start gap-3 mb-3">
          {/* SVGアイコン表示 */}
          {recipe.icon && (
            <div
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12"
              dangerouslySetInnerHTML={{ __html: recipe.icon }}
              aria-hidden="true"
            />
          )}
          <h3 className="flex-1 text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {recipe.name}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="inline-flex items-center gap-1">
            <span aria-label="材料の数">📝</span> {ingredientCount}個
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-label="構造タイプ">🏗️</span> {recipe.structureType === 'flat' ? 'フラット' : '階層'}
          </span>
        </div>

        <time
          className="block text-xs text-gray-500 dark:text-gray-500"
          dateTime={recipe.createdAt}
        >
          作成: {new Date(recipe.createdAt).toLocaleDateString('ja-JP')}
        </time>
      </article>
    </Link>
  )
}

// パフォーマンス最適化: 不要な再レンダリングを防ぐ
export default memo(RecipeCard)
