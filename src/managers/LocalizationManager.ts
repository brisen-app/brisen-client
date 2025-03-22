import { supabase } from '../lib/supabase'
import { LanguageManager } from './LanguageManager'
import { NotFoundError } from '@/src/models/Errors'
import SupabaseManager from './SupabaseManager'
import { Tables } from '@/src/models/supabase'

const tableName = 'localizations'
export type Localization = Tables<typeof tableName>

class LocalizationManagerSingleton extends SupabaseManager<Localization> {
  constructor() {
    super(tableName)
  }

  dayCountToLocaleString(days: number): string {
    switch (days) {
      case 0:
        return this.get('today')?.value ?? 'today'
      case 1:
        return this.get('tomorrow')?.value ?? 'tomorrow'
      case 7:
        return this.get('in_one_week')?.value ?? 'in one week'
      case 8 - 28:
        return (
          this.get('in_x_weeks')?.value?.replace('{0}', Math.round(days / 7).toString()) ??
          `in ${Math.round(days / 7)} weeks`
        )
      case 29 - 31:
        return this.get('in_one_month')?.value ?? 'in one month'
      default:
        return this.get('in_days')?.value?.replace('{0}', days.toString()) ?? `in ${days} days`
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
