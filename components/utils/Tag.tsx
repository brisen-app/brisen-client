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
      entering={FadeInUp.easing(Easing.out(Easing.quad))}
      exiting={ZoomOut.easing(Easing.out(Easing.quad))}
    >
      <TouchableOpacity
        {...props}
        style={[
          {
            flexDirection: 'row',
            backgroundColor: Colors[colorScheme].secondaryBackground,
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
        {!hideIcon ? <MaterialIcons name='close' size={16} color={Colors[colorScheme].secondaryText} /> : null}
        <Text style={[FontStyles.AccentuatedBody, { color: Colors[colorScheme].text }]}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
