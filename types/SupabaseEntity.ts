import { supabase } from '@/lib/supabase';
import { UUID } from "./uuid"

type Identifier = UUID | string

interface SupabaseObject {
    id: Identifier

    fetchAll<T extends SupabaseObject>(): Promise<T[]>
    fetch(id: Identifier): Promise<SupabaseObject>
    fromSupabase<T extends SupabaseObject>(data: any): T
    toSupabase(): any
}


abstract class SupabaseEntity {
    static readonly tableName: string = ""
    static readonly primaryKey: string = "id"
    readonly id: Identifier
    
    constructor(
        id: Identifier
    ) {
        this.id = id
    }

    private static async fetchAll<T extends SupabaseEntity>(): Promise<T[]> {
        throw new Error("Method not implemented.")
    }

    private static async fetch(id: Identifier): Promise<SupabaseEntity> {
        return this.fromSupabase(await supabase.from(this.tableName).select().eq(this.primaryKey, id).single())
    }

    private static fromSupabase<T extends SupabaseEntity>(data: any): T {
        throw new Error("Method not implemented.")
    }

    private static toSupabase(entity: SupabaseEntity) {
        throw new Error("Method not implemented.")
    }
}