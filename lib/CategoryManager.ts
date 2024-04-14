// @ts-nocheck

import { Tables } from '@/types/supabase'
import { supabase } from './supabase'
import { NotFoundError } from '@/types/Errors'

export type Category = Tables<'categories'>

export abstract class CategoryManager {
    static readonly tableName = 'categories'
    private static cache: Set<Category> | null = null

    static get items() {
        if (!this.cache) throw new NotFoundError(`${this.tableName} have not been fetched yet`)
        return this.cache
    }

    static get(id: string): Category {
        for (const item of this.items) {
            if (item.id === id) return item
        }
        throw new NotFoundError(`Item with id '${id}' not found in ${this.tableName}`)
    }

    static set(categories: Iterable<Category>) {
        if (this.cache) console.warn(`${this.tableName} have already been set`)
        this.cache = new Set()
        for (const item of categories) {
            this.cache.add(item)
        }
    }

    static getFetchAllQuery() {
        return {
            queryKey: [this.tableName],
            queryFn: async () => {
                return await this.fetchAll()
            },
        }
    }

    private static async fetchAll() {
        const { data } = await supabase.from(this.tableName).select().throwOnError()
        if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        this.set(data)
        return data
    }

    static getTitleLocaleKey(category: Category) {
        return `${this.tableName}_${category.id}_title`
    }

    static getDescLocaleKey(category: Category) {
        return `${this.tableName}_${category.id}_desc`
    }
}
