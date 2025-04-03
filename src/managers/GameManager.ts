import { getRandom, getRandomPercent, shuffled } from '../lib/utils'
import { Player } from '../models/Player'
import { AppContextType } from '../providers/AppContextProvider'
import { Card, CardManager, PlayedCard } from './CardManager'
import { CardRelationManager } from './CardRelationManager'
import { ConfigurationManager } from './ConfigurationManager'
import { Pack, PackManager } from './PackManager'

const PLAYER_REGEX = /\{player\W*(\d+)\}/gi

class GameManagerSingleton {
  public drawCard(c: AppContextType): PlayedCard | undefined {
    const card = this.selectCard(c) ?? undefined
    if (!card) return card

    const playerList =
      this.getParentPlayerList(card, c) ?? [...shuffled(c.players)].sort((a, b) => a.playCount - b.playCount)

    return this.toPlayedCard(card, playerList, c)
  }

  /**
   * Retrieves the next card to be played based on the given app context.
   */
  private selectCard(c: AppContextType): Card | null | undefined {
    console.debug('Drawing card...')

    const { orderedCandidates, unorderedCandidates } = this.findCandidates(c)

    const startingCards = this.getStartingCards(orderedCandidates)
    if (startingCards.size > 0) return getRandom(startingCards.values())

    const nextCards = this.getNextCards(orderedCandidates, c)
    if (nextCards.size > 0) return getRandom(nextCards.values())

    const endingCards = this.getEndingCards(orderedCandidates, unorderedCandidates, c)
    const candidates = new Map([...unorderedCandidates, ...endingCards])
    return this.drawClosingCard(c) ?? getRandom(candidates.values())
  }

  /**
   * Finds all valid candidates to be played based on the given app context.
   */
  private findCandidates(c: AppContextType) {
    const unorderedCandidates = new Map<string, Card>()
    const orderedCandidates = new Map<string, Card>()

    for (const packId of c.playlist) {
      const pack = PackManager.get(packId)
      if (!pack) continue
      for (const cardId of pack.cards) {
        const card = CardManager.get(cardId)
        if (!card || !this.isCandidate(card, c)) continue
        if (card.order) orderedCandidates.set(card.id, card)
        else unorderedCandidates.set(card.id, card)
      }
    }

    return { orderedCandidates, unorderedCandidates }
  }

  public getPlayableCards(packId: string, c: AppContextType) {
    const { orderedCandidates, unorderedCandidates } = this.findCandidates({
      ...c,
      playedCards: [],
      playedIds: new Set(),
      playlist: [packId],
    })
    return new Map([...unorderedCandidates, ...orderedCandidates])
  }

  /**
   * Determines if the given card is a valid candidate to be played.
   */
  private isCandidate(card: Card, c: AppContextType) {
    const beenPlayed = c.playedIds.has(card.id)
    if (beenPlayed) return false

    const validCategory = !card.category || !c.categoryFilter.includes(card.category)
    if (!validCategory) return false

    const allParentsHaveBeenPlayed = [...CardRelationManager.getParents(card.id)].every(parent =>
      c.playedIds.has(parent)
    )
    if (!allParentsHaveBeenPlayed) return false

    const enoughPlayers = c.players.length >= CardRelationManager.getRequiredPlayerCount(card.id)
    if (!enoughPlayers) return false

    return true
  }

  private getStartingCards(orderedCandidates: Map<string, Card>): Map<string, Card> {
    return new Map([...orderedCandidates].filter(([_, v]) => v.order === 'starting'))
  }

  private getEndingCards(
    orderedCandidates: Map<string, Card>,
    unorderedCandidates: Map<string, Card>,
    c: AppContextType
  ) {
    const availableEndingCards: Map<string, Card> = new Map()

    for (const packId of c.playlist) {
      const pack = PackManager.get(packId)
      if (!pack) continue

      const candidatesFromPack = pack.cards
        .map(id => unorderedCandidates.get(id) ?? orderedCandidates.get(id))
        .filter(c => !!c)

      if (!candidatesFromPack.every(c => c.order === 'ending')) continue
      candidatesFromPack.forEach(c => availableEndingCards.set(c.id, c))
    }

    return availableEndingCards
  }

  /**
   * Retrieves cards that are marked as "next" and have a direct parent that has been played.
   */
  private getNextCards(orderedCandidates: Map<string, Card>, c: AppContextType) {
    return new Map(
      [...orderedCandidates].filter(
        ([_, card]) => card.order === 'next' && CardRelationManager.hasDirectPlayedParent(card.id, c.playedIds)
      )
    )
  }

  private drawClosingCard(c: AppContextType) {
    const unplayedChildren = new Map<number, Card>()
    const maxAge = ConfigurationManager.getValue('max_unclosed_card_age') ?? 10
    const maxSimultanousOpenCards = ConfigurationManager.getValue('max_simultaneous_open_cards') ?? 5

    for (let i = 0; i < c.playedCards.length; i++) {
      const card = c.playedCards[i]

      // Don't draw children from packs that are not in the playlist anymore
      if (!c.playlist.includes(card.pack.id)) continue

      const unplayedChildrenIds = [...CardRelationManager.getChildren(card.id) ?? []].filter(id => !c.playedIds.has(id))
      if (!unplayedChildrenIds || unplayedChildrenIds.length === 0) continue

      const unplayedChildId = getRandom(unplayedChildrenIds)
      if (!unplayedChildId) continue

      const unplayedChild = CardManager.get(unplayedChildId)
      if (!unplayedChild) continue

      unplayedChildren.set(c.playedCards.length - i, unplayedChild)
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

    return null
  }

  private toPlayedCard(card: Card, players: Player[], c: AppContextType): PlayedCard {
    const { formattedContent, featuredPlayers } = this.formatContent(card, players)

    return {
      ...card,
      minPlayers: CardManager.getRequiredPlayerCount(card),
      pack: this.getClosestPack(card, c),
      players,
      featuredPlayers: Array.from(featuredPlayers.values()),
      formattedContent,
    }
  }

  private getClosestPack(card: Card, c: AppContextType): Pack {
    for (const packId of c.playlist) {
      const p = PackManager.get(packId)
      if (p?.cards.includes(card.id)) {
        return p
      }
    }

    let parent: string | null = card.id
    while (parent) {
      parent = CardRelationManager.getPlayedParent(parent, c.playedIds)
      if (parent) {
        const pack = c.playedCards.find(c => c.id === parent)?.pack
        if (pack) return pack
      }
    }

    throw new Error(`Could not find pack for card ${card.id}`)
  }

  /**
   * Formats the content of the card to include player names.
   *
   * @returns The formatted content and all players that are mentioned.
   */
  private formatContent(
    card: Card,
    players: Player[]
  ): { formattedContent?: string; featuredPlayers: Map<string, Player> } {
    let featuredPlayers = new Map<string, Player>()
    if (!card.is_group && players.length > 0) featuredPlayers.set(players[0].name, players[0])

    const matches = card.content.matchAll(PLAYER_REGEX)
    if (!matches) return { featuredPlayers }

    let formattedContent = card.content
    for (const match of matches) {
      const matchedString = match[0]
      const index = parseInt(match[1])
      if (index >= players.length)
        throw new Error(`Not enough players (${players.length}) to insert ${matchedString} into card.`)
      const player = players[index]
      formattedContent = formattedContent.replace(matchedString, player.name)
      featuredPlayers.set(player.name, player)
    }

    if (formattedContent === card.content) return { featuredPlayers }
    return { formattedContent, featuredPlayers }
  }

  /**
   * Retrieves the player list of a parent card that has been played.
   */
  private getParentPlayerList(card: Card, c: AppContextType) {
    return c.playedCards.find(pc => CardRelationManager.getParents(card.id).has(pc.id))?.players
  }
}

const GameManager = new GameManagerSingleton()
export default GameManager
