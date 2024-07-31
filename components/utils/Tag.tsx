import Colors from '@/constants/Colors'
import { FontStyles } from '@/constants/Styles'
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import Animated, { Easing, FadeInUp, ZoomOut } from 'react-native-reanimated'
import useColorScheme from './useColorScheme'

export type TagListProps = {
  text: string
  hideIcon?: boolean
} & TouchableOpacityProps

export default function Tag(props: Readonly<TagListProps>) {
  const { text, hideIcon, style, onPress } = props
  const colorScheme = useColorScheme()

  return (
    <Animated.View
      {...props}
      style={[
        {
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
        },
        style,
      ]}
      entering={FadeInUp.easing(Easing.out(Easing.quad))}
      exiting={ZoomOut.easing(Easing.out(Easing.quad))}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
          gap: 4,
        }}
      >
        {!hideIcon ? <MaterialIcons name='close' size={16} color={Colors[colorScheme].secondaryText} /> : null}
        <Text style={[FontStyles.AccentuatedBody, { color: Colors[colorScheme].text }]}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
