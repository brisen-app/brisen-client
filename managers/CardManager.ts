import { getRandom, getRandomPercent, shuffled } from '../lib/utils'
import { InsufficientCountError } from '@/models/Errors'
import { Pack, PackManager } from './PackManager'
import { Tables } from '@/models/supabase'
import SupabaseManager from './SupabaseManager'
import { CardRelationManager } from './CardRelationManager'
import { Player } from '@/models/Player'
import { CategoryManager } from './CategoryManager'

const tableName = 'cards'
const playerTemplateRegex = /\{player\W*(\d+)\}/gi
export type Card = Tables<typeof tableName>
export type PlayedCard = {
  featuredPlayers: Set<Player> // The players featured in the card content
  formattedContent: string | undefined // The card content with player names inserted
  minPlayers: number // Minimum number of players required to play the card
  pack: Pack // The pack to which the card belongs
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
    playlist: Set<Pack>,
    players: Set<Player>,
    categoryFilterIds: Set<string>
  ): PlayedCard | null {
    const candidates = this.findCandidates(playlist, playedIds, players.size, categoryFilterIds)
    if (candidates.size === 0) return null

    let card = this.drawClosingCard(playedCards, playedIds)
    card = card ?? getRandom(candidates.values())
    if (card === null) return null

    const parentId = CardRelationManager.getUnplayedParent(card.id, new Set(candidates.keys()))
    if (parentId) card = candidates.get(parentId) ?? card

    const playerList =
      this.getParentPlayerList(card, playedCards, playedIds) ??
      shuffled(players).sort((a, b) => a.playCount - b.playCount)

    const { formattedContent, featuredPlayers } = this.insertPlayers(card.content, playerList)
    if (!card.is_group && playerList.length > 0) featuredPlayers.set(playerList[0].name, playerList[0])

    return {
      ...card,
      minPlayers: this.getRequiredPlayerCount(card),
      pack: PackManager.getPackOf(card.id, playlist)!,
      players: playerList,
      featuredPlayers: new Set(featuredPlayers.values()),
      formattedContent,
    }
  }

  private drawClosingCard(playedCards: PlayedCard[], playedIds: Set<string>, maxAge = 12) {
    const unclosedPlayedCards = new Map<number, Card>()

    for (let i = 0; i < playedCards.length; i++) {
      const card = playedCards[i]
      const unplayedChildId = CardRelationManager.getUnplayedChild(card.id, playedIds)
      if (!unplayedChildId) continue
      const unplayedChild = CardManager.get(unplayedChildId)
      if (!unplayedChild) continue
      unclosedPlayedCards.set(playedCards.length - i, unplayedChild)
    }

    const chance = getRandomPercent() * maxAge
    for (const [age, card] of unclosedPlayedCards) {
      if (age < 3) continue
      console.log(age, '>', chance, '=', age > chance)
      if (age > chance) return card
    }
    return null
  }

  private findCandidates(
    playlist: Set<Pack>,
    playedIds: Set<string>,
    playerCount: number,
    categoryFilterIds: Set<string>
  ) {
    const candidates = new Map<string, Card>()

    for (const pack of playlist) {
      for (const cardId of pack.cards) {
        const card = this.get(cardId)!
        if (
          card &&
          !playedIds.has(card.id) &&
          (!card.category || !categoryFilterIds.has(card.category)) &&
          playerCount >= CardRelationManager.getRequiredPlayerCount(card.id)
        )
          candidates.set(card.id, card)
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
      var player = players[index]
      formattedContent = formattedContent.replace(matchedString, player.name)
      featuredPlayers.set(player.name, player)
    }

    if (formattedContent === cardContent) return { featuredPlayers }
    return { formattedContent, featuredPlayers }
  }

  private cachedPlayerCounts: Map<string, number> = new Map()
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
    return requiredPlayerCount
  }
}

export const CardManager = new CardManagerSingleton()
