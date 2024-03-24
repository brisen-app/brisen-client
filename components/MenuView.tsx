import { Pressable, StyleSheet, View, ViewProps } from 'react-native'
import { LocalizedText, LocalizedTextProps } from './utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import GridContainer from './utils/GridContainer'
import { BottomSheetScrollView, useBottomSheet } from '@gorhom/bottom-sheet'
import UserQuickView from './user/UserQuickView'
import { Text } from './utils/Themed'
import Colors from '@/constants/Colors'
import useColorScheme from './utils/useColorScheme'
import { FontStyles, Styles } from '@/constants/Styles'

export default function MenuView() {
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
    return (
        <View
            style={{
                flexDirection: 'row',
                // justifyContent: 'space-between',
                // alignItems: 'center',
                backgroundColor: 'white',
            }}
        >
            <UserQuickView showDetails style={{ flex: 1, backgroundColor: 'blue', width: '90%' }} />
            <View style={{ flex: 1 }} />
            <ValueView id="packs" value={6} />
            <ValueView id="packs" value={17} />
            <ValueView id="packs" value={63} />
        </View>
    )
}

type ValueViewProps = {
    value: number
} & LocalizedTextProps &
    ViewProps

function ValueView(props: Readonly<ValueViewProps>) {
    const { value, style, ...localizedTextProps } = props
    const colorScheme = useColorScheme()

    return (
        <View
            style={[
                {
                    backgroundColor: 'purple',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 8,
                    ...Styles.shadow,
                },
                style,
            ]}
        >
            <LocalizedText {...localizedTextProps} style={FontStyles.Subheading} textCase="uppercase" />
            <Text style={{ color: Colors[colorScheme].accentColor, ...FontStyles.LargeTitle }}>{value}</Text>
        </View>
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
