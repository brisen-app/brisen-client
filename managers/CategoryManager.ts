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
    const key = `${tableName}_${category.id.replaceAll('-', '')}_title`
    return LocalizationManager.get(key)?.value ?? key
  }

  getDescription(category: Category) {
    const key = `${tableName}_${category.id.replaceAll('-', '')}_desc`
    return LocalizationManager.get(key)?.value ?? key
  }
}

export const CategoryManager = new CategoryManagerSingleton()
