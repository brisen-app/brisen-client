import { NotFoundError } from '@/src/models/Errors'
import { Tables } from '@/src/models/supabase'
import { supabase } from '../lib/supabase'
import LocalizationDefaults from '../models/LocalizationDefaults'
import { LanguageManager } from './LanguageManager'
import SupabaseManager from './SupabaseManager'

const tableName = 'localizations'
export type Localization = Tables<typeof tableName>
export type LocalizationKey = keyof typeof LocalizationDefaults

class LocalizationManagerSingleton extends SupabaseManager<Localization> {
  constructor() {
    super(tableName)
  }

  getValue<K extends keyof typeof LocalizationDefaults>(key: K): (typeof LocalizationDefaults)[K] {
    const item = this.get(key)
    if (!item) {
      console.warn(`Localization item '${key}' not found`)
      return LocalizationDefaults[key]
    }
    return item.value
  }

  dayCountToLocaleString(days: number): string {
    switch (days) {
      case 0:
        return this.getValue('today')
      case 1:
        return this.getValue('tomorrow')
      case 7:
        return this.getValue('in_one_week')
      case 8 - 28:
        return this.getValue('in_x_weeks').replace('{0}', Math.round(days / 7).toString())
      case 29 - 31:
        return this.getValue('in_one_month')
      default:
        return this.getValue('in_days').replace('{0}', days.toString())
    }
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
      .from(tableName)
      .select()
      .eq('language', LanguageManager.getLanguage().id)
      .throwOnError()
    if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
    if (!this.isItemList(data)) throw new Error(`Invalid data type: ${typeof data}`)
    this.set(data)
    return data
  }
}

export const LocalizationManager = new LocalizationManagerSingleton()
