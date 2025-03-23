import Colors from '@/src/constants/Colors'
import { FontStyles, Styles } from '@/src/constants/Styles'
import GameManager from '@/src/managers/GameManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { Pack, PackManager, UnplayableReason } from '@/src/managers/PackManager'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Alert, Platform, Pressable, StyleSheet, Text, View, ViewProps } from 'react-native'
import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { AppContextType, useAppContext, useAppDispatchContext } from '../../providers/AppContextProvider'
import { presentPaywall, useInAppPurchaseContext } from '../../providers/InAppPurchaseProvider'
import Skeleton from '../utils/Skeleton'
import { LinearGradient } from 'expo-linear-gradient'

export type PackViewProps = ViewProps & {
  pack: Pack
  onAddPlayersConfirm?: () => void
}

export type PackPosterViewProps = PackViewProps & {
  width?: number
}

const DEFAULT_WIDTH = 256
const animationConfig = { duration: 150, easing: Easing.bezier(0, 0, 0.5, 1) }

export default function PackPosterView(props: Readonly<PackPosterViewProps>) {
  const { pack, style, width = DEFAULT_WIDTH, onAddPlayersConfirm } = props
  const c = useAppContext()

  const isSelected = c.playlist.includes(pack.id)
  const isNoneSelected = c.playlist.length === 0
  const { onPress, unplayableReasons, localizations } = getPackDetails(pack, c, onAddPlayersConfirm)

  const { data: image, isLoading, error } = PackManager.useImageQuery(pack.image)
  if (error) console.warn(`Couldn't load image for pack ${pack.name}:`, error)

  const isSelectedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected || isNoneSelected ? 1 : 0.5, animationConfig),
      transform: [{ scale: withTiming(isSelected || isNoneSelected ? 1 : 0.98, animationConfig) }],
    }
  }, [isSelected, isNoneSelected])

  if (isLoading) return <SkeletonView {...props} />

  const descriptionField = pack.availability.start?.soon
    ? localizations.comingSoonMsg ?? localizations.comingSoonTitle
    : pack.description ?? pack.cards.length + ' cards'

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
      <Pressable onPress={onPress}>
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
          {descriptionField}
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
  const { pack, unplayableReasons, isSelected } = props

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

      {pack.availability.start?.soon && (
        <Animated.View entering={enterAnimation} exiting={exitAnimation}>
          <IconTag icon='hourglass' color={Colors.blue.light} backgroundColor={Colors.blue.dark} />
        </Animated.View>
      )}

      {pack.availability.end?.soon && (
        <Animated.View entering={enterAnimation} exiting={exitAnimation}>
          <IconTag icon='hourglass' color={Colors.yellow.light} backgroundColor={Colors.yellow.dark} />
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

function getLocalizations(pack: Pack) {
  const comingSoonMsg = LocalizationManager.getValue('coming_soon_msg')

  return {
    addMorePlayersTitle: LocalizationManager.getValue('pack_unplayable_title'),
    addMorePlayersMessage: LocalizationManager.getValue('pack_unplayable_msg'),

    comingSoonTitle: LocalizationManager.getValue('coming_soon_title'),
    comingSoonMsg: pack.availability.start?.daysUntil
      ? comingSoonMsg.replace('{0}', LocalizationManager.dayCountToLocaleString(pack.availability.start.daysUntil))
      : undefined,
  }
}

function getOnPress(
  pack: Pack,
  unplayableReasons: Set<UnplayableReason>,
  localizations: ReturnType<typeof getLocalizations>,
  onAddPlayersConfirm?: () => any
) {
  const setContext = useAppDispatchContext()

  if (unplayableReasons.has('subscription')) {
    return () => presentPaywall()
  }

  if (unplayableReasons.has('dateRestriction')) {
    return () => Alert.alert(localizations.comingSoonTitle, localizations.comingSoonMsg)
  }

  if (unplayableReasons.has('cardCount')) {
    return () =>
      Alert.alert(localizations.addMorePlayersTitle, localizations.addMorePlayersMessage, [
        { onPress: onAddPlayersConfirm },
      ])
  }

  return () => setContext({ action: 'togglePack', payload: pack.id })
}

function getPackDetails(pack: Pack, c: AppContextType, onAddPlayersConfirm?: () => any) {
  const { isSubscribed } = useInAppPurchaseContext()
  const playableCardCount = GameManager.getPlayableCards(pack.id, c).size
  const unplayableReasons = PackManager.validatePlayability(isSubscribed, pack, playableCardCount)
  const localizations = getLocalizations(pack)

  return {
    onPress: getOnPress(pack, unplayableReasons, localizations, onAddPlayersConfirm),
    unplayableReasons,
    localizations,
  }
}

type IconTagProps = {
  icon: keyof typeof Ionicons.glyphMap
  color?: string
  backgroundColor?: string
  size?: number
}

export function IconTag(props: Readonly<IconTagProps>) {
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
      <LinearGradient
        style={[StyleSheet.absoluteFill, { opacity: 0.05, borderRadius: size / 2 }]}
        colors={['white', 'black']}
      />
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
