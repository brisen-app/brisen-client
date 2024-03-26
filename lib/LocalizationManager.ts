import { supabase } from './supabase'
import { LanguageManager } from './LanguageManager'
import { NotFoundError } from '@/types/Errors'

export type Localization = Awaited<ReturnType<typeof LocalizationManager.fetch>>

export abstract class LocalizationManager {
    static readonly tableName = 'localizations'

    static getFetchQuery(id: string) {
        return {
            queryKey: [this.tableName, id, LanguageManager.getLanguage().id],
            queryFn: async () => {
                return await this.fetch(id)
            },
        }
    }

    static getFetchAllQuery() {
        return {
            queryKey: [this.tableName, LanguageManager.getLanguage().id],
            queryFn: async () => {
                return await this.fetchAll()
            },
        }
    }

    static async fetch(id: string) {
        const { data } = await supabase
            .from(this.tableName)
            .select()
            .eq('id', id)
            .eq('language', LanguageManager.getLanguage().id)
            .single()
            .throwOnError()
        if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }

    static async fetchAll() {
        const { data } = await supabase
            .from(this.tableName)
            .select()
            .eq('language', LanguageManager.getLanguage().id)
            .throwOnError()
        if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }
}
