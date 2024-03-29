import { BlurView } from 'expo-blur'
import { DimensionValue, View, TouchableOpacity, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Image, ImageProps } from 'expo-image'
import { PlaylistContext } from '../utils/AppContext'
import { Text } from '../utils/Themed'
import { useCallback, useContext } from 'react'
import Color from '@/types/Color'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import Assets from '@/constants/Assets'
import { PackManager } from '@/lib/PackManager'
import { useQuery } from '@tanstack/react-query'
import Placeholder from '../utils/Placeholder'
import { PackViewProps } from '@/app/pack/[packID]'
import { Link } from 'expo-router'

const borderRadius = 16
const height: DimensionValue = 256 + 32

export default function PackFeaturedView(props: Readonly<PackViewProps>) {
    const { pack } = props
    const colorScheme = useColorScheme()
    const { playlist, setPlaylist } = useContext(PlaylistContext)
    const isSelected = playlist.some((p) => p.id === pack.id)

    function onPress() {
        if (isSelected) setPlaylist(playlist.filter((p) => p.id !== pack.id))
        else setPlaylist([...playlist, pack])
    }

    const { data: image, isLoading, error } = useQuery(PackManager.getImageQuery(pack.image))
    if (error) console.warn(error)

    const PackImage = useCallback(
        (props: ImageProps) => <Image {...props} source={image ?? Assets[colorScheme].pack_placeholder} />,
        [image]
    )

    if (isLoading) return <PackFeaturedViewPlaceholder />

    return (
        <Link href={`/pack/${pack.id}`} asChild>
            <Pressable
                style={{
                    height: height,
                    borderRadius: borderRadius,
                    overflow: 'hidden',
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: Sizes.thin,
                }}
            >
                {/* <PackImage
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: borderRadius,
                    }}
                /> */}
                {/* <LinearGradient
                    end={{ x: 0.5, y: 0.25 }}
                    colors={[Color.black.alpha(0.5).string, Color.black.alpha(0).string]}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: borderRadius,
                    }}
                /> */}

                <View style={{ flex: 1 }}>
                    {/* <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            padding: 16,
                            gap: 16,
                        }}
                    >
                        <StatButton icon="heart" label="17.3k" />
                        <StatButton icon="send" label="34" />
                    </View> */}
                    <PackImage
                        style={{
                            flex: 1,
                            overflow: 'hidden',
                        }}
                    />

                    <BlurView
                        intensity={100}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 16,
                            borderBottomLeftRadius: borderRadius,
                            borderBottomRightRadius: borderRadius,
                            overflow: 'hidden',
                            backgroundColor: Color.black.alpha(0.5).string,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                gap: 2,
                            }}
                        >
                            <Text style={[styles.text, styles.header]}>{pack.name}</Text>

                            <Text
                                numberOfLines={1}
                                style={{ ...styles.text, color: Colors[colorScheme].secondaryText }}
                            >
                                {pack.cards.length} cards {pack.description && '• ' + pack.description}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onPress}
                            style={{
                                justifyContent: 'center',
                                // margin: 8,
                                backgroundColor: Colors[colorScheme].background,
                                borderRadius: 64,
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                            }}
                        >
                            <Text
                                style={{
                                    ...styles.header,
                                    color: isSelected ? 'red' : Colors[colorScheme].accentColor,
                                }}
                            >
                                {isSelected ? 'Remove' : 'Play'}
                            </Text>
                        </TouchableOpacity>
                    </BlurView>
                </View>
            </Pressable>
        </Link>
    )
}

export function PackFeaturedViewPlaceholder() {
    const colorScheme = useColorScheme()
    return (
        <View
            style={{
                height: height,
                borderRadius: borderRadius,
                overflow: 'hidden',
                justifyContent: 'flex-end',
                borderColor: Colors[colorScheme].stroke,
                borderWidth: Sizes.thin,
                backgroundColor: Color.white.alpha(0.05).string,
            }}
        >
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={Color.white.alpha(0.1).string} />
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: Color.white.alpha(0.05).string,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        gap: 4,
                    }}
                >
                    <Placeholder width="33%" height={18} />
                    <Placeholder width="100%" height={18} />
                </View>
                {/* Insert icons here */}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        userSelect: 'none',
        textShadowColor: Color.black.alpha(0.25).string,
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 1 },
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
    },
})
