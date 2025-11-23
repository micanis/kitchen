'use client'

/**
 * レシピ詳細ページ
 * Phase 2: 階層構造の材料表示に対応
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
      if (!ingredient.amount || ingredient.isGroup) {
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

  // 階層構造のインデント計算
  const getIndentClass = (level: number) => {
    const indents = {
      1: 'ml-0',
      2: 'ml-8',
      3: 'ml-16',
    }
    return indents[level as 1 | 2 | 3] || 'ml-0'
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
              <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>作成日: {new Date(recipe.createdAt).toLocaleDateString('ja-JP')}</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  {recipe.structureType === 'flat' ? 'フラット構造' : '階層構造'}
                </span>
              </div>
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
              材料 ({recipe.ingredients.filter(i => !i.isGroup).length})
            </h2>
            {recipe.ingredients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">材料が登録されていません</p>
            ) : (
              <div className="space-y-2">
                {scaledIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className={`${getIndentClass(ingredient.level)} ${
                      ingredient.isGroup ? 'font-bold text-purple-700 dark:text-purple-400 mt-4' : ''
                    }`}
                  >
                    {ingredient.isGroup ? (
                      // グループの表示
                      <div className="flex items-center gap-2 py-2 border-b-2 border-purple-300 dark:border-purple-700">
                        <span className="text-lg">{ingredient.name}</span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                          グループ
                        </span>
                      </div>
                    ) : (
                      // 材料の表示
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
