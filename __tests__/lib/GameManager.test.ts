import { Card, CardManager, PlayedCard } from '@/src/managers/CardManager'
import { CardRelation, CardRelationManager } from '@/src/managers/CardRelationManager'
import GameManager from '@/src/managers/GameManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import { Player } from '@/src/models/Player'
import { AppContextType } from '@/src/providers/AppContextProvider'

// Suppress console.warn messages
console.warn = jest.fn()
jest.mock('@/src/lib/supabase', () => ({ supabase: {} }))
jest.mock('@/src/lib/utils', () => ({
  ...jest.requireActual('@/src/lib/utils'),
  getRandomPercent: jest.fn(() => 0.5),
  getRandom: jest.fn((collection: Iterable<any>) => [...collection][0]),
  shuffled: jest.fn((collection: Iterable<any>) => [...collection]),
}))

//#region Mocks

const MockedCards = {
  Card_1: { id: '1', category: 'cat1', content: 'Content of card 1', is_group: true, order: 'starting' } as Card,
  Card_2: { id: '2', category: 'cat2', content: 'Content of card 2', is_group: true, order: 'next' } as Card,
  Card_3: { id: '3', category: 'cat3', content: 'Content of card 3', is_group: true, order: 'ending' } as Card,
  Card_4_no_category: { id: '4', content: 'Content of card 4', is_group: true } as Card,
  Card_5_req_2_players: { id: '5', content: 'Content of card 5 {player-0} {player-1}', is_group: false } as Card,
  Card_6_req_5_players: {
    id: '6',
    content: 'Hello {player-0}, how are you {player-4}? ({player-4} is testing {player-0})',
    is_group: false,
  } as Card,
  Card_7_req_10_players: { id: '7', content: 'Content of card 7 {player-9}', is_group: false } as Card,
  Card_8_req_2_players: {
    id: '8',
    category: 'cat8',
    content: 'Content of card 8 {player-0} {player-1}',
    is_group: true,
  } as Card,
}

const MockedCardRelations = {
  CardRelation_1_2: {
    id: 'rel1',
    parent: '1',
    child: '2',
  } as CardRelation,
  CardRelation_2_3: {
    id: 'rel2',
    parent: '2',
    child: '3',
  } as CardRelation,
  CardRelation_1_4: {
    id: 'rel3',
    parent: '1',
    child: '4',
  } as CardRelation,
}

const MockedPacks = {
  Pack_with_1_and_3: {
    id: '1',
    cards: ['1', '3'],
  } as Pack,
  Pack_with_2: {
    id: '2',
    cards: ['2'],
  } as Pack,
  Pack_with_1_and_5_and_6: {
    id: '3',
    cards: ['1', '5', '6'],
  } as Pack,
  Pack_with_8: {
    id: '4',
    cards: ['8'],
  } as Pack,
  Pack_with_all_cards: {
    id: '5',
    cards: Object.values(MockedCards).map(card => card.id),
  } as Pack,
}

const MockedPlayers = {
  Alice: { name: 'Alice', playCount: 0 } as Player,
  Bob: { name: 'Bob', playCount: 0 } as Player,
  Charlie: { name: 'Charlie', playCount: 0 } as Player,
  David: { name: 'David', playCount: 0 } as Player,
  Earl: { name: 'Earl', playCount: 0 } as Player,
  Frank: { name: 'Frank', playCount: 0 } as Player,
  George: { name: 'George', playCount: 0 } as Player,
  Hank: { name: 'Hank', playCount: 0 } as Player,
  Igor: { name: 'Igor', playCount: 0 } as Player,
  John: { name: 'John', playCount: 0 } as Player,
  Kevin: { name: 'Kevin', playCount: 0 } as Player,
}

const MockedPlayedCards = {
  PlayedCard_1: {
    ...MockedCards.Card_1,
    featuredPlayers: [MockedPlayers.Alice],
    formattedContent: 'Content of card 1 Alice',
    pack: MockedPacks.Pack_with_1_and_3,
  } as PlayedCard,
  PlayedCard_2: {
    ...MockedCards.Card_2,
    featuredPlayers: [MockedPlayers.Bob],
    formattedContent: 'Content of card 2 Bob',
    pack: MockedPacks.Pack_with_2,
  } as PlayedCard,
  PlayedCard_3: {
    ...MockedCards.Card_3,
    featuredPlayers: [MockedPlayers.Charlie],
    formattedContent: 'Content of card 3 Charlie',
    pack: MockedPacks.Pack_with_1_and_3,
  } as PlayedCard,
  PlayedCard_4: {
    ...MockedCards.Card_4_no_category,
    featuredPlayers: [MockedPlayers.David],
    formattedContent: 'Content of card 4 David',
    pack: MockedPacks.Pack_with_all_cards,
  } as PlayedCard,
  PlayedCard_5: {
    ...MockedCards.Card_5_req_2_players,
    featuredPlayers: [MockedPlayers.Earl, MockedPlayers.Frank],
    formattedContent: 'Content of card 5 Earl Frank',
    pack: MockedPacks.Pack_with_1_and_5_and_6,
  } as PlayedCard,
  PlayedCard_6: {
    ...MockedCards.Card_6_req_5_players,
    featuredPlayers: [MockedPlayers.George, MockedPlayers.Hank],
    formattedContent: 'Hello George, how are you Hank? (Hank is testing George)',
    pack: MockedPacks.Pack_with_1_and_5_and_6,
  } as PlayedCard,
  PlayedCard_7: {
    ...MockedCards.Card_7_req_10_players,
    featuredPlayers: [MockedPlayers.Igor],
    formattedContent: 'Content of card 7 Igor',
    pack: MockedPacks.Pack_with_all_cards,
  } as PlayedCard,
  PlayedCard_8: {
    ...MockedCards.Card_8_req_2_players,
    featuredPlayers: [MockedPlayers.John, MockedPlayers.Kevin],
    formattedContent: 'Content of card 8 John Kevin',
    pack: MockedPacks.Pack_with_8,
  } as PlayedCard,
}

const MockedContext: AppContextType = {
  playedCards: [],
  playedIds: new Set(),
  players: Object.values(MockedPlayers),
  playlist: [MockedPacks.Pack_with_all_cards.id],
  categoryFilter: [],
}

//#endregion

beforeEach(() => {
  CardManager['_items'] = undefined
  CardManager['cachedPlayerCounts'].clear()
  CardManager['set'](Object.values(MockedCards))
  PackManager['_items'] = undefined
  PackManager['set'](Object.values(MockedPacks))
  CardRelationManager['_items'] = undefined
  CardRelationManager['set'](Object.values(MockedCardRelations))
  jest.clearAllMocks()
})

//#region getPlayableCards

describe('getPlayableCards', () => {
  it('should return cards that are playable based on player count and category filter', () => {
    const context = {
      categoryFilter: ['cat1'],
      playedCards: [],
      playedIds: new Set(),
      players: [MockedPlayers.Alice, MockedPlayers.Bob],
      playlist: ['3'],
    } satisfies AppContextType

    const result = GameManager.getPlayableCards(MockedPacks.Pack_with_1_and_5_and_6.id, context)

    expect(result.keys()).toContain(MockedCards.Card_5_req_2_players.id)
    expect(result.size).toBe(1)
  })
})

//#endregion

//#region drawCard

describe('drawCard', () => {
  it('should return a card if available', () => {
    const result = GameManager.drawCard(MockedContext)

    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
  })

  it('should return null if no candidates are available', () => {
    const context = {
      ...MockedContext,
      playedCards: Object.values(MockedPlayedCards),
      playedIds: new Set(Object.values(MockedPlayedCards).map(c => c.id)),
    } satisfies AppContextType

    const result = GameManager.drawCard(context)
    expect(result).toBeUndefined()
  })

  it('should return a card with an unfiltered category', () => {
    const context = {
      ...MockedContext,
      players: [MockedPlayers.Alice, MockedPlayers.Bob],
      playlist: [MockedPacks.Pack_with_1_and_5_and_6.id],
      categoryFilter: ['cat1'],
    } satisfies AppContextType
    const result = GameManager.drawCard(context)

    expect(result).not.toBeUndefined()
    expect(result?.id).toBe(MockedCards.Card_5_req_2_players.id)
  })

  it('should return a parent before a child', () => {
    const players = [MockedPlayers.Alice, MockedPlayers.Bob]
    const pack = MockedPacks.Pack_with_2
    const playedCards = [{ ...MockedCards.Card_1, pack, players } as PlayedCard]
    const context = {
      ...MockedContext,
      playedCards: playedCards,
      playedIds: new Set(playedCards.map(c => c.id)),
      playlist: [MockedPacks.Pack_with_2.id, MockedPacks.Pack_with_1_and_3.id],
    } satisfies AppContextType

    const firstResult = GameManager.drawCard(context)
    expect(firstResult?.id).toBe('2')
    expect(firstResult?.players).toBe(players)

    const nextContext = {
      ...context,
      playedCards: [...playedCards, firstResult as PlayedCard],
      playedIds: new Set([...context.playedIds, firstResult!.id]),
    } satisfies AppContextType

    const nextResult = GameManager.drawCard(nextContext)
    expect(nextResult?.id).toBe('3')
    expect(nextResult?.pack).toBe(MockedPacks.Pack_with_1_and_3)
    expect(nextResult?.players).toBe(firstResult?.players)
  })

  it('should prioritize players with the lowest play count', () => {
    const players = [
      {
        ...MockedPlayers.Alice,
        playCount: 3,
      },
      {
        ...MockedPlayers.Bob,
        playCount: 10,
      },
      {
        ...MockedPlayers.Charlie,
        playCount: 1,
      },
      {
        ...MockedPlayers.David,
        playCount: 10,
      },
    ] as Player[]

    const context = {
      ...MockedContext,
      players,
      playlist: [MockedPacks.Pack_with_8.id],
    }

    const result = GameManager.drawCard(context)

    expect(result?.formattedContent).toEqual('Content of card 8 Charlie Alice')
    expect(result?.featuredPlayers).toEqual([players[2], players[0]])
    expect(result?.players).toEqual([players[2], players[0], players[1], players[3]])
  })

  it('should always return starting cards first', () => {
    const cards = [
      {
        ...MockedCards.Card_4_no_category,
        order: 'ending',
      } as Card,
      {
        ...MockedCards.Card_5_req_2_players,
        order: 'starting',
      } as Card,
    ]

    CardManager['_items'] = undefined
    CardManager['set'](cards)

    const result = GameManager.drawCard(MockedContext)

    expect(result?.id).toBe(MockedCards.Card_5_req_2_players.id)
  })

  it('should only return ending cards if no other cards are available', () => {
    const cards: Set<Card> = new Set([
      {
        ...MockedCards.Card_1,
        order: 'ending',
      },
      MockedCards.Card_5_req_2_players,
      MockedCards.Card_6_req_5_players,
    ])

    CardManager['_items'] = undefined
    CardManager['set'](cards)

    const firstResult = GameManager.drawCard(MockedContext)

    expect(firstResult?.id).not.toBe(MockedCards.Card_1.id)

    const playedCards = [
      {
        ...MockedCards.Card_5_req_2_players,
        pack: MockedPacks.Pack_with_1_and_5_and_6,
      } as PlayedCard,
      {
        ...MockedCards.Card_6_req_5_players,
        pack: MockedPacks.Pack_with_1_and_5_and_6,
      } as PlayedCard,
    ]

    const context = {
      ...MockedContext,
      pack: MockedPacks.Pack_with_1_and_5_and_6,
      playedCards,
      playedIds: new Set(playedCards.map(c => c.id)),
    } as AppContextType

    const nextResult = GameManager.drawCard(context)

    expect(nextResult?.id).toBe(MockedCards.Card_1.id)
  })
})

//#endregion
