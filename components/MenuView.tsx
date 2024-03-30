import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { LocalizedText } from './utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import { StyleSheet, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PackFeaturedView from './pack/PackFeaturedView'
import PackListView from './pack/PackListView'
import Colors from '@/constants/Colors'
import useColorScheme from './utils/useColorScheme'
import { FontStyles } from '@/constants/Styles'

export default function MenuView() {
    const insets = useSafeAreaInsets()
    const colorScheme = useColorScheme()

    const { data: packs, error } = useQuery(PackManager.getFetchAllQuery())
    if (error) console.warn(error)

    return (
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
                <LocalizedText id="packs" style={FontStyles.Header} placeHolderStyle={{ height: 28, width: 128 }} />
                <LocalizedText
                    id="no_pack_selected_description"
                    style={FontStyles.Subheading}
                    placeHolderStyle={{ height: 28, width: 128 }}
                />
            </View>

            {packs &&
                packs.map((pack, index) =>
                    index === -1 ? (
                        <PackFeaturedView
                            key={pack.id}
                            pack={pack}
                            style={{ marginHorizontal: 16, marginBottom: 16 }}
                        />
                    ) : (
                        <View key={pack.id}>
                            <PackListView pack={pack} style={{ height: 80, marginHorizontal: 16 }} />
                            {index < packs.length - 1 ? (
                                <View
                                    style={{
                                        borderTopColor: Colors[colorScheme].stroke,
                                        borderTopWidth: StyleSheet.hairlineWidth,
                                        marginVertical: 8,
                                        marginLeft: 80 + 8 + 16,
                                    }}
                                />
                            ) : null}
                        </View>
                    )
                )}

            <View style={{ height: insets.bottom ?? 16 }} />
        </BottomSheetScrollView>
    )
}
