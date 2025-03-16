import Colors from '@/src/constants/Colors'
import { FontStyles, Styles } from '@/src/constants/Styles'
import { getPlayableCards } from '@/src/managers/GameManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Alert, Platform, Pressable, StyleSheet, Text, View, ViewProps } from 'react-native'
import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { AppContextType, useAppContext, useAppDispatchContext } from '../../providers/AppContextProvider'
import { presentPaywall, useInAppPurchaseContext } from '../../providers/InAppPurchaseProvider'
import Skeleton from '../utils/Skeleton'

export type PackViewProps = ViewProps & {
  pack: Pack
  onAddPlayersConfirm?: () => void
}

export type PackPosterViewProps = PackViewProps & {
  width?: number
}

type UnplayableReason = 'subscription' | 'cardCount'

const DEFAULT_WIDTH = 256
const animationConfig = { duration: 150, easing: Easing.bezier(0, 0, 0.5, 1) }

function validatePlayability(isSubscribed: boolean, pack: Pack, c: AppContextType): Set<UnplayableReason> {
  const reasons: Set<UnplayableReason> = new Set()
  const playableCardCount = getPlayableCards(pack.id, c).size
  if (!PackManager.isPlayable(pack.cards.length, playableCardCount)) reasons.add('cardCount')
  if (!pack.is_free && !isSubscribed) reasons.add('subscription')
  return reasons
}

export default function PackPosterView(props: Readonly<PackPosterViewProps>) {
  const { pack, style, width = DEFAULT_WIDTH, onAddPlayersConfirm } = props
  const c = useAppContext()
  const { isSubscribed } = useInAppPurchaseContext()
  const setContext = useAppDispatchContext()

  const isSelected = c.playlist.includes(pack.id)
  const isNoneSelected = c.playlist.length === 0

  const unplayableReasons = validatePlayability(isSubscribed, pack, c)

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

  function handlePackPress() {
    if (unplayableReasons.has('subscription')) presentPaywall()
    else if (unplayableReasons.has('cardCount'))
      Alert.alert(addMorePlayersTitle, addMorePlayersMessage, [{ onPress: onAddPlayersConfirm }])
    else setContext({ action: 'togglePack', payload: pack.id })
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
          <PackImageView {...props} image={image} isSelectable={unplayableReasons.size === 0} />
          <PackImageOverlay {...props} unplayableReasons={unplayableReasons} isSelected={isSelected} />
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
      isSelectable?: boolean
    }
  >
) {
  const { style, width, image, isSelectable } = props

  const availabilityStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelectable ? 1 : 0.2, animationConfig),
    }
  }, [isSelectable])

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
  props: Readonly<
    PackPosterViewProps & {
      unplayableReasons: Set<UnplayableReason>
      isSelected: boolean
    }
  >
) {
  const { unplayableReasons, isSelected } = props

  const enterAnimation = FadeIn.duration(animationConfig.duration).easing(Easing.in(animationConfig.easing.factory()))
  const exitAnimation = FadeOut.duration(animationConfig.duration).easing(Easing.out(animationConfig.easing.factory()))

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          gap: 4,
          padding: 8,
        },
      ]}
    >
      {unplayableReasons.has('subscription') && (
        <Animated.View entering={enterAnimation} exiting={exitAnimation}>
          <IconTag icon='cart' color={Colors.green.light} backgroundColor={Colors.green.dark} />
        </Animated.View>
      )}

      {unplayableReasons.has('cardCount') && (
        <Animated.View entering={enterAnimation} exiting={exitAnimation}>
          <IconTag icon='people' color={Colors.orange.light} backgroundColor={Colors.orange.dark} />
        </Animated.View>
      )}

      <View style={{ flex: 1 }} />

      {isSelected && (
        <Animated.View entering={enterAnimation} exiting={exitAnimation}>
          <IconTag icon='checkmark-circle' />
        </Animated.View>
      )}
    </View>
  )
}

type IconTagProps = {
  icon: keyof typeof Ionicons.glyphMap
  color?: string
  backgroundColor?: string
  size?: number
}

function IconTag(props: Readonly<IconTagProps>) {
  const { icon, color = Colors.yellow.light, backgroundColor = Colors.yellow.dark, size = 18 } = props
  return (
    <View
      style={[
        {
          backgroundColor: backgroundColor,
          padding: size / 3,
          borderRadius: size / 2,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: Colors.stroke,
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
