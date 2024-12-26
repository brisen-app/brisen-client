import Colors from '@/src/constants/Colors'
import React, { useCallback, useEffect, useRef } from 'react'

import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native'

type SkeletonProps = {
  width?: DimensionValue
  height?: DimensionValue
  borderRadius?: number
  bgColor?: string
  duration?: number
  style?: StyleProp<ViewStyle>
}

export default function Skeleton(props: Readonly<SkeletonProps>) {
  const {
    width = '100%',
    height = '100%',
    bgColor = Colors.placeholder,
    borderRadius = 8,
    duration = 500,
    style,
    ...rest
  } = props

  const animation = useRef(new Animated.Value(0.5)).current

  const startAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0.5,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [animation])

  useEffect(() => {
    startAnimation()
  }, [startAnimation])

  const animatedStyle = {
    opacity: animation,
  }

  return (
    <Animated.View
      {...rest}
      style={[
        {
          width,
          height,
          backgroundColor: bgColor,
          borderRadius,
        },
        style,
        animatedStyle,
      ]}
    />
  )
}
