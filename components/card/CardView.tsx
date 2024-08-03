import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import { FontStyles, Styles } from '@/constants/Styles'
import { PlayedCard } from '@/managers/CardManager'
import { Category, CategoryManager } from '@/managers/CategoryManager'
import { PackManager } from '@/managers/PackManager'
import Color from '@/models/Color'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Platform, Pressable, StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import { Text } from '../utils/Themed'
import useColorScheme from '../utils/useColorScheme'
import { ConfigurationManager } from '@/managers/ConfigurationManager'
import { MaterialIcons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

export type CardViewProps = {
  card: PlayedCard
  category?: Category | null
  onPressCategory: () => void
  onPressPack: () => void
}

export function CardView(props: Readonly<CardViewProps & ViewProps>) {
  const colorScheme = useColorScheme()
  const { card, category, style } = props

  const padding = 24
  const target = card.is_group || card.players.length === 0 ? null : card.players[0]
  const content = card.formattedContent ?? card.content
  const { data: image, error } = PackManager.useImageQuery(card.pack?.image)

  if (error) console.warn(error)

  function getGradient() {
    if (!category?.gradient)
      return ConfigurationManager.get('default_gradient')?.list ?? [Colors[colorScheme].accentColor]
    if (category.gradient.length === 1) return [category.gradient[0], category.gradient[0]]
    return category.gradient.map(color => Color.hex(color).string)
  }

  return (
    <Pressable style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
      <LinearGradient colors={getGradient()} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={Styles.absoluteFill} />

      {/* Grain */}
      <Image
        source={require('@/assets/images/noise.png')}
        style={{
          ...Styles.absoluteFill,
          opacity: 0.1,
        }}
      />

      {/* Pack & Category */}
      <SafeAreaView
        style={{
          ...Styles.absoluteFill,
          padding: padding,
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
              paddingBottom: 64,
              gap: 8,
            }}
          >
            <Image
              source={image}
              style={{
                height: 48,
                aspectRatio: 1,
                ...styles.shadow,
                backgroundColor: Color.black.alpha(0.5).string,
                borderColor: Colors[colorScheme].stroke,
                borderWidth: Sizes.thin,
                borderRadius: 12,
              }}
            />
            <Text style={{ ...FontStyles.Title, ...styles.textShadow, color: Color.white.string }}>
              {card.pack?.name}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Content */}
      <>
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
      </>
    </Pressable>
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
