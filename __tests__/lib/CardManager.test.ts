import { Card, CardManager } from '@/src/managers/CardManager'

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
jest.mock('@/src/lib/supabase', () => ({ supabase: {} }))

//#endregion

beforeEach(() => {
  CardManager['_items'] = undefined
  CardManager['cachedPlayerCounts'].clear()
  jest.clearAllMocks()
})

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
