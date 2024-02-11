import React from 'react';
import { Text, StyleSheet, View, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '@/types/Card';
import { useQuery } from '@tanstack/react-query';
import Localization from '@/types/Localization';
import ColorTheme from '@/types/ColorTheme';
import Color from '@/types/Color';
import { BlurView } from 'expo-blur';

export default function GameCard(props: Readonly<{ card: Card, onPress?: () => void }>) {
    let insets = useSafeAreaInsets()
    insets = {
        top: insets.top ? insets.top : 8,
        bottom: insets.bottom ? insets.bottom : 8,
        left: insets.left ? insets.left : 8,
        right: insets.right ? insets.right : 8
    }

    const { data: category, isLoading: loadingCategory } = useQuery({
        queryKey: ["fetch", props.card.category],
        queryFn: async () => {
            return await props.card?.fetchCategory()
        },
        enabled: !!props.card?.category
    })

    const { data: categoryTitle, isLoading: loadingTitle } = useQuery({
        queryKey: ["fetch", Localization.tableName, `${category?.id}_title`],
        queryFn: async () => {
            return await category?.fetchTitle()
        },
        enabled: !!category
    })

    if (loadingCategory || loadingTitle) return (
        <BlurView style={[styles.container, styles.view]}>
            <ActivityIndicator color={ColorTheme.accent} size={"large"} />
        </BlurView>
    )

    return (
        <Pressable style={{ ...styles.container, paddingBottom: insets.bottom, paddingTop: insets.top }} onPress={props.onPress}>
            <View style={{
                ...styles.view,
                backgroundColor: category?.color?.string ?? ColorTheme.accent
            }}>
                {category ?
                    <Text style={[styles.text, styles.title]}>
                        {`${category?.icon} ${categoryTitle}`}
                    </Text> : null}
                <Text style={[styles.text, styles.content]}>
                    {props.card.content}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        //justifyContent: 'center',
        //alignItems: 'center',
    },
    view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //maxHeight: 1080,
        borderRadius: 48,
        padding: 32,
        borderColor: ColorTheme.border,
        borderWidth: 1,
    },
    text: {
        userSelect: 'none',
        textShadowColor: ColorTheme.textShadow,
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 1 },
        textAlign: 'center',
        color: Color.white.string,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
    },
    content: {
        fontSize: 24,
        fontWeight: '900',
    }
});
