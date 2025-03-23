import { NotFoundError } from '@/src/models/Errors'
import { Database } from '@/src/models/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { tryCatchAsync } from '../lib/utils'
import { Card } from './CardManager'
import { CardRelation } from './CardRelationManager'
import { Category } from './CategoryManager'
import { Configuration } from './ConfigurationManager'
import { Language } from './LanguageManager'
import { Localization } from './LocalizationManager'
import { Pack } from './PackManager'

export type SupabaseItem = Category | Pack | Card | Localization | Language | Configuration | CardRelation
type SupabaseTableName = keyof Database['public']['Tables']

export default abstract class SupabaseManager<T extends SupabaseItem> {
  readonly tableName: SupabaseTableName
  protected _items: Map<string, T> | undefined

  constructor(tableName: SupabaseTableName) {
    this.tableName = tableName
  }

  get items(): Set<T> | Array<T> | undefined {
    if (!this._items) console.warn(`${this.tableName} has not been set`)
    return new Set(this._items?.values())
  }

  get(id: T['id']) {
    return this._items?.get(id)
  }

  protected async store(items: Set<T> | Array<T>) {
    const { error } = await tryCatchAsync(AsyncStorage.setItem(this.tableName, JSON.stringify(items)))
    if (error) console.error(`Failed to store ${this.tableName} in AsyncStorage:`, error)
  }

  protected async retrieve() {
    const { data, error } = await tryCatchAsync(AsyncStorage.getItem(this.tableName))
    if (error) return console.error(`Failed to retrieve ${this.tableName} from AsyncStorage:`, error)
    if (!data) return console.warn(`No data found in ${this.tableName} in AsyncStorage`)

    const items = JSON.parse(data) as Array<T>
    this.set(items)
    return items
  }

  protected set(items: Iterable<T>) {
    if (this._items) console.warn(`${this.tableName} have already been set`)
    this._items = new Map()
    for (const item of items) {
      this._items.set(item.id, item)
    }
  }

  protected push(item: T) {
    if (!this._items) this._items = new Map()
    this._items.set(item.id, item)
  }

  /**
   * Fetches a record from the table based on the provided ID.
   *
   * @param id - The ID of the record to fetch.
   * @returns The fetched record.
   * @throws {NotFoundError} If no data is found in the table.
   */
  async fetch(id: string) {
    const { data } = await supabase.from(this.tableName).select().eq('id', id).single().throwOnError()
    if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
    if (!this.isItem(data)) throw new Error(`Got invalid ${this.tableName} object: ${JSON.stringify(data)}`)
    this.push(data)
    return data
  }

  /**
   * Fetches all records from the table.
   *
   * @returns {Promise<T[]>} A promise that resolves to an array of records.
   * @throws {NotFoundError} If no data is found in the table.
   */
  async fetchAll(): Promise<T[]> {
    const { data } = await supabase.from(this.tableName).select().throwOnError()
    if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
    if (!this.isItemList(data)) throw new Error(`Got list of invalid '${this.tableName}' objects.`)
    this.set(data)
    await this.store(data)
    return data
  }

  async fetchAllOrRetrieve() {
    const { data, error } = await tryCatchAsync(this.retrieve())
    if (error) return console.error(`Failed to retrieve ${this.tableName} from AsyncStorage:`, error)
    if (data) return this.set(data)
    console.warn(`No data found in ${this.tableName} in AsyncStorage`)
  }

  isItem(item: object): item is T {
    return (item as T).id !== undefined
  }

  isItemList(item: object): item is T[] {
    return (item as T[]).every(item => this.isItem(item))
  }
}
