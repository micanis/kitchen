'use client'

/**
 * レシピ編集ページ
 */

import RecipeForm from '@/components/RecipeForm'
import { useRecipes } from '@/lib/RecipeContext'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  const { getRecipeById, updateRecipe } = useRecipes()

  const recipeId = params.id as string
  const recipe = getRecipeById(recipeId)

  const handleSubmit = (updatedData: Parameters<typeof updateRecipe>[1]) => {
    updateRecipe(recipeId, updatedData)
    router.push(`/recipes/${recipeId}`)
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
        <div className="mb-8">
          <Link
            href={`/recipes/${recipeId}`}
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← レシピに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            レシピを編集
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {recipe.name}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <RecipeForm recipe={recipe} onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  )
}
