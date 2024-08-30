import { ActivityIndicator, Platform, Pressable, StyleSheet, View, ViewProps } from 'react-native'
import { Image } from 'expo-image'
import { InAppContext, InAppDispatchContext, isSubscribed } from '@/providers/InAppPurchaseProvider'
import { Ionicons } from '@expo/vector-icons'
import { Pack, PackManager } from '@/managers/PackManager'
import { Text } from '../utils/Themed'
import { useAppContext, useAppDispatchContext } from '../../providers/AppContextProvider'
import { useBottomSheet } from '@gorhom/bottom-sheet'
import { useContext } from 'react'
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import Color from '@/models/Color'
import Colors from '@/constants/Colors'
import Purchases from 'react-native-purchases'
import RevenueCatUI from 'react-native-purchases-ui'
import useColorScheme from '../utils/useColorScheme'

export type PackViewProps = {
  pack: Pack
}

export type PackPosterViewProps = {
  width?: number
}

export default function PackPosterView(props: Readonly<PackPosterViewProps & PackViewProps & ViewProps>) {
  const { pack, style } = props
  const colorScheme = useColorScheme()
  const bottomSheet = useBottomSheet()
  const { playlist, playedIds } = useAppContext()
  const setContext = useAppDispatchContext()
  const width = props.width ?? 256

  const customerInfo = useContext(InAppContext)
  const setCustomerInfo = useContext(InAppDispatchContext)

  const isAvailable = pack.is_free || isSubscribed(customerInfo)
  const isSelected = playlist.has(pack)
  const isNoneSelected = playlist.size === 0

  const { data: image, isLoading, error } = PackManager.useImageQuery(pack.image)
  if (error) console.warn(error)

  const animationConfig = { duration: 150, easing: Easing.bezier(0, 0, 0.5, 1) }

  const isSelectedAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected || isNoneSelected ? 1 : 0.5, animationConfig),
      transform: [{ scale: withTiming(isSelected || isNoneSelected ? 1 : 0.98, animationConfig) }],
    }
  }, [isSelected, isNoneSelected])

  const isAvailableAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isAvailable ? 1 : 1 / 3, animationConfig),
    }
  }, [isAvailable])

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected ? 1 : 0, animationConfig),
      transform: [{ scale: withTiming(isSelected ? 1 : 0.75, animationConfig) }],
    }
  }, [isSelected])

  const lockStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(!isAvailable ? 1 : 0, animationConfig),
      transform: [{ scale: withTiming(!isAvailable ? 1 : 0.75, animationConfig) }],
    }
  }, [isAvailable])

  function handlePress() {
    if (isAvailable) {
      setContext({ action: 'togglePack', payload: pack })
      if (playlist.size === 0 && playedIds.size === 0) bottomSheet.collapse()
      return
    }

    RevenueCatUI.presentPaywall().then(result => {
      console.log('Paywall result:', result)
      Purchases.getCustomerInfo().then(setCustomerInfo)
    })
  }

  return (
    <Animated.View
      style={[
        {
          width: width,
        },
        style,
        isSelectedAnimationStyle,
      ]}
    >
      <Pressable onPress={handlePress}>
        <View
          style={[
            {
              height: width,
              overflow: 'hidden',
              borderRadius: 16,
              marginBottom: 8,
              backgroundColor: Colors[colorScheme].placeholder,
              borderColor: Colors[colorScheme].stroke,
              borderWidth: StyleSheet.hairlineWidth,
              justifyContent: 'center',
              alignItems: 'center',
            },
            Platform.select({
              ios: {
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 16 },
                shadowRadius: 16,
                shadowOpacity: 1 / 5,
              },
            }) ?? {},
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size='large' color={Colors[colorScheme].accentColor} />
          ) : (
            <Animated.View style={isAvailableAnimationStyle}>
              <Image
                style={{
                  width: width,
                  height: width,
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
                    { padding: 8, color: Colors[colorScheme].accentColor },
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
          )}
          <Animated.View
            style={[
              {
                position: 'absolute',
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              },
              lockStyle,
            ]}
          >
            <Ionicons
              name='lock-closed'
              size={32 + 16 + 8}
              style={[
                { color: Color.white.string },
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
        </View>

        <Text numberOfLines={1} style={[styles.text, styles.header]}>
          {pack.name}
        </Text>

        <Text numberOfLines={2} style={{ ...styles.text, color: Colors[colorScheme].secondaryText }}>
          {pack.description ? pack.description : pack.cards.size + ' cards'}
        </Text>
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
