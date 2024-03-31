import {
    DimensionValue,
    View,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    PressableProps,
    TouchableOpacityProps,
    ActivityIndicator,
} from 'react-native'
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
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import Placeholder from '../utils/Placeholder'

export type PackListViewProps = {
    hideImage?: boolean
}

const height: DimensionValue = 80

export default function PackListView(props: Readonly<PackListViewProps & PackViewProps & TouchableOpacityProps>) {
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
        <TouchableOpacity
            style={{
                height: height,
                borderRadius: 16,
            }}
            {...props}
            onPress={onAddToQueue}
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
                            opacity: isSelected ? 1 : 0.5,
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

                <MaterialCommunityIcons
                    size={28}
                    name={isSelected ? 'check' : 'checkbox-blank-circle-outline'}
                    color={isSelected ? Colors[colorScheme].accentColor : Colors[colorScheme].secondaryText}
                />

                <Link href={`/pack/${pack.id}`} asChild>
                    <TouchableOpacity>
                        <MaterialIcons size={28} name={'more-horiz'} color={Colors[colorScheme].text} />
                    </TouchableOpacity>
                </Link>
            </View>
        </TouchableOpacity>
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
                        <ActivityIndicator color={Colors[colorScheme].secondaryText} />
                    </View>
                )}

                <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
                    <Placeholder width="25%" height={18} />
                    <Placeholder width="75%" height={18} />
                </View>
                <MaterialCommunityIcons
                    size={28}
                    name='checkbox-blank-circle-outline'
                    color={Colors[colorScheme].placeholder}
                />
                <MaterialIcons size={28} name={'more-horiz'} color={Colors[colorScheme].placeholder} />
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
