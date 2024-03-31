import {
    DimensionValue,
    View,
    Pressable,
    ActivityIndicator,
    PressableProps,
    TouchableOpacity,
    TouchableOpacityProps,
    StyleSheet,
} from 'react-native'
import { Image, ImageProps } from 'expo-image'
import { useCallback, useContext } from 'react'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import { PackManager } from '@/lib/PackManager'
import { useQuery } from '@tanstack/react-query'
import { PackViewProps } from '@/app/pack/[packID]'
import PackListView, { PackListViewPlaceholder } from './PackListView'
import { PlaylistContext } from '../utils/AppContext'

const borderRadius = 16
const height: DimensionValue = 256 - 32

export default function PackFeaturedView(props: Readonly<PackViewProps & TouchableOpacityProps>) {
    const { pack } = props
    const colorScheme = useColorScheme()
    const { playlist, setPlaylist } = useContext(PlaylistContext)
    const isSelected = playlist.some((p) => p.id === pack.id)

    function onAddToQueue() {
        if (isSelected) setPlaylist(playlist.filter((p) => p.id !== pack.id))
        else setPlaylist([...playlist, pack])
    }

    const { data: image, isLoading, error } = useQuery(PackManager.getImageQuery(pack.image))
    if (error) console.warn(error)

    const PackImage = useCallback((props: ImageProps) => <Image {...props} source={image} transition={256} />, [image])

    if (isLoading) return <PackFeaturedViewPlaceholder {...props} />

    return (
        <TouchableOpacity onPress={onAddToQueue} {...props}>
            <PackImage
                style={{
                    height: height,
                    overflow: 'hidden',
                    borderRadius: borderRadius,
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: StyleSheet.hairlineWidth,
                    opacity: isSelected ? 1 : 0.5,
                }}
            />
            <PackListView pack={pack} hideImage style={{ paddingVertical: 16 }} />
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: Colors[colorScheme].stroke }} />
        </TouchableOpacity>
    )
}

export function PackFeaturedViewPlaceholder(props: Readonly<PressableProps>) {
    const colorScheme = useColorScheme()
    return (
        <Pressable {...props} onPress={() => {}}>
            <View
                style={{
                    borderRadius: borderRadius,
                    overflow: 'hidden',
                    justifyContent: 'flex-end',
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: Sizes.thin,
                    backgroundColor: Colors[colorScheme].placeholder,
                }}
            >
                <View style={{ height: height, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={Colors[colorScheme].placeholder} />
                </View>
            </View>
            <PackListViewPlaceholder
                hideImage
                style={{ backgroundColor: Colors[colorScheme].secondaryBackground, paddingVertical: 16 }}
            />
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: Colors[colorScheme].stroke }} />
        </Pressable>
    )
}
