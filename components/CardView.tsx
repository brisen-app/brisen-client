import React from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '@/types/Card';
import { useQuery } from '@tanstack/react-query';
import Color from '@/types/Color';
import { BlurView } from 'expo-blur';
import { LocalizedText } from './LocalizedText';
import { Text } from './Themed';
import Category from '@/types/Category';

export default function GameCard(props: Readonly<{ card: Card, onPress?: () => void }>) {
    let insets = useSafeAreaInsets()
    insets = {
        top: insets.top ? insets.top : 8,
        bottom: insets.bottom ? insets.bottom : 8,
        left: insets.left ? insets.left : 8,
        right: insets.right ? insets.right : 8
    }

    const { data: category, isLoading: loadingCategory } = useQuery({
        queryKey: props.card.category ? [Category.tableName, props.card.category] : [],
        queryFn: async () => {
            return await Category.fetch(props.card.category!)
        },
        enabled: !!props.card?.category
    })

    if (loadingCategory) return (
        <BlurView style={[styles.container, styles.view]}>
            <ActivityIndicator color={"white"} size={"large"} />
        </BlurView>
    )

    return (
        <Pressable style={{
            ...styles.container,
            paddingBottom: insets.bottom + 64 + 8,
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }} onPress={props.onPress}>
            <View style={{
                ...styles.view,
                backgroundColor: category?.color?.string ?? "orange"
            }}>
                {category ?
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.text, styles.title, { marginRight: 4 }]}>{category?.icon}</Text>
                        <LocalizedText
                            localeKey={`${category?.id}_title`}
                            placeHolderStyle={{ width: '50%', height: 32 }}
                            style={[styles.text, styles.title]}
                        />
                    </View> :
                    null}
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
        borderRadius: 32,
        padding: 32,
        //marginBottom: "10%",
        borderColor: Color.white.alpha(0.1).string,
        borderWidth: 1,
    },
    text: {
        userSelect: 'none',
        textShadowColor: Color.black.alpha(0.5).string,
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
