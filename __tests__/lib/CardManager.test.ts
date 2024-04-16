// @ts-nocheck

import { CardManager, Card, PlayedCard } from '@/lib/CardManager'
import { Category } from '@/lib/CategoryManager'
import { Pack } from '@/lib/PackManager'
import { supabase } from '@/lib/supabase'
import * as utils from '@/lib/utils'
import { InsufficientCountError } from '@/types/Errors'

const mockedItems: Card[] = [
    {
        id: '1',
        category: 'cat1',
        content: 'Content of card 1',
        created_at: '2021-01-01T00:00:00.000Z',
        modified_at: '2021-01-01T00:00:00.000Z',
    },
    {
        id: '3',
        category: 'cat3',
        content: 'Content of card 3',
        created_at: '2021-01-01T00:00:00.000Z',
        modified_at: '2021-01-01T00:00:00.000Z',
    },
    {
        id: '2',
        category: 'cat2',
        content: 'Content of card 2',
        created_at: '2021-01-01T00:00:00.000Z',
        modified_at: '2021-01-01T00:00:00.000Z',
    },
]

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                throwOnError: () => ({ data: mockedItems }),
                eq: (columnName: keyof Card, value: string) => ({
                    single: () => ({
                        throwOnError: () => ({ data: mockedItems.find((item) => item[columnName] === value) }),
                    }),
                }),
            }),
        }),
    },
}))

describe('getFetchQuery', () => {
    it('should return a query object with the correct queryKey and queryFn', () => {
        const id = '1'
        const fetchSpy = jest.spyOn(CardManager, 'fetch')
        const query = CardManager.getFetchQuery(id)
        expect(query.queryKey).toEqual(['cards', id])
        expect(query.queryFn).toBeDefined()
        // Call the queryFn
        query.queryFn()
        // Assert that CardManager.fetch has been called
        expect(fetchSpy).toHaveBeenCalledWith(id)
    })
})

describe('getFetchAllQuery', () => {
    it('should return a query object with the correct queryKey and queryFn', () => {
        const fetchAllSpy = jest.spyOn(CardManager, 'fetchAll').mockReturnValueOnce(Promise.resolve(mockedItems))
        const query = CardManager.getFetchAllQuery()
        expect(query.queryKey).toEqual(['cards'])
        expect(query.queryFn).toBeDefined()
        // Call the queryFn
        query.queryFn()
        // Assert that CardManager.fetchAll has been called
        expect(fetchAllSpy).toHaveBeenCalled()
    })
})

describe('fetch', () => {
    const testCases = [
        { id: '1', expected: mockedItems[0] },
        { id: '3', expected: mockedItems[1] },
    ]

    testCases.forEach(({ id, expected }) => {
        it(`should return the correct card for ID ${id}`, async () => {
            const card = await CardManager.fetch(id)
            expect(card).toEqual(expected)
        })
    })

    it('should throw a NotFoundError if the card does not exist', async () => {
        const id = '0'
        await expect(CardManager.fetch(id)).rejects.toThrow(`No data found in table 'cards'`)
    })

    it('should throw if an error occurs', async () => {
        const cardID = '1'
        jest.spyOn(supabase, 'from').mockReturnValueOnce({
            select: () => ({
                throwOnError: () => ({ error: new Error() }),
            }),
        })
        await expect(CardManager.fetch(cardID)).rejects.toThrow()
    })
})

describe('fetchAll', () => {
    it('should return all cards sorted by name', async () => {
        const cards = await CardManager.fetchAll()
        expect(cards).toEqual(mockedItems)
    })

    it('should throw a NotFoundError if no cards are found', async () => {
        jest.spyOn(supabase, 'from').mockReturnValueOnce({
            select: () => ({
                throwOnError: () => ({ data: [] }),
            }),
        })
        await expect(CardManager.fetchAll()).rejects.toThrow(`No data found in table 'cards'`)
    })

    it('should throw if an error occurs', async () => {
        jest.spyOn(supabase, 'from').mockReturnValueOnce({
            select: () => ({
                order: () => ({
                    throwOnError: () => ({ error: new Error() }),
                }),
            }),
        })
        await expect(CardManager.fetchAll()).rejects.toThrow()
    })
})

const mockPlayers = [
    'Alice', // 0
    'Bob', // 1
    'Charlie', // 2
    'David', // 3
    'Earl', // 4
    'Frank', // 5
    'George', // 6
    'Hank', // 7
    'Igor', // 8
    'John', // 9
    'Kevin', // 10
]

const mockTemplateString = 'Hello {player-0}, how are you {player-4}? ({player-4} is testing {player-0})'

describe('insertPlayers', () => {
    it('should not change the content in place', () => {
        const testString = mockTemplateString
        const result = CardManager.insertPlayers(testString, mockPlayers)
        expect(testString).toBe(mockTemplateString)
        expect(result).not.toBe(mockTemplateString)
    })

    const testCases = [
        {
            cardContent: mockTemplateString,
            players: mockPlayers,
            expected: 'Hello Alice, how are you Earl? (Earl is testing Alice)',
        },
        { cardContent: 'Hello {player-10}', players: mockPlayers, expected: 'Hello Kevin' },
        { cardContent: 'Hello {plopper-0}', players: mockPlayers, expected: null },
    ]

    testCases.forEach(({ cardContent, players, expected }) => {
        it(`should return '${expected}' for "${cardContent}"`, () => {
            const result = CardManager.insertPlayers(cardContent, players)
            expect(result).toEqual(expected)
        })
    })

    it('should throw an error if a player index is out of bounds', () => {
        expect(() => CardManager.insertPlayers('Hello {player-11}', mockPlayers)).toThrow(InsufficientCountError)
    })
})

const mockTemplateCard = {
    ...mockedItems[0],
    content: mockTemplateString,
}

describe('getRequiredPlayerCount', () => {
    afterEach(() => {
        CardManager.cachedPlayerCounts = new Map()
        jest.clearAllMocks()
    })

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
            const result = CardManager.getRequiredPlayerCount({ ...mockedItems[0], content: cardContent })
            expect(result).toEqual(expected)
        })
    })

    it('should throw an error if card is null', () => {
        expect(() => CardManager.getRequiredPlayerCount(null)).toThrow(TypeError)
    })

    it('should cache the result for subsequent calls with the same card content', () => {
        const matchAllSpy = jest.spyOn(String.prototype, 'matchAll')

        const result1 = CardManager.getRequiredPlayerCount(mockTemplateCard)
        const result2 = CardManager.getRequiredPlayerCount(mockTemplateCard)

        expect(matchAllSpy).toHaveBeenCalledTimes(1)
        expect(result1).toEqual(result2)
    })
})

describe('getNextCard', () => {
    afterEach(() => {
        CardManager.cachedPlayerCounts = new Map()
        jest.clearAllMocks()
    })

    it('should return a valid next card if unplayed cards are available', () => {
        const players = new Set(mockPlayers)
        const playlist: Pack[] = [
            {
                cards: [...mockedItems, { id: '69', content: 'Hello {player-0} and {player-1}' }],
            },
        ]

        const spyOnShuffled = jest.spyOn(utils, 'shuffled').mockReturnValueOnce(mockPlayers)
        const matchAllSpy = jest.spyOn(String.prototype, 'matchAll')

        const result = CardManager.getNextCard(mockedItems, playlist, players, new Set())
        expect(matchAllSpy).toHaveBeenCalledTimes(2)

        expect(spyOnShuffled).toHaveBeenCalledTimes(1)
        expect(spyOnShuffled).toHaveBeenCalledWith(players)

        expect(result).not.toBeNull()
        expect(result.formattedContent).toBe('Hello Alice and Bob')
        expect(result.minPlayers).toBe(2)
    })

    it('should return a card that can accommodate all players', () => {
        const playedCards: PlayedCard[] = [{ id: '1' }, { id: '2' }]

        const playlist: Pack[] = [
            {
                cards: [
                    { id: '2', content: '' },
                    { id: '4', content: 'Content of card 4 {player-0} {player-1}' },
                ],
            },
            {
                cards: [
                    { id: '3', content: 'Content of card 3 {player-0}' },
                    { id: '5', content: 'Content of card 5 {player-0} {player-1} {player-2}' },
                ],
            },
        ]

        const result = CardManager.getNextCard(playedCards, playlist, new Set([mockPlayers[0]]), new Set())
        expect(result.id).toBe('3')
        expect(result.minPlayers).toBe(1)
    })

    it('should return null if not enough players for card', () => {
        const playlist: Pack[] = [
            {
                cards: [...mockedItems, { id: '69', content: 'Hello {player-0} and {player-1}' }],
            },
        ]

        const result = CardManager.getNextCard(mockedItems, playlist, new Set(), new Set())
        expect(result).toBeNull()
    })

    it('should ignore duplicate cards', () => {
        const result = CardManager.getNextCard([], [{ cards: [mockedItems[0], mockedItems[0]] }], new Set(), new Set())
        expect(result.id).toBe('1')
    })
})
