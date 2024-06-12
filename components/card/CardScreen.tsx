import { Dimensions, PressableProps, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import { PlayedCard } from '@/lib/CardManager'
import { CategoryManager } from '@/lib/CategoryManager'
import { CardView } from './CardView'
import Animated, { Easing, withTiming } from 'react-native-reanimated'

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
      <Animated.View
        entering={entering}
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
      </Animated.View>
    </Pressable>
  )
}
