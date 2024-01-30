import React from "react";
import { ActivityIndicator as ActInd } from "react-native";
import { BlurTint, BlurView } from 'expo-blur';
import { useThemeColor } from './Themed';
import { useColorScheme } from "./useColorScheme";
import { Headline } from "./TextStyles";

export function ActivityIndicator({ label = "Loading..." }) {
    return (
        <BlurView tint={(useColorScheme()) as BlurTint} style={{
            alignSelf: 'center',
            borderRadius: 16,
            overflow: 'hidden',
            padding: 24,
            paddingHorizontal: 48,
        }}>
            <ActInd size="large" color={useThemeColor({}, "accentColor")}/>
            <Headline>{label}</Headline>
        </BlurView>
    );
}