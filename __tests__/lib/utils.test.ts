import * as Crypto from 'expo-crypto'
import * as utils from '@/lib/utils'

jest.mock('expo-crypto', () => ({
    getRandomValues: jest.fn(() => new Uint32Array([123456789])),
}))

describe('formatName', () => {
    it('should trim and replace multiple spaces with a single space', () => {
        const name = '   John    Doe    '
        const result = utils.formatName(name)
        expect(result).toEqual('John Doe')
    })

    it('should handle empty name', () => {
        const name = ''
        const result = utils.formatName(name)
        expect(result).toEqual('')
    })
})

describe('shuffled', () => {
    const mockedArray = [1, 2, 3, 4, 5]

    it('should return a shuffled copy of the input', () => {
        const result = utils.shuffled(mockedArray)
        expect(result).not.toEqual(mockedArray)
        expect(new Set(result)).toEqual(new Set(mockedArray))
    })

    it('should shuffle a set', () => {
        const mockedSet = new Set(mockedArray)
        const result = utils.shuffled(mockedSet)
        expect(new Set(result)).toEqual(mockedSet)
    })
})

describe('getRandom', () => {
    const mockedArray = [1, 2, 3, 4, 5]

    it('should return a random element from an array', () => {
        const result = utils.getRandom(mockedArray)
        expect(mockedArray).toContain(result)
    })

    it('should return a random element from a set', () => {
        const mockedSet = new Set(mockedArray)
        const result = utils.getRandom(mockedSet)
        expect(mockedSet).toContain(result)
    })

    it('should throw an error for unsupported collection types', () => {
        const input = new Map()
        expect(() => utils.getRandom(input)).toThrow('Unsupported collection type')
    })
})

describe('emptyQuery', () => {
    it('should have queryKey as an empty array', () => {
        expect(utils.emptyQuery.queryKey).toEqual([])
    })

    it('should have enabled as false', () => {
        expect(utils.emptyQuery.enabled).toEqual(false)
    })

    it('should return null when queryFn is called', async () => {
        const result = await utils.emptyQuery.queryFn()
        expect(result).toBeNull()
    })
})
