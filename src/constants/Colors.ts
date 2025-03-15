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

  orange: {
    light: accentColor,
    dark: Color.hex('#2D1F00').string,
  },

  yellow: {
    light: Color.hex('#FFC916').string,
    dark: Color.hex('#412700').string,
  },

  red: {
    light: Color.hex('#F31111').string,
    dark: Color.hex('#450000').string,
  },
}
