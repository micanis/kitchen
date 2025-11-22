'use client'

/**
 * レシピ新規作成ページ
 */

import RecipeForm from '@/components/RecipeForm'
import { useRecipes } from '@/lib/RecipeContext'
import { useRouter } from 'next/navigation'

export default function NewRecipePage() {
  const { addRecipe } = useRecipes()
  const router = useRouter()

  const handleSubmit = (recipe: Parameters<typeof addRecipe>[0]) => {
    const newRecipe = addRecipe(recipe)
    router.push(`/recipes/${newRecipe.id}`)
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            新しいレシピを作成
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            レシピの情報を入力してください
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <RecipeForm onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  )
}
