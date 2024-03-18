import { Pressable, StyleSheet } from 'react-native'
import { Text } from './Themed'
import { LocalizedText } from './LocalizedText'
import useColorScheme from './useColorScheme'
import { PackManager } from '@/lib/PackManager'
import GridContainer from './GridContainer'
import { BottomSheetScrollView, useBottomSheet } from '@gorhom/bottom-sheet'

export default function MenuView() {
    const colorScheme = useColorScheme()
    const { expand } = useBottomSheet()

    return (
        <BottomSheetScrollView >
            <Pressable onPress={() => expand()} style={{ paddingHorizontal: 16 }}>
                {/* <HUDView /> */}

                <LocalizedText id="featured" style={styles.header} placeHolderStyle={{ height: 28, width: 128 }} />
                <GridContainer query={PackManager.getFetchAllQuery()} itemsPerRow={1} style="card" />

                <LocalizedText id="most_popular" style={styles.header} placeHolderStyle={{ height: 28, width: 164 }} />
                <GridContainer query={PackManager.getFetchAllQuery()} />
            </Pressable>
        </BottomSheetScrollView>
    )
}

function HUDView() {
    return (
        <>
            <Text>HUD</Text>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 32,
        marginBottom: 8,
    },
})
