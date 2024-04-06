// @ts-nocheck

import { CardManager, Card } from '@/lib/CardManager'
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

const mockPlayerTemplateString = 'Hello {player-0}, how are you {player-1}? ({player-1} is testing {player-0})'

describe('insertPlayers', () => {
    it('should not change the content in place', () => {
        const testString = mockPlayerTemplateString
        const result = CardManager.insertPlayers(testString, mockPlayers)
        expect(testString).toBe(mockPlayerTemplateString)
        expect(result).not.toBe(mockPlayerTemplateString)
    })

    it('should insert players in the correct order', () => {
        jest.spyOn(utils, 'shuffled').mockReturnValueOnce(mockPlayers)

        const result = CardManager.insertPlayers(mockPlayerTemplateString, [])
        expect(result).toEqual('Hello Alice, how are you Bob? (Bob is testing Alice)')
    })

    it('should accept player indeces with multiple digits', () => {
        jest.spyOn(utils, 'shuffled').mockReturnValueOnce(mockPlayers)
        const result = CardManager.insertPlayers('Hello {player-10}', mockPlayers)
        expect(result).toEqual('Hello Kevin')
    })

    it('should throw an error if a player index is out of bounds', () => {
        expect(() => CardManager.insertPlayers('Hello {player-11}', mockPlayers)).toThrow(InsufficientCountError)
    })

    it('should return the original content if there are no placeholders', () => {
        const result = CardManager.insertPlayers(mockedItems[0].content, mockPlayers)
        expect(result).toEqual(mockedItems[0].content)
    })
})

describe('getRequiredPlayerCount', () => {
    beforeEach(() => {
        CardManager.cachedPlayerCounts = new Map()
    })

    it('should return the number of player placeholders in the card content', () => {
        const templateString = 'Hello {player-0}, how are you {player-9}? ({player-3} is testing {player-2})'
        const result = CardManager.getRequiredPlayerCount(templateString)
        expect(result).toEqual(10)
    })

    it('should return 0 if there are no player placeholders', () => {
        const result = CardManager.getRequiredPlayerCount(mockedItems[0].content)
        expect(result).toEqual(0)
    })

    it('should return 0 if the card content is empty', () => {
        const result = CardManager.getRequiredPlayerCount('')
        expect(result).toEqual(0)
    })

    it('should correctly handle duplicate player placeholders with the same index', () => {
        const templateString = 'Hello {player-0}, how are you {player-0}? ({player-0} is testing {player-0})'
        const result = CardManager.getRequiredPlayerCount(templateString)
        expect(result).toEqual(1)
    })

    it('should cache the result for subsequent calls with the same card content', () => {
        const templateString = 'Hello {player-0}, how are you {player-9}? ({player-3} is testing {player-2})'
        const matchAllSpy = jest.spyOn(String.prototype, 'matchAll')

        const result1 = CardManager.getRequiredPlayerCount(templateString)
        const result2 = CardManager.getRequiredPlayerCount(templateString)

        expect(matchAllSpy).toHaveBeenCalledTimes(1)
        expect(result1).toEqual(result2)
    })
})
