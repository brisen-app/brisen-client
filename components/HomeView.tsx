import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { StyleSheet } from 'react-native'
import { useCallback, useMemo, useRef } from 'react'
import { BlurView } from 'expo-blur'
import GameView from '@/components/GameView'
import MenuView from '@/components/MenuView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Sizes from '@/constants/Sizes'
import useColorScheme from './utils/useColorScheme'
import Colors from '@/constants/Colors'
import { Image } from 'expo-image'

export default function HomeView() {
    const colorScheme = useColorScheme()
    const insets = useSafeAreaInsets()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const snapPoints = useMemo(() => [insets.bottom + Sizes.big], [bottomSheetRef, insets])

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
        <>
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
                    borderWidth: Sizes.thin,
                    overflow: 'hidden',
                }}
                handleIndicatorStyle={{
                    backgroundColor: Colors[colorScheme].stroke,
                }}
                style={styles.shadow}
                topInset={insets.top ?? 8}
            >
                <MenuView />
                {/* <BottomSheetView >
                    <View style={{ height: 500 }} />
                </BottomSheetView> */}
            </BottomSheet>
        </>
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
