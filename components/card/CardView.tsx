import { useContext, useMemo } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { LocalizedText } from '../utils/LocalizedText'
import { Text } from '../utils/Themed'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import Color from '@/types/Color'
import { LinearGradient } from 'expo-linear-gradient'
import { PlaylistContext } from '../utils/AppContext'
import { StatButton } from '../ui/StatButton'
import { Image } from 'expo-image'
import { Card } from '@/lib/CardManager'
import { Category, CategoryManager } from '@/lib/CategoryManager'
import { styles } from './CardScreen'

export function CardView(props: Readonly<{ card: Card; category: Category | undefined }>) {
    const colorScheme = useColorScheme()
    const { card, category } = props
    const { playlist } = useContext(PlaylistContext)

    const padding = 24

    const pack = useMemo(() => playlist.find((p) => p.cards.find((c) => c.id === card.id)), [card.id])

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
            <Text
                style={{
                    ...styles.text,
                    ...styles.content,
                    position: 'absolute',
                }}
            >
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
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {category && (
                        <>
                            <Text style={[styles.text, styles.content, { marginRight: 4 }]}>{category?.icon}</Text>
                            <LocalizedText
                                id={CategoryManager.getTitleLocaleKey(category)}
                                style={[styles.text, styles.categoryTitle]}
                                placeHolderStyle={{ width: 128, height: 24 }}
                            />
                        </>
                    )}
                </TouchableOpacity>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                    }}
                >
                    <TouchableOpacity style={{ ...styles.shadow, flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={`https://picsum.photos/seed/${pack?.id}/265`}
                            cachePolicy={'none'}
                            style={{
                                height: 40,
                                width: 40,
                                backgroundColor: Color.black.alpha(0.5).string,
                                borderColor: Colors[colorScheme].stroke,
                                borderWidth: Sizes.thin,
                                borderRadius: 12,
                                marginRight: 8,
                            }}
                        />
                        <Text style={styles.categoryTitle}>{pack?.name}</Text>
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center', gap: 16 }}>
                        <StatButton icon="list" label="16" />
                        <StatButton icon="heart" label="12.0m" />
                        <StatButton icon="send" label="27.1k" />
                        <TouchableOpacity style={{ ...styles.shadow }}>
                            <Image
                                source={`https://picsum.photos/265?random=1`}
                                cachePolicy={'none'}
                                style={{
                                    ...styles.shadow,
                                    height: 48,
                                    width: 48,
                                    backgroundColor: Color.black.alpha(0.5).string,
                                    borderColor: Colors[colorScheme].stroke,
                                    borderWidth: Sizes.thin,
                                    borderRadius: 32,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    )
}
