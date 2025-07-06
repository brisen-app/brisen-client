import Colors from '@/src/constants/Colors'
import { FontStyles } from '@/src/constants/Styles'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { Platform, StyleSheet, Text, TouchableOpacityProps, ViewProps } from 'react-native'
import Animated, { AnimatedProps, Easing, FadeInRight, FadeOutRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type HoverButtonsProps = AnimatedProps<ViewProps> & {
  buttons: (TouchableOpacityProps & {
    text?: string
    icon?: keyof typeof Ionicons.glyphMap
    foregroundColor?: string
    backgroundColor?: string
  })[]
}

export default function HoverButtons(props: Readonly<HoverButtonsProps>) {
  const insets = useSafeAreaInsets()
  const { buttons, ...rest } = props

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        position: 'absolute',
        marginHorizontal: 16,
        gap: 8,
        bottom: insets.bottom + insets.top + 4 + 32,
        right: insets.right,
      }}
      entering={FadeInRight.duration(150).easing(Easing.out(Easing.quad))}
      exiting={FadeOutRight.duration(150).easing(Easing.out(Easing.quad))}
      {...rest}
    >
      {buttons.map(
        (
          { text, icon, foregroundColor = Colors.yellow.dark, backgroundColor = Colors.yellow.light, style, ...rest },
          i
        ) => (
          <TouchableOpacity
            key={text ?? '' + i}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: backgroundColor,
                gap: 4,
                padding: 8,
                borderColor: Colors.stroke,
                borderWidth: StyleSheet.hairlineWidth,
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
            {text && <Text style={[FontStyles.Button, { color: foregroundColor, paddingLeft: 6 }]}>{text}</Text>}
            {icon && <Ionicons name={icon} size={22} color={foregroundColor} />}
          </TouchableOpacity>
        )
      )}
    </Animated.View>
  )
}
