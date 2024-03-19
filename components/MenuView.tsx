import { Pressable, StyleSheet } from 'react-native'
import { LocalizedText } from './utils/LocalizedText'
import useColorScheme from './utils/useColorScheme'
import { PackManager } from '@/lib/PackManager'
import GridContainer from './utils/GridContainer'
import { BottomSheetScrollView, useBottomSheet } from '@gorhom/bottom-sheet'
import UserQuickView from './user/UserQuickView'

export default function MenuView() {
    const colorScheme = useColorScheme()
    const { expand } = useBottomSheet()

    return (
        <BottomSheetScrollView>
            <Pressable onPress={() => expand()} style={{ paddingHorizontal: 16 }}>
                <HUDView />

                <LocalizedText id="featured" style={styles.header} placeHolderStyle={{ height: 28, width: 128 }} />
                <GridContainer query={PackManager.getFetchAllQuery()} itemsPerRow={1} style="card" />

                <LocalizedText id="most_popular" style={styles.header} placeHolderStyle={{ height: 28, width: 164 }} />
                <GridContainer query={PackManager.getFetchAllQuery()} />
            </Pressable>
        </BottomSheetScrollView>
    )
}

function HUDView() {
    return <UserQuickView size={64} showDetails style={{ maxWidth: '30%' }} />
}

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 32,
        marginBottom: 8,
    },
})
