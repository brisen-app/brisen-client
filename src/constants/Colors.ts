import Color from '@/src/models/Color'

const accentColor = Color.hex('#F3A000').string

export default {
  accentColor: accentColor,

  text: Color.white.string,
  secondaryText: Color.brightness(2 / 3).string,

  background: Color.black.string,
  secondaryBackground: Color.brightness(0.1).string,

  stroke: Color.white.alpha(0.1).string,

  placeholder: Color.white.alpha(0.1).string,

  green: {
    light: Color.hex('#3ED68C').string,
    dark: Color.hex('#142D21').string,
  },

  yellow: {
    light: accentColor,
    dark: Color.hex('#331D00').string,
  },

  orange: {
    light: Color.hex('#FF7B25').string,
    dark: Color.hex('#311400').string,
  },

  blue: {
    light: Color.hex('#0090FF').string,
    dark: Color.hex('#0C2643').string,
  },

  red: {
    light: Color.hex('#F31111').string,
    dark: Color.hex('#450000').string,
  },
}
