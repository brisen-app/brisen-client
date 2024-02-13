import { ActivityIndicator, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { Text } from "./Themed";
import Pack from "@/types/Pack";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import { LocalizedText } from "./LocalizedText";

function PackListView(props: Readonly<{ pack: Pack, onPress?: () => void }>) {

    return (
        <TouchableOpacity >
            <BlurView intensity={100} style={{ padding: 8, borderRadius: 8, overflow: 'hidden' }} >
                <LocalizedText localeKey={`${props.pack.id}_title`} placeHolerStyle={{ height: 16 }} />
            </BlurView>
        </TouchableOpacity>
    )
}

export default function MenuView() {
    const isLightMode = useColorScheme() === 'light';

    const { data: packs, isLoading } = useQuery({
        queryKey: [Pack.tableName],
        queryFn: async () => {
            return await Pack.fetchAll()
        }
    })

    if (isLoading) return <ActivityIndicator />

    return (
        <View style={{ paddingHorizontal: 16, overflow: 'visible' }}>
            <Text style={styles.title}>Players</Text>
            <Text style={styles.title}>Packs</Text>
            <FlatList
                style={{ flexGrow: 0, overflow: 'visible' }}
                horizontal
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