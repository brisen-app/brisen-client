import { Dimensions, PressableProps, Pressable, ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import { PlayedCard } from '@/lib/CardManager'
import { CategoryManager } from '@/lib/CategoryManager'
import { CardView } from './CardView'
import Animated, { Easing, SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

export type CardScreenProps = { card: PlayedCard; viewableItems: SharedValue<ViewToken<PlayedCard>[]> } & PressableProps

export default function CardScreen(props: Readonly<CardScreenProps>) {
  const { card, onPress, viewableItems } = props
  const colorScheme = useColorScheme()
  const animationConfig = { duration: 400, easing: Easing.bezier(0, 0, 0.5, 1) }

  const animatedStyle = useAnimatedStyle(() => {
    const isVisible = !!viewableItems.value.find(
      (viewableItem) => viewableItem.isViewable && viewableItem.item.id === card.id
    )

    return {
      opacity: withTiming(isVisible ? 1 : 0, animationConfig),
      transform: [{ scale: withTiming(isVisible ? 1 : 0.9, animationConfig) }],
    }
  }, [])

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
      <Animated.View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderRadius: 32,
            backgroundColor: Colors[colorScheme].secondaryBackground,
            borderColor: Colors[colorScheme].stroke,
            borderWidth: Sizes.thin,
          },
          animatedStyle,
        ]}
      >
        <CardView card={card} category={category} />
      </Animated.View>
    </Pressable>
  )
}
