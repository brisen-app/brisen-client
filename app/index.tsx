import GameView from '@/components/GameView'
import MenuView from '@/components/MenuView'
import useColorScheme from '@/components/utils/useColorScheme'
import Colors from '@/constants/Colors'
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import { Stack } from 'expo-router'
import { useCallback, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function App() {
    const colorScheme = useColorScheme()
    const insets = useSafeAreaInsets()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const snapPoints = useMemo(() => [insets.bottom + 64], [bottomSheetRef, insets])

    // Initial setup
    // const queryClient = useQueryClient()

    // const { data: languages, error, isLoading: isLoadingLanguage } = useQuery({
    // 	queryKey: [Language.tableName],
    // 	queryFn: async () => {
    // 		return await Language.fetchAll()
    // 	}
    // })

    // languages?.forEach(item => {
    // 	queryClient.setQueryData([Language.tableName, item.id], item)
    // })

    // const { data: packs, isLoading } = useQuery({
    // 	queryKey: [Pack.tableName],
    // 	queryFn: async () => {
    // 		return await Pack.fetchAll()
    // 	}
    // })

    // packs?.forEach(item => {
    // 	queryClient.setQueryData([Pack.tableName, item.id], item)
    // })

    // const { data: categories, isLoading: isLoadingCategories } = useQuery({
    // 	queryKey: [Category.tableName],
    // 	queryFn: async () => {
    // 		return await Category.fetchAll()
    // 	}
    // })

    // categories?.forEach(item => {
    // 	queryClient.setQueryData([Category.tableName, item.id], item)
    // })

    // const language = languages ? Language.findDeviceLanguage(languages) : null
    // const { data: localizations, isLoading: isLoadingLocalizations } = useQuery({
    // 	queryKey: language ? [Localization.tableName, language.id] : [],
    // 	queryFn: async () => {
    // 		return await Localization.fetchAllWithLang(language!)
    // 	},
    // 	enabled: !!language
    // })

    // localizations?.forEach(item => {
    // 	queryClient.setQueryData([Localization.tableName, language!.id, item.id], item)
    // })

    // if (isLoading) return (
    // 	<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    // 		<ActivityIndicator color={"white"} size={"large"} />
    // 	</View>
    // )

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
