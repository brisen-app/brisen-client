import { SupabaseEntityManager, supabase } from './supabase';
import { Tables } from '@/types/supabase';
import { LanguageManager } from './LanguageManager';


export type Localization = Tables<'localizations'>;

export abstract class LocalizationManager extends SupabaseEntityManager {
    static readonly tableName = 'localizations';

    static getFetchQuery(id: string) {
        return {
            queryKey: [this.tableName, id, LanguageManager.getLanguage().id],
            queryFn: async () => { return await this.fetch(id)}
        }
    }

    static getFetchAllQuery() {
        return {
            queryKey: [this.tableName, LanguageManager.getLanguage().id],
            queryFn: async () => { return await this.fetchAll() }
        }
    }

    static async fetch(id: string) {
        const { data } = await supabase.from(this.tableName)
            .select()
            .eq('id', id)
            .eq('language', LanguageManager.getLanguage().id)
            .single()
            .throwOnError();
        return this.throwOnNull(data);
    }

    static async fetchAll() {
        const { data } = await supabase.from(this.tableName)
            .select()
            .eq('language', LanguageManager.getLanguage().id)
            .throwOnError();
        return this.throwOnNull(data);
    }
}
