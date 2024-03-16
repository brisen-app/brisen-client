import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { Text } from "./Themed";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native-gesture-handler";
import { LocalizedText } from "./LocalizedText";
import React from "react";
import useColorScheme from "./useColorScheme";
import Supabase from "@/lib/supabase";
import { PackListView } from "./PackListView";

export default function MenuView() {
    const colorScheme = useColorScheme()

    return ( <View style={{ paddingHorizontal: 16 }}>
        <HUDView />
        <LocalizedText localeKey="most_popular" style={styles.header} placeHolderStyle={{ height: 28, width: 164}} />
        <PackGridContainer />
    </View> )
}


function HUDView() {
    return ( <>
        <Text>HUD</Text>
    </> )
}

function PackGridContainer() {
    const colorScheme = useColorScheme()

    // Todo: Implement pagination
    const { data, isLoading, error } = useQuery(Supabase.getPacksQuery())
    const packs = data?.sort((a, b) => a.name.localeCompare(b.name))

    if (error) return <Text>Error: {error.message}</Text>

    const { width } = Dimensions.get('window');
    const itemsPerRow = 3;
    const itemWidth = width - 16 * 2;
    const enableScroll = (packs?.length ?? 0) > itemsPerRow;

    if (isLoading) return <ActivityIndicator />

    return (
        <FlatList
            style={{ flexGrow: 0, overflow: 'visible' }}
            showsHorizontalScrollIndicator={false}
            horizontal
            scrollEnabled={enableScroll}
            snapToInterval={itemWidth + 8}
            decelerationRate={'fast'}
            // initialNumToRender={itemsPerRow * 2}
            // maxToRenderPerBatch={itemsPerRow * 3}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            data={partition(packs ?? [], itemsPerRow)}
            keyExtractor={(item) => item.map(p => p.id).join()}
            renderItem={({ item: items }) =>
                <View style={{ width: itemWidth }} >
                    {
                        items.map((pack, index) => (
                            <React.Fragment key={pack.id.toString()}>
                                <PackListView pack={pack} />
                                {(index < items.length - 1) && <View style={{ height: 8 }} />}
                            </React.Fragment>
                        ))
                    }
                </View>
            }
        />
    )
}

function partition<T>(items: T[], size: number): T[][] {
    let p: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        p.push(items.slice(i, i + size));
    }
    return p;
}

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8
    }
});