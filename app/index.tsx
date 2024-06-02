import GameView from '@/components/GameView'
import MenuView from '@/components/MenuView'
import useColorScheme from '@/components/utils/useColorScheme'
import Colors from '@/constants/Colors'
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { useCallback, useMemo, useRef } from 'react'
import { Keyboard, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
    shadowOpacity: 0.5,
    shadowRadius: 32,
  },
})
