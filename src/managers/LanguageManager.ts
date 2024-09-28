import { Tables } from '@/src/models/supabase'
import { getLocales, Locale } from 'expo-localization'
import { ConfigurationManager } from './ConfigurationManager'
import SupabaseManager from './SupabaseManager'

const tableName = 'languages'
export type SupabaseLanguage = Tables<typeof tableName>
export type Language = Partial<Omit<Locale, 'languageCode'>> & SupabaseLanguage

class LanguageManagerSingleton extends SupabaseManager<Language> {
  protected _displayLanguage: Language | undefined

  constructor() {
    super(tableName)
  }

  getDisplayLanguage() {
    if (!this._displayLanguage) throw new Error('Display language has not been set')
    return this._displayLanguage
  }

  protected set(items: Iterable<SupabaseLanguage>) {
    if (this._items) console.warn(`${tableName} have already been set`)

    if (ConfigurationManager.get('use_sfw_content')?.bool === true) {
      console.log('Forcing safe-for-work language')

      const sfwLanguage = ConfigurationManager.get('sfw_language')?.string

      this._displayLanguage = [...items].filter(item => item.id === sfwLanguage)[0]
      this._items = new Map([[this._displayLanguage.id, this._displayLanguage]])
      return
    }

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

  /**
   * Finds the user's preferred language from a collection of languages.
   *
   * @param items - An iterable collection of languages.
   * @returns The preferred language of the user, or undefined if no matching language is found.
   */
  private findUserLanguage(items: Iterable<SupabaseLanguage>): Language | undefined {
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

  /**
   * Finds the default language from the provided list of languages.
   * If the default language is not found, the first publiclanguage in the list is returned.
   *
   * @param items - The list of languages to search from.
   * @returns The default language or the first language in the list.
   * @throws Error if no languages are provided when setting default language.
   */
  private findDefaultLanguage(items: Iterable<SupabaseLanguage>) {
    const defaultLanguageId = ConfigurationManager.get('default_language')?.string ?? 'en'

    const languageList = [...items]
    if (languageList.length === 0) throw new Error('No languages provided when setting default language')

    const defaultLanguages = languageList.filter(item => item.id === defaultLanguageId)
    if (defaultLanguages.length === 0) console.error(`Default language '${defaultLanguageId}' not found`)
    const result = defaultLanguages[0] ?? languageList.find(item => item.public)
    if (!result) throw new Error('No public languages found')
    return result
  }
}

export const LanguageManager = new LanguageManagerSingleton()
