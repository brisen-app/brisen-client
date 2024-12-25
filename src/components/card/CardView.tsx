import Colors from '@/src/constants/Colors'
import { FontStyles, Styles } from '@/src/constants/Styles'
import { PlayedCard } from '@/src/managers/CardManager'
import { Category, CategoryManager } from '@/src/managers/CategoryManager'
import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import Color from '@/src/models/Color'
import { Player } from '@/src/models/Player'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Platform, StyleSheet, Text, View, ViewProps } from 'react-native'

export type CardViewProps = {
  card: PlayedCard
  category?: Category
}

export function CardView(props: Readonly<CardViewProps & ViewProps>) {
  const { card, category, style } = props

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
        {(category || card.header) && <CategoryView item={category} header={card.header ?? undefined} />}
        <View style={{ flex: 1 }} />
        {card.pack && <PackView pack={card.pack} />}
      </View>

      <Content content={content} player={target} />
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

function CategoryView(props: Readonly<{ item?: Category; header?: string } & ViewProps>) {
  const { item, header, style, ...rest } = props

  const categoryTitle = item ? CategoryManager.getTitle(item) : header

  return (
    <View
      {...rest}
      style={[{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 4, borderRadius: 16 }, style]}
    >
      {item?.icon && <Text style={[styles.textShadow, { fontSize: 48 }]}>{item?.icon}</Text>}

      <View>
        {categoryTitle && (
          <Text style={[FontStyles.Title, styles.textShadow, { color: Color.white.string }]}>{categoryTitle}</Text>
        )}
      </View>
    </View>
  )
}

function PackView(props: Readonly<{ pack: Pack } & ViewProps>) {
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
