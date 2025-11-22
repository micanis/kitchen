# レシピ管理アプリ

レシピを追加・管理できるWEBアプリケーション

## 📋 機能 (Phase 1 MVP)

- ✅ レシピの登録・編集・削除
- ✅ レシピ名の登録（必須）
- ✅ フラット構造の材料登録（名前、分量、単位）
- ✅ 倍率ベースの分量調整機能
- ✅ シンプルな作り方の登録（テキスト）
- ✅ LocalStorageによるデータ永続化
- ✅ レシピ一覧表示

## 🚀 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context + Hooks
- **データ保存**: LocalStorage

## 📦 セットアップ

### 必要なもの

- Node.js 20以上
- npm

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 🎯 使い方

### レシピの作成

1. トップページの「新規作成」ボタンをクリック
2. レシピ名を入力（必須）
3. 「材料を追加」ボタンで材料を追加
   - 材料名、分量、単位を入力
4. 分量調整倍率を設定（デフォルト: 1倍）
5. 作り方を入力（任意）
6. 「作成する」ボタンをクリック

### レシピの閲覧

- トップページでレシピ一覧を表示
- カードをクリックして詳細を表示
- 詳細ページで倍率を変更すると、材料の分量が自動計算されます

### レシピの編集

1. レシピ詳細ページの「編集」ボタンをクリック
2. 内容を変更
3. 「更新する」ボタンをクリック

### レシピの削除

1. レシピ詳細ページの「削除」ボタンをクリック
2. 確認ダイアログで「OK」をクリック

## 📁 プロジェクト構成

```
kitchen/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ（レシピ一覧）
│   ├── globals.css        # グローバルCSS
│   └── recipes/
│       ├── new/           # レシピ新規作成ページ
│       └── [id]/          # レシピ詳細・編集ページ
├── components/            # Reactコンポーネント
│   ├── RecipeCard.tsx    # レシピカード
│   ├── RecipeList.tsx    # レシピ一覧
│   └── RecipeForm.tsx    # レシピフォーム
├── lib/                   # ライブラリ・ユーティリティ
│   ├── RecipeContext.tsx # React Context（状態管理）
│   └── storage.ts        # LocalStorage操作
├── types/                 # TypeScript型定義
│   └── index.ts          # データモデル
├── SPECIFICATION.md       # 詳細仕様書
└── package.json
```

## 📖 仕様書

詳細な仕様は [SPECIFICATION.md](./SPECIFICATION.md) をご覧ください。

## 🔮 今後の予定 (Phase 2以降)

### Phase 2: 階層構造対応
- 階層構造の材料登録（最大3階層）
- ドラッグ&ドロップでの階層変更

### Phase 3: 高度な機能
- SVGアイコンアップロード
- 複数の分量調整モード（人数ベース、材料ベース）
- ステップバイステップの作り方
- 検索・フィルター機能

### Phase 4: 完成度向上
- レスポンシブデザインの最適化
- アクセシビリティ改善
- パフォーマンス最適化

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# Lintチェック
npm run lint
```

## 📝 ライセンス

MIT

## 🤝 コントリビューション

Issue、Pull Requestをお気軽にお送りください！
