import GameView from '@/components/GameView'
import MenuView from '@/components/MenuView'
import useColorScheme from '@/components/utils/useColorScheme'
import Colors from '@/constants/Colors'
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
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

    const containerView = useCallback(
        (props: any) => (
            <BlurView intensity={100} {...props}>
                <Image
                    source={require('@/assets/images/noise.png')}
                    style={{
                        width: '100%',
                        height: '55%',
                        opacity: 0.02,
                    }}
                />
            </BlurView>
        ),
        []
    )

    const backdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                opacity={0.75}
                appearsOnIndex={2}
                disappearsOnIndex={0}
                pressBehavior={'collapse'}
                {...props}
            />
        ),
        []
    )

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <GameView bottomSheetRef={bottomSheetRef} />
            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                enableDynamicSizing
                backgroundComponent={containerView}
                backdropComponent={backdrop}
                backgroundStyle={{
                    borderRadius: 16,
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: StyleSheet.hairlineWidth,
                    overflow: 'hidden',
                }}
                handleIndicatorStyle={{
                    backgroundColor: Colors[colorScheme].secondaryText,
                }}
                style={styles.shadow}
            >
                <MenuView />
            </BottomSheet>
        </View>
    )
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: 'black',
        shadowOpacity: 1 / 3,
        shadowRadius: 32,
        elevation: 24,
    },
})
