import { DimensionValue, View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./Themed";
import Colors from "@/constants/Colors";
import Sizes from "@/constants/Sizes";
import React, { useContext, useEffect } from "react";
import { PlaylistContext } from "./AppContext";
import useColorScheme from "./useColorScheme";
import { Pack } from "@/lib/supabase";
import { Image } from "expo-image";


export function PackListView(props: Readonly<{ pack: Pack }>) {
    const { pack } = props;
    const colorScheme = useColorScheme();
    const { playlist, setPlaylist } = useContext(PlaylistContext);
    const isSelected = playlist.some(p => p.id === pack.id);
    const height: DimensionValue = 88;

    function onPress() {
        if (isSelected) setPlaylist(playlist.filter(p => p.id !== pack.id));
        else setPlaylist([...playlist, pack]);
    }

    useEffect(() => {
		console.debug(`Rendering PackListView: ${pack.name}`);
	}, [])

    return (
        <TouchableOpacity activeOpacity={0.5} style={{
            height: height,
            borderRadius: 16,
            borderColor: Colors[colorScheme].stroke,
            borderWidth: Sizes.thin,
        }}>
            <Image
                source={`https://picsum.photos/seed/${pack.id}/265`}
                blurRadius={64}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: 16,
                }}
            />
            <View style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0.75,
                borderRadius: 16,
                backgroundColor: Colors[colorScheme].background,
            }} />
            <View style={{
                // flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                margin: 8
            }}>
                <Image
                    source={`https://picsum.photos/seed/${pack.id}/256`}
                    style={{
                        aspectRatio: 1,
                        height: '100%',
                        borderRadius: 12,
                        borderColor: Colors[colorScheme].stroke,
                        borderWidth: Sizes.thin,
                    }}
                />
                <View style={{
                    flex: 1,
                    paddingHorizontal: 8,
                    justifyContent: 'center',
                }}>
                    <Text style={styles.header}>{pack.name}</Text>
                    { pack.description &&
                        <Text numberOfLines={2} style={{ color: Colors[colorScheme].secondaryText }}>
                            {pack.description}
                        </Text>
                    }
                </View>
                <TouchableOpacity onPress={onPress} style={{
                    justifyContent: 'center',
                    margin: 8,
                    backgroundColor: Colors[colorScheme].background,
                    borderRadius: 64,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                }}>
                    <Text style={{
                        ...styles.header,
                        color: isSelected ? 'red' : Colors[colorScheme].accentColor,
                    }}>
                        { isSelected ? 'Remove' : 'Play' }
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    
    )
}

const styles = StyleSheet.create({
    header: {
        fontSize: 16,
        fontWeight: 'bold'
    }
});