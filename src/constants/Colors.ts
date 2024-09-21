import Color from '@/src/models/Color'

export default {
  accentColor: Color.hex('#f3a000').string,

  text: Color.white.string,
  secondaryText: Color.brightness(0.5).string,

  background: Color.black.string,
  secondaryBackground: Color.brightness(0.1).string,

  stroke: Color.white.alpha(0.1).string,

  placeholder: Color.white.alpha(0.1).string,
}
