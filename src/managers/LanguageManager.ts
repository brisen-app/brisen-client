import { Tables } from '@/src/models/supabase'
import { getLocales, Locale } from 'expo-localization'
import { ConfigurationManager } from './ConfigurationManager'
import SupabaseManager from './SupabaseManager'

const tableName = 'languages'
export type SupabaseLanguage = Tables<typeof tableName>
export type Language = Partial<Locale> & SupabaseLanguage

class LanguageManagerSingleton extends SupabaseManager<SupabaseLanguage> {
  protected _displayLanguage: Language | undefined
  private _userSelectedLanguage: string | undefined

  constructor() {
    super(tableName)
  }

  getDisplayLanguage() {
    if (!this._displayLanguage) throw new Error('Display language has not been set')
    return this._displayLanguage
  }

  protected set(items: Iterable<SupabaseLanguage>) {
    if (this._items) console.warn(`${tableName} have already been set`)
    // Store the SupabaseLanguages in a map for easy access
    this._items = new Map([...items]?.map(item => [item.id, item]))

    this.updateDisplayLanguage()
  }

  /**
   * Checks if the display language has changed compared to the user's current language settings.
   *
   * @returns {boolean} `true` if the display language has changed, otherwise `false`.
   */
  public hasChangedLanguage(): boolean {
    if (ConfigurationManager.getValue('use_sfw_content') === true) return false
    const userLocales = getLocales()
    if (!userLocales || userLocales.length === 0) return false
    const newSelectedLanguage = userLocales[0]?.languageCode
    return this._userSelectedLanguage !== newSelectedLanguage
  }

  /**
   * Retrieves the safe-for-work (SFW) language from the provided list of languages.
   *
   * @param languages - An array of `Language` objects to search through.
   * @returns The `Language` object that matches the SFW language ID.
   * @throws Will throw an error if the SFW language is not found in the provided list.
   */
  private getSfwLanguage() {
    const sfwLanguageId = ConfigurationManager.getValue('sfw_language')
    if (!sfwLanguageId) throw new Error('Safe-for-work language ID not found')
    const sfwLanguage = this._items?.get(sfwLanguageId)
    if (!sfwLanguage) throw new Error('Safe-for-work language data not found')
    return sfwLanguage
  }

  /**
   * Updates the display language of the application based on the user's locale settings.
   *
   * - If the application is configured to use safe-for-work content, it forces the display language to be the safe-for-work language.
   * - Stores the user's selected language from the available locales.
   * - Finds and sets the language that matches the user's locale.
   * - If no matching language is found, it uses the default language.
   * - Logs the selected language to the console.
   *
   * @returns {void}
   */
  public updateDisplayLanguage(): void {
    // If the app is configured to use safe-for-work content, force the display language to be the safe-for-work language
    if (ConfigurationManager.getValue('use_sfw_content') === true) {
      console.log('Forcing safe-for-work language')
      this._displayLanguage = this.getSfwLanguage()
      return
    }

    const userLocales = getLocales() ?? []

    // Store the user's selected language
    this._userSelectedLanguage = userLocales[0]?.languageCode ?? undefined

    // Find the language that matches the user's locale
    const userLocale = userLocales?.find(item => !!item.languageCode && this.get(item.languageCode)?.public)

    // If no matches are found, use the default language
    if (!userLocale) {
      const language = this.findDefaultLanguage()
      this._displayLanguage = language
      return
    }

    // Use the first language that matches the user's language
    const language = this.get(userLocale.languageCode!)
    this._displayLanguage = {
      ...userLocale,
      ...language,
    } as Language

    console.log('Found language:', this._displayLanguage.id)
  }

  /**
   * Finds the default language from the provided list of languages.
   * If the default language is not found, the first publiclanguage in the list is returned.
   *
   * @param items - The list of languages to search from.
   * @returns The default language or the first language in the list.
   * @throws Error if no languages are provided when setting default language.
   */
  private findDefaultLanguage() {
    console.log('Using default language')
    const defaultLanguageId = ConfigurationManager.getValue('default_language') ?? 'en'
    const defaultLanguage = this.get(defaultLanguageId)
    if (!defaultLanguage) throw new Error('Default language not found')
    return defaultLanguage
  }
}

export const LanguageManager = new LanguageManagerSingleton()
