import { CardManager, Card } from '@/lib/CardManager'
import { supabase } from '@/lib/supabase'

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
                // @ts-ignore
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
                // @ts-ignore
                throwOnError: () => ({ data: [] }),
            }),
        })
        await expect(CardManager.fetchAll()).rejects.toThrow(`No data found in table 'cards'`)
    })

    it('should throw if an error occurs', async () => {
        jest.spyOn(supabase, 'from').mockReturnValueOnce({
            select: () => ({
                order: () => ({
                    // @ts-ignore
                    throwOnError: () => ({ error: new Error() }),
                }),
            }),
        })
        await expect(CardManager.fetchAll()).rejects.toThrow()
    })
})
