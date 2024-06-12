import { Category, CategoryManager } from '@/lib/CategoryManager'
import { FontStyles, Styles } from '@/constants/Styles'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { PackManager } from '@/lib/PackManager'
import { PlayedCard } from '@/lib/CardManager'
import { Text } from '../utils/Themed'
import { useQuery } from '@tanstack/react-query'
import { View, TouchableOpacity } from 'react-native'
import Assets from '@/constants/Assets'
import Color from '@/models/Color'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import { Link } from 'expo-router'

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
      return [Color.hex('#370A00').string, Color.hex('#a14316').string, Colors[colorScheme].accentColor, 'white']
    if (category.gradient.length === 1) return [category.gradient[0], category.gradient[0]]
    return category.gradient
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
          <Link href={`/category/${card.category}`} asChild>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={FontStyles.Title}>{CategoryManager.getTitle(category)}</Text>
              <Text style={{ fontSize: 48 }}>{category?.icon}</Text>
            </TouchableOpacity>
          </Link>
        )}

        <View style={{ flex: 1 }} />

        <Link href={`/pack/${card.pack.id}`} asChild>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Image
              source={image ?? Assets[colorScheme].pack_placeholder}
              style={{
                height: 48,
                aspectRatio: 1,
                backgroundColor: Color.black.alpha(0.5).string,
                borderColor: Colors[colorScheme].stroke,
                borderWidth: Sizes.thin,
                borderRadius: 12,
              }}
            />
            <Text style={FontStyles.Title}>{card.pack.name}</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Content */}
      <>
        {target && (
          <Text
            style={{
              fontSize: 32,
              fontWeight: '900',
              ...Styles.shadow,
              textAlign: 'center',
            }}
          >
            {card.players[0]}
          </Text>
        )}
        <Text
          style={{
            fontSize: Math.max(18, 28 / Math.max(1, content.length / 150)),
            fontWeight: '900',
            ...Styles.shadow,
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
