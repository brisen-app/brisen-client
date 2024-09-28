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

    // Filter out languages that are not in the user's locale and merge Supabase language data with locale data
    const langList = [...items]
    const languages = this.mergeLanguageData(langList)

    // Store the languages in a map for easy access
    this._items = new Map(languages?.map(item => [item.id, item]))
    console.log(
      'Stored languages:',
      languages?.map(item => item.id)
    )

    // If the app is configured to use safe-for-work content, force the display language to be the safe-for-work language
    if (ConfigurationManager.get('use_sfw_content')?.bool === true) {
      console.log('Forcing safe-for-work language')

      const sfwLanguage = ConfigurationManager.get('sfw_language')?.string

      this._displayLanguage = langList.find(item => item.id === sfwLanguage)
      if (this._displayLanguage) return

      console.error('sfw language not found')
    }

    // Find the first language that matches the user's language
    this._displayLanguage = languages ? languages[0] : undefined

    // If no matches are found, use the default language
    if (!this._displayLanguage) {
      const language = this.findDefaultLanguage(items)
      this._items = new Map([[language.id, language]])
      this._displayLanguage = language
    }

    console.log('Display language:', this._displayLanguage.id)
  }

  /**
   * Merges the language data that's in the user's locale with the Supabase language data.
   *
   * @param langList - An array of `SupabaseLanguage` objects representing the available languages.
   * @returns An array of merged locale objects, where each object contains the properties of both the locale and the corresponding language from the list.
   */
  private mergeLanguageData(langList: Array<SupabaseLanguage>) {
    const userLocales = getLocales()
    const result = userLocales
      .filter(locale => locale.languageCode && langList.some(lang => lang.id === locale.languageCode))
      .map(locale => ({ ...locale, ...langList.find(lang => lang.id === locale.languageCode)! }))
    return result.length > 0 ? result : undefined
  }

  public updateDisplayLanguage() {
    if (!this._items) {
      console.warn('[updateDisplayLanguage] No languages set')
      return false
    }
    const newLanguages = this.mergeLanguageData([...this._items.values()])
    if (!newLanguages) {
      console.warn('[updateDisplayLanguage] No languages match user locale')
      return false
    }
    const newLanguage = newLanguages[0]
    const hasChanged = newLanguages && newLanguage.id !== this.getDisplayLanguage().id
    if (hasChanged) {
      this._displayLanguage = newLanguage
      console.log(`[updateDisplayLanguage] User has changed language to '${newLanguages[0].id}'`)
    }
    return hasChanged
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
