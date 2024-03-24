import { SupabaseEntityManager, supabase } from './supabase';


export type Pack = Awaited<ReturnType<typeof PackManager.fetch>>

export abstract class PackManager extends SupabaseEntityManager {
    static readonly tableName = 'packs';

    static async fetch(id: string) {
        const { data } = await supabase.from(this.tableName)
            .select('*, cards(id)')
            .eq('id', id)
            .single()
            .throwOnError();
        return this.throwOnNull(data);
    }

    static async fetchAll() {
        const { data } = await supabase.from(this.tableName)
            .select('*, cards(id)')
            .throwOnError();
        return this.throwOnNull(data);
    }

    static isPack(item: any): item is Pack {
        return 'cards' in item;
    }
}
