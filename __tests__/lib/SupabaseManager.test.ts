import SupabaseManager, { SupabaseItem } from '@/lib/SupabaseManager'

const mockedItems: SupabaseItem[] = [
    // @ts-ignore
    {
        id: '1',
        name: 'Item 1',
    },
    // @ts-ignore
    {
        id: '2',
        name: 'Item 2',
    },
    // @ts-ignore
    {
        id: '3',
        name: 'Item 3',
    },
]

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                throwOnError: () => ({ data: mockedItems }),
                eq: (key: 'id', value: string) => ({
                    single: () => ({
                        throwOnError: () => ({
                            data: mockedItems.find((item) => item[key] === value),
                        }),
                    }),
                }),
            }),
        }),
    },
}))

class SupabaseManagerMockSingleton extends SupabaseManager<SupabaseItem> {
    constructor(tableName: string) {
        super(tableName)
    }
}

const SupabaseManagerMock = new SupabaseManagerMockSingleton('mock')

beforeEach(() => {
    // @ts-ignore
    SupabaseManagerMock._items = null
})

describe('tableName', () => {
    it('should return the table name', () => {
        expect(SupabaseManagerMock.tableName).toBe('mock')
    })
})

describe('set', () => {
    it('should set all items', () => {
        // @ts-ignore
        SupabaseManagerMock.set(mockedItems)
        const items = SupabaseManagerMock.items
        expect(items).toContain(mockedItems[0])
        expect(items).toContain(mockedItems[1])
        expect(items).toContain(mockedItems[2])
    })

    it('should warn if items have already been set', () => {
        console.warn = jest.fn()
        // @ts-ignore
        SupabaseManagerMock.set(mockedItems)
        // @ts-ignore
        SupabaseManagerMock.set(mockedItems)
        expect(console.warn).toHaveBeenCalledTimes(1)
    })
})

describe('push', () => {
    it('should push an item', () => {
        // @ts-ignore
        SupabaseManagerMock.push(mockedItems[0])
        expect(SupabaseManagerMock.items).toContain(mockedItems[0])
    })
})

describe('items', () => {
    it('should warn if items have not been set', () => {
        console.warn = jest.fn()
        SupabaseManagerMock.items
        expect(console.warn).toHaveBeenCalledTimes(1)
    })
})

describe('get', () => {
    it('should return an item', () => {
        // @ts-ignore
        SupabaseManagerMock.set(mockedItems)
        expect(SupabaseManagerMock.get('1')).toBe(mockedItems[0])
    })

    it('should warn if items have not been set', () => {
        console.warn = jest.fn()
        SupabaseManagerMock.get('1')
        expect(console.warn).toHaveBeenCalledTimes(1)
    })
})

describe('fetch', () => {
    it('should fetch an item', async () => {
        const item = await SupabaseManagerMock.fetch('1')
        expect(item).toBe(mockedItems[0])
    })

    it('should throw an error if no data is found', async () => {
        await expect(SupabaseManagerMock.fetch('4')).rejects.toThrow("No data found in table 'mock'")
    })
})

describe('fetchAll', () => {
    it('should fetch all items', async () => {
        const items = await SupabaseManagerMock.fetchAll()
        expect(items).toEqual(mockedItems)
    })

    it('should throw an error if no data is found', async () => {
        mockedItems.length = 0
        await expect(SupabaseManagerMock.fetchAll()).rejects.toThrow("No data found in table 'mock'")
    })
})
