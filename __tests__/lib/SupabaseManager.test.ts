import { Card } from '@/lib/CardManager'
import SupabaseManager, { SupabaseItem } from '@/lib/SupabaseManager'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

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
    for (var key in AsyncStorage.getAllKeys()) {
        AsyncStorage.removeItem(key)
    }
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

    it('should store the fetched items', async () => {
        // @ts-ignore
        const storeSpy = jest.spyOn(SupabaseManagerMock, 'store')
        const items = await SupabaseManagerMock.fetchAll()
        expect(storeSpy).toHaveBeenCalledWith(items)
    })

    it('should throw an error if no data is found', async () => {
        const supabase = require('@/lib/supabase').supabase

        supabase.from = jest.fn(() => ({
            select: jest.fn(() => ({
                throwOnError: jest.fn(() => ({ data: null })),
            })),
        }))

        await expect(SupabaseManagerMock.fetchAll()).rejects.toThrow("No data found in table 'mock'")
    })
})

describe('fetchAllOrRetrieve', () => {
    it('should return items if fetching succeeds', async () => {
        // @ts-ignore
        const items = await SupabaseManagerMock.fetchAllOrRetrieve()
        expect(items).toEqual(mockedItems)
    })

    it('should try to retrieve if fetching fails', async () => {
        const error = new Error('Failed to fetch')

        // @ts-ignore
        const fetchAllSpy = jest.spyOn(SupabaseManagerMock, 'fetchAll').mockRejectedValueOnce(error)
        // @ts-ignore
        const retrieveSpy = jest.spyOn(SupabaseManagerMock, 'retrieve').mockResolvedValueOnce(mockedItems)
        // @ts-ignore
        SupabaseManagerMock.set(mockedItems)

        // @ts-ignore
        const items = await SupabaseManagerMock.fetchAllOrRetrieve()

        expect(fetchAllSpy).toHaveBeenCalledTimes(1)
        expect(retrieveSpy).toHaveBeenCalledTimes(1)
        expect(items).toEqual(mockedItems)
    })

    it('should throw an error if both fetching and retrieving fails', async () => {
        const error = new Error('Failed to fetch')

        // @ts-ignore
        jest.spyOn(SupabaseManagerMock, 'fetchAll').mockRejectedValueOnce(error)
        // @ts-ignore
        jest.spyOn(SupabaseManagerMock, 'retrieve').mockResolvedValueOnce(null)

        await expect(SupabaseManagerMock.fetchAllOrRetrieve()).rejects.toThrow(error)
    })
})

describe('store & retrieve', () => {
    const stringedItems = JSON.stringify(mockedItems)

    it('should store items in AsyncStorage and retrieve them', async () => {
        AsyncStorage.getItem = jest.fn().mockResolvedValueOnce(stringedItems)

        // @ts-ignore
        await SupabaseManagerMock.store(mockedItems)
        // @ts-ignore
        const items = await SupabaseManagerMock.retrieve()

        expect(AsyncStorage.getItem).toHaveBeenCalledWith('mock')
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('mock', stringedItems)
        expect(items).not.toBeNull()
        expect(items).toEqual(mockedItems)
    })

    it('should log an error if storing fails', async () => {
        const error = new Error('Failed to store')

        // @ts-ignore
        AsyncStorage.setItem.mockRejectedValueOnce(error)
        console.error = jest.fn()

        // @ts-ignore
        await SupabaseManagerMock.store(mockedItems)
        expect(console.error).toHaveBeenCalledWith(`Failed to store mock in AsyncStorage:`, error)
    })

    it('should return null if no data is retrieved', async () => {
        AsyncStorage.getItem = jest.fn().mockResolvedValueOnce(null)
        // @ts-ignore
        const items = await SupabaseManagerMock.retrieve()
        expect(items).toBeNull()
    })

    it('should log an error if retrieving fails', async () => {
        const error = new Error('Failed to retrieve')

        // @ts-ignore
        AsyncStorage.getItem.mockRejectedValueOnce(error)
        console.error = jest.fn()

        // @ts-ignore
        await SupabaseManagerMock.retrieve()
        expect(console.error).toHaveBeenCalledWith(`Failed to retrieve mock from AsyncStorage:`, error)
    })
})

describe('push', () => {
    it('should push an item if items have been set', () => {
        console.warn = jest.fn()
        console.error = jest.fn()
        // @ts-ignore
        SupabaseManagerMock.set(mockedItems)

        // @ts-ignore
        SupabaseManagerMock.push(mockedItems[0])

        expect(console.warn).not.toHaveBeenCalled()
        expect(console.error).not.toHaveBeenCalled()
        expect(SupabaseManagerMock.items).toContain(mockedItems[0])
    })

    it('should create a new Map if items have not been set', () => {
        // @ts-ignore
        SupabaseManagerMock._items = null
        // @ts-ignore
        SupabaseManagerMock.push(mockedItems[0])
        // @ts-ignore
        expect(SupabaseManagerMock._items).toBeInstanceOf(Map)
    })
})
