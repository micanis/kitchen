import type { Metadata } from 'next'
import './globals.css'
import { RecipeProvider } from '@/lib/RecipeContext'

export const metadata: Metadata = {
  title: 'レシピ管理アプリ',
  description: 'レシピを追加・管理できるアプリケーション',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <RecipeProvider>{children}</RecipeProvider>
      </body>
    </html>
  )
}
