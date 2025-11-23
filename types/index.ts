/**
 * レシピ管理アプリのTypeScript型定義
 * SPECIFICATION.mdに基づいて定義
 */

// ============================================
// Phase 1 MVP用の型定義
// ============================================

/**
 * 材料（基本）
 */
export interface Ingredient {
  id: string
  name: string // 必須
  amount?: number // 分量（数値部分）
  unit?: string // 単位（例: g, ml, 個）
  order: number // 表示順序
  level: 1 | 2 | 3 // 階層レベル（1が最上位）
  parentId?: string // 親グループのID
  isGroup: boolean // グループかどうか
}

/**
 * レシピ（Phase 2対応）
 * - フラット構造と階層構造の両方をサポート
 * - 倍率ベースの分量調整
 * - シンプルなテキストの作り方
 */
export interface Recipe {
  id: string
  name: string // 必須
  structureType: RecipeStructureType // 'flat' or 'hierarchical'
  ingredients: Ingredient[]
  scalingMultiplier: number // 倍率（デフォルト: 1）
  instructions?: string // 作り方（任意、プレーンテキスト）
  createdAt: string // ISO 8601形式
  updatedAt: string // ISO 8601形式
}

// ============================================
// Phase 2以降用の型定義（将来の拡張用）
// ============================================

/**
 * レシピ構造タイプ
 */
export type RecipeStructureType = 'flat' | 'hierarchical'

/**
 * 分量調整モードのタイプ
 */
export type ScalingModeType = 'servings' | 'ingredient' | 'multiplier'

/**
 * 分量調整設定（Phase 3で実装予定）
 */
export interface ScalingMode {
  type: ScalingModeType
  baseServings?: number // 人数ベースの場合の基準人数
  baseIngredientId?: string // 特定材料ベースの場合の基準材料ID
  defaultMultiplier?: number // デフォルト倍率（デフォルト: 1）
}

/**
 * 階層型材料（後方互換性のためのエイリアス）
 */
export type HierarchicalIngredient = Ingredient

/**
 * 作り方の形式
 */
export type InstructionsFormat = 'markdown' | 'steps'

/**
 * 作り方（Phase 3で実装予定）
 */
export interface Instructions {
  format: InstructionsFormat
  content?: string // マークダウン形式の場合
  steps?: InstructionStep[] // ステップ形式の場合
}

/**
 * 作り方のステップ
 */
export interface InstructionStep {
  id: string
  order: number
  description: string
  image?: string // 画像URL
  duration?: number // 所要時間（分）
}

/**
 * 完全版レシピ（Phase 3以降）
 */
export interface FullRecipe extends Omit<Recipe, 'ingredients' | 'scalingMultiplier' | 'instructions'> {
  icon?: string // SVGファイルパスまたはBase64
  structureType: RecipeStructureType
  ingredients: HierarchicalIngredient[]
  scalingMode?: ScalingMode
  instructions?: Instructions
}
