import * as utils from '@/src/lib/utils'
import { Card, CardManager, PlayedCard } from '@/src/managers/CardManager'
import { CardRelationManager } from '@/src/managers/CardRelationManager'
import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import { InsufficientCountError } from '@/src/models/Errors'
import { Player } from '@/src/models/Player'

//#region Mocks

const MockedCards = {
  Card_1: { id: '1', category: 'cat1', content: 'Content of card 1', is_group: true } as Card,
  Card_2: { id: '2', category: 'cat2', content: 'Content of card 2', is_group: true } as Card,
  Card_3: { id: '3', category: 'cat3', content: 'Content of card 3', is_group: true } as Card,
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

// Suppress console.warn messages
console.warn = jest.fn()

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

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        throwOnError: () => ({ data: Object.values(MockedCards) }),
        eq: (columnName: keyof Card, value: string) => ({
          single: () => ({
            throwOnError: () => ({ data: Object.values(MockedCards).find(item => item[columnName] === value) }),
          }),
        }),
      }),
    }),
  },
}))

//#endregion

beforeEach(() => {
  CardManager['_items'] = undefined
  CardManager['cachedPlayerCounts'].clear()
  jest.clearAllMocks()
})

//#region insertPlayers

describe('insertPlayers', () => {
  it('should not change the content in place', () => {
    const testString = MockedCards.Card_6_req_5_players.content
    const result = CardManager['insertPlayers'](testString, Object.values(MockedPlayers))
    expect(testString).toBe(MockedCards.Card_6_req_5_players.content)
    expect(result).not.toBe(MockedCards.Card_6_req_5_players.content)
  })

  const testCases = [
    {
      cardContent: MockedCards.Card_6_req_5_players.content,
      players: Object.values(MockedPlayers),
      expected: 'Hello Alice, how are you Earl? (Earl is testing Alice)',
    },
    { cardContent: 'Hello {player-10}', players: Object.values(MockedPlayers), expected: 'Hello Kevin' },
    { cardContent: 'Hello {plopper-0}', players: Object.values(MockedPlayers), expected: undefined },
  ]

  testCases.forEach(({ cardContent, players, expected }) => {
    it(`should return '${expected}' for "${cardContent}"`, () => {
      const result = CardManager['insertPlayers'](cardContent, players)
      expect(result.formattedContent).toEqual(expected)
    })
  })

  it('should throw an error if a player index is out of bounds', () => {
    expect(() => CardManager['insertPlayers']('Hello {player-11}', Object.values(MockedPlayers))).toThrow(
      InsufficientCountError
    )
  })
})

//#endregion

//#region getRequiredPlayerCount

describe('getRequiredPlayerCount', () => {
  const testCases = [
    {
      card: {
        is_group: false,
        content: 'Hello {player-0}, how are you {player-5}? ({player-2} is testing {player-3})',
      },
      expected: 6,
    },
    {
      card: {
        is_group: true,
        content: 'Hello {player-0}, how are you {player-150}? ({player-3} is testing {player-2})',
      },
      expected: 151,
    },
    { card: { is_group: true, content: 'Hello everyone.' }, expected: 0 },
    { card: { is_group: false, content: '' }, expected: 1 },
  ] as { card: Card; expected: number }[]

  testCases.forEach(({ card, expected }) => {
    it(`should return ${expected} for "${card.content}"`, () => {
      const result = CardManager.getRequiredPlayerCount(card)
      expect(result).toEqual(expected)
    })
  })

  it('should throw an error if card is null', () => {
    // @ts-ignore
    expect(() => CardManager.getRequiredPlayerCount(null)).toThrow(TypeError)
    // @ts-ignore
    expect(() => CardManager.getRequiredPlayerCount(undefined)).toThrow(TypeError)
  })

  it('should cache the result for subsequent calls with the same card content', () => {
    const matchAllSpy = jest.spyOn(String.prototype, 'matchAll')

    const result1 = CardManager.getRequiredPlayerCount(MockedCards.Card_6_req_5_players)
    const result2 = CardManager.getRequiredPlayerCount(MockedCards.Card_6_req_5_players)

    expect(matchAllSpy).toHaveBeenCalledTimes(1)
    expect(result1).toEqual(result2)
  })
})

//#endregion

//#region getPlayableCards

describe('getPlayableCards', () => {
  beforeEach(() => {
    CardManager['set'](Object.values(MockedCards))
  })

  it('should return cards that are playable based on player count and category filter', () => {
    const categoryFilter = new Set(['cat1'])

    const result = CardManager.getPlayableCards(MockedPacks.Pack_with_1_and_5_and_6, 2, categoryFilter)

    expect(result.keys()).toContain(MockedCards.Card_5_req_2_players.id)
    expect(result.size).toBe(1)
  })
})

//#endregion

//#region findCandidates

describe('findCandidates', () => {
  beforeEach(() => {
    CardManager['set'](Object.values(MockedCards))
  })

  it('should return cards from the playlist that have not been played', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])
    const playedIds = new Set(['1'])
    const result = CardManager['findCandidates'](playlist, playedIds, 0, new Set())

    const expected = new Map([[MockedCards.Card_3.id, MockedCards.Card_3.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should return cards that have no category', () => {
    const playlist = new Set([MockedPacks.Pack_with_2])
    const result = CardManager['findCandidates'](playlist, new Set(), 2, new Set())

    const expected = new Map([[MockedCards.Card_2.id, MockedCards.Card_2.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should not return cards that have a category that is filtered', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])
    const categoryFilter = new Set(['cat1'])
    const result = CardManager['findCandidates'](playlist, new Set(), 0, categoryFilter)

    const expected = new Map([[MockedCards.Card_3.id, MockedCards.Card_3.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should return cards that require 2 players or less', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_5_and_6])
    const result = CardManager['findCandidates'](playlist, new Set(), 2, new Set())

    const expected = new Map([
      [MockedCards.Card_1.id, MockedCards.Card_1.valueOf()],
      [MockedCards.Card_5_req_2_players.id, MockedCards.Card_5_req_2_players.valueOf()],
    ])
    expect(result).toEqual(expected)
  })
})

//#endregion

//#region getNextCard

describe('getNextCard', () => {
  beforeEach(() => {
    CardManager['set'](Object.values(MockedCards))
    PackManager['set'](Object.values(MockedPacks))
  })

  it('should return the correct card based on arguments', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_3, MockedCards.Card_4_no_category] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))
    const playlist = [MockedPacks.Pack_with_all_cards.id]
    const players = new Set([MockedPlayers.Alice, MockedPlayers.Bob])
    const categoryFilter = new Set(['cat1', 'cat2', 'cat3', 'cat8', 'cat9'])

    const spyOnShuffled = jest.spyOn(utils, 'shuffled').mockReturnValueOnce(Object.values(MockedPlayers))

    const result = CardManager.drawCard(playedCards, playedIds, playlist, players, categoryFilter)

    expect(spyOnShuffled).toHaveBeenCalledTimes(4)
    expect(result?.id).toBe('5')
  })

  it('should return null if no cards are available', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_3, MockedCards.Card_4_no_category] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))
    const playlist = [MockedPacks.Pack_with_all_cards.id]
    const players = new Set([MockedPlayers.Alice])
    const categoryFilter = new Set(['cat1', 'cat2', 'cat3', 'cat8'])
    const _ = jest.spyOn(utils, 'shuffled').mockReturnValueOnce(Object.values(MockedPlayers))

    const result = CardManager.drawCard(playedCards, playedIds, playlist, players, categoryFilter)
    expect(result).toBeNull()
  })
})

//#endregion

//#region drawClosingCard

describe('drawClosingCard', () => {
  beforeEach(() => {
    CardManager['set'](Object.values(MockedCards))
    jest.clearAllMocks()
  })

  it('should return the correct card based on arguments', () => {
    const playedCards = [
      MockedCards.Card_1,
      { id: '-1' },
      MockedCards.Card_2,
      MockedCards.Card_3,
      MockedCards.Card_4_no_category,
    ] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))

    const getUnplayedChildSpy = jest
      .spyOn(CardRelationManager, 'getUnplayedChild')
      .mockReturnValueOnce('8')
      .mockReturnValueOnce('7')
      .mockReturnValueOnce('6')
      .mockReturnValueOnce('5')

    const getRandomPercentSpy = jest.spyOn(utils, 'getRandomPercent').mockReturnValue(0)

    const result = CardManager['drawClosingCard'](playedCards, playedIds, 10)

    expect(getUnplayedChildSpy).toHaveBeenCalledTimes(5)
    expect(getRandomPercentSpy).toHaveBeenCalledTimes(1)
    expect(result?.id).toBe('8')
  })

  it('should return null if no cards are available', () => {
    const playedCards = [
      MockedCards.Card_1,
      MockedCards.Card_2,
      MockedCards.Card_3,
      MockedCards.Card_4_no_category,
    ] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))

    const getUnplayedChildSpy = jest.spyOn(CardRelationManager, 'getUnplayedChild').mockReturnValue(null)
    const getRandomPercentSpy = jest.spyOn(utils, 'getRandomPercent').mockReturnValue(0.2)

    const result = CardManager['drawClosingCard'](playedCards, playedIds, 0)

    expect(getUnplayedChildSpy).toHaveBeenCalledTimes(4)
    expect(getRandomPercentSpy).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })

  it('should not exceed 5 open cards', () => {
    const playedCards = [
      MockedCards.Card_1,
      MockedCards.Card_2,
      MockedCards.Card_3,
      MockedCards.Card_4_no_category,
      MockedCards.Card_5_req_2_players,
      MockedCards.Card_6_req_5_players,
    ] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))

    const getUnplayedChildSpy = jest.spyOn(CardRelationManager, 'getUnplayedChild').mockReturnValue('1')

    jest.spyOn(utils, 'getRandomPercent').mockReturnValue(Number.MAX_SAFE_INTEGER)
    jest.spyOn(utils, 'getRandom').mockReturnValue(MockedCards.Card_3)
    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(10).mockReturnValueOnce(5)

    const logSpy = jest.spyOn(console, 'log')

    const result = CardManager['drawClosingCard'](playedCards, playedIds, 1)

    expect(getUnplayedChildSpy).toHaveBeenCalledTimes(playedCards.length)
    expect(result?.id).toBe('3')
    expect(logSpy).toHaveBeenLastCalledWith('Too many open cards, returning closing card...')
  })
})

//#endregion

//#region getParentPlayerList

describe('getParentPlayerList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the players of the parent card', () => {
    const playedCards = [
      { ...MockedCards.Card_1, players: [MockedPlayers.Alice, MockedPlayers.Bob] },
      { ...MockedCards.Card_2, players: [MockedPlayers.Charlie, MockedPlayers.David] },
    ] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))

    const spyOnGetPlayedParent = jest.spyOn(CardRelationManager, 'getPlayedParent').mockReturnValue('2')

    const result = CardManager['getParentPlayerList'](MockedCards.Card_3, playedCards, playedIds)

    expect(spyOnGetPlayedParent).toHaveBeenCalledTimes(1)
    expect(result).toEqual(playedCards[1].players)
  })

  it('should return null if the parent card has not been played', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_2, MockedCards.Card_3] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))

    const spyOnGetPlayedParent = jest.spyOn(CardRelationManager, 'getPlayedParent').mockReturnValue('-1')

    const result = CardManager['getParentPlayerList'](MockedCards.Card_1, playedCards, playedIds)

    expect(spyOnGetPlayedParent).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })

  it('should return null if the parent card has not been played', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_2, MockedCards.Card_3] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))

    const spyOnGetPlayedParent = jest.spyOn(CardRelationManager, 'getPlayedParent').mockReturnValue(null)

    const result = CardManager['getParentPlayerList'](MockedCards.Card_1, playedCards, playedIds)

    expect(spyOnGetPlayedParent).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })
})

//#endregion

//#region drawCard

describe('drawCard', () => {
  beforeEach(() => {
    CardManager['set'](Object.values(MockedCards))
    PackManager['set'](Object.values(MockedPacks))
    jest.restoreAllMocks()
  })

  it('should return null if no candidates are available', () => {
    const cards = Object.values(MockedCards) as PlayedCard[]
    const playedIds = new Set(cards.map(card => card.id))
    const players = new Set(Object.values(MockedPlayers))
    const playlist = [MockedPacks.Pack_with_all_cards.id]

    const result = CardManager.drawCard(cards, playedIds, playlist, players, new Set())

    expect(result).toBeNull()
  })

  it('should not return null if closing cards are available', () => {
    const cards = [] as PlayedCard[]
    const playlist = [MockedPacks.Pack_with_all_cards.id]

    // @ts-ignore
    const spyOnClosingCard = jest.spyOn(CardManager, 'drawClosingCard').mockReturnValue(MockedCards.Card_3)

    const result = CardManager.drawCard(cards, new Set(), playlist, new Set(), new Set())

    expect(spyOnClosingCard).toHaveBeenCalledTimes(1)
    expect(result?.id).toBe(MockedCards.Card_3.id)
  })

  it('should return an unplayed card', () => {
    const playedCards = [MockedCards.Card_1] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))
    const playlist = [MockedPacks.Pack_with_1_and_3.id]

    const result = CardManager.drawCard(playedCards, playedIds, playlist, new Set(), new Set())

    expect(result?.id).toBe(MockedCards.Card_3.id)
  })

  it('should return an unplayed card with a category that is not filtered', () => {
    const playlist = [MockedPacks.Pack_with_1_and_3.id]
    const categoryFilter = new Set(['cat1'])

    const spyOnGetRandom = jest.spyOn(utils, 'getRandom').mockImplementation(list => {
      const candidates = Array.from(list)
      expect(candidates).toEqual([MockedCards.Card_3])
      return MockedCards.Card_3
    })

    const result = CardManager.drawCard([], new Set(), playlist, new Set(), categoryFilter)

    expect(spyOnGetRandom).toHaveBeenCalledTimes(1)
    expect(result?.id).toBe('3')
  })

  it('it should use parent cards player list', () => {
    const playedCards = [MockedCards.Card_1] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))
    const playlist = [MockedPacks.Pack_with_1_and_3.id]

    // @ts-ignore
    const spyOnGetParentPlayerList = jest.spyOn(CardManager, 'getParentPlayerList').mockReturnValue(
      // @ts-ignore
      new Set([MockedPlayers.Alice, MockedPlayers.Bob])
    )

    const result = CardManager.drawCard(playedCards, playedIds, playlist, new Set(), new Set())

    expect(spyOnGetParentPlayerList).toHaveBeenCalledTimes(1)
    expect(result?.players).toEqual(new Set([MockedPlayers.Alice, MockedPlayers.Bob]))
  })

  it('should prioritize players with the lowest play count', () => {
    const playlist = [MockedPacks.Pack_with_8.id]
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

    const spyOnShuffled = jest.spyOn(utils, 'shuffled').mockReturnValueOnce(players)

    const result = CardManager.drawCard([], new Set(), playlist, new Set(players), new Set())

    expect(spyOnShuffled).toHaveBeenCalledTimes(1)
    expect(result).not.toBeNull()
    expect(result!.formattedContent).toEqual('Content of card 8 Charlie Alice')
    expect(result!.featuredPlayers).toEqual([players[2], players[0]])
    expect(result!.players).toEqual([players[2], players[0], players[1], players[3]])
  })

  it('should always return starting cards first', () => {
    const cards: Set<Card> = new Set([
      {
        ...MockedCards.Card_3,
        order: 'ending',
      },
      {
        ...MockedCards.Card_1,
        order: 'starting',
      },
    ])

    CardManager['_items'] = undefined
    CardManager['set'](cards)

    const players = new Set([MockedPlayers.Alice, MockedPlayers.Bob])

    const result = CardManager.drawCard([], new Set(), ['1'], players, new Set())

    expect(result?.id).toBe('1')
  })

  it('should only return ending cards if no other cards are available', () => {
    const cards: Set<Card> = new Set([
      {
        ...MockedCards.Card_1,
        order: 'starting',
      },
      MockedCards.Card_2,
      {
        ...MockedCards.Card_3,
        order: 'ending',
      },
    ])

    CardManager['_items'] = undefined
    CardManager['set'](cards)

    const players = new Set([MockedPlayers.Alice, MockedPlayers.Bob])

    const result = CardManager.drawCard(
      [MockedCards.Card_1 as PlayedCard, MockedCards.Card_2 as PlayedCard],
      new Set(['1', '2']),
      ['1'],
      players,
      new Set()
    )

    expect(result?.id).toBe('3')
  })
})

//#endregion
