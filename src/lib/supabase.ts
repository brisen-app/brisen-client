import { Database } from '@/src/models/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'
import env from './env'

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnon, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})
