import Colors from '@/constants/Colors'
import { Pack, PackManager } from '@/managers/PackManager'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Image, ImageProps } from 'expo-image'
import { useCallback } from 'react'
import { Pressable, StyleSheet, View, ViewProps } from 'react-native'
import { useAppContext, useAppDispatchContext } from '../../providers/AppContextProvider'
import { Text } from '../utils/Themed'
import useColorScheme from '../utils/useColorScheme'
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated'

export type PackViewProps = {
  pack: Pack
}

export type PackPosterViewProps = {
  hideImage?: boolean
  width?: number
}

export default function PackPosterView(props: Readonly<PackPosterViewProps & PackViewProps & ViewProps>) {
  const { pack, hideImage, style } = props
  const colorScheme = useColorScheme()
  const { playlist } = useAppContext()
  const setContext = useAppDispatchContext()
  const width = props.width ?? 256
  const isSelected = playlist.has(pack)
  const isNoneSelected = playlist.size === 0

  const { data: image, error } = useQuery(PackManager.getImageQuery(pack.image, !hideImage))
  if (error) console.warn(error)

  const PackImage = useCallback((props: ImageProps) => <Image {...props} source={image} transition={256} />, [image])

  const animationConfig = { duration: 150, easing: Easing.bezier(0, 0, 0.5, 1) }

  const animatedStyle = useAnimatedStyle(() => {
    const shadowSize = 16
    return {
      shadowOffset: { width: 0, height: shadowSize },
      shadowRadius: shadowSize,
      shadowOpacity: 1 / 5,
      opacity: withTiming(isSelected || isNoneSelected ? 1 : 0.5, animationConfig),
      transform: [{ scale: withTiming(isSelected || isNoneSelected ? 1 : 0.98, animationConfig) }],
    }
  }, [isSelected, isNoneSelected])

  const checkmarkStyle = useAnimatedStyle(() => {
    const iconPadding = withTiming(isSelected ? 8 : 0, animationConfig)
    const shadowSize = 8
    return {
      position: 'absolute',
      bottom: iconPadding,
      right: iconPadding,
      shadowOffset: { width: 0, height: shadowSize },
      shadowRadius: shadowSize,
      shadowOpacity: 0.5,
      opacity: withTiming(isSelected ? 1 : 0, animationConfig),
      transform: [{ scale: withTiming(isSelected ? 1 : 0.75, animationConfig) }],
    }
  }, [isSelected])

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => setContext({ action: 'togglePack', payload: pack })}
        {...props}
        style={[
          {
            width: width,
            alignItems: 'center',
            gap: 8,
          },
          style,
        ]}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            gap: 8,
            shadowColor: 'black',
          }}
        >
          <PackImage
            style={{
              width: width,
              aspectRatio: 1,
              borderRadius: 16,
              borderColor: Colors[colorScheme].stroke,
              borderWidth: StyleSheet.hairlineWidth,
            }}
          >
            <Animated.View style={checkmarkStyle}>
              <Ionicons name='checkmark-circle' size={32 + 16 + 8} style={{ color: Colors[colorScheme].accentColor }} />
            </Animated.View>
          </PackImage>

          <View style={{ width: width }}>
            <Text numberOfLines={1} style={[styles.text, styles.header]}>
              {pack.name}
            </Text>

            <Text numberOfLines={2} style={{ ...styles.text, color: Colors[colorScheme].secondaryText }}>
              {pack.description ? pack.description : pack.cards.size + ' cards'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  text: {
    userSelect: 'none',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
})
