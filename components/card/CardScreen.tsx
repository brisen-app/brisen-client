import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import { PlayedCard } from '@/managers/CardManager'
import { CategoryManager } from '@/managers/CategoryManager'
import { Dimensions, PressableProps, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useColorScheme from '../utils/useColorScheme'
import { CardView } from './CardView'
import { Text } from '../utils/Themed'
import { FontStyles, Styles } from '@/constants/Styles'
import { LocalizationManager } from '@/managers/LocalizationManager'
import { Image } from 'expo-image'
import { PackManager } from '@/managers/PackManager'
import { useRef } from 'react'
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/reanimated2/component/ScrollView'

export type CardScreenProps = { card: PlayedCard } & PressableProps

export default function CardScreen(props: Readonly<CardScreenProps>) {
  const { card } = props
  const colorScheme = useColorScheme()
  const horizontalScroll = useRef<AnimatedScrollView>(null)
  const detailsWidth = Dimensions.get('screen').width * 0.8
  const scrollOffset = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      const { layoutMeasurement, contentOffset, contentSize } = event
      scrollOffset.value = 1 - contentOffset.x / (contentSize.width - layoutMeasurement.width)
    },
  })

  const padding = 16
  let insets = useSafeAreaInsets()
  insets = {
    top: insets.top ? insets.top : padding,
    bottom: insets.bottom ? insets.bottom : padding,
    left: insets.left ? insets.left : padding,
    right: insets.right ? insets.right : padding,
  }

  const category = card.category ? CategoryManager.get(card.category) : null
  const categoryDescription = category ? CategoryManager.getDescription(category) : null

  const { data: image, error } = PackManager.useImageQuery(card.pack?.image)
  if (error) console.warn(error)

  const appearOnScrollStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.value, [0, 0.5], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(scrollOffset.value, [0, 1], [16, 0], Extrapolation.CLAMP) }],
  }))

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
    <View
      onTouchEnd={() => scrollOffset.value >= 0.95 && horizontalScroll.current?.scrollToEnd()}
      style={{
        height: Dimensions.get('screen').height,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 64 + 16,
      }}
    >
      <Animated.View
        style={[
          {
            ...Styles.absoluteFill,
            width: detailsWidth - insets.right,
            marginTop: insets.top,
            marginBottom: insets.bottom,
            marginLeft: insets.left,
            justifyContent: 'flex-end',
            gap: 8,
          },
          appearOnScrollStyle,
        ]}
      >
        {category && (
          <>
            <Text style={FontStyles.Subheading}>{LocalizationManager.get('category')?.value?.toUpperCase()}</Text>
            <View
              style={{
                backgroundColor: Colors[colorScheme].secondaryBackground,
                padding: 16,
                borderRadius: 16,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 32 }} numberOfLines={1}>
                  {category.icon}
                </Text>
                <Text style={{ ...FontStyles.Title, color: Colors[colorScheme].text }} numberOfLines={1}>
                  {CategoryManager.getTitle(category)}
                </Text>
              </View>
              {categoryDescription && (
                <Text style={[FontStyles.Subheading, { fontSize: 18 }]}>
                  {CategoryManager.getDescription(category)}
                </Text>
              )}
            </View>
          </>
        )}

        {card.pack && (
          <>
            <Text style={FontStyles.Subheading}>{LocalizationManager.get('pack')?.value?.toUpperCase()}</Text>
            <View
              style={{
                backgroundColor: Colors[colorScheme].secondaryBackground,
                padding: 16,
                borderRadius: 16,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image
                  source={image}
                  transition={256}
                  style={{
                    aspectRatio: 1,
                    height: 64,
                    borderRadius: 16,
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: StyleSheet.hairlineWidth,
                  }}
                />
                <Text style={{ ...FontStyles.Title, color: Colors[colorScheme].text }} numberOfLines={1}>
                  {card.pack.name}
                </Text>
              </View>
              <Text style={[FontStyles.Subheading, { fontSize: 18 }]}>{card.pack.description}</Text>
            </View>
          </>
        )}
      </Animated.View>

      <Animated.ScrollView
        ref={horizontalScroll}
        onScroll={scrollHandler}
        onLayout={() => horizontalScroll.current?.scrollToEnd({ animated: false })}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{
          overflow: 'visible',
          marginLeft: insets.left,
          marginRight: insets.right,
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 32 },
          shadowRadius: 32,
          shadowOpacity: 1 / 4,
          elevation: 48,
        }}
      >
        {(category || card.pack) && (
          <View onTouchStart={() => horizontalScroll.current?.scrollToEnd()} style={{ width: detailsWidth }} />
        )}

        <Animated.View
          entering={entering}
          style={{
            overflow: 'hidden',
            width: Dimensions.get('screen').width - insets.left - insets.right,
            borderRadius: 32,
            backgroundColor: Colors[colorScheme].secondaryBackground,
            borderColor: Colors[colorScheme].stroke,
            borderWidth: Sizes.thin,
          }}
        >
          <CardView
            card={card}
            category={category}
            onPressCategory={() => horizontalScroll.current?.scrollTo({ x: 0 })}
            onPressPack={() => horizontalScroll.current?.scrollTo({ x: 0 })}
          />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  )
}
