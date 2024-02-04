import React from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import Card from '@/types/Card';
import Colors from '@/constants/Colors';
import Category from '@/types/Category';
import { useQuery } from '@tanstack/react-query';
import Localization from '@/types/Localization';

export default function GameCard(props: Readonly<{ card: Card | null, onPress?: () => void }>) {
    const { data: category, isLoading: loadingCategory } = useQuery({
        queryKey: ["fetch", props.card?.category],
        queryFn: async () => {
            return await props.card?.fetchCategory()
        }
    })

    const { data: categoryTitle, isLoading: loadingTitle } = useQuery({
        queryKey: ["fetch", category?.id ?? "null", "title"],
        queryFn: async () => {
            return await category?.fetchTitle()
        },
        enabled: !!category
    })

    if (!props.card) return <Text>Error: No card provided</Text>;

    return (
        <Pressable style={styles.container} onPress={props.onPress}>
            <View style={styles.view}>
                {(loadingCategory || loadingTitle) ?
                    <ActivityIndicator /> :
                    category ? <Text style={styles.title}>{`${category?.icon} ${categoryTitle}`}</Text> :
                    null
                }
                <Text style={styles.text}>{props.card.content}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 32,
        backgroundColor: Colors.accentColor,
        margin: 16,
        overflow: 'hidden',
    },
    view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    title : {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        userSelect: 'none',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 1 },
    },
    text: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        userSelect: 'none',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 1 },
    }
});
