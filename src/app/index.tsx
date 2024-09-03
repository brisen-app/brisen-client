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
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function App() {
  const insets = useSafeAreaInsets()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const sheetHeight = useSheetHeight()
  const snapPoints = useMemo(() => [sheetHeight, '45%', '100%'], [bottomSheetRef, insets])

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

const SheetMenuBackground: React.FC<BottomSheetBackgroundProps> = ({ style, animatedIndex, animatedPosition }) => {
  const insets = useSafeAreaInsets()

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(animatedPosition.value, [insets.top, 0], [16, 0], Extrapolation.CLAMP),
    backgroundColor: interpolateColor(animatedIndex.value, [2, 1], [Colors.background, Colors.secondaryBackground]),
  }))

  return (
    <Animated.View
      pointerEvents='none'
      style={[
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
        style,
        containerAnimatedStyle,
      ]}
    />
  )
}

const SheetHandle: React.FC<BottomSheetHandleProps & ViewProps> = ({ style, animatedIndex, animatedPosition }) => {
  const insets = useSafeAreaInsets()

  const handleHeight = 24

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: !insets.top
      ? handleHeight
      : interpolate(animatedIndex.value, [1, 2], [handleHeight, insets.top], Extrapolation.CLAMP),
    opacity: interpolate(animatedPosition.value, [insets.top, 0], [1 / 3, 0], Extrapolation.CLAMP),
  }))

  return (
    <Animated.View
      renderToHardwareTextureAndroid={true}
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
        },
        containerAnimatedStyle,
      ]}
    >
      <View
        style={{
          height: 4,
          width: 32,
          backgroundColor: Colors.text,
          borderRadius: Number.MAX_SAFE_INTEGER,
        }}
      />
    </Animated.View>
  )
}
