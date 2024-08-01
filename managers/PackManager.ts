import { blobToBase64, emptyQuery } from '../lib/utils'
import { NotFoundError } from '@/models/Errors'
import { supabase } from '../lib/supabase'
import { Tables } from '@/models/supabase'
import SupabaseManager from './SupabaseManager'
import { useQuery } from '@tanstack/react-query'

const tableName = 'packs'
const select = '*, cards(id)'
export type Pack = Tables<typeof tableName> & { cards: Set<string> }

class PackManagerSingleton extends SupabaseManager<Pack> {
  constructor() {
    super(tableName)
  }

  get items() {
    if (!this._items) return undefined
    return [...this._items.values()]?.sort((a, b) => a.name.localeCompare(b.name))
  }

  getPackOf(cardId: string, playlist: Set<Pack>) {
    for (const pack of playlist) {
      if (pack.cards.has(cardId)) return pack
    }
    console.warn(`Card ${cardId} not found in any pack`)
    return null
  }

  getPacksOf(cardId: string) {
    return this.items?.filter(pack => pack.cards.has(cardId)) ?? []
  }

  async fetchAll(): Promise<Pack[]> {
    const { data } = await supabase.from(tableName).select(select).order('name').throwOnError()
    if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)

    const packs = Array<Pack>()
    for (const pack of data) {
      packs.push({
        ...pack,
        cards: new Set(pack.cards.map((card: any) => card.id)),
      })
    }

    this.set(packs)
    return packs
  }

  useImageQuery(imageName: string | null | undefined, enabled = true) {
    return useQuery(
      !imageName
        ? emptyQuery
        : {
            queryKey: ['storage', this.tableName, imageName],
            queryFn: async () => {
              return await this.fetchImage(imageName)
            },
            enabled: enabled,
          }
    )
  }

  private async fetchImage(imageName: string) {
    const { data, error } = await supabase.storage.from(this.tableName).download(imageName)
    if (error) throw error
    return await blobToBase64(data)
  }
}

export const PackManager = new PackManagerSingleton()
