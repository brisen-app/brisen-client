import Colors from '@/src/constants/Colors'
import { PlayedCard } from '@/src/managers/CardManager'
import { CategoryManager } from '@/src/managers/CategoryManager'
import { StyleSheet, ViewProps } from 'react-native'
import Animated, { Easing, withTiming } from 'react-native-reanimated'
import { CardView } from './CardView'

export type CardScreenProps = { card: PlayedCard } & ViewProps

export default function CardScreen(props: Readonly<CardScreenProps>) {
  const { card, style } = props

  const category = card.category ? CategoryManager.get(card.category) : undefined

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
    <Animated.View
      entering={entering}
      style={[
        style,
        {
          borderRadius: 32,
          overflow: 'hidden',
          borderColor: Colors.stroke,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <CardView card={card} category={category} />
    </Animated.View>
  )
}
