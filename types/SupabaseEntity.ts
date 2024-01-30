import { supabase } from '@/lib/supabase';
import { UUID } from "./uuid"

type Identifier = UUID | string

export class SupabaseEntity {
    protected static readonly tableName: string
    protected static readonly primaryKey: string = "id"
    protected readonly data: any

    protected constructor(data: any) {
        this.data = data;
    }

    get id(): Identifier { return this.data[SupabaseEntity.primaryKey]; }

    static async fetchAll<T extends SupabaseEntity>(): Promise<T[]> {
        const { data, error } = await supabase.from(this.tableName).select();
        if (error) throw error;
        return data.map((d: any) => new this(d) as T);
    }

    static async fetch<T extends SupabaseEntity>(id: Identifier): Promise<T | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select()
            .eq(this.primaryKey, id)
            .single();
        if (error) throw error;
        if (!data) return null;
        return new this(data) as T;
    }
}