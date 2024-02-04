import SupabaseEntity from "./SupabaseEntity";
import { NativeModules, Platform } from 'react-native';

export default class Language extends SupabaseEntity {
    protected static readonly tableName: string = "languages"

    get id() { return super.id as string }
    get icon() { return this.data.icon as string }
    get title() { return this.data.title as string }

    static async getDeviceLanguage(): Promise<Language> {
        const deviceLanguageCode = (Platform.OS === 'ios'
            ? (NativeModules.SettingsManager.settings.AppleLocale as string).slice(0, 2).toLowerCase()
            : (NativeModules.I18nManager?.localeIdentifier as string | null) ?? "en");
        
        const languages = await this.fetchAll();

        return languages.find(lang => lang.id === deviceLanguageCode) ?? languages[0];
    }
}