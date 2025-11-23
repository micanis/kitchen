'use client'

/**
 * レシピ登録・編集フォームコンポーネント
 * Phase 3: SVGアイコン、複数の分量調整モード、ステップバイステップの作り方に対応
 */

import { useState, FormEvent, ChangeEvent } from 'react'
import { Recipe, Ingredient, RecipeStructureType, ScalingMode, ScalingModeType, Instructions, InstructionStep, InstructionsFormat } from '@/types'
import { useRouter } from 'next/navigation'

interface RecipeFormProps {
  recipe?: Recipe
  onSubmit: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export default function RecipeForm({ recipe, onSubmit }: RecipeFormProps) {
  const router = useRouter()

  // 既存のinstructionsが文字列かInstructions型かをチェック
  const existingInstructions = recipe?.instructions
  const isStepsFormat = existingInstructions && typeof existingInstructions === 'object'

  // フォームの状態管理
  const [name, setName] = useState(recipe?.name || '')
  const [icon, setIcon] = useState(recipe?.icon || '')
  const [structureType, setStructureType] = useState<RecipeStructureType>(
    recipe?.structureType || 'flat'
  )
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || []
  )

  // 分量調整モード
  const [scalingModeType, setScalingModeType] = useState<ScalingModeType>(
    recipe?.scalingMode?.type || 'multiplier'
  )
  const [baseServings, setBaseServings] = useState(recipe?.scalingMode?.baseServings || 4)
  const [baseIngredientId, setBaseIngredientId] = useState(recipe?.scalingMode?.baseIngredientId || '')
  const [scalingMultiplier, setScalingMultiplier] = useState(recipe?.scalingMultiplier || 1)

  // 作り方
  const [instructionsFormat, setInstructionsFormat] = useState<InstructionsFormat>(
    isStepsFormat ? (existingInstructions as Instructions).format : 'markdown'
  )
  const [markdownContent, setMarkdownContent] = useState(
    typeof existingInstructions === 'string' ? existingInstructions :
    (isStepsFormat && (existingInstructions as Instructions).format === 'markdown') ? (existingInstructions as Instructions).content || '' : ''
  )
  const [instructionSteps, setInstructionSteps] = useState<InstructionStep[]>(
    isStepsFormat && (existingInstructions as Instructions).format === 'steps' ? (existingInstructions as Instructions).steps || [] : []
  )

  // SVGアイコンアップロード
  const handleIconUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('svg')) {
      alert('SVGファイルのみアップロードできます')
      return
    }

    if (file.size > 100 * 1024) {
      alert('ファイルサイズは100KB以下にしてください')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setIcon(base64)
    }
    reader.readAsDataURL(file)
  }

  // 材料関連の関数（Phase 2から継承）
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

  const removeIngredient = (index: number) => {
    const ingredientId = ingredients[index].id
    setIngredients(
      ingredients.filter((ing) => {
        if (ing.id === ingredientId) return false
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

  // ステップ関連の関数
  const addStep = () => {
    const newStep: InstructionStep = {
      id: `temp-${Date.now()}`,
      order: instructionSteps.length + 1,
      description: '',
    }
    setInstructionSteps([...instructionSteps, newStep])
  }

  const updateStep = (index: number, field: keyof InstructionStep, value: string | number) => {
    const updated = [...instructionSteps]
    if (field === 'duration') {
      updated[index] = { ...updated[index], duration: value ? Number(value) : undefined }
    } else if (field === 'description') {
      updated[index] = { ...updated[index], description: value as string }
    }
    setInstructionSteps(updated)
  }

  const removeStep = (index: number) => {
    setInstructionSteps(instructionSteps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      order: i + 1
    })))
  }

  const getIndentClass = (level: number) => {
    const indents = {
      1: 'ml-0',
      2: 'ml-8',
      3: 'ml-16',
    }
    return indents[level as 1 | 2 | 3] || 'ml-0'
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('レシピ名を入力してください')
      return
    }

    const validIngredients = ingredients
      .filter((ing) => ing.name.trim() !== '')
      .map((ing, index) => ({
        ...ing,
        order: index,
        id: ing.id.startsWith('temp-') ? `${Date.now()}-${index}` : ing.id,
      }))

    // 分量調整モードの構築
    let scalingMode: ScalingMode | undefined
    if (scalingModeType === 'servings') {
      scalingMode = { type: 'servings', baseServings }
    } else if (scalingModeType === 'ingredient' && baseIngredientId) {
      scalingMode = { type: 'ingredient', baseIngredientId }
    } else {
      scalingMode = { type: 'multiplier' }
    }

    // 作り方の構築
    let instructions: string | Instructions | undefined
    if (instructionsFormat === 'markdown') {
      instructions = markdownContent || undefined
    } else if (instructionsFormat === 'steps' && instructionSteps.length > 0) {
      const validSteps = instructionSteps
        .filter(step => step.description.trim() !== '')
        .map((step, index) => ({
          ...step,
          order: index + 1,
          id: step.id.startsWith('temp-') ? `${Date.now()}-${index}` : step.id,
        }))

      if (validSteps.length > 0) {
        instructions = {
          format: 'steps',
          steps: validSteps
        }
      }
    }

    onSubmit({
      name,
      icon: icon || undefined,
      structureType,
      ingredients: validIngredients,
      scalingMode,
      scalingMultiplier,
      instructions,
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

      {/* SVGアイコンアップロード */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          アイコン (任意)
        </label>
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-16 h-16 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
              <img src={icon} alt="Recipe icon" className="w-full h-full object-contain" />
            </div>
          )}
          <input
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleIconUpload}
            className="text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
          />
          {icon && (
            <button
              type="button"
              onClick={() => setIcon('')}
              className="text-sm text-red-600 hover:underline"
            >
              削除
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          SVGファイルのみ、最大100KB
        </p>
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
                <div className={`flex gap-2 items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 ${
                  ingredient.isGroup ? 'border-purple-500' : 'border-green-500'
                }`}>
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

      {/* 分量調整モード */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          分量調整モード
        </label>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="multiplier"
                checked={scalingModeType === 'multiplier'}
                onChange={(e) => setScalingModeType(e.target.value as ScalingModeType)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">倍率ベース（デフォルト）</span>
            </label>
            {scalingModeType === 'multiplier' && (
              <div className="ml-6 flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={scalingMultiplier}
                  onChange={(e) => setScalingMultiplier(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-600 dark:text-gray-400">倍</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="servings"
                checked={scalingModeType === 'servings'}
                onChange={(e) => setScalingModeType(e.target.value as ScalingModeType)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">人数ベース</span>
            </label>
            {scalingModeType === 'servings' && (
              <div className="ml-6 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">基準人数:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={baseServings}
                  onChange={(e) => setBaseServings(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-600 dark:text-gray-400">人分</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="ingredient"
                checked={scalingModeType === 'ingredient'}
                onChange={(e) => setScalingModeType(e.target.value as ScalingModeType)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">特定材料ベース</span>
            </label>
            {scalingModeType === 'ingredient' && (
              <div className="ml-6 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">基準材料:</span>
                <select
                  value={baseIngredientId}
                  onChange={(e) => setBaseIngredientId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">選択してください</option>
                  {ingredients.filter(i => !i.isGroup && i.amount).map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.amount} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 作り方 */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          作り方 (任意)
        </label>

        <div className="flex gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="markdown"
              checked={instructionsFormat === 'markdown'}
              onChange={(e) => setInstructionsFormat(e.target.value as InstructionsFormat)}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">マークダウン形式</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="steps"
              checked={instructionsFormat === 'steps'}
              onChange={(e) => setInstructionsFormat(e.target.value as InstructionsFormat)}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">ステップバイステップ</span>
          </label>
        </div>

        {instructionsFormat === 'markdown' ? (
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="作り方を入力してください&#10;&#10;例:&#10;1. 鍋にお湯を沸かす&#10;2. パスタを茹でる&#10;3. ..."
          />
        ) : (
          <div className="space-y-4">
            {instructionSteps.map((step, index) => (
              <div key={step.id} className="flex gap-2 items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    rows={3}
                    placeholder="ステップの説明"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">所要時間:</span>
                    <input
                      type="number"
                      min="0"
                      value={step.duration || ''}
                      onChange={(e) => updateStep(index, 'duration', e.target.value)}
                      placeholder="分"
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">分</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addStep}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + ステップを追加
            </button>
          </div>
        )}
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-4 pt-6 border-t">
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
