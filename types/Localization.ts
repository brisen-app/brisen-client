import { supabase } from "@/lib/supabase";
import SupabaseEntity from "./SupabaseEntity";
import Language from "./Language";
import { NotFoundError } from "./Errors";

export default class Localization extends SupabaseEntity {
    static readonly tableName: string = "localizations"
    protected static readonly primaryKey: string = "key"

    get id() { return this.data[Localization.primaryKey] as string }
    get value() { return this.data.value as string }

    constructor(data: any) {
        if (!data.value) throw new Error(`No 'value' found in localization data`);
        super(data);
    }

    static async get(key: string, language: Language = Language.getCurrent()) {
        return (await this.fetchWithLang(key, language)).value;
    }

    static async fetchAllWithLang(language: Language): Promise<Localization[]> {
        console.debug(`Fetching all '${this.tableName}'`);
        const { data, error } = await supabase
            .from(this.tableName)
            .select()
            .eq('language', language.id);
        if (!data || data.length === 0) throw new Error(`No data found in ${this.tableName}`);
        if (error) throw error;
        return data.map((d: any) => new this(d));
    }

    static async fetchWithLang(id: string, language: Language): Promise<Localization> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select()
            .eq(this.primaryKey, id)
            .eq('language', language.id)
            .single();
        if (!data) throw new NotFoundError(`'${id}' in lang '${language.title}' not found in '${this.tableName}'`);
        if (error) throw error
        return new this(data);
    }
}