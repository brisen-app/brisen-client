import { Appearance, ColorSchemeName } from "react-native";
import Color from "./Color";

export default abstract class ColorTheme {
    // Docs: https://reactnative.dev/docs/appearance

    static get colorScheme(): ColorSchemeName {
        return Appearance.getColorScheme();
    }

    static get isLightMode() {
        return this.colorScheme === "light";
    }

    static setColorScheme(scheme: "light" | "dark" | "auto") {
        if (scheme === "auto") Appearance.setColorScheme(null);
        Appearance.setColorScheme(scheme as ("light" | "dark"));
    }

    static get transparent() {
        return Color.transparent.string;
    }

    static get text() {
        return this.isLightMode ? Color.black.string : Color.white.string;
    }

    static get background() {
        return this.isLightMode ? Color.white.string : Color.black.string;
    }

    static get accent() {
        return Color.hex("#f3a000").string;
    }

    static get textShadow() {
        return Color.black.alpha(0.5).string;
    }

    static get border() {
        return Color.white.alpha(0.2).string;
    }
}