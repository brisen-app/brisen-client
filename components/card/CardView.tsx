import { useContext, useMemo } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { LocalizedText } from '../utils/LocalizedText'
import { Text } from '../utils/Themed'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import Color from '@/types/Color'
import { LinearGradient } from 'expo-linear-gradient'
import { PlayerListContext, PlaylistContext } from '../utils/AppContext'
import { Image } from 'expo-image'
import { Card, CardManager } from '@/lib/CardManager'
import { Category, CategoryManager } from '@/lib/CategoryManager'
import { FontStyles, Styles } from '@/constants/Styles'
import Assets from '@/constants/Assets'
import { useQuery } from '@tanstack/react-query'
import { PackManager } from '@/lib/PackManager'

export type CardViewProps = {
    card: Card
    category?: Category | null
}

export function CardView(props: Readonly<CardViewProps>) {
    const colorScheme = useColorScheme()
    const { card, category } = props
    const { playlist } = useContext(PlaylistContext)
    const { players } = useContext(PlayerListContext)

    const padding = 24

    const formattedContent = useMemo(() => {
        try {
            return CardManager.insertPlayers(card.content, players)
        } catch (error) {
            console.warn(error)
        }
    }, [card])

    const pack = useMemo(() => playlist.find((p) => p.cards.find((c) => c.id === card.id)), [card.id])
    const { data: image, error } = useQuery(PackManager.getImageQuery(pack?.image))
    if (error) console.warn(error)

    return (
        <>
            <LinearGradient
                colors={category?.gradient ?? [Color.hex('#370A00').string, Colors[colorScheme].accentColor]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={Styles.absoluteFill}
            />

            {/* Grain */}
            <Image
                source={require('@/assets/images/noise.png')}
                style={{
                    ...Styles.absoluteFill,
                    opacity: 0.05,
                }}
            />

            {/* Content */}
            <Text style={{ fontSize: 28, fontWeight: '900', ...Styles.shadow, textAlign: 'center', padding: 32 }}>
                {formattedContent ?? card.content}
            </Text>

            {/* Overlay */}
            <View
                style={{
                    position: 'absolute',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '100%',
                    padding: padding,
                    ...Styles.shadow,
                }}
            >
                {category ? (
                    <TouchableOpacity
                        onPress={() => {
                            console.log('Category tapped')
                        }}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <Text style={FontStyles.LargeTitle}>{category?.icon}</Text>
                        <LocalizedText
                            id={CategoryManager.getTitleLocaleKey(category)}
                            style={FontStyles.Title}
                            placeHolderStyle={{ width: 128, height: 24 }}
                        />
                    </TouchableOpacity>
                ) : (
                    <View />
                )}

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            console.log('Pack tapped')
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            source={image ?? Assets[colorScheme].pack_placeholder}
                            cachePolicy={'none'}
                            style={{
                                height: 40,
                                aspectRatio: 1,
                                backgroundColor: Color.black.alpha(0.5).string,
                                borderColor: Colors[colorScheme].stroke,
                                borderWidth: Sizes.thin,
                                borderRadius: 12,
                                marginRight: 8,
                            }}
                        />
                        <Text style={FontStyles.Title}>{pack?.name}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}
