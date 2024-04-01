import { Tables } from '@/types/supabase'
import { supabase } from './supabase'
import { NotFoundError } from '@/types/Errors'
import { emptyQuery } from './utils'

export type Category = Tables<'categories'>

export abstract class CategoryManager {
    static readonly tableName = 'categories'

    static getFetchQuery(id: string | null | undefined) {
        if (!id) return emptyQuery
        return {
            queryKey: [this.tableName, id],
            queryFn: async () => {
                return await this.fetch(id)
            },
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

    static async fetch(id: string) {
        const { data } = await supabase.from(this.tableName).select().eq('id', id).single().throwOnError()
        if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }

    static async fetchAll() {
        const { data } = await supabase.from(this.tableName).select().throwOnError()
        if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }

    static getTitleLocaleKey(category: Category) {
        return `${this.tableName}_${category.id}_title`
    }

    static getDescLocaleKey(category: Category) {
        return `${this.tableName}_${category.id}_desc`
    }
}
