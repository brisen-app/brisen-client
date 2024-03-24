import { Tables } from '@/types/supabase';
import { SupabaseEntityManager } from './supabase';


export type Category = Tables<'categories'>;

export abstract class CategoryManager extends SupabaseEntityManager {
    static readonly tableName = 'categories'

    static getTitleLocaleKey(category: Category) {
        return `${this.tableName}_${category.id}_title`
    }

    static getDescLocaleKey(category: Category) {
        return `${this.tableName}_${category.id}_desc`
    }
}
