import { Category } from './CategoryManager'
import { Pack } from './PackManager'
import { Card } from './CardManager'
import { Localization } from './LocalizationManager'
import { Language } from './LanguageManager'
import { NotFoundError } from '@/types/Errors'
import { supabase } from './supabase'

type SupabaseItem = Category | Pack | Card | Localization | Language

export default abstract class SupabaseManager<T extends SupabaseItem> {
    readonly tableName: string
    protected _items: Map<string, T> | undefined

    constructor(tableName: string) {
        this.tableName = tableName
    }

    get items() {
        if (!this._items) throw new NotFoundError(`${this.tableName} have not been fetched yet`)
        return new Set(this._items.values())
    }

    get(id: string) {
        return this._items?.get(id)
    }

    protected set(items: Iterable<T>) {
        if (this._items) throw new Error(`${this.tableName} have already been set`)
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
        this.push(data)
        return data as T
    }

    /**
     * Fetches all records from the table.
     * 
     * @returns {Promise<T[]>} A promise that resolves to an array of records.
     * @throws {NotFoundError} If no data is found in the table.
     */
    async fetchAll() {
        const { data } = await supabase.from(this.tableName).select().throwOnError()
        if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        this.set(data)
        return data as T[]
    }
}
