import { blobToBase64, emptyQuery } from '@/src/lib/utils'
import { NotFoundError } from '@/src/models/Errors'
import { Tables } from '@/src/models/supabase'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { ConfigurationManager } from './ConfigurationManager'
import { LanguageManager } from './LanguageManager'
import SupabaseManager from './SupabaseManager'

const tableName = 'packs'
const select = '*, cards(id)'
export type Pack = Tables<typeof tableName> & { cards: string[] }

class PackManagerSingleton extends SupabaseManager<Pack> {
  constructor() {
    super(tableName)
  }

  get items() {
    if (!this._items) return undefined
    return [...this._items.values()]?.sort((a, b) => a.name.localeCompare(b.name))
  }

  getPackOf(cardId: string, playlist: Set<Pack | undefined>) {
    for (const pack of playlist) {
      if (pack?.cards.includes(cardId)) return pack
    }
    return null
  }

  getPacksOf(cardId: string) {
    if (!this._items) return []
    return [...this._items.values()].filter(pack => pack.cards.includes(cardId)) ?? []
  }

  async fetchAll(): Promise<Pack[]> {
    const { data } = await supabase
      .from(tableName)
      .select(select)
      .eq('language', LanguageManager.getLanguage().id)
      .order('name')
      .throwOnError()
    if (!data || data.length === 0)
      throw new NotFoundError(
        `No data found in table '${this.tableName}' for language '${LanguageManager.getLanguage().id}'`
      )

    const packs = data.map(pack => ({
      ...pack,
      cards: pack.cards.map(card => card.id),
    }))

    this.set(packs)
    return packs
  }

  isWithinDateRange(pack: Pack, today: Date = new Date()): boolean {
    if (!pack.start_date && !pack.end_date) return true

    const startDate = pack.start_date ? new Date(pack.start_date) : null
    const endDate = pack.end_date ? new Date(pack.end_date) : null
    endDate?.setDate(endDate.getDate() + 1) // Include full end date

    if (startDate && !endDate) return startDate <= today
    if (endDate && !startDate) return today <= endDate

    const yearlessToday = today.toISOString().slice(5, 10)
    const yearlessStartDate = pack.start_date!.slice(5, 10)
    const yearlessEndDate = pack.end_date!.slice(5, 10)

    if (yearlessStartDate > yearlessEndDate) {
      return yearlessStartDate <= yearlessToday || yearlessToday <= yearlessEndDate
    }

    return yearlessStartDate <= yearlessToday && yearlessToday <= yearlessEndDate
  }

  isPlayable(totalCardCount: number, playableCardCount: number) {
    const minPlayableCards = ConfigurationManager.getValue('min_playable_cards') ?? 10
    return playableCardCount > 0 && (playableCardCount >= minPlayableCards || totalCardCount < minPlayableCards)
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
