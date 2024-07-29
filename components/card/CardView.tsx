import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import { FontStyles, Styles } from '@/constants/Styles'
import { PlayedCard } from '@/managers/CardManager'
import { Category, CategoryManager } from '@/managers/CategoryManager'
import { PackManager } from '@/managers/PackManager'
import Color from '@/models/Color'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { TouchableOpacity, View } from 'react-native'
import { Text } from '../utils/Themed'
import useColorScheme from '../utils/useColorScheme'
import { ConfigurationManager } from '@/managers/ConfigurationManager'

export type CardViewProps = {
  card: PlayedCard
  category?: Category | null
}

export function CardView(props: Readonly<CardViewProps>) {
  const colorScheme = useColorScheme()
  const { card, category } = props

  const padding = 24
  const target = card.is_group || card.players.length === 0 ? null : card.players[0]
  const content = card.formattedContent ?? card.content
  const { data: image, error } = useQuery(PackManager.getImageQuery(card.pack.image))

  if (error) console.warn(error)

  function getGradient() {
    if (!category?.gradient)
      return ConfigurationManager.get('default_gradient')?.list ?? [Colors[colorScheme].accentColor]
    if (category.gradient.length === 1) return [category.gradient[0], category.gradient[0]]
    return category.gradient.map(color => Color.hex(color).string)
  }

  return (
    <>
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
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          padding: padding,
          ...Styles.shadow,
        }}
      >
        {category && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text
              style={{ flex: 1, ...FontStyles.Title, color: Color.white.string, textAlign: 'right' }}
              numberOfLines={1}
            >
              {CategoryManager.getTitle(category)}
            </Text>
            <Text style={{ fontSize: 48 }}>{category?.icon}</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Image
            source={image}
            style={{
              height: 48,
              aspectRatio: 1,
              backgroundColor: Color.black.alpha(0.5).string,
              borderColor: Colors[colorScheme].stroke,
              borderWidth: Sizes.thin,
              borderRadius: 12,
            }}
          />
          <Text style={{ ...FontStyles.Title, color: Color.white.string }}>{card.pack.name}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <>
        {target && (
          <Text
            style={{
              fontSize: 32,
              fontWeight: '900',
              ...Styles.shadow,
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
            ...Styles.shadow,
            color: Color.white.string,
            textAlign: 'center',
            paddingHorizontal: 32,
          }}
        >
          {content}
        </Text>
      </>
    </>
  )
}
