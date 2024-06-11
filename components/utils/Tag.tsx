import React, { useEffect } from 'react'
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  FadeIn,
  FadeOut,
  EntryExitTransition,
  FadeInUp,
  Easing,
  ZoomOutDown,
  ZoomOut,
} from 'react-native-reanimated'
import Colors from '@/constants/Colors'
import useColorScheme from './useColorScheme'
import { FontStyles } from '@/constants/Styles'

export type TagListProps = {
  text: string
  hideIcon?: boolean
} & TouchableOpacityProps

export default function Tag(props: Readonly<TagListProps>) {
  const { text, hideIcon, style, onPress } = props
  const colorScheme = useColorScheme()

  return (
    <Animated.View
      entering={FadeInUp.easing(Easing.out(Easing.quad))}
      exiting={ZoomOut.easing(Easing.out(Easing.quad))}
    >
      <TouchableOpacity
        {...props}
        style={[
          {
            flexDirection: 'row',
            backgroundColor: Colors[colorScheme].background,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 8,
            alignItems: 'center',
            overflow: 'hidden',
            gap: 4,
          },
          style,
        ]}
        onPress={onPress}
      >
        {!hideIcon ? <MaterialIcons name="close" size={16} color={Colors[colorScheme].secondaryText} /> : null}
        <Text style={[FontStyles.AccentuatedBody, { color: Colors[colorScheme].text }]}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
