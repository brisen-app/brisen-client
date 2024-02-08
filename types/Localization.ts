import { supabase } from "@/lib/supabase";
import SupabaseEntity from "./SupabaseEntity";
import Language from "./Language";
import { NotFoundError } from "./Errors";

export default class Localization extends SupabaseEntity {
    static readonly tableName: string = "localizations"
    protected static readonly primaryKey: string = "key"

    get id() { return super.id as string }
    get value() { return this.data.value as string }

    constructor(data: any) {
        if (!data.value) throw new Error(`No 'value' found in localization data`);
        super(data);
    }

    static async get(key: string) {
        return (await this.fetch(key)).value;
    }

    static async fetchAll<T extends typeof SupabaseEntity>(this: T): Promise<InstanceType<T>[]> {
        const language = await Language.getDeviceLanguage();
        const { data, error } = await supabase
            .from(this.tableName)
            .select(`${this.primaryKey}, value`)
            .eq('language', language.id);
        if (!data || data.length === 0) throw new Error(`No data found in ${this.tableName}`);
        if (error) throw error;
        return data.map((d: any) => new this(d) as InstanceType<T>);
    }

    static async fetch<T extends typeof SupabaseEntity>(this: T, id: string): Promise<InstanceType<T>> {
        const language = await Language.getDeviceLanguage();
        const { data, error } = await supabase
            .from(this.tableName)
            .select()
            .eq(this.primaryKey, id)
            .eq('language', language.id)
            .single();
        if (!data) throw new NotFoundError(`'${id}' in lang '${language.title}' not found in '${this.tableName}'`);
        if (error) throw error
        return new this(data) as InstanceType<T>;
    }
}