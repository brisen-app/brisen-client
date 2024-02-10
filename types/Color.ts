export default class Color {
    // Docs: https://reactnative.dev/docs/colors

    private static hexPattern = RegExp(/^#(?:[\da-f]{3,4}){1,2}$/i)

    private readonly hex: string // #rrggbb
    private readonly a: number // 0-1
    get string() { return `${this.hex}${Color.numberToHex(this.a * 255)}` }

    static readonly white = Color.hex("#fff")
    static readonly black = Color.hex("#000")
    static readonly transparent = Color.white.alpha(0)

    protected constructor(string: string) {
        if (!Color.hexPattern.test(string)) throw new TypeError(`Invalid hex pattern: '${string}'`)
        switch (string.length) {
            case 4:
                this.hex = `#${string[1]}${string[1]}${string[2]}${string[2]}${string[3]}${string[3]}`
                this.a = 1
                break
            case 5:
                this.hex = `#${string[1]}${string[1]}${string[2]}${string[2]}${string[3]}${string[3]}`
                this.a = Color.hexToNumber(string[4]) / 255
                break
            case 7:
                this.hex = string
                this.a = 1
                break
            case 9:
                this.hex = string.slice(0, 7)
                this.a = Color.hexToNumber(string.slice(7)) / 255
                break
            default:
                throw new TypeError(`Invalid hex length: '${string}'`)
        }
    }

    alpha(a: number): Color {
        if (a < 0 || a > 1) throw new TypeError(`Invalid alpha: '${a}'`)
        return new Color(`${this.hex}${Color.numberToHex(Math.round(a * 255))}`)
    }
    
    static hex(hex: string): Color {
        return new Color(hex)
    }

    static rgb(r: number = 0, g: number = 0, b: number = 0): Color {
        return new Color(`#${Color.numberToHex(r)}${Color.numberToHex(g)}${Color.numberToHex(b)}`)
    }

    private static numberToHex(i: number): string {
        if (i < 0 || i > 255) throw new TypeError(`Invalid color value: '${i}'`)
        return i.toString(16).padStart(2, "0")
    }

    private static hexToNumber(hex: string): number {
        return parseInt(hex, 16)
    }

    private static shortHexToLong(hex: string): string {
        return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    }
}