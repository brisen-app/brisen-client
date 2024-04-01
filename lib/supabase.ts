import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import Constants from 'expo-constants'

let supabaseUrl = Constants.expoConfig?.extra?.supabaseURL as string | undefined
let supabaseAnon = Constants.expoConfig?.extra?.supabaseAnon as string | undefined

if (!supabaseUrl || !supabaseAnon) {
    console.warn(`Supabase URL or Anon Key not found in Constants.expoConfig.extra. Falling back to environment variables.`)
    supabaseUrl = process.env.EXPO_PUBLIC_SB_URL!
    supabaseAnon = process.env.EXPO_PUBLIC_SB_ANON!
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
})
