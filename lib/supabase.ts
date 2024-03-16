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

    // Cards
    private static cardsTableName = 'cards' as const
    static getCardQuery(id: string) {
        return {
            queryKey: ['fetch', this.cardsTableName, id],
            queryFn: async () => {
                return await this.fetch(this.cardsTableName, id)
            }
        }
    }
    static getAllCardsQuery() {
        return {
            queryKey: ['fetch', this.cardsTableName],
            queryFn: async () => {
                return await this.fetchAll(this.cardsTableName)
            }
        }
    }

    // Categories
    private static categoriesTableName = 'categories' as const
    static getCategoryTitleId(id: string) { return `${this.categoriesTableName}_${id}_title` }
    static getCategoryDescId(id: string) { return `${this.categoriesTableName}_${id}_desc` }
    static getCategoryQuery(id: string | null | undefined) {
        if (!id) return { queryKey: [] }
        return {
            queryKey: ['fetch', this.categoriesTableName, id],
            queryFn: async () => {
                return await this.fetch(this.categoriesTableName, id)
            }
        }
    }

    // Packs
    private static packsTableName = 'packs' as const

    private static async fetchPack(id: string) {
        return await this.fetch(this.packsTableName, id, '*, cards(id)')
    }

    private static async fetchAllPacks() {
        return await this.fetchAll(this.packsTableName, '*, cards(id)') as Pack[]
    }

    static getPackQuery(id: string) {
        return {
            queryKey: [this.packsTableName, id],
            queryFn: async () => { return await this.fetchPack(id) }
        }
    }

    static getPacksQuery() {
        return {
            queryKey: [this.packsTableName],
            queryFn: async () => { return await this.fetchAllPacks() }
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

    private static getQuery<T extends keyof Database['public']['Tables']>(
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

    private static async fetch<T extends keyof Database['public']['Tables']>(
        table: T,
        id: string,
        select: string | null = null
    ): Promise<Tables<T>> {
        const { data } = await supabase.from(table).select(select ?? '*').eq('id', id).single().throwOnError();
        return data as Tables<T>;
    }

    private static async fetchAll<T extends keyof Database['public']['Tables']>(
        table: T,
        select: string | null = null
    ): Promise<Array<Tables<T>>> {
        const { data, error } = await supabase.from(table).select(select ?? '*');
        if (error) throw new Error(`Error occurred when fetching '${table}': ${error.message}`);
        if (!data || data.length === 0) throw new Error(`No data found in '${table}'`);
        return data as Array<Tables<T>>;
    }
}
