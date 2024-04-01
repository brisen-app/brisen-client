// @ts-nocheck

import { Tables } from '@/types/supabase'
import { supabase } from './supabase'
import { NotFoundError } from '@/types/Errors'

export type Category = Tables<'categories'>

export abstract class CategoryManager {
    static readonly tableName = 'categories'
    private static categories: { [id: string]: Category } | null = null

    static getFetchAllQuery() {
        return {
            queryKey: [this.tableName],
            queryFn: async () => {
                return await this.fetchAll()
            },
        }
    }

    static get(id: string | null | undefined) {
        if (!id) return null
        if (!this.categories) throw new NotFoundError('Categories have not been fetched yet')
        if (!this.categories[id]) throw new NotFoundError(`Category with ID ${id} not found`)
        return this.categories[id]
    }

    static set(categories: Category[]) {
        this.categories = categories.reduce((acc, category) => {
            acc[category.id] = category
            return acc
        }, {} as { [id: string]: Category })
    }

    private static async fetchAll() {
        const { data } = await supabase.from(this.tableName).select().throwOnError()
        if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }

    static getTitleLocaleKey(category: Category) {
        return `${this.tableName}_${category.id}_title`
    }

    static getDescLocaleKey(category: Category) {
        return `${this.tableName}_${category.id}_desc`
    }
}
