import { Tables } from '@/types/supabase';
import { SupabaseEntityManager, supabase } from './supabase';
import { NativeModules, Platform } from 'react-native';


export type Language = Tables<'languages'>;

export class LanguageNotSetError extends Error {
    constructor() { super("Language not set. Use 'findDeviceLanguage' to set a language.") }
}

const defaultLanguage: Language = {
    id: "nb",
    icon: "🇳🇴",
    name: "Norsk",
    public: true,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
}

export abstract class LanguageManager extends SupabaseEntityManager {
    static readonly tableName = 'languages';
    private static displayLanguage: Language = defaultLanguage

    static setLanguage(language: Language) {
        this.displayLanguage = language
    }

    static getLanguage() {
        if (!this.displayLanguage) throw new LanguageNotSetError()
        return this.displayLanguage
    }

    // static findDeviceLanguage(languages: Language[]): Language {
    //     // if (this.displayLanguage) return this.displayLanguage

    //     const deviceLanguageCode = (Platform.OS === 'ios'
    //         ? (NativeModules.SettingsManager?.settings?.AppleLocale as string | null)?.slice(0, 2).toLowerCase()
    //         : (NativeModules.I18nManager?.localeIdentifier as string | null));

    //     if (!deviceLanguageCode) {
    //         console.debug(`Unable to determine device language. Defaulting to '${this.defaultLanguage.id}'.`);
    //         return this.defaultLanguage
    //     }
        
    //     const language = languages.find(l => l.id === deviceLanguageCode)
        
    //     if (!language) {
    //         console.debug(`Device language '${deviceLanguageCode}' not supported. Defaulting to '${this.defaultLanguage.id}'.`);
    //         return this.defaultLanguage
    //     }

    //     console.debug(`Device language is '${language.name}' (${language.id})`);
    //     return language
    // }

    static async fetchAll() {
        const { data } = await supabase.from(this.tableName)
            .select()
            .eq('public', true)
            .throwOnError()
        return this.throwOnNull(data)
    }
}
