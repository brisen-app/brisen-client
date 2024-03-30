import { DimensionValue, View, StyleSheet, Pressable, ActivityIndicator, PressableProps } from 'react-native'
import { Image, ImageProps } from 'expo-image'
import { useCallback } from 'react'
import Color from '@/types/Color'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import { PackManager } from '@/lib/PackManager'
import { useQuery } from '@tanstack/react-query'
import { PackViewProps } from '@/app/pack/[packID]'
import { Link } from 'expo-router'
import PackListView, { PackListViewPlaceholder } from './PackListView'

const borderRadius = 16
const height: DimensionValue = 256 - 32

export default function PackFeaturedView(props: Readonly<PackViewProps & PressableProps>) {
    const { pack } = props
    const colorScheme = useColorScheme()

    const { data: image, isLoading, error } = useQuery(PackManager.getImageQuery(pack.image))
    if (error) console.warn(error)

    const PackImage = useCallback((props: ImageProps) => <Image {...props} source={image} transition={256} />, [image])

    if (isLoading) return <PackFeaturedViewPlaceholder {...props} />

    return (
        <Link key={pack.id} href={`/pack/${pack.id}`} asChild>
            <Pressable {...props}>
                <View
                    style={{
                        borderRadius: borderRadius,
                        overflow: 'hidden',
                        borderColor: Colors[colorScheme].stroke,
                        borderWidth: Sizes.thin,
                        backgroundColor: Colors[colorScheme].background,
                    }}
                >
                    <PackImage
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0.25,
                        }}
                        contentFit="fill"
                        blurRadius={100}
                    />

                    <PackImage style={{ height: height }} />

                    <PackListView pack={pack} hideImage style={{ padding: 16 }} />
                </View>
            </Pressable>
        </Link>
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
                    backgroundColor: Color.white.alpha(0.05).string,
                }}
            >
                <View style={{ height: height, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={Color.white.alpha(0.1).string} />
                </View>
                <PackListViewPlaceholder
                    hideImage
                    style={{ backgroundColor: Colors[colorScheme].secondaryBackground, padding: 16 }}
                />
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
