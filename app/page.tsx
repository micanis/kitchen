import RecipeList from '@/components/RecipeList'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            レシピ管理アプリ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            お気に入りのレシピを保存・管理しましょう
          </p>
        </header>

        <RecipeList />
      </div>
    </main>
  )
}
