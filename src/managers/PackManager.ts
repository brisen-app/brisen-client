import { blobToBase64, emptyQuery } from '@/src/lib/utils'
import { LanguageManager } from './LanguageManager'
import { NotFoundError } from '@/src/models/Errors'
import { supabase } from '../lib/supabase'
import { Tables } from '@/src/models/supabase'
import { useQuery } from '@tanstack/react-query'
import SupabaseManager from './SupabaseManager'

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
    if (!this._items) return []
    return [...this._items.values()].filter(pack => pack.cards.has(cardId)) ?? []
  }

  async fetchAll(): Promise<Pack[]> {
    const { data } = await supabase
      .from(tableName)
      .select(select)
      .eq('language', LanguageManager.getDisplayLanguage().id)
      .order('name')
      .throwOnError()
    if (!data || data.length === 0)
      throw new NotFoundError(
        `No data found in table '${this.tableName}' for language '${LanguageManager.getDisplayLanguage().id}'`
      )

    const packs = data.map(pack => ({
      ...pack,
      cards: new Set(pack.cards.map(card => card.id)),
    }))

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
