// @ts-nocheck

import { CardManager, Card } from '@/lib/CardManager'
import { Category } from '@/lib/CategoryManager'
import { Pack } from '@/lib/PackManager'
import * as utils from '@/lib/utils'
import { InsufficientCountError } from '@/types/Errors'

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
        cards: [{ id: '1' }, { id: '3' }],
    },
    Pack_with_2 = {
        cards: [{ id: '2' }],
    },
    Pack_with_all_cards = {
        cards: MockedCards.all.map((card) => ({ id: card.id })),
    },
}

enum MockedPlayers {
    Alice = 'Alice',
    Bob = 'Bob',
    Charlie = 'Charlie',
    David = 'David',
    Earl = 'Earl',
    Frank = 'Frank',
    George = 'George',
    Hank = 'Hank',
    Igor = 'Igor',
    John = 'John',
    Kevin = 'Kevin',

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
                        throwOnError: () => ({ data: MockedCards.all.find((item) => item[columnName] === value) }),
                    }),
                }),
            }),
        }),
    },
}))

beforeEach(() => {
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
        { cardContent: 'Hello {plopper-0}', players: MockedPlayers.all, expected: null },
    ]

    testCases.forEach(({ cardContent, players, expected }) => {
        it(`should return '${expected}' for "${cardContent}"`, () => {
            const result = CardManager.insertPlayers(cardContent, players)
            expect(result).toEqual(expected)
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

describe('getNextCard', () => {
    beforeAll(() => {
        CardManager.set(MockedCards.all)
    })

    it('should return a random card if unplayed cards are available', () => {
        const playedIds = new Set(['1', '3'])
        const playlist: Pack[] = [MockedPacks.Pack_with_1_and_3, MockedPacks.Pack_with_2]

        const spyOnShuffled = jest.spyOn(utils, 'shuffled').mockReturnValueOnce(MockedPlayers.all)

        const result = CardManager.getNextCard(playedIds, playlist, new Set(), new Set())

        expect(spyOnShuffled).toHaveBeenCalledTimes(1)
        expect(result.id).toBe('2')
    })

    it('should return a card that can accommodate all players', () => {
        const players = new Set([MockedPlayers.Alice, MockedPlayers.Bob])
        const cachedCards = [
            MockedCards.Card_5_req_2_players,
            MockedCards.Card_6_req_5_players,
            MockedCards.Card_7_req_10_players,
        ]

        const playlist: Pack[] = [
            {
                cards: [{ id: '6' }, { id: '5' }],
            },
            {
                cards: [{ id: '7' }],
            },
        ]

        const result = CardManager.getNextCard(new Set(), playlist, players, new Set())

        expect(result.id).toBe('5')
    })

    it('should only return cards with unfiltered categories', () => {
        const playlist: Pack[] = [MockedPacks.Pack_with_1_and_3, MockedPacks.Pack_with_2]

        const categoryFilter = new Set(['cat1', 'cat2'])

        let result = CardManager.getNextCard(new Set(), playlist, new Set(MockedPlayers.all), categoryFilter)
        expect(result.id).toBe('3')
    })

    it('should return cards with no category', () => {
        const playlist: Pack[] = [
            MockedPacks.Pack_with_2,
            MockedPacks.Pack_with_1_and_3,
            {
                cards: [{ id: '4' }],
            },
        ]

        const categoryFilter: Set<Category> = new Set(['cat1', 'cat2', 'cat3'])

        let result = CardManager.getNextCard(new Set(), playlist, new Set(), categoryFilter)
        expect(result.id).toBe('4')
    })

    it('should return null if not enough players for card', () => {
        const playlist: Pack[] = [
            {
                cards: [{ id: '5' }, { id: '6' }, { id: '7' }],
            },
        ]

        const result = CardManager.getNextCard(new Set(), playlist, new Set(), new Set())
        expect(result).toBeNull()
    })

    it('should handle duplicate cards', () => {
        const playlist: Pack[] = [
            {
                cards: [{ id: '4' }],
            },
            {
                cards: [{ id: '3' }, { id: '5' }, { id: '4' }, { id: '4' }],
            },
        ]

        let result = CardManager.getNextCard(new Set(['4', '5']), playlist, new Set(), new Set())
        expect(result.id).toBe('3')

        result = CardManager.getNextCard(new Set(['4', '5', '3']), playlist, new Set(), new Set())
        expect(result).toBeNull()
    })
})
