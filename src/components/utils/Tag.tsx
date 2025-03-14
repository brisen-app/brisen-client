import Colors from '@/src/constants/Colors'
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import Animated from 'react-native-reanimated'

type TagSize = 'small' | 'medium' | 'large'

export type TagListProps = {
  size?: TagSize
  text: string
  disabled?: boolean
  hideIcon?: boolean
  labelColor?: string
  backgroundColor?: string
} & TouchableOpacityProps

function getTagSize(size: TagSize) {
  switch (size) {
    case 'small': {
      return {
        fontSize: 12,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
      }
    }
    case 'medium': {
      return {
        fontSize: 16,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
      }
    }
    case 'large': {
      return {
        fontSize: 18,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
      }
    }
  }
}

export default function Tag(props: Readonly<TagListProps>) {
  const { text, hideIcon, style, labelColor, backgroundColor, disabled, size = 'medium', onPress } = props
  const sizes = getTagSize(size)

  return (
    <Animated.View
      {...props}
      style={[
        {
          backgroundColor: backgroundColor ?? Colors.background,
          paddingVertical: sizes.paddingVertical,
          paddingHorizontal: sizes.paddingHorizontal,
          borderRadius: sizes.borderRadius,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: Colors.stroke,
        },
        style,
      ]}
    >
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
          gap: 4,
        }}
      >
        {!hideIcon ? <MaterialIcons name='close' size={sizes.fontSize} color={Colors.secondaryText} /> : null}
        <Text style={{ color: labelColor ?? Colors.text, fontSize: sizes.fontSize }}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
