import { Tables } from '@/src/models/supabase'
import SupabaseManager from './SupabaseManager'

const tableName = 'configurations'
export type Configuration = Tables<typeof tableName>
export type ConfigurationKey = ConfigurationItem['key']
type ConfigurationItem =
  | { key: 'use_sfw_content'; value: boolean }
  | { key: 'default_gradient'; value: string[] }
  | { key: 'bottom_sheet_min_position'; value: number }
  | { key: 'max_simultaneous_open_cards'; value: number }
  | { key: 'max_unclosed_card_age'; value: number }
  | { key: 'app_store_url'; value: string }
  | { key: 'brisen_plus_id'; value: string }
  | { key: 'default_language'; value: string }
  | { key: 'play_store_url'; value: string }
  | { key: 'sfw_language'; value: string }

class ConfigurationManagerSingleton extends SupabaseManager<Configuration> {
  constructor() {
    super(tableName)
  }

  get(key: ConfigurationItem['key']) {
    return this._items?.get(key)
  }

  getValue<K extends ConfigurationItem['key']>(key: K): Extract<ConfigurationItem, { key: K }>['value'] | undefined {
    const configItem = this.get(key)
    if (!configItem) {
      console.warn(`Configuration item '${key}' not found`)
      return undefined
    }

    switch (configItem.data_type) {
      case 'bool':
        // @ts-ignore
        return configItem.bool ?? undefined
      case 'number':
        // @ts-ignore
        return configItem.number ?? undefined
      case 'string':
        // @ts-ignore
        return configItem.string ?? undefined
      case 'list':
        // @ts-ignore
        return configItem.list ?? undefined
      default:
        throw new Error(`Unknown type '${configItem.data_type}' for key: '${key}'`)
    }
  }
}

export const ConfigurationManager = new ConfigurationManagerSingleton()
