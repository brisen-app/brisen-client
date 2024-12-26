import Colors from '@/src/constants/Colors'
import { Pack, PackManager } from '@/src/managers/PackManager'
import Color from '@/src/models/Color'
import { useInAppPurchaseContext } from '@/src/providers/InAppPurchaseProvider'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Platform, Pressable, StyleSheet, Text, View, ViewProps } from 'react-native'
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useAppContext, useAppDispatchContext } from '../../providers/AppContextProvider'
import { presentPaywall } from '../../providers/InAppPurchaseProvider'
import Skeleton from '../utils/Skeleton'

export type PackViewProps = {
  pack: Pack
}

export type PackPosterViewProps = {
  width?: number
}

export default function PackPosterView(props: Readonly<PackPosterViewProps & PackViewProps & ViewProps>) {
  const { pack, style } = props
  const { playlist } = useAppContext()
  const { isSubscribed } = useInAppPurchaseContext()
  const setContext = useAppDispatchContext()
  const width = props.width ?? 256
  const isSelected = playlist.has(pack)
  const isNoneSelected = playlist.size === 0
  const isAvailable = pack.is_free || isSubscribed

  const { data: image, isLoading, error } = PackManager.useImageQuery(pack.image)
  if (error) console.warn(`Couldn't load image for pack ${pack.name}:`, error)

  const animationConfig = { duration: 150, easing: Easing.bezier(0, 0, 0.5, 1) }

  const isSelectedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected || isNoneSelected ? 1 : 0.5, animationConfig),
      transform: [{ scale: withTiming(isSelected || isNoneSelected ? 1 : 0.98, animationConfig) }],
    }
  }, [isSelected, isNoneSelected])

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected ? 1 : 0, animationConfig),
      transform: [{ scale: withTiming(isSelected ? 1 : 0.75, animationConfig) }],
    }
  }, [isSelected])

  const isAvailableStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isAvailable ? 1 : 0.2, animationConfig),
    }
  }, [isSubscribed])

  const lockStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(!isAvailable ? 1 : 0, animationConfig),
      transform: [{ scale: withTiming(!isAvailable ? 1 : 0.9, animationConfig) }],
    }
  }, [isSubscribed])

  if (isLoading) {
    return (
      <View style={[{ width, gap: 8 }, style]}>
        <Skeleton height={width} borderRadius={16} />
        <Skeleton height={18} width={width * 0.75} />
        <Skeleton height={32} />
      </View>
    )
  }

  return (
    <Animated.View
      style={[
        {
          width: width,
        },
        style,
        isSelectedStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          if (isAvailable) setContext({ action: 'togglePack', payload: pack })
          else presentPaywall()
        }}
      >
        <View
          style={[
            {
              height: width,
              overflow: 'hidden',
              borderRadius: 16,
              marginBottom: 8,
              borderColor: Colors.stroke,
              borderWidth: StyleSheet.hairlineWidth,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Animated.View style={isAvailableStyle}>
            <Image
              style={{
                width: width,
                aspectRatio: 1,
              }}
              source={image}
              transition={200}
            />
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                },
                checkmarkStyle,
              ]}
            >
              <Ionicons
                name='checkmark-circle'
                size={32 + 16 + 8}
                style={[
                  { padding: 8, color: Colors.accentColor },
                  Platform.select({
                    ios: {
                      shadowOffset: { width: 0, height: 8 },
                      shadowRadius: 8,
                      shadowOpacity: 0.75,
                    },
                    android: {
                      textShadowOffset: { width: 0, height: 8 },
                      textShadowRadius: 16,
                      textShadowColor: Color.black.alpha(0.5).string,
                    },
                  }) ?? {},
                ]}
              />
            </Animated.View>
          </Animated.View>
          <Animated.View
            style={[
              {
                position: 'absolute',
              },
              lockStyle,
            ]}
          >
            <Ionicons
              name='lock-closed'
              size={32 + 16}
              style={[
                { padding: 8, color: Color.white.string },
                Platform.select({
                  ios: {
                    shadowOffset: { width: 0, height: 8 },
                    shadowRadius: 8,
                    shadowOpacity: 0.5,
                  },
                  android: {
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 16,
                    textShadowColor: Color.black.alpha(0.5).string,
                  },
                }) ?? {},
              ]}
            />
          </Animated.View>
        </View>

        <Text numberOfLines={1} style={[styles.text, styles.header]}>
          {pack.name}
        </Text>

        <Text numberOfLines={2} style={{ ...styles.text, color: Colors.secondaryText }}>
          {pack.description ? pack.description : pack.cards.size + ' cards'}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: Colors.text,
    userSelect: 'none',
  },
  header: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
})
