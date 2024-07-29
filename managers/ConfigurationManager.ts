import SupabaseManager from './SupabaseManager'
import { Tables } from '@/models/supabase'

const tableName = 'configurations'
export type Configuration = Tables<typeof tableName>

class ConfigurationManagerSingleton extends SupabaseManager<Configuration> {
  constructor() {
    super(tableName)
  }
}

export const ConfigurationManager = new ConfigurationManagerSingleton()
