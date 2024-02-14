import { ActivityIndicator, Button, DimensionValue, Pressable, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { Text } from "./Themed";
import Pack from "@/types/Pack";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native-gesture-handler";
import { LocalizedText } from "./LocalizedText";
import Color from "@/types/Color";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";

function PackListView(props: Readonly<{ pack: Pack, onPress?: () => void }>) {
    const colorScheme = useColorScheme() ?? 'dark';
    const height: DimensionValue = 75;
    const { pack, onPress } = props;

    return (
        <Pressable style={{
                height: height,
                // borderRadius: 16,
                backgroundColor: Colors[colorScheme].background.string
            }}>
            <View style={{ flex: 1, flexDirection: 'row', margin: 8 }} >
                <View style={{
                    aspectRatio: 1,
                    backgroundColor: Colors[colorScheme].text.alpha(0.5).string,
                    alignItems: 'center',
                    justifyContent: 'center',
                    // borderRadius: 32,
                    // borderColor: Colors[colorScheme].stroke.string,
                    // borderWidth: StyleSheet.hairlineWidth
                }}>
                    <Text style={{ fontSize: height / 2 }}>{pack.icon}</Text>
                </View>
                <View style={{
                    flex: 1,
                    marginHorizontal: 8,
                    justifyContent: 'center',
                }}>
                    <LocalizedText localeKey={`${props.pack.id}_title`} placeHolderStyle={{ height: 20, width: 64 }} style={{ fontSize: 16, fontWeight: '900', color: Colors[colorScheme].text.string }} />
                    <LocalizedText localeKey={`${props.pack.id}_desc`} placeHolderStyle={{ height: 36 }} numberOfLines={2} style={{ color: Colors[colorScheme].secondaryText.string }} />
                </View>
                <View style={{ justifyContent: 'center' }}>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </View>
            </View>
        </Pressable>
    )
}

export default function MenuView() {
    const { data: packs, isLoading } = useQuery({
        queryKey: [Pack.tableName],
        queryFn: async () => { return await Pack.fetchAll() }
    })

    if (isLoading) return <ActivityIndicator />

    return (
        <View style={{ paddingHorizontal: 16, overflow: 'visible' }}>
            <FlatList
                style={{ flexGrow: 0, overflow: 'visible' }}
                // horizontal
                data={packs}
                renderItem={({ item }) => <PackListView pack={item} />}
                ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: Color.white.alpha(0.2).string, marginVertical: 8 }} />}
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