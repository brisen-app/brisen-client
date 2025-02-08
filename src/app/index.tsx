import GameView from '@/src/components/GameView'
import MenuView from '@/src/components/MenuView'
import Colors from '@/src/constants/Colors'
import { useSheetHeight } from '@/src/lib/utils'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackgroundProps,
  BottomSheetHandleProps,
} from '@gorhom/bottom-sheet'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useMemo, useRef } from 'react'
import { Keyboard, Platform, View, ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SHEET_HANDLE_HEIGHT } from '../constants/Styles'
import Color from '../models/Color'

export default function App() {
  const insets = useSafeAreaInsets()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const sheetHeight = useSheetHeight()
  const snapPoints = useMemo(() => [sheetHeight], [bottomSheetRef, insets])

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

  return (
    <>
      <LinearGradient
        colors={bezierGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: 'absolute',
          zIndex: Number.MAX_SAFE_INTEGER,
          height: insets.top,
          width: '100%',
          opacity: 0.75,
        }}
      />
      <GameView bottomSheetRef={bottomSheetRef} />
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        containerStyle={{ marginTop: insets.top + 16 }}
        enableDynamicSizing
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

const bezierGradient: [string, string, ...string[]] = [
  Color.black.alpha(1).string,
  Color.black.alpha(1 - 0.1129).string,
  Color.black.alpha(1 - 0.2204).string,
  Color.black.alpha(1 - 0.3225).string,
  Color.black.alpha(1 - 0.4188).string,
  Color.black.alpha(1 - 0.5092).string,
  Color.black.alpha(1 - 0.5933).string,
  Color.black.alpha(1 - 0.6709).string,
  Color.black.alpha(1 - 0.7416).string,
  Color.black.alpha(1 - 0.805).string,
  Color.black.alpha(1 - 0.8607).string,
  Color.black.alpha(1 - 0.9081).string,
  Color.black.alpha(1 - 0.9466).string,
  Color.black.alpha(1 - 0.9754).string,
  Color.black.alpha(1 - 0.9936).string,
  Color.black.alpha(0).string,
]
