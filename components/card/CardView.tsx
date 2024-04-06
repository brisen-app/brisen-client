import { Category, CategoryManager } from '@/lib/CategoryManager'
import { FontStyles, Styles } from '@/constants/Styles'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { LocalizedText } from '../utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import { PlayedCard } from '@/lib/CardManager'
import { Text } from '../utils/Themed'
import { useQuery } from '@tanstack/react-query'
import { View, TouchableOpacity } from 'react-native'
import Assets from '@/constants/Assets'
import Color from '@/types/Color'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'

export type CardViewProps = {
    card: PlayedCard
    category?: Category | null
}

export function CardView(props: Readonly<CardViewProps>) {
    const colorScheme = useColorScheme()
    const { card, category } = props

    const padding = 24
    const { data: image, error } = useQuery(PackManager.getImageQuery(card.pack.image))

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
                {card.formattedContent ?? card.content}
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
                        <Text style={FontStyles.Title}>{card.pack.name}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}
