import { Pressable, StyleSheet } from 'react-native'
import { LocalizedText } from './utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import GridContainer from './utils/GridContainer'
import { BottomSheetView, useBottomSheet } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import PackFeaturedView from './pack/PackFeaturedView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function MenuView() {
    const { expand } = useBottomSheet()
    const insets = useSafeAreaInsets()

    const { data: packs, isLoading, error } = useQuery(PackManager.getFetchAllQuery())
    if (error) console.warn(error)

    return (
        <BottomSheetView style={{ paddingHorizontal: 16, paddingBottom: insets.bottom }}>
            <Pressable onPress={() => expand()}>
                <LocalizedText id="packs" style={styles.header} placeHolderStyle={{ height: 28, width: 128 }} />
                <GridContainer
                    data={packs}
                    itemsPerRow={1}
                    renderItem={({ item }) => <PackFeaturedView pack={item} />}
                />
            </Pressable>
        </BottomSheetView>
    )
}

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        // marginTop: 32,
        marginBottom: 8,
    },
})
