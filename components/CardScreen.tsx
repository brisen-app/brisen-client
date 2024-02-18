import React from 'react';
import { StyleSheet, View, Dimensions, DimensionValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LocalizedText } from './LocalizedText';
import { Text } from './Themed';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import Placeholder from './Placeholder';
import useColorScheme from './useColorScheme';
import Supabase from '@/lib/supabase';
import { Tables } from '@/types/supabase';
import Color from '@/types/Color';

export default function CardScreen(props: Readonly<{ cardID: string }>) {
    const { cardID } = props;
    const colorScheme = useColorScheme()
    let insets = useSafeAreaInsets()
    insets = {
        top: insets.top ? insets.top : 8,
        bottom: insets.bottom ? insets.bottom : 8,
        left: insets.left ? insets.left : 8,
        right: insets.right ? insets.right : 8
    }

    const { data: card, isLoading } = useQuery({
        queryKey: ['cards', cardID],
        queryFn: async () => {
            return await Supabase.fetch('cards', cardID)
        }
    })

    return (
        <View style={{
            height: Dimensions.get('window').height,
            width: Dimensions.get('window').width,
            paddingBottom: insets.bottom + Sizes.big + Sizes.normal,
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }}>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                borderRadius: 32,
                // padding: 32,
                backgroundColor: Colors[colorScheme].contentBackground,
                borderColor: Colors[colorScheme].stroke,
                borderWidth: Sizes.thin,
            }}>
                {
                isLoading ? <CardLoadingView /> :
                !card ? <Text style={{ fontSize: Sizes.big }}>🥵</Text> :
                <CardView card={card} paddingTop={insets.top} />
                }
            </View>
        </View>
    )
}

function CardLoadingView() {
    return (
        <View>
        {/* <View style={{ flexDirection: 'row', width: '75%', alignItems: 'center' }}>
            <Placeholder isCircle height={Sizes.big} />
            <Placeholder height={Sizes.large} />
        </View> */}
            <Placeholder lineCount={3} height={Sizes.large} textAlignment={'center'} />
        </View>
    )
}

function CardView(props: Readonly<{ card: Tables<'cards'>, paddingTop: DimensionValue }>) {
    const colorScheme = useColorScheme()
    const { card, paddingTop } = props

    const { data: category, isLoading } = useQuery({
        queryKey: card.category ? ['categories', card.category] : [],
        queryFn: async () => {
            return !!card.category ? await Supabase.fetch('categories', card.category) : null
        },
        enabled: !!card.category
    })
    
    return (
        <View style={{
            flex: 1,
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            paddingTop: paddingTop,
            backgroundColor: category?.color ?? Colors[colorScheme].accentColor,
        }}>
            <Text style={[styles.text, styles.content]}>{card.content}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
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
