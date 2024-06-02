import { Tables } from '@/models/supabase'
import SupabaseManager from './SupabaseManager'
import { LocalizationManager } from './LocalizationManager'

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
    return LocalizationManager.get(`${tableName}_${category.id}_title`)?.value
  }

  getDescription(category: Category) {
    return LocalizationManager.get(`${tableName}_${category.id}_desc`)?.value
  }
}

export const CategoryManager = new CategoryManagerSingleton()
