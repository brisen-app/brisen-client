import React from "react";
import { ActivityIndicator as ActInd } from "react-native";
import { BlurTint, BlurView } from 'expo-blur';
import { Text, View, useThemeColor } from './Themed';

import Colors from '@/constants/Colors';
import { useColorScheme } from "./useColorScheme.web";

export function ActivityIndicator({ label = "Loading..." }) {
    return (
        <BlurView tint={(useColorScheme() ?? 'dark') as BlurTint} style={{
            alignSelf: 'center',
            borderRadius: 16,
            overflow: 'hidden',
            padding: 32,
            paddingHorizontal: 64,
        }}>
            <ActInd size="large" color={useThemeColor({}, "accentColor")}/>
            <Text style={{ textAlign: 'center' }}>{label}</Text>
        </BlurView>
    );
}