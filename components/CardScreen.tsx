import React, { useContext } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { PlaylistContext } from './AppContext';

export default function CardScreen(props: Readonly<{ cardID: string }>) {
    const { cardID } = props;
    const colorScheme = useColorScheme()
    
    const padding = 16
    let insets = useSafeAreaInsets()
    insets = {
        top: insets.top ? insets.top : padding,
        bottom: insets.bottom ? insets.bottom : padding,
        left: insets.left ? insets.left : padding,
        right: insets.right ? insets.right : padding
    }

    const { data: card, isLoading: isLoadingCard, error: errorCard } = useQuery(
        Supabase.getCardQuery(cardID)
    )

    const { data: category, isLoading: isLoadingCategory, error: errorCategory } = useQuery({
        ...Supabase.getCategoryQuery(card?.category),
        enabled: !!card?.category
    })
    
    if (errorCategory) console.warn(errorCategory)

    if (errorCard) {
        console.warn(errorCard)
        // TODO: Show empty card
    }

    const isLoading = isLoadingCard || isLoadingCategory

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
                borderRadius: 32 + 16,
                // padding: 32,
                backgroundColor: Colors[colorScheme].contentBackground,
                borderColor: Colors[colorScheme].stroke,
                borderWidth: Sizes.thin,
            }}>
                {
                isLoading ? <CardLoadingView /> :
                !card ? <CardErrorView /> :
                <CardView card={card} category={category} />
                }
            </View>
        </View>
    )
}

function CardLoadingView() {
    // TODO: Add card skeleton
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

function CardErrorView() {
    // TODO: Make more user friendly
    return (
        <View>
            <Text style={{ fontSize: Sizes.big }}>🥵</Text>
        </View>
    )
}

function CardView(props: Readonly<{ card: Tables<'cards'>, category: Tables<'categories'> | undefined }>) {
    const colorScheme = useColorScheme()
    const { card, category } = props
    const { playlist } = useContext(PlaylistContext)

    // TODO: Memoize
    const pack = playlist.find(p => p.cards.find(c => c.id === card.id))
    
    return (
        <LinearGradient
            colors={category?.gradient ?? [Color.black.string, Colors[colorScheme].accentColor]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{
                flex: 1,
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '100%',
                padding: 32,
            }}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'red'
                }}
            >
                {
                category ? <Text style={[styles.text, styles.content]}>{category?.icon}</Text> : null
                }
            </View>
            <View
                style={{
                    flex: 1,
                    //alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white'
                }}
            >
                <Text style={[styles.text, styles.content]}>{card.content}</Text>
            </View>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    width: '100%',
                    backgroundColor: 'blue'
                }}
            >
                <Text style={[styles.text, styles.content]}>{pack?.name}</Text>
                <View style={{ backgroundColor: 'purple' }}>
                    <View style={{ height: 64, width: 64, backgroundColor: 'black', borderRadius: 32 }}>
                        {/* TODO: Insert user profile image */}
                    </View>
                </View>
            </View>
        </LinearGradient>
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
    categoryTitle: {
        fontSize: 32,
        fontWeight: '900',
    },
    content: {
        fontSize: 28,
        fontWeight: '900',
    }
});
