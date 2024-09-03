import Colors from '@/src/constants/Colors'
import { FontStyles, Styles } from '@/src/constants/Styles'
import { PlayedCard } from '@/src/managers/CardManager'
import { CategoryManager } from '@/src/managers/CategoryManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'
import { Image } from 'expo-image'
import { useRef } from 'react'
import { Text, Dimensions, Platform, PressableProps, StyleSheet, View, ViewProps } from 'react-native'
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/reanimated2/component/ScrollView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CardView } from './CardView'
import { useSheetHeight } from '@/src/lib/utils'

export type CardScreenProps = { card: PlayedCard } & PressableProps

export default function CardScreen(props: Readonly<CardScreenProps>) {
  const { card } = props
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
  const safeArea = {
    paddingTop: Math.max(padding, insets.top),
    paddingLeft: Math.max(padding, insets.left),
    paddingRight: Math.max(padding, insets.right),
    paddingBottom: useSheetHeight() + padding,
  }

  const category = card.category ? CategoryManager.get(card.category) : null
  const categoryDescription = category ? CategoryManager.getDescription(category) : null
  const packs = PackManager.getPacksOf(card.id)

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
      }}
    >
      <Animated.View
        style={[
          {
            ...Styles.absoluteFill,
            ...safeArea,
            width: detailsWidth,
            justifyContent: 'flex-end',
            gap: 16,
          },
          appearOnScrollStyle,
        ]}
      >
        {category && (
          <View style={{ gap: 8 }}>
            <Text style={FontStyles.Subheading}>{LocalizationManager.get('category')?.value?.toUpperCase()}</Text>
            <View
              style={{
                backgroundColor: Colors.secondaryBackground,
                padding: 16,
                borderRadius: 16,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 32 }} numberOfLines={1}>
                  {category.icon}
                </Text>
                <Text style={{ ...FontStyles.Title, color: Colors.text }} numberOfLines={1}>
                  {CategoryManager.getTitle(category)}
                </Text>
              </View>
              {categoryDescription && (
                <Text style={[FontStyles.Subheading, { fontSize: 18 }]}>
                  {CategoryManager.getDescription(category)}
                </Text>
              )}
            </View>
          </View>
        )}

        {packs.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={FontStyles.Subheading}>{LocalizationManager.get('packs')?.value?.toUpperCase()}</Text>
            <View style={{ gap: 16 }}>
              {packs.map(pack => (
                <PackView key={pack.id} pack={pack} />
              ))}
            </View>
          </View>
        )}
      </Animated.View>

      <Animated.ScrollView
        ref={horizontalScroll}
        onScroll={scrollHandler}
        onLayout={() => horizontalScroll.current?.scrollToEnd({ animated: false })}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {(category || card.pack) && (
          <View onTouchStart={() => horizontalScroll.current?.scrollToEnd()} style={{ width: detailsWidth }} />
        )}

        <Animated.View
          entering={entering}
          style={[
            {
              width: Dimensions.get('screen').width,
            },
            Platform.select({
              ios: {
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 16,
                shadowOpacity: 0.5,
              },
              android: {
                elevation: 32,
              },
            }) ?? {},
          ]}
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

function PackView(props: Readonly<{ pack: Pack } & ViewProps>) {
  const { pack, style } = props
  const { data: image, error } = PackManager.useImageQuery(pack.image)
  if (error) console.warn(error)

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: Colors.secondaryBackground,
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
