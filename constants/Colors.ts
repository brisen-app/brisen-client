import Color from "@/types/Color";

const accentColor = Color.hex('#f3a000');

export default {
  light: {
    accentColor: accentColor.string,
    text: Color.black.string,
    secondaryText: Color.brightness(0.5).string,
    background: Color.white.string,
    stroke: Color.brightness(0.9).string,
    packIconBackground: Color.white.alpha(0.5).string,
  },
  dark: {
    accentColor: accentColor.string,
    text: Color.white.string,
    secondaryText: Color.brightness(0.5).string,
    background: Color.black.string,
    stroke: Color.brightness(0.1).string,
    packIconBackground: Color.white.alpha(0.05).string,
  },
  accentColor: accentColor.string,
};
