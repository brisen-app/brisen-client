import React from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import Card from '@/types/Card';
import { useQuery } from '@tanstack/react-query';
import Localization from '@/types/Localization';
import ColorTheme from '@/types/ColorTheme';

export default function GameCard(props: Readonly<{ card: Card, onPress?: () => void }>) {
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

    return (
        <Pressable style={{
            ...styles.container,
            backgroundColor: category?.color?.string ?? ColorTheme.accent
        }} onPress={props.onPress}>
            <View style={styles.view}>
                {(loadingCategory || loadingTitle) ?
                    <ActivityIndicator color={ColorTheme.text}/> :
                    category ? <Text style={[styles.text, styles.title]}>{`${category?.icon} ${categoryTitle}`}</Text> :
                    null
                }
                <Text style={[styles.text, styles.content]}>{props.card.content}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 32,
        margin: 16,
        overflow: 'hidden',
        borderColor: ColorTheme.border,
        borderWidth: 1,
    },
    view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    text: {
        userSelect: 'none',
        textShadowColor: ColorTheme.textShadow,
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 1 },
        textAlign: 'center'
    },
    title : {
        fontSize: 32,
        fontWeight: '900',
    },
    content: {
        fontSize: 24,
        fontWeight: '900',
    }
});
