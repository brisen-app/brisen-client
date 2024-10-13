import Colors from '@/src/constants/Colors'
import { FontStyles, Styles } from '@/src/constants/Styles'
import { PlayedCard } from '@/src/managers/CardManager'
import { Category, CategoryManager } from '@/src/managers/CategoryManager'
import { PackManager } from '@/src/managers/PackManager'
import Color from '@/src/models/Color'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewProps } from 'react-native'
import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSheetHeight } from '@/src/lib/utils'

export type CardViewProps = {
  card: PlayedCard
  category?: Category | null
  onPressCategory: () => void
  onPressPack: () => void
}

export function CardView(props: Readonly<CardViewProps & ViewProps>) {
  const { card, category, style } = props
  const insets = useSafeAreaInsets()

  const padding = 16
  const safeArea = {
    paddingTop: Math.max(padding, insets.top),
    paddingLeft: Math.max(padding, insets.left),
    paddingRight: Math.max(padding, insets.right),
    paddingBottom: useSheetHeight() + padding,
  }

  const target = card.is_group || card.players.length === 0 ? null : card.players[0]
  const content = card.formattedContent ?? card.content
  const { data: image, error } = PackManager.useImageQuery(card.pack?.image)
  if (error) console.warn(`Couldn't load image for pack ${card.pack?.name}:`, error)

  function getGradient() {
    if (!category?.gradient) return ConfigurationManager.get('default_gradient')?.list ?? [Colors.accentColor]
    if (category.gradient.length === 1) return [category.gradient[0], category.gradient[0]]
    return category.gradient.map(color => Color.hex(color).string)
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
          <TouchableOpacity
            onPress={props.onPressCategory}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ ...styles.textShadow, fontSize: 48 }}>{category?.icon}</Text>
            <Text
              style={{ ...FontStyles.Title, ...styles.textShadow, color: Color.white.string, textAlign: 'right' }}
              numberOfLines={1}
            >
              {category ? card.header ?? CategoryManager.getTitle(category) : card.header}
            </Text>
            <MaterialIcons name='info' size={18} color={Color.white.alpha(0.5).string} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />
        {card.pack && (
          <TouchableOpacity
            onPress={props.onPressPack}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Image
              source={image}
              transition={200}
              style={{
                height: 48,
                aspectRatio: 1,
                backgroundColor: Color.black.alpha(0.5).string,
                borderColor: Colors.stroke,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 12,
              }}
            />

            <Text style={{ ...FontStyles.Title, ...styles.textShadow, color: Color.white.string }}>
              {card.pack?.name}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={safeArea}>
        {target && (
          <Text
            style={{
              fontSize: 32,
              fontWeight: '900',
              ...styles.textShadow,
              color: Color.white.string,
              textAlign: 'center',
            }}
          >
            {target.name},
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
