'use client'

/**
 * レシピ登録・編集フォームコンポーネント
 * Phase 2: 階層構造の材料登録に対応
 */

import { useState, FormEvent } from 'react'
import { Recipe, Ingredient, RecipeStructureType } from '@/types'
import { useRouter } from 'next/navigation'

interface RecipeFormProps {
  recipe?: Recipe
  onSubmit: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export default function RecipeForm({ recipe, onSubmit }: RecipeFormProps) {
  const router = useRouter()

  // フォームの状態管理
  const [name, setName] = useState(recipe?.name || '')
  const [structureType, setStructureType] = useState<RecipeStructureType>(
    recipe?.structureType || 'flat'
  )
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || []
  )
  const [scalingMultiplier, setScalingMultiplier] = useState(
    recipe?.scalingMultiplier || 1
  )
  const [instructions, setInstructions] = useState(recipe?.instructions || '')

  // 材料追加（フラット構造）
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: `temp-${Date.now()}`,
      name: '',
      amount: undefined,
      unit: '',
      order: ingredients.length,
      level: 1,
      isGroup: false,
    }
    setIngredients([...ingredients, newIngredient])
  }

  // グループ追加（階層構造）
  const addGroup = (parentId?: string) => {
    const parentLevel = parentId
      ? ingredients.find((i) => i.id === parentId)?.level || 1
      : 0
    const newLevel = Math.min(parentLevel + 1, 3) as 1 | 2 | 3

    const newGroup: Ingredient = {
      id: `temp-${Date.now()}`,
      name: '',
      amount: undefined,
      unit: '',
      order: ingredients.length,
      level: newLevel,
      parentId: parentId,
      isGroup: true,
    }
    setIngredients([...ingredients, newGroup])
  }

  // 材料を特定のグループ内に追加
  const addIngredientToGroup = (parentId: string) => {
    const parent = ingredients.find((i) => i.id === parentId)
    if (!parent) return

    const newLevel = Math.min(parent.level + 1, 3) as 1 | 2 | 3

    const newIngredient: Ingredient = {
      id: `temp-${Date.now()}`,
      name: '',
      amount: undefined,
      unit: '',
      order: ingredients.length,
      level: newLevel,
      parentId: parentId,
      isGroup: false,
    }
    setIngredients([...ingredients, newIngredient])
  }

  // 材料更新
  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string | number | boolean
  ) => {
    const updated = [...ingredients]
    if (field === 'amount') {
      updated[index] = { ...updated[index], amount: value ? Number(value) : undefined }
    } else if (field === 'name' || field === 'unit') {
      updated[index] = { ...updated[index], [field]: value as string }
    } else if (field === 'isGroup') {
      updated[index] = { ...updated[index], isGroup: value as boolean }
    }
    setIngredients(updated)
  }

  // 材料削除
  const removeIngredient = (index: number) => {
    const ingredientId = ingredients[index].id
    // 削除する材料と、その子孫も削除
    setIngredients(
      ingredients.filter((ing) => {
        if (ing.id === ingredientId) return false
        // 親がこの材料の場合も削除
        let current = ing
        while (current.parentId) {
          if (current.parentId === ingredientId) return false
          current = ingredients.find((i) => i.id === current.parentId)!
          if (!current) break
        }
        return true
      })
    )
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
      structureType,
      ingredients: validIngredients,
      scalingMultiplier,
      instructions: instructions || undefined,
    })
  }

  // 階層構造での子要素を取得
  const getChildren = (parentId?: string) => {
    return ingredients
      .map((ing, index) => ({ ing, index }))
      .filter(({ ing }) => ing.parentId === parentId)
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

      {/* 構造タイプ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          材料の構造タイプ
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="flat"
              checked={structureType === 'flat'}
              onChange={(e) => setStructureType(e.target.value as RecipeStructureType)}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">フラット構造</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="hierarchical"
              checked={structureType === 'hierarchical'}
              onChange={(e) => setStructureType(e.target.value as RecipeStructureType)}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">階層構造 (最大3階層)</span>
          </label>
        </div>
      </div>

      {/* 材料リスト */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            材料
          </label>
          <div className="flex gap-2">
            {structureType === 'hierarchical' && (
              <button
                type="button"
                onClick={() => addGroup()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                + グループを追加
              </button>
            )}
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              + 材料を追加
            </button>
          </div>
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
                className={`${getIndentClass(ingredient.level)}`}
              >
                <div className="flex gap-2 items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 ${
                  ingredient.isGroup ? 'border-purple-500' : 'border-green-500'
                }">
                  {/* 階層表示 */}
                  {structureType === 'hierarchical' && (
                    <div className="flex flex-col gap-1 mr-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Lv{ingredient.level}
                      </span>
                      {ingredient.isGroup && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1 rounded">
                          G
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        placeholder={ingredient.isGroup ? 'グループ名' : '材料名'}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {!ingredient.isGroup && (
                        <>
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
                            placeholder="単位"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </>
                      )}
                    </div>

                    {/* グループの場合、子要素を追加するボタン */}
                    {structureType === 'hierarchical' && ingredient.isGroup && ingredient.level < 3 && (
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => addIngredientToGroup(ingredient.id)}
                          className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          + 材料を追加
                        </button>
                        {ingredient.level < 3 && (
                          <button
                            type="button"
                            onClick={() => addGroup(ingredient.id)}
                            className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                          >
                            + サブグループ
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    削除
                  </button>
                </div>
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
