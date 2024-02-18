import { ActivityIndicator, Dimensions, DimensionValue, Pressable, StyleSheet, View, ViewProps } from "react-native";
import { Text } from "./Themed";
import Pack from "@/types/Pack";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native-gesture-handler";
import { LocalizedText } from "./LocalizedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";
import Sizes from "@/constants/Sizes";
import React, { useContext } from "react";
import { PlaylistContext } from "./AppContext";
import useColorScheme from "./useColorScheme";


type TextProps = { items: Pack[] } & ViewProps;

function PagingGridView(props: TextProps) {
    const { items, ...otherProps } = props;

    return (
        <View {...otherProps} >
            {
                props.items.map((pack, index) => (
                    <React.Fragment key={pack.id.toString()}>
                        <PackListView pack={pack} />
                        {(index < items.length - 1) && <View style={{ height: 8 }} />}
                    </React.Fragment>
                ))
            }
        </View>
    )
}

function PackListView(props: Readonly<{ pack: Pack }>) {
    const { pack } = props;
    const colorScheme = useColorScheme()
    const { playlist, setPlaylist } = useContext(PlaylistContext);
    const isSelected = playlist.some(p => p.id === pack.id);
    const height: DimensionValue = Sizes.bigger;

    function onPress() {
        if (isSelected) setPlaylist(playlist.filter(p => p.id !== pack.id));
        else setPlaylist([...playlist, pack]);
    }

    return (
        <Pressable onPress={onPress} style={{
            height: height,
            borderRadius: Sizes.medium,
            backgroundColor: Colors[colorScheme].background,
            borderColor: isSelected ? Colors[colorScheme].text : Colors[colorScheme].stroke,
            borderWidth: isSelected ? Sizes.tiny : Sizes.thin,
        }}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                margin: 8
            }} >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                }}>
                    <Text style={{ fontSize: 16, fontWeight: '900' }}>{pack.name}</Text>
                    {pack.description && <Text style={{ color: Colors[colorScheme].secondaryText }}>{pack.description}</Text>}
                </View>
                <View style={{
                    justifyContent: 'center',
                    margin: Sizes.normal
                }}>
                    <Ionicons name="arrow-forward" size={24} color={Colors[colorScheme].text} />
                </View>
            </View>
        </Pressable>
    )
}

export default function MenuView() {
    const colorScheme = useColorScheme()

    const { data: packs, isLoading, error } = useQuery({
        queryKey: [Pack.tableName],
        queryFn: async () => { return await Pack.fetchAll() }
    })

    if (error) return <Text>Error: {error.message}</Text>

    const { width } = Dimensions.get('window');
    const itemsPerRow = 3;
    const itemWidth = width - Sizes.normal * 2;
    const enableScroll = (packs?.length ?? 0) > itemsPerRow;


    if (isLoading) return <ActivityIndicator />

    return (
        <View style={{ overflow: 'visible', paddingHorizontal: 16 }}>
            <LocalizedText localeKey="packs" style={styles.title} placeHolderStyle={{ height: 28, width: 96}}  />
            <FlatList
                style={{ flexGrow: 0, overflow: 'visible' }}
                showsHorizontalScrollIndicator={false}
                horizontal
                scrollEnabled={enableScroll}
                snapToInterval={itemWidth + 8}
                decelerationRate={0}
                data={partition(packs ?? [], itemsPerRow)}
                keyExtractor={(item) => item.map(p => p.id).join('')}
                renderItem={({ item }) => <PagingGridView items={item} style={{ width: itemWidth }} />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: Sizes.medium,
        fontWeight: 'bold',
        marginBottom: Sizes.tiny
    }
});

function partition<T>(items: T[], size: number): T[][] {
    let p: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        p.push(items.slice(i, i + size));
    }
    return p;
}