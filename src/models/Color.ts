export default class Color {
  // Docs: https://reactnative.dev/docs/colors

  private static readonly hexPattern = RegExp(/^#(?:[\da-f]{3,4}){1,2}$/i)

  private readonly hex: string // #rrggbb
  private readonly a: number // 0-1
  get luminance() {
    return Color.calculateRelativeLuminance(this.hex)
  } // 0-1
  get string() {
    return `${this.hex}${Color.numberToHex(this.a * 255)}`
  }

  static readonly white = Color.hex('#fff')
  static readonly black = Color.hex('#000')
  static readonly transparent = Color.white.alpha(0)

  public toString() {
    return this.string
  }

  protected constructor(string: string) {
    string = string.toLowerCase()
    if (!string.startsWith('#')) string = `#${string}`
    if (!Color.hexPattern.test(string)) throw new TypeError(`Invalid hex pattern: '${string}'`)
    switch (string.length) {
      case 4:
        this.hex = Color.shortHexToLong(string)
        this.a = 1
        break
      case 5:
        this.hex = Color.shortHexToLong(string)
        this.a = Color.hexToNumber(string.slice(-1) + string.slice(-1)) / 255
        break
      case 7:
        this.hex = string
        this.a = 1
        break
      case 9:
        this.hex = string.slice(0, 7)
        this.a = Color.hexToNumber(string.slice(-2)) / 255
        break
      default:
        throw new TypeError(`Invalid hex length: '${string}'`)
    }
  }

  alpha(a: number): Color {
    if (a < 0 || a > 1) throw new TypeError(`Invalid alpha: '${a}'`)
    return new Color(`${this.hex}${Color.numberToHex(Math.round(a * 255))}`)
  }

  private static calculateRelativeLuminance(hexColor: string): number {
    // Convert hex to RGB
    const r = this.hexToNumber(hexColor.slice(1, 3)) / 255
    const g = this.hexToNumber(hexColor.slice(3, 5)) / 255
    const b = this.hexToNumber(hexColor.slice(5, 7)) / 255

    // Calculate RsRGB, GsRGB, and BsRGB
    const RsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    const GsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    const BsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

    // Calculate relative luminance
    const L = 0.2126 * RsRGB + 0.7152 * GsRGB + 0.0722 * BsRGB
    return L
  }

  static hex(hex: string): Color {
    return new Color(hex)
  }

  static rgb(r: number = 0, g: number = 0, b: number = 0): Color {
    return new Color(`#${Color.numberToHex(r)}${Color.numberToHex(g)}${Color.numberToHex(b)}`)
  }

  static brightness(brightness: number): Color {
    if (brightness < 0 || brightness > 1) throw new TypeError(`Invalid brightness: '${brightness}'`)
    return new Color(
      `#${Color.numberToHex(Math.round(brightness * 255))}${Color.numberToHex(
        Math.round(brightness * 255)
      )}${Color.numberToHex(Math.round(brightness * 255))}`
    )
  }

  private static numberToHex(i: number): string {
    if (i < 0 || i > 255) throw new TypeError(`Invalid color value: '${i}'`)
    return i.toString(16).padStart(2, '0')
  }

  private static hexToNumber(hex: string): number {
    return parseInt(hex, 16)
  }

  private static shortHexToLong(hex: string): string {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
}
