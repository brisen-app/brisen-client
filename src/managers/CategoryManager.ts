import { Tables } from '@/src/models/supabase'
import SupabaseManager from './SupabaseManager'
import { LocalizationKey, LocalizationManager } from './LocalizationManager'

const tableName = 'categories'
export type Category = Tables<typeof tableName>

class CategoryManagerSingleton extends SupabaseManager<Category> {
  constructor() {
    super(tableName)
  }

  get items() {
    if (!this._items) return undefined
    return [...this._items.values()]?.sort((a, b) => (this.getTitle(a) ?? a.id).localeCompare(this.getTitle(b) ?? b.id))
  }

  getTitle(category: Category) {
    const key = `${tableName}_${category.id.replaceAll('-', '')}_title` as LocalizationKey
    return LocalizationManager.getValue(key)
  }

  getDescription(category: Category) {
    const key = `${tableName}_${category.id.replaceAll('-', '')}_description` as LocalizationKey
    return LocalizationManager.getValue(key)
  }
}

export const CategoryManager = new CategoryManagerSingleton()
