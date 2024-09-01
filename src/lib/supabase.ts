import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/src/models/supabase'

let supabaseUrl = process.env.EXPO_PUBLIC_SB_URL!
let supabaseAnon = process.env.EXPO_PUBLIC_SB_ANON!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})
