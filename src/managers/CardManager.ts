import { Player } from '@/src/models/Player'
import { Tables } from '@/src/models/supabase'
import { Pack } from './PackManager'
import SupabaseManager from './SupabaseManager'

const tableName = 'cards'
const playerTemplateRegex = /\{player\W*(\d+)\}/gi
export type Card = Tables<typeof tableName>
export type PlayedCard = {
  featuredPlayers: Player[] // The players featured in the card content
  formattedContent: string | undefined // The card content with player names inserted
  minPlayers: number // Minimum number of players required to play the card
  pack: Pack | null // The pack to which the card belongs
  players: Player[] // The order of all players in this series of cards
} & Card

class CardManagerSingleton extends SupabaseManager<Card> {
  constructor() {
    super(tableName)
  }

  private readonly cachedPlayerCounts: Map<string, number> = new Map()
  /**
   * Calculates the required player count based on the card's content.
   * The method is memoized to avoid recalculating the same card multiple times.
   */
  getRequiredPlayerCount(card: Card) {
    if (this.cachedPlayerCounts.has(card.id)) {
      return this.cachedPlayerCounts.get(card.id)!
    }

    const matches = card.content.matchAll(playerTemplateRegex)
    let highestIndex = -1
    for (const match of matches) {
      const index = parseInt(match[1])
      if (index > highestIndex) highestIndex = index
    }
    const requiredPlayerCount = highestIndex + 1
    this.cachedPlayerCounts.set(card.id, requiredPlayerCount)
    if (requiredPlayerCount === 0 && !card.is_group) return 1
    return requiredPlayerCount
  }
}

export const CardManager = new CardManagerSingleton()
