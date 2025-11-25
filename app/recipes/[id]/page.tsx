'use client'

/**
 * レシピ詳細ページ
 * Phase 3: アイコン表示、複数の分量調整モード、ステップバイステップの作り方に対応
 * Phase 5: レシピ複製機能対応
 */

import { useRecipes } from '@/lib/RecipeContext'
import { useParams, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Ingredient, Instructions } from '@/types'
import Link from 'next/link'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getRecipeById, deleteRecipe, duplicateRecipe } = useRecipes()
  const recipeId = params.id as string

  const recipe = getRecipeById(recipeId)

  // 分量調整の状態管理
  const [currentServings, setCurrentServings] = useState(recipe?.scalingMode?.baseServings || 4)
  const [currentMultiplier, setCurrentMultiplier] = useState(recipe?.scalingMultiplier || 1)
  const [baseIngredientAmount, setBaseIngredientAmount] = useState<number | null>(null)

  // 分量を調整した材料リストを計算
  const scaledIngredients = useMemo(() => {
    if (!recipe) return []

    return recipe.ingredients.map((ingredient) => {
      if (!ingredient.amount || ingredient.isGroup) {
        return ingredient
      }

      let scaledAmount = ingredient.amount

      // 分量調整モードに応じて計算
      if (recipe.scalingMode) {
        if (recipe.scalingMode.type === 'servings' && recipe.scalingMode.baseServings) {
          // 人数ベース
          const ratio = currentServings / recipe.scalingMode.baseServings
          scaledAmount = ingredient.amount * ratio
        } else if (recipe.scalingMode.type === 'ingredient' && recipe.scalingMode.baseIngredientId) {
          // 特定材料ベース
          if (ingredient.id === recipe.scalingMode.baseIngredientId && baseIngredientAmount !== null) {
            scaledAmount = baseIngredientAmount
          } else if (baseIngredientAmount !== null) {
            const baseIngredient = recipe.ingredients.find(i => i.id === recipe.scalingMode?.baseIngredientId)
            if (baseIngredient && baseIngredient.amount) {
              const ratio = baseIngredientAmount / baseIngredient.amount
              scaledAmount = ingredient.amount * ratio
            }
          }
        } else {
          // 倍率ベース
          scaledAmount = (ingredient.amount / recipe.scalingMultiplier) * currentMultiplier
        }
      } else {
        // デフォルト: 倍率ベース
        scaledAmount = (ingredient.amount / recipe.scalingMultiplier) * currentMultiplier
      }

      return {
        ...ingredient,
        amount: Math.round(scaledAmount * 100) / 100,
      }
    })
  }, [recipe, currentServings, currentMultiplier, baseIngredientAmount])

  // 基準材料を設定
  useMemo(() => {
    if (recipe?.scalingMode?.type === 'ingredient' && recipe.scalingMode.baseIngredientId) {
      const baseIngredient = recipe.ingredients.find(i => i.id === recipe.scalingMode?.baseIngredientId)
      if (baseIngredient && baseIngredient.amount && baseIngredientAmount === null) {
        setBaseIngredientAmount(baseIngredient.amount)
      }
    }
  }, [recipe, baseIngredientAmount])

  const handleDelete = () => {
    if (confirm('このレシピを削除してもよろしいですか？')) {
      deleteRecipe(recipeId)
      router.push('/')
    }
  }

  const handleDuplicate = () => {
    const duplicated = duplicateRecipe(recipeId)
    if (duplicated) {
      router.push(`/recipes/${duplicated.id}`)
    }
  }

  const getIndentClass = (level: number) => {
    const indents = {
      1: 'ml-0',
      2: 'ml-8',
      3: 'ml-16',
    }
    return indents[level as 1 | 2 | 3] || 'ml-0'
  }

  // 作り方がInstructions型かどうかをチェック
  const isInstructionsObject = recipe?.instructions && typeof recipe.instructions === 'object'
  const instructions = isInstructionsObject ? recipe.instructions as Instructions : null

  // 総所要時間を計算
  const totalDuration = useMemo(() => {
    if (!instructions || instructions.format !== 'steps' || !instructions.steps) return null
    return instructions.steps.reduce((sum, step) => sum + (step.duration || 0), 0)
  }, [instructions])

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
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* アイコン表示 */}
              {recipe.icon && (
                <div className="w-20 h-20 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-2 border-2 border-gray-200 dark:border-gray-700">
                  <img src={recipe.icon} alt={recipe.name} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {recipe.name}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>作成日: {new Date(recipe.createdAt).toLocaleDateString('ja-JP')}</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    {recipe.structureType === 'flat' ? 'フラット構造' : '階層構造'}
                  </span>
                  {recipe.scalingMode && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                      {recipe.scalingMode.type === 'servings' ? '人数ベース' :
                       recipe.scalingMode.type === 'ingredient' ? '材料ベース' : '倍率ベース'}
                    </span>
                  )}
                  {totalDuration && totalDuration > 0 && (
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
                      約{totalDuration}分
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm sm:text-base"
                aria-label="レシピを印刷"
              >
                🖨️ 印刷
              </button>
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
                aria-label="レシピを編集"
              >
                編集
              </Link>
              <button
                onClick={handleDuplicate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm sm:text-base"
                aria-label="レシピを複製"
              >
                複製
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-sm sm:text-base"
                aria-label="レシピを削除"
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

            {recipe.scalingMode?.type === 'servings' && (
              <div className="flex items-center gap-4">
                <label htmlFor="servings" className="text-gray-700 dark:text-gray-300">
                  人数:
                </label>
                <input
                  type="number"
                  id="servings"
                  min="1"
                  max="100"
                  value={currentServings}
                  onChange={(e) => setCurrentServings(Number(e.target.value))}
                  className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-600 dark:text-gray-400">人分</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (基準: {recipe.scalingMode.baseServings}人分)
                </span>
              </div>
            )}

            {recipe.scalingMode?.type === 'ingredient' && recipe.scalingMode.baseIngredientId && (
              <div className="flex items-center gap-4">
                <label className="text-gray-700 dark:text-gray-300">
                  基準材料の分量:
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseIngredientAmount || ''}
                  onChange={(e) => setBaseIngredientAmount(Number(e.target.value))}
                  className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {(() => {
                  const baseIng = recipe.ingredients.find(i => i.id === recipe.scalingMode?.baseIngredientId)
                  return baseIng ? (
                    <>
                      <span className="text-gray-600 dark:text-gray-400">{baseIng.unit}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({baseIng.name}: 元の分量 {baseIng.amount} {baseIng.unit})
                      </span>
                    </>
                  ) : null
                })()}
              </div>
            )}

            {(!recipe.scalingMode || recipe.scalingMode.type === 'multiplier') && (
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
            )}
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
                      <div className="flex items-center gap-2 py-2 border-b-2 border-purple-300 dark:border-purple-700">
                        <span className="text-lg">{ingredient.name}</span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                          グループ
                        </span>
                      </div>
                    ) : (
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
          {(recipe.instructions || instructions) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                作り方
              </h2>

              {instructions && instructions.format === 'steps' && instructions.steps ? (
                <div className="space-y-4">
                  {instructions.steps.map((step, index) => (
                    <div key={step.id} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2">
                          {step.description}
                        </p>
                        {step.duration && step.duration > 0 && (
                          <span className="inline-block text-sm px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
                            ⏱ {step.duration}分
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {typeof recipe.instructions === 'string' ? recipe.instructions : instructions?.content}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
