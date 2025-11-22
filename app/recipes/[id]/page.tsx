'use client'

/**
 * レシピ詳細ページ
 * Phase 1: 基本的な表示と倍率調整機能
 */

import { useRecipes } from '@/lib/RecipeContext'
import { useParams, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Ingredient } from '@/types'
import Link from 'next/link'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getRecipeById, deleteRecipe } = useRecipes()
  const recipeId = params.id as string

  const recipe = getRecipeById(recipeId)
  const [currentMultiplier, setCurrentMultiplier] = useState(recipe?.scalingMultiplier || 1)

  // 分量を調整した材料リストを計算
  const scaledIngredients = useMemo(() => {
    if (!recipe) return []

    return recipe.ingredients.map((ingredient) => {
      if (!ingredient.amount) {
        return ingredient
      }

      const baseMultiplier = recipe.scalingMultiplier || 1
      const scaledAmount = (ingredient.amount / baseMultiplier) * currentMultiplier

      return {
        ...ingredient,
        amount: Math.round(scaledAmount * 100) / 100, // 小数点2桁まで
      }
    })
  }, [recipe, currentMultiplier])

  const handleDelete = () => {
    if (confirm('このレシピを削除してもよろしいですか？')) {
      deleteRecipe(recipeId)
      router.push('/')
    }
  }

  if (!recipe) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400">レシピが見つかりません</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← 一覧に戻る
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← 一覧に戻る
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {recipe.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                作成日: {new Date(recipe.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                編集
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 分量調整 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              分量調整
            </h2>
            <div className="flex items-center gap-4">
              <label htmlFor="multiplier" className="text-gray-700 dark:text-gray-300">
                倍率:
              </label>
              <input
                type="number"
                id="multiplier"
                step="0.1"
                min="0.1"
                max="10"
                value={currentMultiplier}
                onChange={(e) => setCurrentMultiplier(Number(e.target.value))}
                className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">倍</span>
              {currentMultiplier !== recipe.scalingMultiplier && (
                <button
                  onClick={() => setCurrentMultiplier(recipe.scalingMultiplier)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  リセット
                </button>
              )}
            </div>
          </div>

          {/* 材料リスト */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              材料 ({recipe.ingredients.length})
            </h2>
            {recipe.ingredients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">材料が登録されていません</p>
            ) : (
              <ul className="space-y-2">
                {scaledIngredients.map((ingredient) => (
                  <li
                    key={ingredient.id}
                    className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-gray-900 dark:text-white">{ingredient.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {ingredient.amount ? (
                        <>
                          {ingredient.amount} {ingredient.unit}
                        </>
                      ) : (
                        '適量'
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 作り方 */}
          {recipe.instructions && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                作り方
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {recipe.instructions}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
