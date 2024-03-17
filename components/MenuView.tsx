import { StyleSheet, View } from "react-native";
import { Text } from "./Themed";
import { LocalizedText } from "./LocalizedText";
import useColorScheme from "./useColorScheme";
import { PackManager } from '@/lib/PackManager';
import GridContainer from "./GridContainer";

export default function MenuView() {
    const colorScheme = useColorScheme()

    return ( <View style={{ paddingHorizontal: 16 }}>
        <HUDView />

        <LocalizedText id="featured" style={styles.header} placeHolderStyle={{ height: 28, width: 128}} />
        <GridContainer query={PackManager.getFetchAllQuery()} itemsPerRow={1} style='card' />

        <LocalizedText id="most_popular" style={styles.header} placeHolderStyle={{ height: 28, width: 164}} />
        <GridContainer query={PackManager.getFetchAllQuery()}/>
    </View> )
}


function HUDView() {
    return ( <>
        <Text>HUD</Text>
    </> )
}

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 32,
        marginBottom: 8
    }
})