import { CardManager, Card, PlayedCard } from '@/src/managers/CardManager'
import * as utils from '@/src/lib/utils'
import { InsufficientCountError } from '@/src/models/Errors'
import { Pack } from '@/src/managers/PackManager'
import { Player } from '@/src/models/Player'
import { CardRelationManager } from '@/src/managers/CardRelationManager'

const MockedCards = {
  Card_1: { id: '1', category: 'cat1', content: 'Content of card 1', is_group: false } as Card,
  Card_2: { id: '2', category: 'cat2', content: 'Content of card 2', is_group: false } as Card,
  Card_3: { id: '3', category: 'cat3', content: 'Content of card 3', is_group: false } as Card,
  Card_4_no_category: { id: '4', content: 'Content of card 4', is_group: false } as Card,
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

const MockedPacks = {
  Pack_with_1_and_3: {
    cards: new Set(['1', '3']),
  } as Pack,
  Pack_with_2: {
    cards: new Set(['2']),
  } as Pack,
  Pack_with_1_and_5_and_6: {
    cards: new Set(['1', '5', '6']),
  } as Pack,
  Pack_with_8: {
    cards: new Set(['8']),
  } as Pack,
  Pack_with_all_cards: {
    cards: new Set(Object.values(MockedCards).map(card => card.id)),
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

jest.mock('@/managers/ConfigurationManager', () => ({
  ConfigurationManager: {
    get: () => ({ number: 10 }),
  },
}))

jest.mock('@/lib/supabase', () => ({
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

beforeEach(() => {
  // @ts-ignore
  CardManager._items = null
  // @ts-ignore
  CardManager.cachedPlayerCounts = new Map()
})

describe('insertPlayers', () => {
  it('should not change the content in place', () => {
    const testString = MockedCards.Card_6_req_5_players.content
    // @ts-ignore
    const result = CardManager.insertPlayers(testString, Object.values(MockedPlayers))
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
      // @ts-ignore
      const result = CardManager.insertPlayers(cardContent, players)
      expect(result.formattedContent).toEqual(expected)
    })
  })

  it('should throw an error if a player index is out of bounds', () => {
    // @ts-ignore
    expect(() => CardManager.insertPlayers('Hello {player-11}', Object.values(MockedPlayers))).toThrow(
      InsufficientCountError
    )
  })
})

describe('getRequiredPlayerCount', () => {
  const testCases = [
    {
      cardContent: 'Hello {player-0}, how are you {player-1}? ({player-2} is testing {player-3})',
      expected: 4,
    },
    {
      cardContent: 'Hello {player-0}, how are you {player-150}? ({player-3} is testing {player-2})',
      expected: 151,
    },
    { cardContent: 'Hello {player-0}.', expected: 1 },
    { cardContent: 'String with no template.', expected: 0 },
    { cardContent: '', expected: 0 },
  ]

  testCases.forEach(({ cardContent, expected }) => {
    it(`should return ${expected} for "${cardContent}"`, () => {
      const result = CardManager.getRequiredPlayerCount({ content: cardContent } as Card)
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

describe('findCandidates', () => {
  beforeEach(() => {
    // @ts-ignore
    CardManager.set(Object.values(MockedCards))
  })

  it('should return cards from the playlist that have not been played', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])
    const playedIds = new Set(['1'])
    // @ts-ignore
    const result = CardManager.findCandidates(playlist, playedIds, 0, new Set())

    const expected = new Map([[MockedCards.Card_3.id, MockedCards.Card_3.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should return cards that have no category', () => {
    const playlist = new Set([MockedPacks.Pack_with_2])
    // @ts-ignore
    const result = CardManager.findCandidates(playlist, new Set(), 2, new Set())

    const expected = new Map([[MockedCards.Card_2.id, MockedCards.Card_2.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should not return cards that have a category that is filtered', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])
    const categoryFilter = new Set(['cat1'])
    // @ts-ignore
    const result = CardManager.findCandidates(playlist, new Set(), 0, categoryFilter)

    const expected = new Map([[MockedCards.Card_3.id, MockedCards.Card_3.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should return cards that require 2 players or less', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_5_and_6])
    // @ts-ignore
    const result = CardManager.findCandidates(playlist, new Set(), 2, new Set())

    const expected = new Map([
      [MockedCards.Card_1.id, MockedCards.Card_1.valueOf()],
      [MockedCards.Card_5_req_2_players.id, MockedCards.Card_5_req_2_players.valueOf()],
    ])
    expect(result).toEqual(expected)
  })
})

describe('getNextCard', () => {
  beforeEach(() => {
    // @ts-ignore
    CardManager.set(Object.values(MockedCards))
  })

  it('should return the correct card based on arguments', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_3, MockedCards.Card_4_no_category] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))
    const playlist = new Set([MockedPacks.Pack_with_all_cards])
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
    const playlist = new Set([MockedPacks.Pack_with_all_cards])
    const players = new Set([MockedPlayers.Alice])
    const categoryFilter = new Set(['cat1', 'cat2', 'cat3', 'cat8'])
    const _ = jest.spyOn(utils, 'shuffled').mockReturnValueOnce(Object.values(MockedPlayers))

    const result = CardManager.drawCard(playedCards, playedIds, playlist, players, categoryFilter)
    expect(result).toBeNull()
  })
})

describe('drawClosingCard', () => {
  beforeEach(() => {
    // @ts-ignore
    CardManager.set(Object.values(MockedCards))
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

    // @ts-ignore
    const result = CardManager.drawClosingCard(playedCards, playedIds, 10)

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

    // @ts-ignore
    const result = CardManager.drawClosingCard(playedCards, playedIds, 0)

    expect(getUnplayedChildSpy).toHaveBeenCalledTimes(4)
    expect(getRandomPercentSpy).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })
})

describe('getParentPlayerList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the players of the parent card', () => {
    const playedCards = [
      { ...MockedCards.Card_1, players: new Set([MockedPlayers.Alice, MockedPlayers.Bob]) },
      { ...MockedCards.Card_2, players: new Set([MockedPlayers.Charlie, MockedPlayers.David]) },
    ]
    const playedIds = new Set(playedCards.map(card => card.id))

    const spyOnGetPlayedParent = jest.spyOn(CardRelationManager, 'getPlayedParent').mockReturnValue('2')

    // @ts-ignore
    const result = CardManager.getParentPlayerList(MockedCards.Card_3, playedCards, playedIds)

    expect(spyOnGetPlayedParent).toHaveBeenCalledTimes(1)
    expect(result).toEqual(playedCards[1].players)
  })

  it('should return null if the parent card has not been played', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_2, MockedCards.Card_3] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))

    const spyOnGetPlayedParent = jest.spyOn(CardRelationManager, 'getPlayedParent').mockReturnValue('-1')

    // @ts-ignore
    const result = CardManager.getParentPlayerList(MockedCards.Card_1, playedCards, playedIds)

    expect(spyOnGetPlayedParent).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })

  it('should return null if the parent card has not been played', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_2, MockedCards.Card_3] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))

    const spyOnGetPlayedParent = jest.spyOn(CardRelationManager, 'getPlayedParent').mockReturnValue(null)

    // @ts-ignore
    const result = CardManager.getParentPlayerList(MockedCards.Card_1, playedCards, playedIds)

    expect(spyOnGetPlayedParent).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })
})

describe('drawCard', () => {
  beforeEach(() => {
    // @ts-ignore
    CardManager.set(Object.values(MockedCards))
    jest.restoreAllMocks()
  })

  it('should return null if no candidates are available', () => {
    const cards = Object.values(MockedCards)
    const playedIds = new Set(cards.map(card => card.id))
    const players = new Set(Object.values(MockedPlayers))
    const playlist = new Set([MockedPacks.Pack_with_all_cards])

    // @ts-ignore
    const result = CardManager.drawCard(cards, playedIds, playlist, players, new Set())

    expect(result).toBeNull()
  })

  it('should not return null if closing cards are available', () => {
    const cards = [] as PlayedCard[]
    const playlist = new Set([MockedPacks.Pack_with_all_cards])

    // @ts-ignore
    const spyOnClosingCard = jest.spyOn(CardManager, 'drawClosingCard').mockReturnValue(MockedCards.Card_3)

    const result = CardManager.drawCard(cards, new Set(), playlist, new Set(), new Set())

    expect(spyOnClosingCard).toHaveBeenCalledTimes(1)
    expect(result?.id).toBe(MockedCards.Card_3.id)
  })

  it('should return an unplayed card', () => {
    const playedCards = [MockedCards.Card_1] as PlayedCard[]
    const playedIds = new Set(playedCards.map(card => card.id))
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])

    const result = CardManager.drawCard(playedCards, playedIds, playlist, new Set(), new Set())

    expect(result?.id).toBe('3')
  })

  it('should return an unplayed card with a category that is not filtered', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])
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
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])

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
    const playlist = new Set([MockedPacks.Pack_with_8])
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
    expect(result?.formattedContent).toEqual('Content of card 8 Charlie Alice')
    expect(result?.featuredPlayers).toEqual(new Set([players[0], players[2]]))
    expect(result?.players).toEqual([players[2], players[0], players[1], players[3]])
  })
})
