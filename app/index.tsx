import GameView from '@/components/GameView'
import MenuView from '@/components/MenuView'
import useColorScheme from '@/components/utils/useColorScheme'
import Colors from '@/constants/Colors'
import Color from '@/models/Color'
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackgroundProps } from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import { SplashScreen } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Keyboard, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

SplashScreen.preventAutoHideAsync()

export default function App() {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => [insets.bottom + 64], [bottomSheetRef, insets])

  const backdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.5}
        appearsOnIndex={1}
        disappearsOnIndex={0}
        pressBehavior="collapse"
        onPress={Keyboard.dismiss}
        {...props}
      />
    ),
    []
  )

  const background = useCallback((props: BottomSheetBackgroundProps) => <BlurView intensity={100} {...props} />, [])

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <>
      <GameView bottomSheetRef={bottomSheetRef} />
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing
        backdropComponent={backdrop}
        keyboardBehavior="extend"
        backgroundComponent={background}
        backgroundStyle={{
          borderRadius: 16,
          borderColor: Colors[colorScheme].stroke,
          borderWidth: StyleSheet.hairlineWidth,
          overflow: 'hidden',
          backgroundColor: Color.hex(Colors[colorScheme].background).alpha(0.9).string,
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
    shadowOpacity: 0.5,
    shadowRadius: 32,
  },
})
