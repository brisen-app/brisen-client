import GameView from '@/src/components/GameView'
import MenuView from '@/src/components/MenuView'
import Colors from '@/src/constants/Colors'
import { useSheetHeight } from '@/src/lib/utils'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackgroundProps,
  BottomSheetHandleProps,
} from '@gorhom/bottom-sheet'
import { SplashScreen } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Keyboard, Platform, View, ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SHEET_HANDLE_HEIGHT } from '../constants/Styles'

export default function App() {
  const insets = useSafeAreaInsets()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const sheetHeight = useSheetHeight()
  const snapPoints = useMemo(() => [sheetHeight, '90%'], [bottomSheetRef, insets])

  const backdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.5}
        appearsOnIndex={1}
        disappearsOnIndex={0}
        pressBehavior='collapse'
        onPress={Keyboard.dismiss}
        {...props}
      />
    ),
    []
  )

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
        backdropComponent={backdrop}
        backgroundComponent={SheetMenuBackground}
        handleComponent={SheetHandle}
        keyboardBehavior='interactive'
      >
        <MenuView />
      </BottomSheet>
    </>
  )
}

const SheetMenuBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
  return (
    <View
      pointerEvents='none'
      style={[
        {
          borderRadius: 16,
          backgroundColor: Colors.secondaryBackground,
          overflow: 'hidden',
        },
        style,
        Platform.select({
          ios: {
            shadowColor: 'black',
            shadowOpacity: 0.5,
            shadowRadius: 32,
          },
          android: {
            elevation: 32,
          },
        }) ?? {},
      ]}
    />
  )
}

const SheetHandle: React.FC<BottomSheetHandleProps & ViewProps> = ({ style }) => {
  return (
    <View style={[{ height: SHEET_HANDLE_HEIGHT, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View
        style={[
          {
            height: 4,
            width: 32,
            backgroundColor: Colors.secondaryText,
            borderRadius: Number.MAX_SAFE_INTEGER,
          },
        ]}
      />
    </View>
  )
}
