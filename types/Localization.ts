import { supabase } from "@/lib/supabase";
import SupabaseEntity from "./SupabaseEntity";
import Language from "./Language";
import { NotFoundError } from "./Errors";
import { Database } from "./supabase";

type LocalizationData = Database['public']['Tables']['localizations']['Row']

export default class Localization extends SupabaseEntity {
    static readonly tableName: string = "localizations"
    protected readonly data: LocalizationData

    constructor(data: LocalizationData) {
        if (!data.value) throw new Error(`No 'value' found in localization data`);
        super(data)
        this.data = data
    }

    get id() { return super.id as string }
    get value() { return this.data.value as string }

    static async get(id: string, langCode: string): Promise<Localization> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select()
            .eq('id', id)
            .eq('language', langCode)
            .single();
        if (!data) throw new NotFoundError(`'${id}' in lang '${langCode}' not found in '${this.tableName}'`);
        if (error) throw error;
        return new this(data);
    }

    // static async fetchAllWithLang(language: Language): Promise<Localization[]> {
    //     console.debug(`Fetching all '${this.tableName}'`);
    //     const { data, error } = await supabase
    //         .from(this.tableName)
    //         .select()
    //         .eq('language', language.id);
    //     if (!data || data.length === 0) throw new Error(`No data found in ${this.tableName}`);
    //     if (error) throw error;
    //     return data.map((d: any) => new this(d));
    // }
}