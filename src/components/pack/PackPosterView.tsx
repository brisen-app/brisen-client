import Colors from '@/src/constants/Colors'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import Color from '@/src/models/Color'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Alert, Platform, Pressable, StyleSheet, Text, View, ViewProps } from 'react-native'
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useAppContext, useAppDispatchContext } from '../../providers/AppContextProvider'
import { presentPaywall, useInAppPurchaseContext } from '../../providers/InAppPurchaseProvider'
import Skeleton from '../utils/Skeleton'
import { CardManager } from '@/src/managers/CardManager'

export type PackViewProps = {
  pack: Pack
}

export type PackPosterViewProps = {
  width?: number
}

export default function PackPosterView(props: Readonly<PackPosterViewProps & PackViewProps & ViewProps>) {
  const { pack, style } = props
  const { playlist, players, categoryFilter } = useAppContext()
  const { isSubscribed } = useInAppPurchaseContext()
  const setContext = useAppDispatchContext()
  const width = props.width ?? 256
  const isSelected = playlist.includes(pack.id)
  const isNoneSelected = playlist.length === 0

  const playableCardCount = CardManager.getPlayableCards(pack, players.size, new Set(categoryFilter)).size

  const isPlayable = PackManager.isPlayable(playableCardCount)
  const isAvailable = pack.is_free || isSubscribed
  const isSelectable = isSelected || (isPlayable && isAvailable)

  const addMorePlayersTitle =
    LocalizationManager.get('pack_unplayable_title')?.value ?? 'More players or categories required'
  const addMorePlayersMessage =
    LocalizationManager.get('pack_unplayable_msg')?.value ??
    'To play this pack, you need to add more players or remove some category filters.'

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

  const isSelectableStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelectable ? 1 : 0.2, animationConfig),
    }
  }, [isSelectable])

  const iconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(!isSelectable ? 1 : 0, animationConfig),
      transform: [{ scale: withTiming(!isSelectable ? 1 : 0.9, animationConfig) }],
    }
  }, [isSelectable])

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
          if (isSelectable) setContext({ action: 'togglePack', payload: pack.id })
          else if (!isPlayable) Alert.alert(addMorePlayersTitle, addMorePlayersMessage)
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
          <Animated.View style={isSelectableStyle}>
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
                alignItems: 'center',
              },
              iconStyle,
            ]}
          >
            <Ionicons
              name={isAvailable ? 'people' : 'cart'}
              size={32 + 16}
              style={[
                { color: Color.white.string },
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
            {isAvailable && !isPlayable && (
              <Text
                style={{ color: Color.white.string, fontSize: 12, fontWeight: 'bold', padding: 8, textAlign: 'center' }}
              >
                {addMorePlayersTitle}
              </Text>
            )}
          </Animated.View>
        </View>

        <Text numberOfLines={1} style={[styles.text, styles.header]}>
          {pack.name}
        </Text>

        <Text numberOfLines={2} style={{ ...styles.text, color: Colors.secondaryText }}>
          {pack.description ? pack.description : pack.cards.length + ' cards'}
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
