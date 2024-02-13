import { ActivityIndicator, DimensionValue, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { Text } from "./Themed";
import Pack from "@/types/Pack";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native-gesture-handler";
import { LocalizedText } from "./LocalizedText";
import Color from "@/types/Color";

function PackListView(props: Readonly<{ pack: Pack, onPress?: () => void }>) {
    const isLightMode = useColorScheme() === 'light';
    const height: DimensionValue = 94;
    const { pack, onPress } = props;

    const color = (isLightMode ? Color.black : Color.white).alpha(0.1).string;

    return (
        <TouchableOpacity style={{ padding: 8, height: height }}>
            <View style={{ flex: 1, flexDirection: 'row' }} >
                <View style={{ aspectRatio: 1, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderColor: color, borderWidth: 0.5, }}>
                    <Text style={{ fontSize: height / 2 }}>{pack.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 8, justifyContent: 'center' }}>
                    <LocalizedText localeKey={`${props.pack.id}_title`} placeHolderStyle={{ height: 20, width: 64 }} style={{ fontSize: 20, fontWeight: '900' }} />
                    <LocalizedText localeKey={`${props.pack.id}_desc`} placeHolderStyle={{ height: 36 }} style={{ opacity: 0.5 }} />
                </View>
                <View style={{ justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: '900' }}>0</Text>
                </View>
            </View>
        </TouchableOpacity>
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
            <Text style={styles.title}>Players</Text>
            <Text style={styles.title}>Packs</Text>
            <FlatList
                style={{ flexGrow: 0, overflow: 'visible' }}
                // horizontal
                data={packs}
                renderItem={({ item }) => <PackListView pack={item} />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 16,
        fontWeight: '800',
    }
});