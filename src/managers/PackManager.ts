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
export type UnplayableReason = 'subscription' | 'cardCount' | 'dateRestriction'

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

  /**
   * Returns the number of days until the given date, ignoring the year.
   * If the date is in the past, it will return the number of days until the same date next year.
   * @returns The number of days until the given date
   */
  daysUntil(date: Date, today: Date = new Date()): number {
    if (date.toISOString().slice(0, 10) < today.toISOString().slice(0, 10)) {
      date.setFullYear(today.getFullYear() + 1)
    }

    return Math.max(0, this.msToDays(date.getTime() - today.getTime()))
  }

  isComingSoon(pack: Pack, today: Date = new Date()): boolean | undefined {
    const dayLimit = ConfigurationManager.getValue('coming_soon_period_length') ?? 14
    if (!pack.start_date) return undefined
    return !this.isWithinDateRange(pack, today) && this.daysUntil(new Date(pack.start_date), today) <= dayLimit
  }

  private msToDays(ms: number) {
    return Math.round(ms / (1000 * 60 * 60 * 24))
  }

  isPlayable(totalCardCount: number, playableCardCount: number) {
    const minPlayableCards = ConfigurationManager.getValue('min_playable_cards') ?? 10
    return playableCardCount > 0 && (playableCardCount >= minPlayableCards || totalCardCount < minPlayableCards)
  }

  validatePlayability(isSubscribed: boolean, pack: Pack, playableCardCount: number): Set<UnplayableReason> {
    const reasons: Set<UnplayableReason> = new Set()

    if (!PackManager.isPlayable(pack.cards.length, playableCardCount)) reasons.add('cardCount')
    if (!PackManager.isWithinDateRange(pack)) reasons.add('dateRestriction')
    if (!pack.is_free && !isSubscribed) reasons.add('subscription')
    return reasons
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
