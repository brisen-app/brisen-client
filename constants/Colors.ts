import Color from "@/types/Color";

const accentColor = Color.hex('#f3a000');

export default {
  light: {
    accentColor: accentColor,
    text: Color.black,
    secondaryText: Color.brightness(0.5),
    background: Color.white,
    stroke: Color.brightness(0.9),
  },
  dark: {
    accentColor: accentColor,
    text: Color.white,
    secondaryText: Color.brightness(0.5),
    background: Color.black,
    stroke: Color.brightness(0.1),
  }
};
