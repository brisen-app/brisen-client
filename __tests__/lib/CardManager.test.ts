// @ts-nocheck

import { CardManager, Card } from '@/managers/CardManager'
import * as utils from '@/lib/utils'
import { InsufficientCountError } from '@/models/Errors'

enum MockedCards {
  Card_1 = { id: '1', category: 'cat1', content: 'Content of card 1' },
  Card_2 = { id: '2', category: 'cat2', content: 'Content of card 2' },
  Card_3 = { id: '3', category: 'cat3', content: 'Content of card 3' },
  Card_4_no_category = { id: '4', content: 'Content of card 4' },
  Card_5_req_2_players = { id: '5', content: 'Content of card 5 {player-0} {player-1}' },
  Card_6_req_5_players = {
    id: '6',
    content: 'Hello {player-0}, how are you {player-4}? ({player-4} is testing {player-0})',
  },
  Card_7_req_10_players = { id: '7', content: 'Content of card 7 {player-9}' },
  Card_8_req_2_players = { id: '8', category: 'cat8', content: 'Content of card 8 {player-0} {player-1}' },

  all = [
    MockedCards.Card_3,
    MockedCards.Card_1,
    MockedCards.Card_2,
    MockedCards.Card_4_no_category,
    MockedCards.Card_5_req_2_players,
    MockedCards.Card_6_req_5_players,
    MockedCards.Card_7_req_10_players,
  ],
}

enum MockedPacks {
  Pack_with_1_and_3 = {
    cards: new Set(['1', '3']),
  },
  Pack_with_2 = {
    cards: new Set(['2']),
  },
  Pack_with_1_and_5_and_6 = {
    cards: new Set(['1', '5', '6']),
  },
  Pack_with_8 = {
    cards: new Set(['8']),
  },
  Pack_with_all_cards = {
    cards: new Set(MockedCards.all.map(card => card.id)),
  },
}

enum MockedPlayers {
  Alice = { name: 'Alice', playCount: 0 },
  Bob = { name: 'Bob', playCount: 0 },
  Charlie = { name: 'Charlie', playCount: 0 },
  David = { name: 'David', playCount: 0 },
  Earl = { name: 'Earl', playCount: 0 },
  Frank = { name: 'Frank', playCount: 0 },
  George = { name: 'George', playCount: 0 },
  Hank = { name: 'Hank', playCount: 0 },
  Igor = { name: 'Igor', playCount: 0 },
  John = { name: 'John', playCount: 0 },
  Kevin = { name: 'Kevin', playCount: 0 },

  all = [
    MockedPlayers.Alice,
    MockedPlayers.Bob,
    MockedPlayers.Charlie,
    MockedPlayers.David,
    MockedPlayers.Earl,
    MockedPlayers.Frank,
    MockedPlayers.George,
    MockedPlayers.Hank,
    MockedPlayers.Igor,
    MockedPlayers.John,
    MockedPlayers.Kevin,
  ],
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        throwOnError: () => ({ data: MockedCards.all }),
        eq: (columnName: keyof Card, value: string) => ({
          single: () => ({
            throwOnError: () => ({ data: MockedCards.all.find(item => item[columnName] === value) }),
          }),
        }),
      }),
    }),
  },
}))

beforeEach(() => {
  CardManager._items = null
  CardManager.cachedPlayerCounts = new Map()
})

describe('insertPlayers', () => {
  it('should not change the content in place', () => {
    const testString = MockedCards.Card_6_req_5_players.content
    const result = CardManager.insertPlayers(testString, MockedPlayers.all)
    expect(testString).toBe(MockedCards.Card_6_req_5_players.content)
    expect(result).not.toBe(MockedCards.Card_6_req_5_players.content)
  })

  const testCases = [
    {
      cardContent: MockedCards.Card_6_req_5_players.content,
      players: MockedPlayers.all,
      expected: 'Hello Alice, how are you Earl? (Earl is testing Alice)',
    },
    { cardContent: 'Hello {player-10}', players: MockedPlayers.all, expected: 'Hello Kevin' },
    { cardContent: 'Hello {plopper-0}', players: MockedPlayers.all, expected: undefined },
  ]

  testCases.forEach(({ cardContent, players, expected }) => {
    it(`should return '${expected}' for "${cardContent}"`, () => {
      const result = CardManager.insertPlayers(cardContent, players)
      expect(result.formattedContent).toEqual(expected)
    })
  })

  it('should throw an error if a player index is out of bounds', () => {
    expect(() => CardManager.insertPlayers('Hello {player-11}', MockedPlayers.all)).toThrow(InsufficientCountError)
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
      const result = CardManager.getRequiredPlayerCount({ content: cardContent })
      expect(result).toEqual(expected)
    })
  })

  it('should throw an error if card is null', () => {
    expect(() => CardManager.getRequiredPlayerCount(null)).toThrow(TypeError)
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
    CardManager.set(MockedCards.all)
  })

  it('should return cards from the playlist that have not been played', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])
    const playedIds = new Set(['1'])
    const result = CardManager.findCandidates(playlist, playedIds, 0, new Set())

    const expected = new Map([[MockedCards.Card_3.id, MockedCards.Card_3.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should return cards that have no category', () => {
    const playlist = new Set([MockedPacks.Pack_with_2])
    const result = CardManager.findCandidates(playlist, new Set(), 2, new Set())

    const expected = new Map([[MockedCards.Card_2.id, MockedCards.Card_2.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should not return cards that have a category that is filtered', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_3])
    const playedIds = new Set()
    const categoryFilter = new Set(['cat1'])
    const result = CardManager.findCandidates(playlist, playedIds, 0, categoryFilter)

    const expected = new Map([[MockedCards.Card_3.id, MockedCards.Card_3.valueOf()]])
    expect(result).toEqual(expected)
  })

  it('should return cards that require 2 players or less', () => {
    const playlist = new Set([MockedPacks.Pack_with_1_and_5_and_6])
    const playedIds = new Set()
    const result = CardManager.findCandidates(playlist, playedIds, 2, new Set())

    const expected = new Map([
      [MockedCards.Card_1.id, MockedCards.Card_1.valueOf()],
      [MockedCards.Card_5_req_2_players.id, MockedCards.Card_5_req_2_players.valueOf()],
    ])
    expect(result).toEqual(expected)
  })
})

describe('getNextCard', () => {
  beforeEach(() => {
    CardManager.set(MockedCards.all)
  })

  it('should return the correct card based on arguments', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_3, MockedCards.Card_4_no_category]
    const playedIds = new Set(playedCards.map(card => card.id))
    const playlist = new Set([MockedPacks.Pack_with_all_cards])
    const players = new Set([MockedPlayers.Alice, MockedPlayers.Bob])
    const categoryFilter = new Set(['cat1', 'cat2', 'cat3', 'cat8', 'cat9'])

    const spyOnShuffled = jest.spyOn(utils, 'shuffled').mockReturnValueOnce(MockedPlayers.all)

    const result = CardManager.drawCard(playedCards, playedIds, playlist, players, categoryFilter)

    expect(spyOnShuffled).toHaveBeenCalledTimes(1)
    expect(result.id).toBe('5')
  })

  it('should return null if no cards are available', () => {
    const playedCards = [MockedCards.Card_1, MockedCards.Card_3, MockedCards.Card_4_no_category]
    const playedIds = new Set(playedCards.map(card => card.id))
    const playlist = new Set([MockedPacks.Pack_with_all_cards])
    const players = new Set([MockedPlayers.Alice])
    const categoryFilter = new Set(['cat1', 'cat2', 'cat3', 'cat8'])
    const _ = jest.spyOn(utils, 'shuffled').mockReturnValueOnce(MockedPlayers.all)

    const result = CardManager.drawCard(playedCards, playedIds, playlist, players, categoryFilter)
    expect(result).toBeNull()
  })
})
