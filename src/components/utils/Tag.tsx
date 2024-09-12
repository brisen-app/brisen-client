import Colors from '@/src/constants/Colors'
import { FontStyles } from '@/src/constants/Styles'
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet } from 'react-native'
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import Animated from 'react-native-reanimated'

export type TagListProps = {
  text: string
  hideIcon?: boolean
} & TouchableOpacityProps

export default function Tag(props: Readonly<TagListProps>) {
  const { text, hideIcon, style, onPress } = props

  return (
    <Animated.View
      {...props}
      style={[
        {
          backgroundColor: Colors.background,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: Colors.stroke,
        },
        style,
      ]}
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
        {!hideIcon ? <MaterialIcons name='close' size={16} color={Colors.secondaryText} /> : null}
        <Text style={[FontStyles.AccentuatedBody, { color: Colors.text }]}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
