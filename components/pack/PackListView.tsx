import { DimensionValue, View, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { PlaylistContext } from '../utils/AppContext'
import { Text } from '../utils/Themed'
import { Key, useContext } from 'react'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import { Pack, PackManager } from '@/lib/PackManager'
import Color from '@/types/Color'
import { useQuery } from '@tanstack/react-query'
import Assets from '@/constants/Assets'

export type PackViewProps = {
    pack: Pack
    key?: Key
}

export default function PackListView(props: Readonly<PackViewProps>) {
    const { pack } = props
    const colorScheme = useColorScheme()
    const { playlist, setPlaylist } = useContext(PlaylistContext)
    const isSelected = playlist.some((p) => p.id === pack.id)
    const height: DimensionValue = 80

    function onPress() {
        if (isSelected) setPlaylist(playlist.filter((p) => p.id !== pack.id))
        else setPlaylist([...playlist, pack])
    }

    const { data: image, error } = useQuery(PackManager.getImageQuery(pack.image))
    if (error) console.warn(error)

    return (
        <Pressable
            style={{
                height: height,
                borderRadius: 16,
                borderColor: Colors[colorScheme].stroke,
                borderWidth: Sizes.thin,
            }}
        >
            <Image
                source={image ?? Assets[colorScheme].pack_placeholder}
                blurRadius={64}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: 16,
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0.75,
                    borderRadius: 16,
                    backgroundColor: Colors[colorScheme].background,
                }}
            />
            <View
                style={{
                    // flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    margin: 8,
                }}
            >
                <Image
                    source={image ?? Assets[colorScheme].pack_placeholder}
                    style={{
                        aspectRatio: 1,
                        height: '100%',
                        borderRadius: 12,
                        borderColor: Colors[colorScheme].stroke,
                        borderWidth: Sizes.thin,
                    }}
                />
                <View
                    style={{
                        flex: 1,
                        paddingHorizontal: 8,
                        justifyContent: 'center',
                    }}
                >
                    <Text numberOfLines={2} style={[styles.text, styles.header]}>
                        {pack.name}
                    </Text>
                    {/* {pack.description &&
                        <Text numberOfLines={2} style={{ color: Colors[colorScheme].secondaryText }}>
                            {pack.description}
                        </Text>
                    } */}
                    <Text numberOfLines={2} style={{ ...styles.text, color: Colors[colorScheme].secondaryText }}>
                        mrkallerud • {pack.cards.length} cards
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={onPress}
                    style={{
                        justifyContent: 'center',
                        margin: 8,
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
