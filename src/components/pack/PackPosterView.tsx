import Colors from '@/src/constants/Colors'
import { FontStyles, Styles } from '@/src/constants/Styles'
import { CardManager } from '@/src/managers/CardManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Alert, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, ViewProps } from 'react-native'
import Animated, { Easing, FadeInDown, FadeOutDown, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useAppContext, useAppDispatchContext } from '../../providers/AppContextProvider'
import { presentPaywall, useInAppPurchaseContext } from '../../providers/InAppPurchaseProvider'
import Skeleton from '../utils/Skeleton'
import Color from '@/src/models/Color'

export type PackViewProps = ViewProps & {
  pack: Pack
}

export type PackPosterViewProps = PackViewProps & {
  width?: number
}

type UnplayableReason = 'subscription' | 'cardCount'

const DEFAULT_WIDTH = 256
const animationConfig = { duration: 150, easing: Easing.bezier(0, 0, 0.5, 1) }

function validatePlayability(
  isSubscribed: boolean,
  pack: Pack,
  playerCount: number,
  categoryFilter: string[]
): UnplayableReason | undefined {
  const playableCardCount = CardManager.getPlayableCards(pack, playerCount, new Set(categoryFilter)).size
  if (!PackManager.isPlayable(pack.cards.length, playableCardCount)) return 'cardCount'
  if (!pack.is_free && !isSubscribed) return 'subscription'
}

export default function PackPosterView(props: Readonly<PackPosterViewProps>) {
  const { pack, style, width = DEFAULT_WIDTH } = props
  const { playlist, players, categoryFilter, playedIds } = useAppContext()
  const { isSubscribed } = useInAppPurchaseContext()
  const setContext = useAppDispatchContext()

  const isSelected = playlist.includes(pack.id)
  const isNoneSelected = playlist.length === 0

  const isStarted = [...playedIds].filter(id => pack.cards.includes(id)).length > 5
  const unplayableReason = validatePlayability(isSubscribed, pack, players.length, categoryFilter)

  const addMorePlayersTitle =
    LocalizationManager.get('pack_unplayable_title')?.value ?? 'More players or categories required'
  const addMorePlayersMessage =
    LocalizationManager.get('pack_unplayable_msg')?.value ??
    'To play this pack, you need to add more players or remove some category filters.'

  const { data: image, isLoading, error } = PackManager.useImageQuery(pack.image)
  if (error) console.warn(`Couldn't load image for pack ${pack.name}:`, error)

  const isSelectedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected || isNoneSelected ? 1 : 0.5, animationConfig),
      transform: [{ scale: withTiming(isSelected || isNoneSelected ? 1 : 0.98, animationConfig) }],
    }
  }, [isSelected, isNoneSelected])

  const isSelectedBorderStyle = useAnimatedStyle(() => {
    return {
      borderWidth: withTiming(isSelected ? 4 : 0, animationConfig),
      borderColor: Colors.accentColor,
    }
  }, [isSelected])

  function handlePackPress() {
    switch (unplayableReason) {
      case 'subscription':
        return presentPaywall()
      case 'cardCount':
        return Alert.alert(addMorePlayersTitle, addMorePlayersMessage)
      default:
        setContext({ action: 'togglePack', payload: pack.id })
    }
  }

  if (isLoading) return <SkeletonView {...props} />

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
      <Pressable onPress={handlePackPress}>
        <View
          style={{
            height: width,
            overflow: 'hidden',
            borderRadius: 16,
            marginBottom: 8,
            borderColor: Colors.stroke,
            borderWidth: StyleSheet.hairlineWidth,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <PackImageView {...props} image={image} isSelected={isSelected} unplayableReason={unplayableReason} />
          <PackImageOverlay {...props} unplayableReason={unplayableReason} isStarted={isStarted} />

          <Animated.View style={[Styles.absoluteFill, { borderRadius: 16 }, isSelectedBorderStyle]} />
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

function PackImageView(
  props: Readonly<
    PackPosterViewProps & {
      image: string | null | undefined
      isSelected: boolean
      unplayableReason: UnplayableReason | undefined
    }
  >
) {
  const { style, width, image, unplayableReason } = props

  const availabilityStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(!unplayableReason ? 1 : 0.4, animationConfig),
    }
  }, [unplayableReason])

  return (
    <Animated.View
      style={[
        { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.placeholder },
        Styles.absoluteFill,
        style,
        availabilityStyle,
      ]}
    >
      {image ? (
        <Image
          style={{
            width: width,
            aspectRatio: 1,
          }}
          source={image}
          transition={200}
        />
      ) : (
        <Text style={FontStyles.LargeTitle}>😵</Text>
      )}
    </Animated.View>
  )
}

function PackImageOverlay(
  props: Readonly<PackPosterViewProps & { unplayableReason: UnplayableReason | undefined; isStarted: boolean }>
) {
  const setContext = useAppDispatchContext()
  const { unplayableReason, isStarted } = props
  const showIcons = !!unplayableReason || isStarted

  function handleRestartPress() {
    setContext({ action: 'restartPack', payload: props.pack })
  }

  return !showIcons ? null : (
    <Animated.View
      entering={FadeInDown.easing(animationConfig.easing.factory())}
      exiting={FadeOutDown.easing(animationConfig.easing.factory())}
      style={[
        StyleSheet.absoluteFill,
        {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: 8,
        },
      ]}
    >
      <View>
        {unplayableReason === 'subscription' && <IconTag icon='cart' />}
        {unplayableReason === 'cardCount' && (
          <IconTag icon='people' color={Colors.orange.light} backgroundColor={Colors.orange.dark} />
        )}
      </View>

      {unplayableReason !== 'subscription' && isStarted && (
        <TouchableOpacity onPress={handleRestartPress}>
          <IconTag icon='reload' color={Colors.orange.dark} backgroundColor={Colors.accentColor} />
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

type IconTagProps = {
  icon: keyof typeof Ionicons.glyphMap
  color?: string
  backgroundColor?: string
  size?: number
}

function IconTag(props: Readonly<IconTagProps>) {
  const { icon, color = Colors.green.light, backgroundColor = Colors.green.dark, size = 18 } = props
  return (
    <View
      style={[
        {
          backgroundColor: backgroundColor,
          padding: size / 3,
          borderRadius: size / 2,
        },
        Platform.select({
          ios: {
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 10.32,
            shadowOpacity: 0.44,
          },
          android: {
            elevation: 16,
          },
        }) ?? {},
      ]}
    >
      <Ionicons name={icon} size={size} style={{ color: color }} />
    </View>
  )
}

function SkeletonView(props: Readonly<PackPosterViewProps>) {
  const { style, width = DEFAULT_WIDTH } = props
  return (
    <View style={[{ width, gap: 8 }, style]}>
      <Skeleton height={width} borderRadius={16} />
      <Skeleton height={18} width={width * 0.75} />
      <Skeleton height={32} />
    </View>
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
