import { DimensionValue, View, TouchableOpacity, StyleSheet, Pressable, PressableProps, ViewProps } from 'react-native'
import { Image, ImageProps } from 'expo-image'
import { PlaylistContext } from '../utils/AppContext'
import { Text } from '../utils/Themed'
import { useCallback, useContext } from 'react'
import Colors from '@/constants/Colors'
import useColorScheme from '../utils/useColorScheme'
import { PackManager } from '@/lib/PackManager'
import Color from '@/types/Color'
import { useQuery } from '@tanstack/react-query'
import { PackViewProps } from '@/app/pack/[packID]'
import { Link } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import Placeholder from '../utils/Placeholder'
import { ActivityIndicator } from 'react-native'

export type PackListViewProps = {
    hideImage?: boolean
}

const height: DimensionValue = 80

export default function PackListView(props: Readonly<PackListViewProps & PackViewProps & PressableProps>) {
    const { pack, hideImage } = props
    const colorScheme = useColorScheme()
    const { playlist, setPlaylist } = useContext(PlaylistContext)
    const isSelected = playlist.some((p) => p.id === pack.id)

    function onAddToQueue() {
        if (isSelected) setPlaylist(playlist.filter((p) => p.id !== pack.id))
        else setPlaylist([...playlist, pack])
    }

    const { data: image, isLoading, error } = useQuery(PackManager.getImageQuery(pack.image, !hideImage))
    if (error) console.warn(error)

    const PackImage = useCallback((props: ImageProps) => <Image {...props} source={image} transition={256} />, [image])

    if (isLoading) return <PackListViewPlaceholder hideImage={hideImage} {...props} />

    return (
        <Link key={pack.id} href={`/pack/${pack.id}`} asChild>
            <Pressable
                style={{
                    height: height,
                    borderRadius: 16,
                }}
                {...props}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {!hideImage && (
                        <PackImage
                            style={{
                                aspectRatio: 1,
                                height: '100%',
                                borderRadius: 16,
                                borderColor: Colors[colorScheme].stroke,
                                borderWidth: StyleSheet.hairlineWidth,
                            }}
                        />
                    )}

                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={[styles.text, styles.header]}>
                            {pack.name}
                        </Text>

                        <Text numberOfLines={2} style={{ ...styles.text, color: Colors[colorScheme].secondaryText }}>
                            {pack.description ? pack.description : pack.cards.length + ' cards'}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={onAddToQueue}>
                        <MaterialIcons
                            size={28}
                            name={isSelected ? 'playlist-remove' : 'playlist-add'}
                            color={isSelected ? Colors[colorScheme].secondaryText : Colors[colorScheme].accentColor}
                        />
                    </TouchableOpacity>
                    {!hideImage && (
                        <MaterialIcons size={28} name={'chevron-right'} color={Colors[colorScheme].secondaryText} />
                    )}
                </View>
            </Pressable>
        </Link>
    )
}

export function PackListViewPlaceholder(props: PackListViewProps & PressableProps) {
    const { hideImage } = props
    const colorScheme = useColorScheme()
    return (
        <Pressable
            style={{
                height: height,
                borderRadius: 16,
            }}
            {...props}
            onPress={() => {}}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {!hideImage && (
                    <View
                        style={{
                            aspectRatio: 1,
                            height: '100%',
                            borderRadius: 16,
                            borderColor: Colors[colorScheme].stroke,
                            borderWidth: StyleSheet.hairlineWidth,
                            justifyContent: 'center',
                            backgroundColor: Color.white.alpha(0.05).string,
                        }}
                    >
                        <ActivityIndicator color={Color.white.alpha(0.1).string} />
                    </View>
                )}

                <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
                    <Placeholder width="33%" height={18} />
                    <Placeholder width="100%" height={18} />
                </View>

                <View style={{ justifyContent: 'center', opacity: 0.1 }}>
                    <MaterialIcons size={28} name={'playlist-add'} color={Colors[colorScheme].secondaryText} />
                </View>
            </View>
        </Pressable>
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
