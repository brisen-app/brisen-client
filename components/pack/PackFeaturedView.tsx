import { BlurView } from 'expo-blur'
import { DimensionValue, View, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { PackViewProps } from './PackListView'
import { PlaylistContext } from '../utils/AppContext'
import { Text } from '../utils/Themed'
import { useContext, useEffect } from 'react'
import Color from '@/types/Color'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import { StatButton } from '../ui/StatButton'
import { LinearGradient } from 'expo-linear-gradient'
import Assets from '@/constants/Assets'
import { PackManager } from '@/lib/PackManager'
import { useQuery } from '@tanstack/react-query'

export default function PackFeaturedView(props: Readonly<PackViewProps>) {
    const { pack } = props
    const colorScheme = useColorScheme()
    const { playlist, setPlaylist } = useContext(PlaylistContext)
    const isSelected = playlist.some((p) => p.id === pack.id)

    const borderRadius = 16
    const height: DimensionValue = 256 + 32

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
                borderRadius: borderRadius,
                overflow: 'hidden',
                borderColor: Colors[colorScheme].stroke,
                borderWidth: Sizes.thin,
            }}
        >
            {/* <Image
                source={image ?? Assets[colorScheme].pack_placeholder}
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
                <Image
                    source={image ?? Assets[colorScheme].pack_placeholder}
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        // position: 'absolute',
                        // width: '100%',
                        // height: '100%',
                        // borderRadius: borderRadius,
                    }}
                />

                <BlurView
                    intensity={100}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        // height: 88,
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

                        <Text style={{ ...styles.text, color: Colors[colorScheme].secondaryText }}>
                            mrkallerud • {pack.cards.length} cards
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
