'use client'

/**
 * レシピ登録・編集フォームコンポーネント
 * Phase 1 MVP: 名前、材料、分量調整、作り方の基本機能
 */

import { useState, FormEvent } from 'react'
import { Recipe, Ingredient } from '@/types'
import { useRouter } from 'next/navigation'

interface RecipeFormProps {
  recipe?: Recipe // 編集時に渡される既存レシピ
  onSubmit: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export default function RecipeForm({ recipe, onSubmit }: RecipeFormProps) {
  const router = useRouter()

  // フォームの状態管理
  const [name, setName] = useState(recipe?.name || '')
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || []
  )
  const [scalingMultiplier, setScalingMultiplier] = useState(
    recipe?.scalingMultiplier || 1
  )
  const [instructions, setInstructions] = useState(recipe?.instructions || '')

  // 材料追加
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: `temp-${Date.now()}`,
      name: '',
      amount: undefined,
      unit: '',
      order: ingredients.length,
    }
    setIngredients([...ingredients, newIngredient])
  }

  // 材料更新
  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients]
    if (field === 'amount') {
      updated[index] = { ...updated[index], amount: value ? Number(value) : undefined }
    } else if (field === 'name' || field === 'unit') {
      updated[index] = { ...updated[index], [field]: value }
    }
    setIngredients(updated)
  }

  // 材料削除
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  // フォーム送信
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('レシピ名を入力してください')
      return
    }

    // 空の材料を除外
    const validIngredients = ingredients
      .filter((ing) => ing.name.trim() !== '')
      .map((ing, index) => ({
        ...ing,
        order: index,
        id: ing.id.startsWith('temp-') ? `${Date.now()}-${index}` : ing.id,
      }))

    onSubmit({
      name,
      ingredients: validIngredients,
      scalingMultiplier,
      instructions: instructions || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* レシピ名 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          レシピ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="例: カルボナーラ"
          required
        />
      </div>

      {/* 材料リスト */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            材料
          </label>
          <button
            type="button"
            onClick={addIngredient}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            + 材料を追加
          </button>
        </div>

        {ingredients.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            まだ材料が追加されていません
          </p>
        ) : (
          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div
                key={ingredient.id}
                className="flex gap-2 items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    placeholder="材料名"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={ingredient.amount || ''}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    placeholder="分量"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={ingredient.unit || ''}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    placeholder="単位 (例: g, ml, 個)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分量調整倍率 */}
      <div>
        <label htmlFor="multiplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          分量調整倍率
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            id="multiplier"
            step="0.1"
            min="0.1"
            max="10"
            value={scalingMultiplier}
            onChange={(e) => setScalingMultiplier(Number(e.target.value))}
            className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <span className="text-gray-600 dark:text-gray-400">倍</span>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          デフォルトは1倍です。0.5倍、2倍などに設定できます。
        </p>
      </div>

      {/* 作り方 */}
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          作り方 (任意)
        </label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="作り方を入力してください&#10;&#10;例:&#10;1. 鍋にお湯を沸かす&#10;2. パスタを茹でる&#10;3. ..."
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {recipe ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
