import { FontStyles } from '@/src/constants/Styles'
import { Image } from 'expo-image'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'
import Colors from '../constants/Colors'
import { Category, CategoryManager } from '../managers/CategoryManager'
import { Pack, PackManager } from '../managers/PackManager'
import { useAppContext } from '../providers/AppContextProvider'

export default function MenuDetailsVeiw(props: Readonly<ViewProps>) {
  const { style, ...rest } = props

  const { currentCard: card } = useAppContext()
  const category = card?.category ? CategoryManager.get(card?.category) : undefined
  const pack = card?.pack

  const categoryTitle = category ? CategoryManager.getTitle(category) : undefined
  const categoryDescription = category ? CategoryManager.getDescription(category) : undefined

  if (!card) return null

  return (
    <Animated.View {...rest} style={[style, { gap: 8 }]}>
      {category && <CategoryView category={category} />}
      {pack && <PackView pack={pack} />}
    </Animated.View>
  )
}

function CategoryView(props: Readonly<{ category: Category } & ViewProps>) {
  const { category, style } = props
  const title = CategoryManager.getTitle(category)
  const description = CategoryManager.getDescription(category)

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: Colors.background,
          padding: 16,
          borderRadius: 16,
          gap: 8,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 32 }} numberOfLines={1}>
          {category.icon}
        </Text>
        <Text style={{ ...FontStyles.Title, color: Colors.text }} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {description && <Text style={[FontStyles.Subheading, { fontSize: 18 }]}>{description}</Text>}
    </View>
  )
}

function PackView(props: Readonly<{ pack: Pack } & ViewProps>) {
  const { pack, style } = props
  const { data: image, error } = PackManager.useImageQuery(pack.image)
  if (error) console.warn(`Couldn't load image for pack ${pack.name}:`, error)

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: Colors.background,
          padding: 16,
          borderRadius: 16,
          gap: 8,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Image
          source={image}
          transition={256}
          style={{
            aspectRatio: 1,
            height: 64,
            borderRadius: 12,
            borderColor: Colors.stroke,
            borderWidth: StyleSheet.hairlineWidth,
          }}
        />
        <Text style={{ ...FontStyles.Title, color: Colors.text }} numberOfLines={1}>
          {pack.name}
        </Text>
      </View>
      <Text style={[FontStyles.Subheading, { fontSize: 18 }]}>{pack.description}</Text>
    </View>
  )
}
