import Colors from '@/src/constants/Colors'
import { FontStyles } from '@/src/constants/Styles'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { Platform, StyleSheet, Text, TouchableOpacityProps } from 'react-native'
import Animated, { Easing, FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type ScrollToBottomButtonProps = {
  text?: string
  icon?: keyof typeof Ionicons.glyphMap
} & TouchableOpacityProps

export default function ScrollToBottomButton(props: Readonly<ScrollToBottomButtonProps>) {
  const insets = useSafeAreaInsets()
  const { text, icon = 'chevron-down', style, ...rest } = props

  return (
    <Animated.View
      entering={FadeInRight.duration(150).easing(Easing.out(Easing.quad))}
      exiting={FadeOutRight.duration(150).easing(Easing.out(Easing.quad))}
    >
      <TouchableOpacity
        style={[
          {
            position: 'absolute',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            bottom: insets.bottom,
            right: insets.right,
            backgroundColor: Colors.yellow.light,
            gap: 4,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderColor: Colors.stroke,
            borderWidth: StyleSheet.hairlineWidth,
            margin: 16,
            borderRadius: Number.MAX_SAFE_INTEGER,
          },
          Platform.select({
            ios: {
              shadowOffset: { width: 0, height: 12 },
              shadowRadius: 16,
              shadowOpacity: 0.5,
            },
            android: {
              elevation: 24,
            },
          }) ?? {},
          style,
        ]}
        {...rest}
      >
        {text && <Text style={[FontStyles.Button, { color: Colors.yellow.dark }]}>{text}</Text>}
        <Ionicons name={icon} size={24} color={Colors.yellow.dark} />
      </TouchableOpacity>
    </Animated.View>
  )
}
