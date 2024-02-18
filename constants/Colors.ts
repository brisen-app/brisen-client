import Color from "@/types/Color";

const accentColor = Color.hex('#f3a000');

export default {
  light: {
    accentColor: accentColor.string,
    text: Color.black.string,
    secondaryText: Color.brightness(0.5).string,
    background: Color.white.string,
    appBackground: Color.brightness(0.9).string,
    stroke: Color.black.alpha(0.1).string,
    contentBackground: Color.white.string,
    placeholder: Color.black.alpha(0.1).string,
  },
  dark: {
    accentColor: accentColor.string,
    text: Color.white.string,
    secondaryText: Color.brightness(0.5).string,
    background: Color.black.string,
    appBackground: Color.black.string,
    stroke: Color.white.alpha(0.1).string,
    contentBackground: Color.brightness(0.1).string,
    placeholder: Color.white.alpha(0.1).string,
  },
  accentColor: accentColor.string,
};
