import { NotFoundError } from '@/types/Errors'
import { supabase } from './supabase'
import { blobToBase64 } from './utils'

export type Pack = Awaited<ReturnType<typeof PackManager.fetch>>

export abstract class PackManager {
    static readonly tableName = 'packs'

    static getFetchAllQuery() {
        return {
            queryKey: [this.tableName],
            queryFn: async () => {
                return await this.fetchAll()
            },
        }
    }

    static getFetchQuery(id: string) {
        return {
            queryKey: [this.tableName, id],
            queryFn: async () => {
                return await this.fetch(id)
            },
        }
    }

    static async fetch(id: string) {
        const { data } = await supabase.from(this.tableName).select('*, cards(id)').eq('id', id).single().throwOnError()
        if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }

    static async fetchAll(): Promise<Pack[]> {
        const { data } = await supabase.from(this.tableName).select('*, cards(id)').order('name').throwOnError()
        if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }

    static isPack(item: any): item is Pack {
        return 'cards' in item
    }

    static getImageQuery(imageName: string | null | undefined) {
        if (!imageName)
            return {
                queryKey: [],
                queryFn: async () => {
                    return null
                },
                enabled: false,
            }
        return {
            queryKey: ['storage', this.tableName, imageName],
            queryFn: async () => {
                return await this.fetchImage(imageName)
            },
        }
    }

    private static async fetchImage(imageName: string) {
        const { data, error } = await supabase.storage.from(this.tableName).download(imageName)
        if (error) throw error
        return await blobToBase64(data)
    }
}
