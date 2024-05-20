import Color from '@/models/Color'

const accentColor = Color.hex('#f3a000')

export default {
    light: {
        accentColor: accentColor.string,

        text: Color.black.string,
        secondaryText: Color.brightness(0.5).string,

        background: Color.brightness(0.9).string,
        secondaryBackground: Color.white.string,

        stroke: Color.black.alpha(0.2).string,
        placeholder: Color.black.alpha(0.1).string,
    },
    dark: {
        accentColor: accentColor.string,

        text: Color.white.string,
        secondaryText: Color.brightness(0.5).string,

        background: Color.black.string,
        secondaryBackground: Color.brightness(0.05).string,

        stroke: Color.white.alpha(0.1).string,
        placeholder: Color.white.alpha(0.1).string,
    },
}
