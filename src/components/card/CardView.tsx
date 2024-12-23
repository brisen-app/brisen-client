import Colors from '@/src/constants/Colors'
import { FontStyles, Styles } from '@/src/constants/Styles'
import { useSheetHeight } from '@/src/lib/utils'
import { PlayedCard } from '@/src/managers/CardManager'
import { Category, CategoryManager } from '@/src/managers/CategoryManager'
import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import Color from '@/src/models/Color'
import { Player } from '@/src/models/Player'
import { MaterialIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewProps } from 'react-native'
import { TouchableOpacityProps } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  Extrapolation,
  WithTimingConfig,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ANIMATION_SETTINGS: WithTimingConfig = { duration: 200, easing: Easing.out(Easing.ease) }

export type CardViewProps = {
  card: PlayedCard
  category?: Category
}

export function CardView(props: Readonly<CardViewProps & ViewProps>) {
  const { card, category, style } = props
  const [showDetails, setShowDetails] = useState(false)

  const insets = useSafeAreaInsets()
  const padding = 16
  const safeArea = {
    paddingTop: Math.max(padding, insets.top),
    paddingLeft: Math.max(padding, insets.left),
    paddingRight: Math.max(padding, insets.right),
    paddingBottom: useSheetHeight() + padding,
  }

  const target = card.is_group || card.players.length === 0 ? undefined : card.players[0]
  const content = card.formattedContent ?? card.content

  function getGradient(): [string, string, ...string[]] {
    if (!category?.gradient)
      return (
        (ConfigurationManager.get('default_gradient')?.list as [string, string, ...string[]]) ?? [
          Colors.accentColor,
          Colors.accentColor,
        ]
      )
    if (category.gradient.length === 1) return [category.gradient[0], category.gradient[0]]
    return category.gradient.map(color => Color.hex(color).string) as [string, string, ...string[]]
  }

  return (
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
      <LinearGradient colors={getGradient()} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={Styles.absoluteFill} />

      {/* Grain */}
      <Image
        source={require('@/src/assets/images/noise.png')}
        style={{
          ...Styles.absoluteFill,
          opacity: 0.05,
        }}
      />

      {/* Pack & Category */}
      <View
        style={{
          ...Styles.absoluteFill,
          padding: 24,
        }}
      >
        {(category || card.header) && (
          <CategoryView
            item={category}
            header={card.header ?? undefined}
            onPress={() => setShowDetails(!showDetails)}
            showDetails={showDetails}
          />
        )}
        <View style={{ flex: 1 }} />
        {card.pack && (
          <PackView pack={card.pack} onPress={() => setShowDetails(!showDetails)} showDetails={showDetails} />
        )}
      </View>

      <Content content={content} player={target} style={safeArea} />
    </View>
  )
}

function Content(props: Readonly<{ content: string; player?: Player } & ViewProps>) {
  const { content, player, ...rest } = props

  return (
    <View {...rest}>
      {player && (
        <Text
          style={{
            fontSize: 32,
            fontWeight: '900',
            ...styles.textShadow,
            color: Color.white.string,
            textAlign: 'center',
          }}
        >
          {player.name},
        </Text>
      )}
      <Text
        style={{
          fontSize: Math.max(18, 28 / Math.max(1, content.length / 150)),
          fontWeight: '900',
          ...styles.textShadow,
          color: Color.white.string,
          textAlign: 'center',
          paddingHorizontal: 32,
        }}
      >
        {content}
      </Text>
    </View>
  )
}

function CategoryView(
  props: Readonly<{ item?: Category; header?: string; showDetails: boolean } & TouchableOpacityProps>
) {
  const { item, header, showDetails, style, ...rest } = props
  const animationState = useSharedValue(0)

  const categoryTitle = item ? CategoryManager.getTitle(item) : header
  const categoryDescription = item ? CategoryManager.getDescription(item) : undefined

  useEffect(() => {
    animationState.value = withTiming(showDetails ? 1 : 0, ANIMATION_SETTINGS)
  }, [showDetails])

  const animatedFlexStyle = useAnimatedStyle(() => ({
    flex: interpolate(animationState.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }))

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(animationState.value, [0, 1], ['transparent', Colors.stroke]),
    padding: interpolate(animationState.value, [0, 1], [0, 16], Extrapolation.CLAMP),
    borderRadius: interpolate(animationState.value, [0, 1], [0, 16], Extrapolation.CLAMP),
  }))

  return (
    <TouchableOpacity {...rest}>
      <Animated.View
        style={[
          { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 4 },
          animatedContainerStyle,
          style,
        ]}
      >
        {item?.icon && <Text style={[styles.textShadow, { fontSize: 48 }]}>{item?.icon}</Text>}

        <Animated.View style={animatedFlexStyle}>
          {categoryTitle && (
            <Text style={[FontStyles.Title, styles.textShadow, { color: Color.white.string }]}>{categoryTitle}</Text>
          )}
          {showDetails && categoryDescription && (
            <Text style={[FontStyles.Subheading, styles.textShadow, { color: Color.white.string }]}>
              {categoryDescription}
            </Text>
          )}
        </Animated.View>
        <MaterialIcons name='info' size={18} color={Color.white.alpha(0.5).string} style={{ marginLeft: 4 }} />
      </Animated.View>
    </TouchableOpacity>
  )
}

function PackView(props: Readonly<{ pack: Pack; showDetails: boolean } & TouchableOpacityProps>) {
  const { pack, showDetails, style, ...rest } = props
  const animationState = useSharedValue(0)

  const { data: image, error } = PackManager.useImageQuery(pack.image)
  if (error) console.warn(`Couldn't load image for pack ${pack.name}:`, error)

  useEffect(() => {
    animationState.value = withTiming(showDetails ? 1 : 0, ANIMATION_SETTINGS)
  }, [showDetails])

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(animationState.value, [0, 1], ['transparent', Colors.stroke]),
    padding: interpolate(animationState.value, [0, 1], [0, 16], Extrapolation.CLAMP),
    borderRadius: interpolate(animationState.value, [0, 1], [0, 16], Extrapolation.CLAMP),
  }))

  const animatedImageStyle = useAnimatedStyle(() => ({
    height: interpolate(animationState.value, [0, 1], [48, 64], Extrapolation.CLAMP),
  }))

  return (
    <TouchableOpacity {...rest}>
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, animatedContainerStyle, style]}>
        {image && (
          <Animated.Image
            source={{ uri: image }}
            style={[
              {
                aspectRatio: 1,
                backgroundColor: Color.black.alpha(0.5).string,
                borderColor: Colors.stroke,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 12,
              },
              animatedImageStyle,
            ]}
          />
        )}

        <View style={{ flex: 1 }}>
          <Text style={[FontStyles.Title, styles.textShadow, { color: Color.white.string }]}>{pack.name}</Text>
          {showDetails && (
            <Text style={[FontStyles.Subheading, styles.textShadow, { color: Color.white.string }]}>
              {pack.description}
            </Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const shadowSize = 1.3
const shadowOpacity = 0.3

const styles = StyleSheet.create({
  textShadow:
    Platform.select({
      ios: {
        shadowOffset: { width: 0, height: shadowSize },
        shadowRadius: shadowSize,
        shadowOpacity: shadowOpacity,
      },
      android: {
        textShadowOffset: { width: 0, height: shadowSize },
        textShadowRadius: shadowSize,
        textShadowColor: Color.black.alpha(shadowOpacity).string,
      },
    }) ?? {},
  shadow:
    Platform.select({
      ios: {
        shadowOffset: { width: 0, height: shadowSize },
        shadowRadius: shadowSize,
        shadowOpacity: shadowOpacity,
      },
      android: {
        elevation: 2,
      },
    }) ?? {},
})
