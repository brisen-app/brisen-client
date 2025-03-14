import { InsufficientCountError } from '@/src/models/Errors'
import { Player } from '@/src/models/Player'
import { Tables } from '@/src/models/supabase'
import { getRandom, getRandomPercent, shuffled } from '../lib/utils'
import { CardRelationManager } from './CardRelationManager'
import { ConfigurationManager } from './ConfigurationManager'
import { Pack, PackManager } from './PackManager'
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

  /**
   * Retrieves the next card to be played based on the given parameters.
   *
   * @param playedCards - An array of previously played cards.
   * @param playedIds - A set of previously played card ids.
   * @param playlist - A set of selected packs.
   * @param players - A set of strings representing player names.
   * @param categoryFilterIds - A set of categories to exclude from the card selection.
   * @returns The next card to be played, or null if no valid card is available.
   */
  drawCard(
    playedCards: PlayedCard[],
    playedIds: Set<string>,
    playlistIds: string[],
    players: Player[],
    categoryFilterIds: Set<string>
  ): PlayedCard | null {
    console.debug('Drawing card...')
    const playlist = new Set(playlistIds.map(id => PackManager.get(id)))
    let candidates = this.findCandidates(playlist, playedIds, players.length, categoryFilterIds)
    let card = this.drawClosingCard(playedCards, playedIds, candidates.size)

    candidates = this.getOrderedCards(candidates, 'starting')
    const endingCandidates = this.getOrderedCards(candidates, 'ending')
    candidates = this.removeOrderedCards(candidates, 'ending')

    card ??= getRandom(candidates.values())
    card ??= getRandom(endingCandidates.values())
    if (!card) return null

    const parentId = CardRelationManager.getUnplayedParent(card.id, new Set(candidates.keys()))
    if (parentId) card = candidates.get(parentId) ?? card

    const playerList =
      this.getParentPlayerList(card, playedCards, playedIds) ??
      [...shuffled(players)].sort((a, b) => a.playCount - b.playCount)

    const { formattedContent, featuredPlayers } = this.insertPlayers(card.content, playerList)
    if (!card.is_group && playerList.length > 0) featuredPlayers.set(playerList[0].name, playerList[0])

    let pack = PackManager.getPackOf(card.id, playlist)
    if (!pack) {
      const parent = CardRelationManager.getPlayedParent(card.id, playedIds)
      if (parent) pack = playedCards.find(c => c.id === parent)?.pack ?? null
    }

    return {
      ...card,
      minPlayers: this.getRequiredPlayerCount(card),
      pack,
      players: playerList,
      featuredPlayers: Array.from(featuredPlayers.values()),
      formattedContent,
    }
  }

  private getOrderedCards(candidates: Map<string, Card>, order: Exclude<Card['order'], null>) {
    let results = new Map<string, Card>()
    for (const card of candidates.values()) {
      if (card.order === order) results.set(card.id, card)
    }
    return results.size > 0 ? results : candidates
  }

  private removeOrderedCards(candidates: Map<string, Card>, order: Exclude<Card['order'], null>) {
    const results = new Map<string, Card>()
    for (const card of candidates.values()) {
      if (card.order !== order) results.set(card.id, card)
    }
    return results
  }

  private drawClosingCard(playedCards: PlayedCard[], playedIds: Set<string>, candidateCount: number) {
    const unplayedChildren = new Map<number, Card>()
    const maxAge = ConfigurationManager.getValue('max_unclosed_card_age') ?? 10
    const maxSimultanousOpenCards = ConfigurationManager.getValue('max_simultaneous_open_cards') ?? 5

    for (let i = 0; i < playedCards.length; i++) {
      const card = playedCards[i]
      const unplayedChildId = CardRelationManager.getUnplayedChild(card.id, playedIds)
      if (!unplayedChildId) continue
      const unplayedChild = CardManager.get(unplayedChildId)
      if (!unplayedChild) continue
      unplayedChildren.set(playedCards.length - i, unplayedChild)
    }

    const chance = getRandomPercent() * maxAge
    for (const [age, child] of unplayedChildren) {
      if (age > 3 && age > chance) {
        console.log(`Drawing closing card ${child.id} with age ${age}`)
        return child
      }
    }
    if (unplayedChildren.size >= maxSimultanousOpenCards) {
      console.log('Too many open cards, returning closing card...')
      return getRandom(unplayedChildren.values())
    }
    return candidateCount === 0 ? getRandom(unplayedChildren.values()) : null
  }

  getPlayableCards(pack: Pack, playerCount: number, categoryFilter: Set<string>) {
    return this.findCandidates(new Set([pack]), new Set(), playerCount, categoryFilter)
  }

  private findCandidates(
    playlist: Set<Pack | undefined>,
    playedIds: Set<string>,
    playerCount: number,
    categoryFilterIds: Set<string>
  ): Map<string, Card> {
    const candidates = new Map<string, Card>()

    for (const pack of playlist) {
      if (!pack) continue
      for (const cardId of pack.cards) {
        const card = this.get(cardId)
        if (
          card &&
          !playedIds.has(card.id) &&
          (!card.category || !categoryFilterIds.has(card.category)) &&
          playerCount >= CardRelationManager.getRequiredPlayerCount(card.id)
        ) {
          candidates.set(card.id, card)
        }
      }
    }

    return candidates
  }

  private getParentPlayerList(card: Card, playedCards: PlayedCard[], playedIds: Set<string>) {
    const playedParent = CardRelationManager.getPlayedParent(card.id, playedIds)
    if (!playedParent) return null
    for (const playedCard of playedCards) {
      if (playedCard.id === playedParent) return playedCard.players
    }
    return null
  }

  /**
   * Inserts the names of players into the card content.
   * Formats the card content by replacing `{player-#}` with the name of the player at the corresponding index.
   * `{player-0}` will always be the targeted player if `is_group` is `false`.
   *
   * @param cardContent - The original card content.
   * @param players - An array of player names.
   * @returns The modified card content with player names inserted, or `null` if no replacements were made.
   * @throws InsufficientCountError if there are not enough players to insert into the card.
   */
  private insertPlayers(
    cardContent: string,
    players: Player[]
  ): { formattedContent?: string; featuredPlayers: Map<string, Player> } {
    let featuredPlayers = new Map<string, Player>()
    const matches = cardContent.matchAll(playerTemplateRegex)
    if (!matches) return { featuredPlayers }

    let formattedContent = cardContent
    for (const match of matches) {
      const matchedString = match[0]
      const index = parseInt(match[1])
      if (index >= players.length)
        throw new InsufficientCountError(`Not enough players (${players.length}) to insert ${matchedString} into card.`)
      const player = players[index]
      formattedContent = formattedContent.replace(matchedString, player.name)
      featuredPlayers.set(player.name, player)
    }

    if (formattedContent === cardContent) return { featuredPlayers }
    return { formattedContent, featuredPlayers }
  }

  private readonly cachedPlayerCounts: Map<string, number> = new Map()
  /**
   * Calculates the required player count based on the card's content.
   * The method is memoized to avoid recalculating the same card multiple times.
   *
   * @param card - The card for which to retrieve the required player count.
   * @returns The required player count for the card.
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
