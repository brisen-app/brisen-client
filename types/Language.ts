import SupabaseEntity from "./SupabaseEntity";
import { NativeModules, Platform } from 'react-native';
import { NotFoundError } from "./Errors";

export default class Language extends SupabaseEntity {
    static readonly tableName: string = "languages"
    private static current: Language | null
    
    static readonly defaultLanguage = new Language({
        id: "nb",
        icon: "🇳🇴",
        title: "Norsk"
    });
    
    get id() { return super.id as string }
    get icon() { return this.data.icon as string }
    get title() { return this.data.title as string }

    static getCurrent(): Language {
        if (!this.current) throw new NotFoundError("Language not set. Use 'findDeviceLanguage' to set a language.");
        return this.current
    }

    static setCurrent(language: Language): Language {
        this.current = language
        return this.current
    }

    static findDeviceLanguage(languages: Language[]): Language {
        if (this.current) return this.current

        const deviceLanguageCode = (Platform.OS === 'ios'
            ? (NativeModules.SettingsManager?.settings?.AppleLocale as string | null)?.slice(0, 2).toLowerCase()
            : (NativeModules.I18nManager?.localeIdentifier as string | null));

        if (!deviceLanguageCode) {
            console.debug(`Unable to determine device language. Defaulting to '${this.defaultLanguage.id}'.`);
            return this.setCurrent(this.defaultLanguage)
        }
        
        const language = languages.find(l => l.id === deviceLanguageCode)
        
        if (!language) {
            console.debug(`Device language '${deviceLanguageCode}' not supported. Defaulting to '${this.defaultLanguage.id}'.`);
            return this.setCurrent(this.defaultLanguage)
        }

        console.debug(`Device language is '${language.title}' (${language.id})`);
        return this.setCurrent(language)
    }
}