import { getLocales, Locale } from 'expo-localization'
import { Tables } from '@/types/supabase'
import SupabaseManager from './SupabaseManager'

const tableName = 'languages'
export type Language = Omit<Locale, 'languageCode'> & Tables<typeof tableName>

export const defaultLanguage: Language = {
    currencyCode: 'NOK',
    currencySymbol: 'kr',
    decimalSeparator: ',',
    digitGroupingSeparator: ' ',
    icon: '🇳🇴',
    id: 'nb',
    languageTag: 'nb-NO',
    measurementSystem: 'metric' as const,
    name: 'Norsk',
    public: true,
    regionCode: 'NO',
    temperatureUnit: 'celsius' as const,
    textDirection: 'ltr' as const,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
}

class LanguageManagerSingleton extends SupabaseManager<Language> {
    protected _displayLanguage: Language | undefined

    constructor() {
        super(tableName)
    }

    getDisplayLanguage() {
        return this._displayLanguage
    }

    protected set(items: Iterable<Language>) {
        if (this._items) console.warn(`${this.tableName} have already been set`)

        this._items = new Map()
        for (const locale of getLocales()) {
            for (const item of items) {
                if (locale.languageCode === item.id && item.public) {
                    const language = {
                        ...locale,
                        ...item,
                    }
                    this._items.set(locale.languageCode, language)
                    if (!this._displayLanguage) this._displayLanguage = language
                }
            }
        }

        if (!this._displayLanguage || this._items.size === 0) {
            this._displayLanguage = defaultLanguage
        }
    }
}

export const LanguageManager = new LanguageManagerSingleton()
