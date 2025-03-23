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

export type Pack = Tables<typeof tableName> & { cards: string[] } & { availability: PackAvailability }
export type UnplayableReason = 'subscription' | 'cardCount' | 'dateRestriction'
export type PackAvailability = {
  isAvailable: boolean
  start?: { soon: boolean; daysUntil: number }
  end?: { soon: boolean; daysUntil: number }
}

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

    const packs = data.map(
      pack =>
        ({
          ...pack,
          cards: pack.cards.map(card => card.id),
          availability: this.getAvailability(pack),
        }) satisfies Pack
    )

    this.set(packs)
    return packs
  }

  getAvailability(
    pack: { start_date: string | null; end_date: string | null },
    todayArg: Date = new Date()
  ): PackAvailability {
    if (!pack.start_date && !pack.end_date) return { isAvailable: true }

    const dayLimit = ConfigurationManager.getValue('pre_period_days') ?? 14
    const today = new Date(todayArg.getFullYear(), todayArg.getMonth(), todayArg.getDate())

    if (pack.start_date && !pack.end_date) return this.checkStartDate(pack.start_date, dayLimit, today)
    if (!pack.start_date && pack.end_date) return this.checkEndDate(pack.end_date, dayLimit, today)

    return this.checkDateRange(pack.start_date!, pack.end_date!, dayLimit, today)
  }

  private checkStartDate(date: string, dayLimit: number, today: Date) {
    const daysUntil = this.daysUntil(new Date(date), today)
    return {
      isAvailable: daysUntil <= 0,
      start: { soon: daysUntil > 0 && daysUntil <= dayLimit, daysUntil },
    }
  }

  private checkEndDate(date: string, dayLimit: number, today: Date) {
    const daysUntil = this.daysUntil(new Date(date), today)
    return {
      isAvailable: daysUntil >= 0,
      end: { soon: daysUntil > 0 && daysUntil <= dayLimit, daysUntil },
    }
  }

  private checkDateRange(startDate: string, endDate: string, dayLimit: number, today: Date) {
    const todayYearless = this.dateToYearless(today)
    const yearlessStartDate = startDate.slice(5, 10)
    const yearlessEndDate = endDate.slice(5, 10)

    const isCrossingYearBoundary = yearlessStartDate > yearlessEndDate

    const daysUntilStart = this.daysUntilYearless(yearlessStartDate, today)
    const daysUntilEnd = this.daysUntilYearless(yearlessEndDate, today)

    const isAvailable = isCrossingYearBoundary
      ? todayYearless >= yearlessStartDate || todayYearless <= yearlessEndDate
      : todayYearless >= yearlessStartDate && todayYearless <= yearlessEndDate

    return {
      isAvailable,
      start: { soon: !isAvailable && daysUntilStart <= dayLimit, daysUntil: daysUntilStart },
      end: { soon: isAvailable && daysUntilEnd <= dayLimit, daysUntil: daysUntilEnd },
    }
  }

  /**
   * Returns the number of days until the given date, ignoring the year.
   * If the date is in the past, it will return the number of days until the same date next year.
   * @returns The number of days until the given date, positive if in the future, negative if in the past
   */
  private daysUntil(date: Date, today: Date = new Date()): number {
    return this.msToDays(date.getTime() - today.getTime())
  }

  /**
   * Returns the number of days until the next ocurrence given yearless date.
   * @returns The number of days until the given date, always positive
   */
  private daysUntilYearless(yearlessDate: string, today: Date = new Date()): number {
    if (yearlessDate.length !== 5 || yearlessDate[2] !== '-') {
      throw new Error(`Invalid yearless date: '${yearlessDate}'`)
    }

    const yearlessToday = this.dateToYearless(today)
    const year = today.getFullYear() + (yearlessDate < yearlessToday ? 1 : 0)
    const date = new Date(`${year}-${yearlessDate}`)
    return this.daysUntil(date, today)
  }

  private dateToYearless(date: Date) {
    return (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0')
  }

  private msToDays(ms: number) {
    return Math.floor(ms / (1000 * 60 * 60 * 24))
  }

  private isPlayable(totalCardCount: number, playableCardCount: number) {
    const minPlayableCards = ConfigurationManager.getValue('min_playable_cards') ?? 10
    return playableCardCount > 0 && (playableCardCount >= minPlayableCards || totalCardCount < minPlayableCards)
  }

  validatePlayability(isSubscribed: boolean, pack: Pack, playableCardCount: number): Set<UnplayableReason> {
    const reasons: Set<UnplayableReason> = new Set()

    if (!this.isPlayable(pack.cards.length, playableCardCount)) reasons.add('cardCount')
    if (!pack.availability.isAvailable) reasons.add('dateRestriction')
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
