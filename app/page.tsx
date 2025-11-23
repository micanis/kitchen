import RecipeList from '@/components/RecipeList'

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            レシピ管理アプリ
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            お気に入りのレシピを保存・管理しましょう
          </p>
        </header>

        <RecipeList />
      </div>
    </main>
  )
}
