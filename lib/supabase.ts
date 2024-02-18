import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryData, createClient } from '@supabase/supabase-js';
import { Database, Tables } from '@/types/supabase';
import { UndefinedInitialDataOptions } from '@tanstack/react-query';


const supabaseUrl = process.env.EXPO_PUBLIC_SB_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SB_ANON!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

const packQuery = supabase
    .from('packs')
    .select('*, cards(id)')
    .single();

export type Pack = QueryData<typeof packQuery>;


export default abstract class Supabase {

    static getPackQuery(): UndefinedInitialDataOptions<Pack[] | null> {
        return {
            queryKey: ['packs'],
            queryFn: async () => {
                return (await supabase
                    .from('packs')
                    .select('*, cards(id)')
                    .throwOnError()
                    ).data as Pack[] | null
            }
        }
    }

    static getLocalizationQuery(
        localeKey: string,
        language: string
    ): UndefinedInitialDataOptions<Tables<'localizations'> | null> {
        return {
            queryKey: ['localizations', localeKey, language],
            queryFn: async () => { return (await supabase
                    .from('localizations')
                    .select()
                    .eq('id', localeKey)
                    .eq('language', language)
                    .single()
                    .throwOnError()
                    ).data
            }
        }
    }

    static getQuery<T extends keyof Database['public']['Tables']>(
        table: T,
        id: string
    ): UndefinedInitialDataOptions<Tables<T>> {
        return {
            queryKey: [table, id],
            queryFn: async () => {
                return await this.fetch(table, id);
            }
        }
    }

    static async fetchAllPacks(): Promise<Pack[]> {
        return Supabase.fetchAll('packs', '*, cards(id)') as Promise<Pack[]>;
    }

    static async fetch<T extends keyof Database['public']['Tables']>(
        table: T,
        id: string
    ): Promise<Tables<T>> {
        const { data, error } = await supabase.from(table).select().eq('id', id).single();
        if (error) throw error;
        return data as Tables<T>;
    }

    static async fetchAll<T extends keyof Database['public']['Tables']>(
        table: T,
        select: string | null = null
    ): Promise<Array<Tables<T>>> {
        const { data, error } = await supabase.from(table).select(select ?? '*');
        if (error) throw new Error(`Error occurred when fetching '${table}': ${error.message}`);
        if (!data || data.length === 0) throw new Error(`No data found in '${table}'`);
        return data as Array<Tables<T>>;
    }
}
