import { View, Dimensions, PressableProps, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import { PlayedCard } from '@/lib/CardManager'
import { CategoryManager } from '@/lib/CategoryManager'
import { CardView } from './CardView'

export type CardScreenProps = { card: PlayedCard } & PressableProps

export default function CardScreen(props: Readonly<CardScreenProps>) {
  const { card, onPress } = props
  const colorScheme = useColorScheme()

  const padding = 16
  let insets = useSafeAreaInsets()
  insets = {
    top: insets.top ? insets.top : padding,
    bottom: insets.bottom ? insets.bottom : padding,
    left: insets.left ? insets.left : padding,
    right: insets.right ? insets.right : padding,
  }

  const category = card.category ? CategoryManager.get(card.category) : null

  return (
    <Pressable
      onPress={onPress}
      style={{
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        paddingBottom: insets.bottom + Sizes.big + Sizes.normal,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: 32,
          backgroundColor: Colors[colorScheme].secondaryBackground,
          borderColor: Colors[colorScheme].stroke,
          borderWidth: Sizes.thin,
        }}
      >
        <CardView card={card} category={category} />
      </View>
    </Pressable>
  )
}
