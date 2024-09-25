import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/src/models/supabase'
import environmentVariables from './env'

const vars = environmentVariables()

export const supabase = createClient<Database>(vars.supabaseUrl, vars.supabaseAnon, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})
