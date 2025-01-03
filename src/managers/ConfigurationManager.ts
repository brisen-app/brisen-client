import SupabaseManager from './SupabaseManager'
import { Tables } from '@/src/models/supabase'

const tableName = 'configurations'
export type Configuration = Tables<typeof tableName> & { key: ConfigurationKey }
export type ConfigurationKey =
  | 'app_store_url'
  | 'bottom_sheet_min_position'
  | 'brisen_plus_id'
  | 'default_gradient'
  | 'default_language'
  | 'max_simultaneous_open_cards'
  | 'max_unclosed_card_age'
  | 'play_store_url'
  | 'sfw_language'
  | 'use_sfw_content'

class ConfigurationManagerSingleton extends SupabaseManager<Configuration> {
  constructor() {
    super(tableName)
  }

  get(key: ConfigurationKey) {
    return this._items?.get(key)
  }
}

export const ConfigurationManager = new ConfigurationManagerSingleton()
