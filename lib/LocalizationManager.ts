import { supabase } from './supabase'
import { LanguageManager } from './LanguageManager'
import { NotFoundError } from '@/types/Errors'
import SupabaseManager from './SupabaseManager'
import { Tables } from '@/types/supabase'

const tableName = 'localizations'
export type Localization = Tables<typeof tableName>

class LocalizationManagerSingleton extends SupabaseManager<Localization> {
    constructor() {
        super(tableName)
    }

    async fetch(id: string) {
        const { data } = await supabase
            .from(tableName)
            .select()
            .eq('id', id)
            .eq('language', LanguageManager.getLanguage().id)
            .single()
            .throwOnError()
        if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        this.push(data)
        return data
    }

    async fetchAll() {
        const { data } = await supabase
            .from(this.tableName)
            .select()
            .eq('language', LanguageManager.getLanguage().id)
            .throwOnError()
        if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        this.set(data)
        return data
    }
}

export const LocalizationManager = new LocalizationManagerSingleton()
