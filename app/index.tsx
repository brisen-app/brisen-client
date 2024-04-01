import GameView from '@/components/GameView'
import MenuView from '@/components/MenuView'
import useColorScheme from '@/components/utils/useColorScheme'
import Colors from '@/constants/Colors'
import { CategoryManager } from '@/lib/CategoryManager'
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function App() {
    const colorScheme = useColorScheme()
    const insets = useSafeAreaInsets()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const snapPoints = useMemo(() => [insets.bottom + 64], [bottomSheetRef, insets])

    const { data: categories } = useQuery(CategoryManager.getFetchAllQuery())
    if (categories) CategoryManager.set(categories)

    const backdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                opacity={0.5}
                appearsOnIndex={1}
                disappearsOnIndex={0}
                pressBehavior={'collapse'}
                {...props}
            />
        ),
        []
    )

    return (
        <>
            <GameView bottomSheetRef={bottomSheetRef} />
            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                enableDynamicSizing
                backdropComponent={backdrop}
                backgroundStyle={{
                    borderRadius: 16,
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: StyleSheet.hairlineWidth,
                    backgroundColor: Colors[colorScheme].secondaryBackground,
                }}
                handleIndicatorStyle={{
                    backgroundColor: Colors[colorScheme].secondaryText,
                }}
                style={styles.shadow}
            >
                <MenuView />
            </BottomSheet>
        </>
    )
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 32,
        elevation: 24,
    },
})
