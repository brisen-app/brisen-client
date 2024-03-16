import React, { useCallback, useContext, useMemo } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
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
import { StatButton } from './StatButton';
import { Image } from 'expo-image';

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
                borderRadius: 32 + 8,
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

    const padding = 24

    const pack = useMemo(
        () => playlist.find(p => p.cards.find(c => c.id === card.id)),
        [card.id]
    )
    
    return (
        <>
            <LinearGradient
                colors={category?.gradient ?? [Color.hex('#370A00').string, Colors[colorScheme].accentColor]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                }}
            />


            {/* Grain */}
            <Image
                source={require('@/assets/images/noise.png')}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0.05,
                }}
            />


            {/* Content */}
            <Text style={{
                ...styles.text,
                ...styles.content,
                position: 'absolute',
            }}>
                {card.content}
            </Text>

            {/* Overlay */}
            <View
                style={{
                    position: 'absolute',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '100%',
                    padding: padding,
                }}
            >
                <TouchableOpacity style= {{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {
                    category && <>
                        <Text style={[styles.text, styles.content, { marginRight: 4}]}>
                            {category?.icon}
                        </Text>
                        <LocalizedText
                            localeKey={Supabase.getCategoryTitleId(category.id)}
                            style={[styles.text, styles.categoryTitle]}
                            placeHolderStyle={{ width: 128, height: 24 }}
                        />
                    </>
                    }
                </TouchableOpacity>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                    }}
                >
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source='https://picsum.photos/200?random=1'
                            cachePolicy={'none'}
                            style={{
                                height: 40,
                                width: 40,
                                backgroundColor: Color.black.alpha(0.5).string,
                                borderColor: Colors[colorScheme].stroke,
                                borderWidth: Sizes.thin,
                                borderRadius: 12,
                                marginRight: 8
                            }}
                        />
                        <Text style={[styles.text, styles.categoryTitle]}>{pack?.name}</Text>
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center' }}>
                        <StatButton icon='list' label='16' style={{ marginTop: 0 }}/>
                        <StatButton icon='heart' label='12.0m' style={{ marginTop: 16 }}/>
                        <StatButton icon='send' label='27.1k' style={{ marginTop: 16 }}/>
                        <TouchableOpacity>
                            <Image
                                source='https://picsum.photos/200?random=0'
                                cachePolicy={'none'}
                                style={{
                                    height: 48,
                                    width: 48,
                                    backgroundColor: Color.black.alpha(0.5).string,
                                    borderColor: Colors[colorScheme].stroke,
                                    borderWidth: Sizes.thin,
                                    borderRadius: 32,
                                    marginTop: 16
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
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
        fontSize: 20,
        fontWeight: '900',
    },
    content: {
        fontSize: 28,
        fontWeight: '900',
    }
});
