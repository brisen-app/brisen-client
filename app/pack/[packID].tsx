import { Stack, useLocalSearchParams } from 'expo-router'
import { Text } from '@/components/utils/Themed'
import { Pack, PackManager } from '@/lib/PackManager'
import { ActivityIndicator, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import Assets from '@/constants/Assets'
import useColorScheme from '@/components/utils/useColorScheme'

export type PackViewProps = {
    pack: Pack
}

export default function PackView() {
    const colorScheme = useColorScheme()
    const { packID } = useLocalSearchParams()

    if (packID instanceof Array) throw new Error('packID is an array')

    const { data: pack, isLoading: isLoadingPack, error: errorPack } = useQuery(PackManager.getFetchQuery(packID))
    if (errorPack) console.error(errorPack)

    const {
        data: image,
        isLoading: isLoadingImage,
        error: errorImage,
    } = useQuery(PackManager.getImageQuery(pack?.image))
    if (errorImage) console.warn(errorImage)

    if (isLoadingPack || isLoadingImage) return <ActivityIndicator size="large" />

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: true, title: pack?.name, headerBackTitle: 'back' }} />
            <Image source={image ?? Assets[colorScheme].pack_placeholder} style={{ height: '66%', width: '100%' }} />
            <Text style={{ color: 'black' }}>{pack.name}</Text>
        </View>
    )
}
