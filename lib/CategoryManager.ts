import { Tables } from '@/types/supabase'
import SupabaseManager from './SupabaseManager'

const tableName = 'categories'
export type Category = Tables<typeof tableName>

class CategoryManagerSingleton extends SupabaseManager<Category> {
    constructor() {
        super(tableName)
    }

    getTitleLocaleKey(category: Category) {
        return `${tableName}_${category.id}_title`
    }

    getDescLocaleKey(category: Category) {
        return `${tableName}_${category.id}_desc`
    }
}

export const CategoryManager = new CategoryManagerSingleton()
