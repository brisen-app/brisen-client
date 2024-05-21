import Color from "@/models/Color"

describe('Color', () => {
    describe('constructor', () => {
        it('should throw an error for invalid hex pattern', () => {
            expect(() => new Color()).toThrow(TypeError)
            expect(() => new Color('')).toThrow(TypeError)
            expect(() => new Color('Random value')).toThrow(TypeError)
            expect(() => new Color('#zzz')).toThrow(TypeError)
        })

        const alphaValueTestCases = [
            { hex: '#00000000', expectedAlpha: 0, expectedHex: '#000000' },
            { hex: '#00000040', expectedAlpha: 0.25, expectedHex: '#000000' },
            { hex: '#00000080', expectedAlpha: 0.5, expectedHex: '#000000' },
            { hex: '#ff0000bf', expectedAlpha: 0.75, expectedHex: '#ff0000' },
            { hex: '#f0fa', expectedAlpha: 2 / 3, expectedHex: '#ff00ff' },
            { hex: '#000000ff', expectedAlpha: 1, expectedHex: '#000000' },
            { hex: '#f0f', expectedAlpha: 1, expectedHex: '#ff00ff' },
        ]

        alphaValueTestCases.forEach(({ hex, expectedAlpha, expectedHex }) => {
            it(`should initialize with the correct hex and alpha values for ${hex}`, () => {
                const color = new Color(hex)
                expect(color.hex).toBe(expectedHex)
                expect(color.a).toBeCloseTo(expectedAlpha)
            })
        })

        it('should throw an error for invalid hex length', () => {
            expect(() => new Color('#f')).toThrow(TypeError)
            expect(() => new Color('#ff')).toThrow(TypeError)
            expect(() => new Color('#fffff')).toThrow(TypeError)
            expect(() => new Color('#fffffff')).toThrow(TypeError)
        })

        it('should throw an error for invalid alpha value', () => {
            expect(() => new Color('#ff0000').alpha(-0.5)).toThrow(TypeError)
            expect(() => new Color('#ff0000').alpha(2)).toThrow(TypeError)
        })
    })

    describe('alpha', () => {
        it('should return a new Color instance with the specified alpha value', () => {
            const color = new Color('#ff0000').alpha(0.5)
            expect(color.string).toBe('#ff000080')
        })

        it('should throw an error for invalid alpha value', () => {
            const color = new Color('#ff0000')
            expect(() => color.alpha(-0.5)).toThrow(TypeError)
            expect(() => color.alpha(2)).toThrow(TypeError)
        })
    })

    describe('string', () => {
        it('should return the string representation of the color with alpha', () => {
            const color = new Color('#ff0000aa')
            expect(color.string).toBe('#ff0000aa')
        })

        it('should return the string representation of the color without alpha', () => {
            const color = new Color('#ff0000')
            expect(color.string).toBe('#ff0000ff')
        })
    })

    describe('calculateRelativeLuminance', () => {
        it('should return the correct relative luminance for a given hex color', () => {
            expect(Color.calculateRelativeLuminance('#000000')).toBe(0)
            expect(Color.calculateRelativeLuminance('#ffffff')).toBe(1)
            expect(Color.calculateRelativeLuminance('#ff0000')).toBeCloseTo(0.2126, 5)
            expect(Color.calculateRelativeLuminance('#00ff00')).toBeCloseTo(0.7152, 5)
            expect(Color.calculateRelativeLuminance('#0000ff')).toBeCloseTo(0.0722, 5)
        })
    })

    describe('hex', () => {
        it('should create a new Color instance with the given hex color', () => {
            const color = Color.hex('#ff0000')
            expect(color.hex).toBe('#ff0000')
            expect(color.a).toBe(1)
        })
    })

    describe('rgb', () => {
        it('should create a new Color instance with the given RGB values', () => {
            const color = Color.rgb(255, 0, 0)
            expect(color.hex).toBe('#ff0000')
            expect(color.a).toBe(1)
        })
    })

    describe('brightness', () => {
        it('should create a new Color instance with the given brightness', () => {
            const color = Color.brightness(0.5)
            expect(color.hex).toBe('#808080')
            expect(color.a).toBe(1)
        })

        it('should throw an error for invalid brightness value', () => {
            expect(() => Color.brightness(-0.5)).toThrow(TypeError)
            expect(() => Color.brightness(2)).toThrow(TypeError)
        })
    })

    describe('numberToHex', () => {
        it('should convert a number to hexadecimal string', () => {
            expect(Color.numberToHex(255)).toBe('ff')
            expect(Color.numberToHex(0)).toBe('00')
            expect(Color.numberToHex(128)).toBe('80')
        })

        it('should throw an error for invalid color value', () => {
            expect(() => Color.numberToHex(-1)).toThrow(TypeError)
            expect(() => Color.numberToHex(256)).toThrow(TypeError)
        })
    })

    describe('hexToNumber', () => {
        it('should convert a hexadecimal string to a number', () => {
            expect(Color.hexToNumber('FF')).toBe(255)
            expect(Color.hexToNumber('00')).toBe(0)
            expect(Color.hexToNumber('80')).toBe(128)
        })
    })

    describe('shortHexToLong', () => {
        it('should convert a short hex string to a long hex string', () => {
            expect(Color.shortHexToLong('#f00')).toBe('#ff0000')
            expect(Color.shortHexToLong('#0f0')).toBe('#00ff00')
            expect(Color.shortHexToLong('#00f')).toBe('#0000ff')
        })
    })
})
