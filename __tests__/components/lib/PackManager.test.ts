import { Pack, PackManager } from '@/lib/PackManager'
import { supabase } from '@/lib/supabase'

const mockedPacks: Pack[] = [
    {
        id: 'pack1',
        name: 'Pack 1',
        description: 'This is a pack',
        image: 'pack1.png',
        cards: [
            { id: '1', category: 'cat1' },
            { id: '2', category: 'cat2' },
        ],
        created_at: '2021-01-01T00:00:00.000Z',
        modified_at: '2021-01-01T00:00:00.000Z',
    },
    {
        id: 'pack3',
        name: 'Pack 3',
        description: 'This is a third pack',
        image: 'pack3.png',
        cards: [
            { id: '3', category: 'cat3' },
            { id: '4', category: 'cat4' },
        ],
        created_at: '2021-01-01T00:00:00.000Z',
        modified_at: '2021-01-01T00:00:00.000Z',
    },
    {
        id: 'pack2',
        name: 'Pack 2',
        description: 'This is another pack',
        image: 'pack2.png',
        cards: [
            { id: '2', category: 'cat2' },
            { id: '3', category: 'cat3' },
        ],
        created_at: '2021-01-01T00:00:00.000Z',
        modified_at: '2021-01-01T00:00:00.000Z',
    },
]

const mockedSortedPacks = [...mockedPacks].sort((a, b) => a.name.localeCompare(b.name))

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                eq: (columnName: keyof Pack, value: string) => ({
                    single: () => ({
                        throwOnError: () => ({ data: mockedPacks.find((pack) => pack[columnName] === value) || null }),
                    }),
                }),
                order: (columnName: 'id' | 'name') => ({
                    throwOnError: () => ({
                        data: [...mockedPacks].sort((a, b) => a[columnName].localeCompare(b[columnName])),
                    }),
                }),
            }),
        }),
        storage: {
            from: () => ({
                download: (imageName: string) => ({
                    data: imageName + "-blob",
                    error: null,
                }),
            }),
        },
    },
}))

jest.mock('@/lib/utils', () => ({
    blobToBase64: (blob: string) => blob + '-base64data',
}))

describe('getFetchQuery', () => {
    it('should return a query object with the correct queryKey and queryFn', () => {
        const packID = 'pack1'
        const fetchSpy = jest.spyOn(PackManager, 'fetch')
        const query = PackManager.getFetchQuery(packID)
        expect(query.queryKey).toEqual(['packs', packID])
        expect(query.queryFn).toBeDefined()
        // Call the queryFn
        query.queryFn()
        // Assert that PackManager.fetch has been called
        expect(fetchSpy).toHaveBeenCalledWith(packID)
    })
})

describe('getFetchAllQuery', () => {
    it('should return a query object with the correct queryKey and queryFn', () => {
        const fetchAllSpy = jest.spyOn(PackManager, 'fetchAll')
        const query = PackManager.getFetchAllQuery()
        expect(query.queryKey).toEqual(['packs'])
        expect(query.queryFn).toBeDefined()
        // Call the queryFn
        query.queryFn()
        // Assert that PackManager.fetchAll has been called
        expect(fetchAllSpy).toHaveBeenCalled()
    })
})

describe('fetch', () => {
    const testCases = [
        { id: 'pack1', expectedPack: mockedPacks[0] },
        { id: 'pack3', expectedPack: mockedPacks[1] },
    ]

    testCases.forEach(({ id, expectedPack }) => {
        it(`should return the correct pack for ID ${id}`, async () => {
            const pack = await PackManager.fetch(id)
            expect(pack).toEqual(expectedPack)
        })
    })

    it('should throw a NotFoundError if the pack does not exist', async () => {
        const packID = 'pack0'
        await expect(PackManager.fetch(packID)).rejects.toThrow(`No data found in table 'packs'`)
    })

    it('should throw if an error occurs', async () => {
        const packID = 'pack1'
        jest.spyOn(supabase, 'from').mockReturnValueOnce({
            select: () => ({
                order: () => ({
                    // @ts-ignore
                    throwOnError: () => ({ error: new Error() }),
                }),
            }),
        })
        await expect(PackManager.fetch(packID)).rejects.toThrow()
    })
})

describe('fetchAll', () => {
    it('should return all packs sorted by name', async () => {
        const packs = await PackManager.fetchAll()
        expect(packs).toEqual(mockedSortedPacks)
    })

    it('should throw a NotFoundError if no packs are found', async () => {
        jest.spyOn(supabase, 'from').mockReturnValueOnce({
            select: () => ({
                order: () => ({
                    // @ts-ignore
                    throwOnError: () => ({ data: [] }),
                }),
            }),
        })
        await expect(PackManager.fetchAll()).rejects.toThrow(`No data found in table 'packs'`)
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
        await expect(PackManager.fetchAll()).rejects.toThrow()
    })
})

describe('getImageQuery', () => {
    it('should return a query object with the correct queryKey and queryFn', () => {
        const imageName = 'pack1.png'
        // @ts-ignore
        const fetchImageSpy = jest.spyOn(PackManager, 'fetchImage')
        const query = PackManager.getImageQuery(imageName)
        expect(query.queryKey).toEqual(['storage', 'packs', imageName])
        expect(query.queryFn).toBeDefined()
        expect(query.enabled).toBe(true)
        // Call the queryFn
        query.queryFn()
        // Assert that PackManager.fetchImage has been called
        expect(fetchImageSpy).toHaveBeenCalledWith(imageName)
    })

    it('should return a query object with enabled set to false if imageName is null', () => {
        const imageName = null
        const query = PackManager.getImageQuery(imageName)
        expect(query.queryKey).toEqual([])
        expect(query.queryFn).toBeDefined()
        expect(query.enabled).toBe(false)
        expect(query.queryFn()).resolves.toBeNull()
    })
})

describe('fetchImage', () => {
    const imageName = 'pack1.png'

    it('should return the base64 image data', async () => {
        // @ts-ignore
        const imageData = await PackManager.fetchImage(imageName)
        expect(imageData).toBe('pack1.png-blob-base64data')
    })

    it('should throw if an error occurs', async () => {
        jest.spyOn(supabase.storage, 'from').mockReturnValueOnce({
            // @ts-ignore
            download: () => ({
                data: null,
                error: new Error(),
            }),
        })
        // @ts-ignore
        await expect(PackManager.fetchImage(imageName)).rejects.toThrow()
    })
})