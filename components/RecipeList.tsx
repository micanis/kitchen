'use client'

/**
 * レシピ一覧コンポーネント
 * Phase 3: 検索・フィルター・ソート機能対応
 */

import { useRecipes } from '@/lib/RecipeContext'
import RecipeCard from './RecipeCard'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Recipe } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'

type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc'
type StructureFilter = 'all' | 'flat' | 'hierarchical'

export default function RecipeList() {
  const { recipes, isLoading } = useRecipes()

  // 検索・フィルター・ソートの状態管理
  const [searchQuery, setSearchQuery] = useState('')
  const [structureFilter, setStructureFilter] = useState<StructureFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('date-desc')

  // 検索クエリのデバウンス処理（300ms遅延）
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // フィルタリング・ソート済みのレシピリスト
  const filteredAndSortedRecipes = useMemo(() => {
    let result = [...recipes]

    // 検索フィルター（レシピ名と材料名で検索）
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      result = result.filter((recipe) => {
        // レシピ名で検索
        const nameMatch = recipe.name.toLowerCase().includes(query)

        // 材料名で検索
        const ingredientMatch = recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(query)
        )

        return nameMatch || ingredientMatch
      })
    }

    // 構造タイプフィルター
    if (structureFilter !== 'all') {
      result = result.filter((recipe) => recipe.structureType === structureFilter)
    }

    // ソート
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'ja')
        case 'name-desc':
          return b.name.localeCompare(a.name, 'ja')
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return result
  }, [recipes, debouncedSearchQuery, structureFilter, sortOption])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          まだレシピがありません
        </p>
        <Link
          href="/recipes/new"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          最初のレシピを作成
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          レシピ一覧 ({filteredAndSortedRecipes.length} / {recipes.length})
        </h2>
        <Link
          href="/recipes/new"
          className="w-full sm:w-auto text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label="新しいレシピを作成"
        >
          + 新規作成
        </Link>
      </div>

      {/* 検索・フィルター・ソート */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 検索ボックス */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              検索
            </label>
            <input
              type="text"
              id="search"
              placeholder="レシピ名または材料名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="レシピを検索"
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* 構造タイプフィルター */}
          <div>
            <label htmlFor="structure-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              構造タイプ
            </label>
            <select
              id="structure-filter"
              value={structureFilter}
              onChange={(e) => setStructureFilter(e.target.value as StructureFilter)}
              aria-label="構造タイプでフィルター"
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="all">すべて</option>
              <option value="flat">フラット構造</option>
              <option value="hierarchical">階層構造</option>
            </select>
          </div>

          {/* ソートオプション */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              並び順
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              aria-label="レシピをソート"
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="date-desc">作成日が新しい順</option>
              <option value="date-asc">作成日が古い順</option>
              <option value="name-asc">名前（あ→ん）</option>
              <option value="name-desc">名前（ん→あ）</option>
            </select>
          </div>
        </div>

        {/* フィルター結果の表示 */}
        {(debouncedSearchQuery || structureFilter !== 'all') && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              フィルター適用中:
            </span>
            {debouncedSearchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                検索: {debouncedSearchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                  aria-label="検索をクリア"
                  type="button"
                >
                  ✕
                </button>
              </span>
            )}
            {structureFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                {structureFilter === 'flat' ? 'フラット構造' : '階層構造'}
                <button
                  onClick={() => setStructureFilter('all')}
                  className="ml-1 hover:text-purple-900 dark:hover:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded transition-colors"
                  aria-label="構造フィルターをクリア"
                  type="button"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('')
                setStructureFilter('all')
              }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-1 transition-colors"
              aria-label="すべてのフィルターをクリア"
              type="button"
            >
              すべてクリア
            </button>
          </div>
        )}
      </div>

      {/* レシピカード表示 */}
      {filteredAndSortedRecipes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-600 dark:text-gray-400">
            条件に一致するレシピが見つかりません
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
