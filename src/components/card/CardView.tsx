import Colors from '@/src/constants/Colors'
import { FontStyles, Styles } from '@/src/constants/Styles'
import { PlayedCard } from '@/src/managers/CardManager'
import { Category, CategoryManager } from '@/src/managers/CategoryManager'
import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import Color from '@/src/models/Color'
import { Player } from '@/src/models/Player'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewProps } from 'react-native'
import Animated, { AnimatedProps, Easing, FadeInDown, FadeOutDown, withTiming } from 'react-native-reanimated'

export type CardViewProps = {
  card: PlayedCard
}

export function CardView(props: Readonly<CardViewProps & ViewProps>) {
  const { card, style } = props
  const [showDetails, setShowDetails] = useState(false)

  const category = card.category ? CategoryManager.get(card.category) : undefined

  const target = card.is_group || card.players.length === 0 ? undefined : card.players[0]
  const content = card.formattedContent ?? card.content

  const animationConfig = { duration: 300, easing: Easing.bezier(0, 0, 0.5, 1) }
  const entering = () => {
    'worklet'
    const animations = {
      opacity: withTiming(1, animationConfig),
      transform: [{ scale: withTiming(1, animationConfig) }],
    }
    const initialValues = {
      opacity: 0,
      transform: [{ scale: 0.9 }],
    }
    return {
      initialValues,
      animations,
    }
  }

  function getGradient(): [string, string, ...string[]] {
    if (!category?.gradient)
      return (
        (ConfigurationManager.getValue('default_gradient') as [string, string, ...string[]]) ?? [
          Colors.accentColor,
          Colors.accentColor,
        ]
      )
    if (category.gradient.length === 1) return [category.gradient[0], category.gradient[0]]
    return category.gradient.map(color => Color.hex(color).string) as [string, string, ...string[]]
  }

  return (
    <Animated.View
      onTouchStart={() => setShowDetails(false)}
      entering={entering}
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 32,
          overflow: 'hidden',
          borderColor: Colors.stroke,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}
    >
      <LinearGradient colors={getGradient()} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={Styles.absoluteFill} />

      {/* Grain */}
      <Image
        source={require('@/src/assets/images/noise.png')}
        style={{
          ...Styles.absoluteFill,
          opacity: 0.05,
        }}
      />

      <Content content={content} player={target} />

      {/* Pack & Category */}
      <View
        style={{
          ...Styles.absoluteFill,
          padding: 24,
        }}
      >
        {(category || card.header) && <CategoryLabel item={category} header={card.header ?? undefined} />}

        <View style={{ flex: 1 }} />

        {showDetails && <DetailsView category={category} pack={card.pack} />}

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {card.pack && <PackLabel pack={card.pack} />}

          <TouchableOpacity style={{ padding: 8 }} onPress={() => setShowDetails(!showDetails)}>
            <Ionicons name='information-circle' size={32} color={Color.white.alpha(0.25).string} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
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
          fontSize: Math.max(24, 32 / Math.max(1, content.length / 100)),
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

function CategoryLabel(props: Readonly<{ item?: Category; header?: string; iconSize?: number } & ViewProps>) {
  const { item, header, iconSize = 48, style, ...rest } = props

  const categoryTitle = item ? CategoryManager.getTitle(item) : null

  return (
    <View
      {...rest}
      style={[{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 4, borderRadius: 16 }, style]}
    >
      {item?.icon && <Text style={[styles.textShadow, { fontSize: iconSize }]}>{item?.icon}</Text>}

      <View>
        {(categoryTitle || header) && (
          <Text style={[FontStyles.Title, styles.textShadow, { color: Color.white.string }]}>
            {header ?? categoryTitle}
          </Text>
        )}
      </View>
    </View>
  )
}

function CategotyDetails(props: Readonly<{ category: Category } & ViewProps>) {
  const { category, style, ...rest } = props
  const description = CategoryManager.getDescription(category)

  return (
    <View style={[{ gap: 8, borderRadius: 16 }, style]} {...rest}>
      <CategoryLabel item={category} style={{ alignSelf: 'flex-start' }} iconSize={FontStyles.LargeTitle.fontSize} />
      <Text style={[FontStyles.AccentuatedBody, styles.textShadow, { color: Colors.secondaryText }]}>
        {description}
      </Text>
    </View>
  )
}

function PackLabel(props: Readonly<{ pack: Pack } & ViewProps>) {
  const { pack, style, ...rest } = props

  const { data: image, error } = PackManager.useImageQuery(pack.image)
  if (error) console.warn(`Couldn't load image for pack ${pack.name}:`, error)

  return (
    <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16 }, style]}>
      {image && (
        <Image
          source={image}
          transition={200}
          style={[
            {
              height: 48,
              aspectRatio: 1,
              backgroundColor: Color.black.alpha(0.5).string,
              borderColor: Colors.stroke,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: 12,
            },
          ]}
        />
      )}

      <Text style={[FontStyles.Title, styles.textShadow, { color: Color.white.string }]}>{pack.name}</Text>
    </View>
  )
}

function PackDetails(props: Readonly<{ pack: Pack } & ViewProps>) {
  const { pack, style, ...rest } = props

  return (
    <View style={[{ gap: 8, borderRadius: 16 }, style]} {...rest}>
      <PackLabel pack={pack} style={{ alignSelf: 'flex-start' }} />
      <Text style={[FontStyles.AccentuatedBody, styles.textShadow, { color: Colors.secondaryText }]}>
        {pack.description}
      </Text>
    </View>
  )
}

function DetailsView(props: Readonly<{ category?: Category; pack: Pack | null } & AnimatedProps<ViewProps>>) {
  const { category, pack, style, ...rest } = props
  const BG_COLOR = Colors.secondaryBackground

  return (
    <Animated.View
      entering={FadeInDown.easing(Easing.out(Easing.cubic))}
      exiting={FadeOutDown.easing(Easing.out(Easing.cubic))}
      style={[
        {
          gap: 32,
          borderRadius: 16,
          borderWidth: StyleSheet.hairlineWidth,
          borderBlockColor: Colors.stroke,
          backgroundColor: BG_COLOR,
          padding: 16,
          marginBottom: 16,
        },
        styles.bigShadow,
        style,
      ]}
      {...rest}
    >
      {category && <CategotyDetails category={category} />}
      {pack && <PackDetails pack={pack} />}
      <View
        style={{
          alignItems: 'center',
          position: 'absolute',
          width: '100%',
          marginHorizontal: 16,
          bottom: -16,
        }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            transform: [{ rotate: '180deg' }],
            borderLeftWidth: 16,
            borderRightWidth: 16,
            borderBottomWidth: 16,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: BG_COLOR,
          }}
        />
      </View>
    </Animated.View>
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
  bigShadow:
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
})
