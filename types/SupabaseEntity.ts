import { supabase } from '@/lib/supabase';
import { NotFoundError } from './Errors';
import UUID from "./uuid";

type Identifier = UUID | string

/**
 * Represents a base class for entities that interact with Supabase.
 */
export default class SupabaseEntity {
    static readonly tableName: string
    protected static readonly primaryKey: string = "id"
    protected readonly data: any

    constructor(data: any) {
        this.data = data
    }
    
    get id(): Identifier { return this.data[SupabaseEntity.primaryKey]; }

    /**
     * Fetches all instances of the entity from the database.
     * @returns A promise that resolves to an array of instances of the entity.
     * @throws {NotFoundError} If no data is found in the table.
     * @throws {PostgrestError} If an error occurs while fetching the data.
     */
    static async fetchAll<T extends typeof SupabaseEntity>(this: T): Promise<InstanceType<T>[]> {
        const { data, error } = await supabase.from(this.tableName).select();
        if (!data || data.length === 0) throw new NotFoundError(`No data found in '${this.tableName}'`);
        if (error) throw (error);
        return data.map((d: any) => new this(d) as InstanceType<T>);
    }

    /**
     * Fetches a single instance of the entity from the database based on the provided identifier.
     * 
     * @param id - The identifier of the entity to fetch.
     * @returns A promise that resolves to the fetched instance of the entity.
     * @throws {NotFoundError} If the entity with the provided identifier is not found.
     */
    static async fetch<T extends typeof SupabaseEntity>(this: T, id: Identifier): Promise<InstanceType<T>> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select()
            .eq(this.primaryKey, id)
            .single();
        if (!data) throw new NotFoundError(`Object with '${this.primaryKey} == ${id}' not found in '${this.tableName}'`);
        if (error) throw error
        return new this(data) as InstanceType<T>;
    }
}