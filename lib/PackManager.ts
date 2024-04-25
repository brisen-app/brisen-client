import { NotFoundError } from '@/types/Errors'
import { supabase } from './supabase'
import { blobToBase64, emptyQuery } from './utils'
import SupabaseManager from './SupabaseManager'

const tableName = 'packs'
const select = '*, cards(*)'
export type Pack = Awaited<ReturnType<typeof fetch>>

async function fetch(id: string) {
    const { data } = await supabase.from(tableName).select(select).eq('id', id).single().throwOnError()
    if (!data) throw new NotFoundError(`No data found in table '${tableName}'`)
    return data
}

class PackManagerSingleton extends SupabaseManager<Pack> {
    constructor() {
        super(tableName)
    }

    get items() {
        if (!this._items) return undefined
        return [...this._items.values()]?.sort((a, b) => a.name.localeCompare(b.name))
    }

    async fetch(id: string) {
        return await fetch(id)
    }

    async fetchAll(): Promise<Pack[]> {
        const { data } = await supabase.from(tableName).select(select).throwOnError()
        if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        this.set(data)
        return data
    }

    getImageQuery(imageName: string | null | undefined, enabled = true) {
        if (!imageName) return emptyQuery
        return {
            queryKey: ['storage', this.tableName, imageName],
            queryFn: async () => {
                return await this.fetchImage(imageName)
            },
            enabled: enabled,
        }
    }

    private async fetchImage(imageName: string) {
        const { data, error } = await supabase.storage.from(this.tableName).download(imageName)
        if (error) throw error
        return await blobToBase64(data)
    }
}

export const PackManager = new PackManagerSingleton()
