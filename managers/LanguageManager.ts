import { getLocales, Locale } from 'expo-localization'
import { Tables } from '@/models/supabase'
import SupabaseManager from './SupabaseManager'
import { ConfigurationManager } from './ConfigurationManager'
import { CategoryManager } from './CategoryManager'

const tableName = 'languages'
export type Language = Partial<Omit<Locale, 'languageCode'>> & Tables<typeof tableName>

class LanguageManagerSingleton extends SupabaseManager<Language> {
  protected _displayLanguage: Language | undefined

  constructor() {
    super(tableName)
  }

  getDisplayLanguage() {
    if (!this._displayLanguage) throw new Error('Display language has not been set')
    return this._displayLanguage
  }

  protected set(items: Iterable<Language>) {
    if (this._items) console.warn(`${tableName} have already been set`)
      
    if (ConfigurationManager.get('use_sfw_content')?.bool === true) {
      console.log('Forcing safe-for-work language')
      this._displayLanguage = [...items].filter(item => item.id === ConfigurationManager.get('sfw_language')?.string)[0]
      this._items = new Map([[this._displayLanguage.id, this._displayLanguage]])
      return
    }

    console.log(
      'User languages:',
      getLocales().map(locale => locale.languageCode)
    )
    // Find the first language that matches the user's language
    this._displayLanguage = this.findUserLanguage(items)

    if (this._displayLanguage) {
      this._items = new Map([[this._displayLanguage.id, this._displayLanguage]])
    } else {
      // If no matches are found, use the default language
      const language = this.findDefaultLanguage(items)
      this._items = new Map([[language.id, language]])
      this._displayLanguage = language
    }

    console.log('Stored languages:', new Set(this._items.keys()))
  }

  private findUserLanguage(items: Iterable<Language>) {
    for (const locale of getLocales()) {
      for (const item of items) {
        if (locale.languageCode === item.id && item.public) {
          const language = {
            ...locale,
            ...item,
          }
          console.log('Found display language:', language.id)
          return language
        }
      }
    }
  }

  private findDefaultLanguage(items: Iterable<Language>) {
    const defaultLanguageId = ConfigurationManager.get('default_language')?.string ?? 'en'

    const languageList = [...items]
    if (languageList.length === 0) throw new Error('No languages provided when setting default language')

    const defaultLanguages = languageList.filter(item => item.id === defaultLanguageId)
    if (defaultLanguages.length === 0) console.error(`Default language '${defaultLanguageId}' not found`)
    return defaultLanguages[0] ?? languageList[0]
  }
}

export const LanguageManager = new LanguageManagerSingleton()
