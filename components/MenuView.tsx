import { ActivityIndicator, Dimensions, DimensionValue, Pressable, StyleSheet, useColorScheme, View, ViewProps } from "react-native";
import { Text } from "./Themed";
import Pack from "@/types/Pack";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native-gesture-handler";
import { LocalizedText } from "./LocalizedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";
import Sizes from "@/constants/Sizes";
import React from "react";


type TextProps = { items: Pack[] } & ViewProps;

function PagingGridView(props: TextProps) {
    const { items, ...otherProps } = props;

    return (
        <View { ...otherProps } >
            {
                props.items.map((pack, index) => (
                    <>
                        <PackListView pack={pack} />
                        { (index < items.length - 1) && <View style={{ height: 8 }} /> }
                    </>
                ))
            }
        </View>
    )
}

function PackListView(props: Readonly<{ pack: Pack, onPress?: () => void }>) {
    const colorScheme = useColorScheme() ?? 'dark';
    const height: DimensionValue = Sizes.bigger;
    const { pack, onPress } = props;

    return (
        <Pressable style={{
            height: height,
            borderRadius: Sizes.medium,
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].stroke,
            borderWidth: Sizes.thin
        }}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                margin: 8
            }} >
                <View style={{
                    aspectRatio: 1,
                    backgroundColor: Colors[colorScheme].packIconBackground,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: Sizes.normal,
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: Sizes.thin
                }}>
                    <Text style={{ fontSize: height / 2 }}>{pack.icon}</Text>
                </View>
                <View style={{
                    flex: 1,
                    marginHorizontal: Sizes.small,
                    justifyContent: 'center',
                }}>
                    <LocalizedText localeKey={`${props.pack.id}_title`}
                        placeHolderStyle={{ height: 20, width: 64 }}
                        style={{ fontSize: 16, fontWeight: '900', color: Colors[colorScheme].text }} />
                    <LocalizedText localeKey={`${props.pack.id}_desc`}
                        numberOfLines={2}
                        placeHolderStyle={{ height: 36 }}
                        style={{ color: Colors[colorScheme].secondaryText }} />
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
    const colorScheme = useColorScheme() ?? 'dark';
    
    const { data: packs, isLoading } = useQuery({
        queryKey: [Pack.tableName],
        queryFn: async () => { return await Pack.fetchAll() }
    })
    
    const { width } = Dimensions.get('window');
    const itemsPerRow = 3;
    const itemWidth = width - Sizes.normal * 2;
    const enableScroll = (packs?.length ?? 0) > itemsPerRow;


    if (isLoading) return <ActivityIndicator />

    return (
        <View style={{ overflow: 'visible', paddingHorizontal: Sizes.normal }}>
            <Text style={{ fontSize: Sizes.large, fontWeight: 'bold', marginBottom: Sizes.tiny }}>Packs</Text>
            <FlatList
                style={{ flexGrow: 0, overflow: 'visible' }}
                showsHorizontalScrollIndicator={false}
                horizontal
                scrollEnabled={enableScroll}
                snapToInterval={itemWidth + 8}
                decelerationRate={0}
                data={partition(packs ?? [], itemsPerRow)}
                renderItem={({ item }) => <PagingGridView items={item} style={{ width: itemWidth }}/>}
                ItemSeparatorComponent={() => <View style={{ width: Sizes.small }} />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    }
});

function partition<T>(items: T[], size: number): T[][] {
    var p: T[][] = [];
    for (var i = 0; i < items.length; i += size) {
        p.push(items.slice(i, i + size));
    }
    console.log(p);
    return p;
}