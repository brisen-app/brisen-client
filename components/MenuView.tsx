import { Pressable, StyleSheet } from 'react-native'
import { LocalizedText } from './utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import GridContainer from './utils/GridContainer'
import { useBottomSheet } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import PackFeaturedView from './pack/PackFeaturedView'

export default function MenuView() {
    const { expand } = useBottomSheet()

    const { data: packs, isLoading, error } = useQuery(PackManager.getFetchAllQuery())
    if (error) console.warn(error)

    return (
        <Pressable onPress={() => expand()} style={{ paddingHorizontal: 16 }}>
            <LocalizedText id="packs" style={styles.header} placeHolderStyle={{ height: 28, width: 128 }} />
            <GridContainer
                data={packs}
                renderItem={({ item }) => (
                    <PackFeaturedView pack={item} />
                )}
            />
        </Pressable>
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
