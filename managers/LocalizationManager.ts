import { supabase } from '../lib/supabase'
import { LanguageManager } from './LanguageManager'
import { NotFoundError } from '@/models/Errors'
import SupabaseManager from './SupabaseManager'
import { Tables } from '@/models/supabase'

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
      .eq('language', LanguageManager.getDisplayLanguage()!.id)
      .single()
      .throwOnError()
    if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
    this.push(data)
    return data as Localization
  }

  async fetchAll() {
    const { data } = await supabase
      .from(this.tableName)
      .select()
      .eq('language', LanguageManager.getDisplayLanguage()!.id)
      .throwOnError()
    if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
    this.set(data)
    return data as Localization[]
  }
}

export const LocalizationManager = new LocalizationManagerSingleton()
