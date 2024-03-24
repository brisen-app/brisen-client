import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SB_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SB_ANON!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

export type SupabaseEntity = Awaited<ReturnType<typeof SupabaseEntityManager.fetch>>
export abstract class SupabaseEntityManager {
    static readonly tableName: keyof Database['public']['Tables']

    static getFetchQuery(id: string) {
        return {
            queryKey: [this.tableName, id],
            queryFn: async () => { return await this.fetch(id) }
        }
    }

    static getFetchAllQuery() {
        return {
            queryKey: [this.tableName as string],
            queryFn: async () => { return await this.fetchAll() }
        }
    }

    static async fetch(id: string) {
        const { data } = await supabase.from(this.tableName).select().eq('id', id).single().throwOnError();
        return this.throwOnNull(data)
    }

    static async fetchAll() {
        const { data } = await supabase.from(this.tableName).select().throwOnError()
        return this.throwOnNull(data)
    }

    protected static throwOnNull<T>(data: T | null | undefined) {
        if (!data) throw new Error(`No data found in '${this.tableName}'`)
        return data
    }
}
